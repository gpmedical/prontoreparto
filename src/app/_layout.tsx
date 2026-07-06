import "@/global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MockAuthProvider } from "@/features/auth/mock-auth-context";
import { useCSSVariable } from "@/tw";

export default function RootLayout() {
  const prontoTeal = useCSSVariable("--color-pronto-teal");

  return (
    <SafeAreaProvider>
      <MockAuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: prontoTeal },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </MockAuthProvider>
    </SafeAreaProvider>
  );
}
