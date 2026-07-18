import { useClerk, useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useState } from "react";

import { AppScreen } from "@/components/app/app-screen";
import { SettingRow } from "@/components/app/setting-row";
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

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
          label="Ospedale predefinito"
          value="Dalla Home"
          description="Puoi cambiare l'ospedale dalla selezione in alto nella schermata Home. La scelta viene ricordata tra una sessione e l'altra."
        />
        <View className="h-px bg-pronto-line" />
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
          value="Dati demo"
          description="I contatti sono locali e di esempio finché la connessione a Supabase non sarà attiva."
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
    </AppScreen>
  );
}
