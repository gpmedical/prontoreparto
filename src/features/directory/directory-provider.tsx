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

import {
  DIRECTORY_CONTACTS,
  DEFAULT_HOSPITAL_ID,
  HOSPITALS,
} from "./mock-data";
import {
  loadDirectoryPreferences,
  saveDirectoryPreferences,
} from "./directory-storage";
import { getContactsForHospital } from "./helpers";
import type {
  ContactId,
  DirectoryContact,
  DirectoryPreferences,
  Hospital,
  HospitalId,
} from "./types";

interface DirectorySelectionState {
  readonly selectedHospitalId: HospitalId;
  readonly favoriteContactIds: readonly ContactId[];
}

export interface DirectoryContextValue {
  readonly hospitals: readonly Hospital[];
  readonly allContacts: readonly DirectoryContact[];
  readonly selectedHospital: Hospital;
  readonly selectedHospitalId: HospitalId;
  readonly selectedContacts: readonly DirectoryContact[];
  readonly favoriteContactIds: readonly ContactId[];
  readonly favoriteContacts: readonly DirectoryContact[];
  readonly isHydrated: boolean;
  readonly storageError: string | null;
  readonly selectHospital: (hospitalId: HospitalId) => void;
  readonly toggleFavorite: (contactId: ContactId) => void;
  readonly isFavorite: (contactId: ContactId) => boolean;
  readonly getContactById: (contactId: ContactId) => DirectoryContact | undefined;
  readonly getHospitalByContactId: (contactId: ContactId) => Hospital | undefined;
}

const EMPTY_SELECTION: DirectorySelectionState = {
  selectedHospitalId: DEFAULT_HOSPITAL_ID,
  favoriteContactIds: [],
};

const HOSPITAL_BY_ID = new Map(
  HOSPITALS.map((hospital) => [hospital.id as HospitalId, hospital] as const),
);
const CONTACT_BY_ID = new Map(
  DIRECTORY_CONTACTS.map((contact) => [contact.id as ContactId, contact] as const),
);

const DirectoryContext = createContext<DirectoryContextValue | null>(null);

function normalizePreferences(
  preferences: DirectoryPreferences | null,
): DirectorySelectionState {
  if (!preferences) {
    return EMPTY_SELECTION;
  }

  const selectedHospitalId = HOSPITAL_BY_ID.has(preferences.selectedHospitalId)
    ? preferences.selectedHospitalId
    : DEFAULT_HOSPITAL_ID;
  const favoriteContactIds = Array.from(
    new Set(
      preferences.favoriteContactIds.filter((contactId) =>
        CONTACT_BY_ID.has(contactId),
      ),
    ),
  );

  return { selectedHospitalId, favoriteContactIds };
}

function toPersistedPreferences(
  selection: DirectorySelectionState,
): DirectoryPreferences {
  return {
    version: 1,
    selectedHospitalId: selection.selectedHospitalId,
    favoriteContactIds: selection.favoriteContactIds,
  };
}

