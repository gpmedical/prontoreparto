import { Text, View } from "@/tw";

export function Logotype() {
  return (
    <View className="items-start gap-2.5">
      <View className="h-[54px] w-[54px] items-center justify-center rounded-lg bg-white">
        <Text className="text-[22px] font-black text-pronto-teal">PR</Text>
      </View>
      <Text className="text-[28px] font-black text-white">ProntoReparto</Text>
    </View>
  );
}
