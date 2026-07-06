import { Redirect, Stack } from "expo-router";

import { useMockAuth } from "@/features/auth/mock-auth-context";
import { useCSSVariable } from "@/tw";

export default function AppLayout() {
  const { isSignedIn } = useMockAuth();
  const prontoTeal = useCSSVariable("--color-pronto-teal");

  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: prontoTeal },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
