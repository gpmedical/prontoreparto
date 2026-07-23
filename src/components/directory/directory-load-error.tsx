import { AppSymbol } from "@/components/ui/app-symbol";
import { Pressable, ScrollView, Text, View } from "@/tw";

type DirectoryLoadErrorProps = {
  readonly onRetry: () => void;
};

export function DirectoryLoadError({ onRetry }: DirectoryLoadErrorProps) {
  return (
    <ScrollView
      className="flex-1 bg-pronto-surface"
      contentContainerClassName="grow items-center justify-center px-5 py-8"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="w-full max-w-[420px] items-center gap-4 rounded-2xl border border-pronto-line bg-white px-6 py-8">
        <AppSymbol name="info" size={32} tintColor="#b42318" />
        <View className="gap-2">
          <Text
            accessibilityRole="header"
            selectable
            className="text-center text-lg font-extrabold text-pronto-ink"
          >
            Rubrica non disponibile
          </Text>
          <Text
            selectable
            className="text-center text-sm leading-5 text-pronto-secondary"
          >
            Controlla la connessione e riprova. Se il problema continua, verifica
            la configurazione Supabase e Clerk.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          className="min-h-[48px] items-center justify-center rounded-xl bg-pronto-teal-dark px-5 active:bg-pronto-ink"
          onPress={onRetry}
        >
          <Text className="text-sm font-extrabold text-white">Riprova</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

