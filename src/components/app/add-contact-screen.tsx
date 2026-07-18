import { AppScreen } from "@/components/app/app-screen";
import { PreviewStep } from "@/components/app/preview-step";
import { Text, View } from "@/tw";

export function AddContactScreen() {
  return (
    <AppScreen subtitle="Proponi un nuovo contatto o segnala una correzione alla rubrica.">
      <View className="gap-4 rounded-2xl border border-pronto-line bg-white p-5">
        <View className="self-start rounded-full bg-pronto-teal-soft px-3 py-1.5">
          <Text selectable className="text-xs font-extrabold uppercase tracking-wide text-pronto-teal-dark">
            Prossimamente
          </Text>
        </View>

        <Text
          accessibilityRole="header"
          selectable
          className="text-xl font-extrabold text-pronto-ink"
        >
          Le segnalazioni non sono ancora attive
        </Text>
      </View>

      <View className="gap-5 rounded-2xl border border-pronto-line bg-white p-5">
        <View className="gap-1.5">
          <Text
            accessibilityRole="header"
            selectable
            className="text-lg font-extrabold text-pronto-ink"
          >
            Come funzionerà
          </Text>
          <Text selectable className="text-sm leading-5 text-pronto-secondary">
            Ogni proposta verrà controllata prima di comparire nella rubrica.
          </Text>
        </View>

        <PreviewStep
          number="1"
          title="Inserisci la proposta"
          description="Scegli l'ospedale e indica nome, tipo di contatto (fisso, cicalino o email) e recapito."
        />
        <View className="ml-4 h-4 w-px bg-pronto-line" />
        <PreviewStep
          number="2"
          title="Revisione"
          description="La segnalazione viene validata per evitare numeri errati o duplicati."
        />
        <View className="ml-4 h-4 w-px bg-pronto-line" />
        <PreviewStep
          number="3"
          title="Pubblicazione"
          description="Dopo l'approvazione, il contatto diventa disponibile nella rubrica."
        />
      </View>

      <View className="gap-2 rounded-2xl bg-pronto-teal-soft p-5">
        <Text
          accessibilityRole="header"
          selectable
          className="text-base font-extrabold text-pronto-ink"
        >
          Dati da non condividere
        </Text>
        <Text selectable className="text-sm leading-5 text-pronto-secondary">
          Le segnalazioni dovranno contenere soltanto recapiti operativi. Non inserire mai dati
          clinici, informazioni sui pazienti o credenziali personali.
        </Text>
      </View>
    </AppScreen>
  );
}