export function DirectoryProvider({ children }: PropsWithChildren) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const authenticatedUserId = isLoaded && isSignedIn ? userId : null;
  const [selection, setSelection] =
    useState<DirectorySelectionState>(EMPTY_SELECTION);
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const activeUserIdRef = useRef<string | null>(authenticatedUserId);
  const hydratedUserIdRef = useRef<string | null>(null);
  const selectionRef = useRef<DirectorySelectionState>(EMPTY_SELECTION);
  const hydrationRequestRef = useRef(0);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  activeUserIdRef.current = authenticatedUserId;

  useEffect(() => {
    const requestId = ++hydrationRequestRef.current;

    hydratedUserIdRef.current = null;
    selectionRef.current = EMPTY_SELECTION;
    setHydratedUserId(null);
    setSelection(EMPTY_SELECTION);
    setStorageError(null);

    if (!authenticatedUserId) {
      return () => {
        hydrationRequestRef.current += 1;
      };
    }

    void loadDirectoryPreferences(authenticatedUserId)
      .then((preferences) => {
        if (
          hydrationRequestRef.current !== requestId ||
          activeUserIdRef.current !== authenticatedUserId
        ) {
          return;
        }

        const nextSelection = normalizePreferences(preferences);
        selectionRef.current = nextSelection;
        hydratedUserIdRef.current = authenticatedUserId;
        setSelection(nextSelection);
        setHydratedUserId(authenticatedUserId);
      })
      .catch(() => {
        if (
          hydrationRequestRef.current !== requestId ||
          activeUserIdRef.current !== authenticatedUserId
        ) {
          return;
        }

        hydratedUserIdRef.current = authenticatedUserId;
        setHydratedUserId(authenticatedUserId);
        setStorageError("Non è stato possibile caricare le preferenze locali.");
      });

    return () => {
      hydrationRequestRef.current += 1;
    };
  }, [authenticatedUserId]);

  const enqueuePreferenceWrite = useCallback(
    (ownerUserId: string, nextSelection: DirectorySelectionState) => {
      writeQueueRef.current = writeQueueRef.current
        .catch(() => undefined)
        .then(() =>
          saveDirectoryPreferences(
            ownerUserId,
            toPersistedPreferences(nextSelection),
          ),
        )
        .then(
          () => {
            if (activeUserIdRef.current === ownerUserId) {
              setStorageError(null);
            }
          },
          () => {
            if (activeUserIdRef.current === ownerUserId) {
              setStorageError(
                "Non è stato possibile salvare le preferenze locali.",
              );
            }
          },
        );
    },
    [],
  );

  const commitSelection = useCallback(
    (nextSelection: DirectorySelectionState) => {
      const ownerUserId = activeUserIdRef.current;

      if (!ownerUserId || hydratedUserIdRef.current !== ownerUserId) {
        return;
      }

      selectionRef.current = nextSelection;
      setSelection(nextSelection);
      enqueuePreferenceWrite(ownerUserId, nextSelection);
    },
    [enqueuePreferenceWrite],
  );

  const selectHospital = useCallback(
    (hospitalId: HospitalId) => {
      if (!HOSPITAL_BY_ID.has(hospitalId)) {
        return;
      }

      const currentSelection = selectionRef.current;
      if (currentSelection.selectedHospitalId === hospitalId) {
        return;
      }

      commitSelection({ ...currentSelection, selectedHospitalId: hospitalId });
    },
    [commitSelection],
  );

  const toggleFavorite = useCallback(
    (contactId: ContactId) => {
      if (!CONTACT_BY_ID.has(contactId)) {
        return;
      }

      const currentSelection = selectionRef.current;
      const isAlreadyFavorite =
        currentSelection.favoriteContactIds.includes(contactId);
      const favoriteContactIds = isAlreadyFavorite
        ? currentSelection.favoriteContactIds.filter((id) => id !== contactId)
        : [...currentSelection.favoriteContactIds, contactId];

      commitSelection({ ...currentSelection, favoriteContactIds });
    },
    [commitSelection],
  );

  const isHydrated = Boolean(
    authenticatedUserId && hydratedUserId === authenticatedUserId,
  );
  const visibleSelection = isHydrated ? selection : EMPTY_SELECTION;

  const selectedHospital =
    HOSPITAL_BY_ID.get(visibleSelection.selectedHospitalId) ?? HOSPITALS[0];
  const selectedContacts = useMemo(
    () =>
      getContactsForHospital(
        DIRECTORY_CONTACTS,
        visibleSelection.selectedHospitalId,
      ),
    [visibleSelection.selectedHospitalId],
  );
  const favoriteContacts = useMemo(
    () =>
      visibleSelection.favoriteContactIds.flatMap((contactId) => {
        const contact = CONTACT_BY_ID.get(contactId);
        return contact ? [contact] : [];
      }),
    [visibleSelection.favoriteContactIds],
  );

  const isFavorite = useCallback(
    (contactId: ContactId) =>
      visibleSelection.favoriteContactIds.includes(contactId),
    [visibleSelection.favoriteContactIds],
  );
  const getContactById = useCallback(
    (contactId: ContactId) => CONTACT_BY_ID.get(contactId),
    [],
  );
  const getHospitalByContactId = useCallback((contactId: ContactId) => {
    const contact = CONTACT_BY_ID.get(contactId);
    return contact ? HOSPITAL_BY_ID.get(contact.hospitalId) : undefined;
  }, []);

  const value = useMemo<DirectoryContextValue>(
    () => ({
      hospitals: HOSPITALS,
      allContacts: DIRECTORY_CONTACTS,
      selectedHospital,
      selectedHospitalId: visibleSelection.selectedHospitalId,
      selectedContacts,
      favoriteContactIds: visibleSelection.favoriteContactIds,
      favoriteContacts,
      isHydrated,
      storageError,
      selectHospital,
      toggleFavorite,
      isFavorite,
      getContactById,
      getHospitalByContactId,
    }),
    [
      favoriteContacts,
      getContactById,
      getHospitalByContactId,
      isFavorite,
      isHydrated,
      selectHospital,
      selectedContacts,
      selectedHospital,
      storageError,
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
