import { useAuth } from "@clerk/expo";
import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createClerkSupabaseClient } from "@/features/supabase/client";

import { fetchDirectoryData } from "./directory-api";
import {
  loadDirectoryPreferences,
  saveDirectoryPreferences,
} from "./directory-storage";
import {
  deleteAllFavoriteContacts,
  deleteFavoriteContact,
  fetchFavoriteContactIds,
  saveFavoriteContact,
} from "./favorites-api";
import { getContactsForHospital } from "./helpers";
import type {
  ContactId,
  DirectoryContact,
  DirectoryPreferences,
  Hospital,
  HospitalId,
} from "./types";

interface DirectorySelectionState {
  readonly selectedHospitalId: HospitalId | null;
  readonly favoriteContactIds: readonly ContactId[];
}

export interface DirectoryContextValue {
  readonly hospitals: readonly Hospital[];
  readonly allContacts: readonly DirectoryContact[];
  readonly selectedHospital: Hospital | null;
  readonly selectedHospitalId: HospitalId | null;
  readonly selectedContacts: readonly DirectoryContact[];
  readonly favoriteContactIds: readonly ContactId[];
  readonly favoriteContacts: readonly DirectoryContact[];
  readonly isHydrated: boolean;
  readonly directoryError: string | null;
  readonly deleteAllFavorites: () => Promise<void>;
  readonly reloadDirectory: () => void;
  readonly selectHospital: (hospitalId: HospitalId) => void;
  readonly toggleFavorite: (contactId: ContactId) => void;
  readonly isFavorite: (contactId: ContactId) => boolean;
  readonly getContactById: (contactId: ContactId) => DirectoryContact | undefined;
  readonly getHospitalByContactId: (contactId: ContactId) => Hospital | undefined;
}

const EMPTY_SELECTION: DirectorySelectionState = {
  selectedHospitalId: null,
  favoriteContactIds: [],
};

const DirectoryContext = createContext<DirectoryContextValue | null>(null);

function normalizePreferences(
  preferences: DirectoryPreferences | null,
  favoriteContactIds: readonly ContactId[],
  hospitals: readonly Hospital[],
  contactById: ReadonlyMap<ContactId, DirectoryContact>,
): DirectorySelectionState {
  const hospitalIds = new Set(hospitals.map((hospital) => hospital.id));
  const defaultHospitalId = hospitals[0]?.id ?? null;
  const selectedHospitalId =
    preferences && hospitalIds.has(preferences.selectedHospitalId)
      ? preferences.selectedHospitalId
      : defaultHospitalId;
  const validFavoriteContactIds = Array.from(
    new Set(
      favoriteContactIds.filter((contactId) => contactById.has(contactId)),
    ),
  );

  return {
    selectedHospitalId,
    favoriteContactIds: validFavoriteContactIds,
  };
}

function toPersistedPreferences(
  selection: DirectorySelectionState,
): DirectoryPreferences | null {
  if (!selection.selectedHospitalId) {
    return null;
  }

  return {
    version: 2,
    selectedHospitalId: selection.selectedHospitalId,
  };
}

