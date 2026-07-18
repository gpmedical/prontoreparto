import type { ReactNode } from "react";

import { ScrollView, Text, View } from "@/tw";

type AppScreenProps = {
  children: ReactNode;
  subtitle: string;
};

export function AppScreen({ children, subtitle }: AppScreenProps) {
  return (
    <ScrollView
      className="flex-1 bg-pronto-surface"
      contentContainerClassName="grow items-center px-4 py-5"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full gap-6" style={{ maxWidth: 680 }}>
        <View className="px-1">
          <Text selectable className="text-base leading-6 text-pronto-secondary">
            {subtitle}
          </Text>
        </View>

        {children}
      </View>
    </ScrollView>
  );
}
