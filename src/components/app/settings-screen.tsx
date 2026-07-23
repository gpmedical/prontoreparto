import { useClerk, useReverification, useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useState } from "react";
import { Modal } from "react-native";

import { AppScreen } from "@/components/app/app-screen";
import { SettingRow } from "@/components/app/setting-row";
import { useDirectory } from "@/features/directory";
import { deleteDirectoryPreferences } from "@/features/directory/directory-storage";
import { Pressable, Text, View } from "@/tw";

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");

  return initials.toLocaleUpperCase("it-IT") || "PR";
}

export function SettingsScreen() {
  const { signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const { deleteAllFavorites } = useDirectory();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const deleteCurrentUser = useReverification(async () => {
    if (!user) {
      throw new Error("No authenticated Clerk user is available.");
    }

    await user.delete();
  });

  const displayName =
    user?.fullName?.trim() || user?.firstName?.trim() || "Account Pronto Reparto";
  const emailAddress =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses.at(0)?.emailAddress ??
    "Email non disponibile";

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setSignOutError(null);

    try {
      await signOut();
      router.replace("/login");
    } catch {
      setSignOutError("Non è stato possibile uscire. Riprova tra poco.");
    } finally {
      setIsSigningOut(false);
    }
  }

  function openDeleteDialog() {
    setDeleteAccountError(null);
    setIsDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    if (!isDeletingAccount) {
      setIsDeleteDialogOpen(false);
      setDeleteAccountError(null);
    }
  }

  async function handleDeleteAccount() {
    if (isDeletingAccount || !user) {
      return;
    }

    if (!user.deleteSelfEnabled) {
      setDeleteAccountError(
        "La cancellazione autonoma dell'account non è abilitata. Contatta l'assistenza.",
      );
      return;
    }

    const userId = user.id;
    setIsDeletingAccount(true);
    setDeleteAccountError(null);

    try {
      await deleteAllFavorites();
      await deleteCurrentUser();

      try {
        await deleteDirectoryPreferences(userId);
      } catch {
        // The Clerk account has already been deleted; local cleanup is best-effort.
      }

      setIsDeleteDialogOpen(false);
      router.replace("/login");
    } catch {
      setDeleteAccountError(
        "Non è stato possibile eliminare l'account. Riprova oppure annulla l'operazione.",
      );
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <AppScreen subtitle="Gestisci le preferenze dell'app e il tuo account.">
      <View className="gap-4 rounded-2xl border border-pronto-line bg-white p-5">
        <Text
          accessibilityRole="header"
          selectable
          className="text-lg font-extrabold text-pronto-ink"
        >
          Account
        </Text>

        {isLoaded ? (
          <View className="flex-row items-center gap-4">
            <View
              accessible
              accessibilityLabel={`Iniziali di ${displayName}`}
              className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pronto-teal-dark"
            >
              <Text className="text-base font-extrabold text-white">
                {getInitials(displayName)}
              </Text>
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text selectable className="text-base font-extrabold text-pronto-ink">
                {displayName}
              </Text>
              <Text selectable className="text-sm text-pronto-secondary">
                {emailAddress}
              </Text>
            </View>
          </View>
        ) : (
          <Text
            accessibilityLiveRegion="polite"
            selectable
            className="text-sm text-pronto-secondary"
          >
            Caricamento dell'account…
          </Text>
        )}
      </View>

      <View className="gap-4 rounded-2xl border border-pronto-line bg-white p-5">
        <Text
          accessibilityRole="header"
          selectable
          className="text-lg font-extrabold text-pronto-ink"
        >
          Preferenze
        </Text>
        <SettingRow
          label="Aspetto"
          value="Chiaro"
          description="Il tema chiaro ad alto contrasto è l'unico disponibile in questa versione."
        />
      </View>

      <View className="gap-4 rounded-2xl border border-pronto-line bg-white p-5">
        <Text
          accessibilityRole="header"
          selectable
          className="text-lg font-extrabold text-pronto-ink"
        >
          Dati e privacy
        </Text>
        <SettingRow
          label="Rubrica"
          value="Supabase"
          description="I contatti attivi vengono caricati da Supabase e sono disponibili solo agli utenti autenticati."
        />
        <View className="h-px bg-pronto-line" />
        <SettingRow
          label="Suggerimenti"
          value="Non attivi"
          description="Nessuna proposta viene inviata o salvata in questa versione."
        />
      </View>

      <View className="gap-3 pb-2">
        {signOutError ? (
          <View
            accessibilityLiveRegion="assertive"
            className="rounded-xl border border-pronto-line bg-pronto-teal-soft px-4 py-3"
          >
            <Text selectable className="text-sm font-bold text-pronto-ink">
              {signOutError}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityLabel="Elimina il tuo account"
          accessibilityRole="button"
          accessibilityState={{ disabled: !isLoaded || !user || isSigningOut }}
          disabled={!isLoaded || !user || isSigningOut}
          onPress={openDeleteDialog}
          className="min-h-[52px] items-center justify-center rounded-xl bg-pronto-danger px-4 active:opacity-80 disabled:opacity-60"
        >
          <Text className="text-base font-extrabold text-white">
            Elimina il tuo account
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Esci dall'account"
          accessibilityRole="button"
          accessibilityState={{ busy: isSigningOut, disabled: isSigningOut }}
          disabled={isSigningOut}
          onPress={handleSignOut}
          className="min-h-[52px] items-center justify-center rounded-xl border border-pronto-teal-dark bg-white px-4 active:bg-pronto-teal-soft disabled:opacity-60"
        >
          <Text className="text-base font-extrabold text-pronto-teal-dark">
            {isSigningOut ? "Uscita in corso…" : "Esci dall'account"}
          </Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={closeDeleteDialog}
        transparent
        visible={isDeleteDialogOpen}
      >
        <View
          className="flex-1 items-center justify-center px-5 py-8"
          style={{ backgroundColor: "rgba(8, 47, 58, 0.52)" }}
        >
          <View
            accessibilityRole="alert"
            accessibilityViewIsModal
            className="w-full max-w-[420px] gap-4 rounded-2xl bg-white p-5"
          >
            <View className="gap-2">
              <Text
                accessibilityRole="header"
                selectable
                className="text-xl font-extrabold text-pronto-ink"
              >
                Eliminare il tuo account?
              </Text>
              <Text selectable className="text-sm leading-5 text-pronto-secondary">
                Questa azione è definitiva. Il tuo account, i preferiti sincronizzati e le
                preferenze salvate su questo dispositivo verranno eliminati.
              </Text>
            </View>

            {deleteAccountError ? (
              <View
                accessibilityLiveRegion="assertive"
                className="rounded-xl bg-pronto-danger-soft px-4 py-3"
              >
                <Text selectable className="text-sm font-bold text-pronto-danger">
                  {deleteAccountError}
                </Text>
              </View>
            ) : null}

            <View className="gap-2.5">
              <Pressable
                accessibilityLabel="Conferma eliminazione account"
                accessibilityRole="button"
                accessibilityState={{ busy: isDeletingAccount, disabled: isDeletingAccount }}
                disabled={isDeletingAccount}
                onPress={handleDeleteAccount}
                className="min-h-[50px] items-center justify-center rounded-xl bg-pronto-danger px-4 active:opacity-80 disabled:opacity-60"
              >
                <Text className="text-base font-extrabold text-white">
                  {isDeletingAccount ? "Eliminazione in corso…" : "Elimina definitivamente"}
                </Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Annulla eliminazione account"
                accessibilityRole="button"
                accessibilityState={{ disabled: isDeletingAccount }}
                disabled={isDeletingAccount}
                onPress={closeDeleteDialog}
                className="min-h-[50px] items-center justify-center rounded-xl border border-pronto-line bg-white px-4 active:bg-pronto-teal-soft disabled:opacity-60"
              >
                <Text className="text-base font-extrabold text-pronto-ink">Annulla</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}