export function DirectoryProvider({ children }: PropsWithChildren) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const authenticatedUserId = isLoaded && isSignedIn ? userId : null;
  const [hospitals, setHospitals] = useState<readonly Hospital[]>([]);
  const [allContacts, setAllContacts] = useState<readonly DirectoryContact[]>([]);
  const [selection, setSelection] =
    useState<DirectorySelectionState>(EMPTY_SELECTION);
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null);
  const [directoryError, setDirectoryError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const activeUserIdRef = useRef<string | null>(authenticatedUserId);
  const getTokenRef = useRef(getToken);
  const hydratedUserIdRef = useRef<string | null>(null);
  const selectionRef = useRef<DirectorySelectionState>(EMPTY_SELECTION);
  const hydrationRequestRef = useRef(0);
  const favoriteWriteQueueRef = useRef<Promise<void>>(Promise.resolve());
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  activeUserIdRef.current = authenticatedUserId;
  getTokenRef.current = getToken;

  const getAccessToken = useCallback(() => getTokenRef.current(), []);

  const supabaseClient = useMemo(() => {
    if (!authenticatedUserId) {
      return null;
    }

    try {
      return createClerkSupabaseClient(getAccessToken);
    } catch {
      return null;
    }
  }, [authenticatedUserId, getAccessToken]);

  useEffect(() => {
    const requestId = ++hydrationRequestRef.current;

    hydratedUserIdRef.current = null;
    selectionRef.current = EMPTY_SELECTION;
    setHospitals([]);
    setAllContacts([]);
    setHydratedUserId(null);
    setSelection(EMPTY_SELECTION);
    setDirectoryError(null);

    if (!authenticatedUserId) {
      return () => {
        hydrationRequestRef.current += 1;
      };
    }

    if (!supabaseClient) {
      setDirectoryError("Configurazione Supabase non disponibile.");
      return () => {
        hydrationRequestRef.current += 1;
      };
    }

    const preferencesPromise = loadDirectoryPreferences(
      authenticatedUserId,
    ).catch(() => null);
    const favoritesPromise = fetchFavoriteContactIds(
      supabaseClient,
      authenticatedUserId,
    ).catch(() => [] as readonly ContactId[]);

    void Promise.all([
      fetchDirectoryData(supabaseClient),
      preferencesPromise,
      favoritesPromise,
    ]).then(
      ([directoryData, preferences, favoriteContactIds]) => {
        if (
          hydrationRequestRef.current !== requestId ||
          activeUserIdRef.current !== authenticatedUserId
        ) {
          return;
        }

        const contactById = new Map(
          directoryData.contacts.map(
            (contact) => [contact.id, contact] as const,
          ),
        );
        const nextSelection = normalizePreferences(
          preferences,
          favoriteContactIds,
          directoryData.hospitals,
          contactById,
        );

        selectionRef.current = nextSelection;
        hydratedUserIdRef.current = authenticatedUserId;
        setHospitals(directoryData.hospitals);
        setAllContacts(directoryData.contacts);
        setSelection(nextSelection);
        setHydratedUserId(authenticatedUserId);
      },
      () => {
        if (
          hydrationRequestRef.current !== requestId ||
          activeUserIdRef.current !== authenticatedUserId
        ) {
          return;
        }

        setDirectoryError("Non e stato possibile caricare la rubrica.");
      },
    );

    return () => {
      hydrationRequestRef.current += 1;
    };
  }, [authenticatedUserId, reloadVersion, supabaseClient]);

  const hospitalById = useMemo(
    () =>
      new Map(
        hospitals.map((hospital) => [hospital.id, hospital] as const),
      ),
    [hospitals],
  );
  const contactById = useMemo(
    () =>
      new Map(
        allContacts.map((contact) => [contact.id, contact] as const),
      ),
    [allContacts],
  );

  const enqueuePreferenceWrite = useCallback(
    (ownerUserId: string, nextSelection: DirectorySelectionState) => {
      const preferences = toPersistedPreferences(nextSelection);

      if (!preferences) {
        return;
      }

      writeQueueRef.current = writeQueueRef.current
        .catch(() => undefined)
        .then(() => saveDirectoryPreferences(ownerUserId, preferences))
        .catch(() => undefined);
    },
    [],
  );

  const commitSelection = useCallback(
    (nextSelection: DirectorySelectionState) => {
      const ownerUserId = activeUserIdRef.current;

      if (!ownerUserId || hydratedUserIdRef.current !== ownerUserId) {
        return null;
      }

      selectionRef.current = nextSelection;
      setSelection(nextSelection);
      return ownerUserId;
    },
    [],
  );

  const selectHospital = useCallback(
    (hospitalId: HospitalId) => {
      if (!hospitalById.has(hospitalId)) {
        return;
      }

      const currentSelection = selectionRef.current;
      if (currentSelection.selectedHospitalId === hospitalId) {
        return;
      }

      const nextSelection = {
        ...currentSelection,
        selectedHospitalId: hospitalId,
      };
      const ownerUserId = commitSelection(nextSelection);
      if (ownerUserId) {
        enqueuePreferenceWrite(ownerUserId, nextSelection);
      }
    },
    [commitSelection, enqueuePreferenceWrite, hospitalById],
  );

  const enqueueFavoriteWrite = useCallback(
    (
      ownerUserId: string,
      contactId: ContactId,
      shouldBeFavorite: boolean,
    ) => {
      const client = supabaseClient;

      favoriteWriteQueueRef.current = favoriteWriteQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          if (!client) {
            throw new Error("Supabase is not available.");
          }

          if (shouldBeFavorite) {
            await saveFavoriteContact(client, ownerUserId, contactId);
          } else {
            await deleteFavoriteContact(client, ownerUserId, contactId);
          }
        })
        .then(undefined, () => {
            if (
              activeUserIdRef.current !== ownerUserId ||
              hydratedUserIdRef.current !== ownerUserId
            ) {
              return;
            }

            const currentSelection = selectionRef.current;
            const isCurrentlyFavorite =
              currentSelection.favoriteContactIds.includes(contactId);

            if (isCurrentlyFavorite === shouldBeFavorite) {
              const favoriteContactIds = shouldBeFavorite
                ? currentSelection.favoriteContactIds.filter(
                    (favoriteId) => favoriteId !== contactId,
                  )
                : [...currentSelection.favoriteContactIds, contactId];
              const rolledBackSelection = {
                ...currentSelection,
                favoriteContactIds,
              };

              selectionRef.current = rolledBackSelection;
              setSelection(rolledBackSelection);
            }
          });
    },
    [supabaseClient],
  );

  const toggleFavorite = useCallback(
    (contactId: ContactId) => {
      if (!contactById.has(contactId)) {
        return;
      }

      const currentSelection = selectionRef.current;
      const isAlreadyFavorite =
        currentSelection.favoriteContactIds.includes(contactId);
      const favoriteContactIds = isAlreadyFavorite
        ? currentSelection.favoriteContactIds.filter((id) => id !== contactId)
        : [...currentSelection.favoriteContactIds, contactId];
      const shouldBeFavorite = !isAlreadyFavorite;
      const ownerUserId = commitSelection({
        ...currentSelection,
        favoriteContactIds,
      });

      if (ownerUserId) {
        enqueueFavoriteWrite(ownerUserId, contactId, shouldBeFavorite);
      }
    },
    [commitSelection, contactById, enqueueFavoriteWrite],
  );

  const deleteAllFavorites = useCallback(async () => {
    const ownerUserId = activeUserIdRef.current;
    const client = supabaseClient;

    if (
      !ownerUserId ||
      !client ||
      hydratedUserIdRef.current !== ownerUserId
    ) {
      throw new Error("I preferiti non sono pronti per la cancellazione.");
    }

    await favoriteWriteQueueRef.current.catch(() => undefined);
    await deleteAllFavoriteContacts(client, ownerUserId);

    if (activeUserIdRef.current === ownerUserId) {
      const nextSelection = {
        ...selectionRef.current,
        favoriteContactIds: [],
      };

      selectionRef.current = nextSelection;
      setSelection(nextSelection);
    }
  }, [supabaseClient]);

  const reloadDirectory = useCallback(() => {
    setReloadVersion((currentVersion) => currentVersion + 1);
  }, []);

  const isHydrated = Boolean(
    authenticatedUserId &&
      hydratedUserId === authenticatedUserId &&
      !directoryError,
  );
  const visibleSelection = isHydrated ? selection : EMPTY_SELECTION;
  const selectedHospital = visibleSelection.selectedHospitalId
    ? (hospitalById.get(visibleSelection.selectedHospitalId) ?? null)
    : null;
  const selectedContacts = useMemo(
    () =>
      visibleSelection.selectedHospitalId
        ? getContactsForHospital(
            allContacts,
            visibleSelection.selectedHospitalId,
          )
        : [],
    [allContacts, visibleSelection.selectedHospitalId],
  );
  const favoriteContacts = useMemo(
    () =>
      visibleSelection.favoriteContactIds.flatMap((contactId) => {
        const contact = contactById.get(contactId);
        return contact ? [contact] : [];
      }),
    [contactById, visibleSelection.favoriteContactIds],
  );

  const isFavorite = useCallback(
    (contactId: ContactId) =>
      visibleSelection.favoriteContactIds.includes(contactId),
    [visibleSelection.favoriteContactIds],
  );
  const getContactById = useCallback(
    (contactId: ContactId) => contactById.get(contactId),
    [contactById],
  );
  const getHospitalByContactId = useCallback(
    (contactId: ContactId) => {
      const contact = contactById.get(contactId);
      return contact ? hospitalById.get(contact.hospitalId) : undefined;
    },
    [contactById, hospitalById],
  );
  const value = useMemo<DirectoryContextValue>(
    () => ({
      hospitals,
      allContacts,
      selectedHospital,
      selectedHospitalId: visibleSelection.selectedHospitalId,
      selectedContacts,
      favoriteContactIds: visibleSelection.favoriteContactIds,
      favoriteContacts,
      isHydrated,
      directoryError,
      deleteAllFavorites,
      reloadDirectory,
      selectHospital,
      toggleFavorite,
      isFavorite,
      getContactById,
      getHospitalByContactId,
    }),
    [
      allContacts,
      deleteAllFavorites,
      directoryError,
      favoriteContacts,
      getContactById,
      getHospitalByContactId,
      hospitals,
      isFavorite,
      isHydrated,
      reloadDirectory,
      selectHospital,
      selectedContacts,
      selectedHospital,
      toggleFavorite,
      visibleSelection.favoriteContactIds,
      visibleSelection.selectedHospitalId,
    ],
  );

  return (
    <DirectoryContext.Provider value={value}>
      {children}
    </DirectoryContext.Provider>
  );
}

export function useDirectory(): DirectoryContextValue {
  const context = use(DirectoryContext);

  if (!context) {
    throw new Error("useDirectory deve essere usato dentro DirectoryProvider.");
  }

  return context;
}
