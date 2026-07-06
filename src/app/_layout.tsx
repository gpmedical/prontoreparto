import "@/global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MockAuthProvider } from "@/features/auth/mock-auth-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MockAuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#007d7d" },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </MockAuthProvider>
    </SafeAreaProvider>
  );
}
