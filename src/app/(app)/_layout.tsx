import { Redirect, Stack } from "expo-router";

import { useMockAuth } from "@/features/auth/mock-auth-context";

export default function AppLayout() {
  const { isSignedIn } = useMockAuth();

  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0097a7" },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
