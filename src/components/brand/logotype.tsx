import { Text, View } from "@/tw";

export function Logotype() {
  return (
    <View className="w-full flex-row items-center justify-center gap-3">
      <View className="h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg border border-white/35 bg-white">
        <Text className="text-[21px] font-bold text-pronto-teal-dark">PR</Text>
      </View>
      <View className="min-w-0">
        <Text className="text-[25px] font-bold text-white">ProntoReparto</Text>
      </View>
    </View>
  );
}
