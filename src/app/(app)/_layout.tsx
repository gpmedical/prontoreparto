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
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
