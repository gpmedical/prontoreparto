import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logotype } from "@/components/brand/logotype";
import { useMockAuth } from "@/features/auth/mock-auth-context";
import { Pressable, ScrollView, Text, View } from "@/tw";

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useMockAuth();

  return (
    <ScrollView
      className="flex-1 bg-pronto-teal"
      contentContainerClassName="grow gap-8 px-6"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 24),
        paddingTop: Math.max(insets.top, 36),
      }}
    >
      <View className="flex-1 justify-between gap-8">
        <View className="gap-8">
          <Logotype />
          <View className="gap-2.5">
            <Text className="text-[30px] font-extrabold text-pronto-mist">Home</Text>
            <Text className="text-base leading-[22px] text-pronto-muted">
              Area riservata pronta per rubrica, ospedali e preferiti.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={signOut}
          className="min-h-[50px] items-center justify-center rounded-lg bg-white px-4 active:bg-pronto-teal-soft"
        >
          <Text className="text-base font-extrabold text-pronto-teal-dark">Esci</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
