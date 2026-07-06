import { Text, View } from "@/tw";

export function Logotype() {
  return (
    <View className="w-full flex-row items-center gap-3">
      <View className="h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg border border-white/35 bg-white">
        <Text className="text-[21px] font-black text-pronto-teal-dark">PR</Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[25px] font-black leading-7 text-white">ProntoReparto</Text>
        <Text className="text-xs font-bold uppercase text-pronto-muted">Rubrica ospedaliera</Text>
      </View>
    </View>
  );
}
