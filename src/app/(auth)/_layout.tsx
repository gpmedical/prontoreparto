import { Stack } from "expo-router";

import { useCSSVariable } from "@/tw";

export default function AuthLayout() {
  const prontoTeal = useCSSVariable("--color-pronto-teal");

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: prontoTeal },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
