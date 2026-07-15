import "@/global.css";

import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Text, View } from "@/tw";

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function MissingClerkConfig() {
  return (
    <View className="flex-1 items-center justify-center bg-pronto-teal px-6">
      <View className="max-w-[420px] gap-3 rounded-lg border border-white/30 bg-white/10 p-5">
        <Text className="text-center text-xl font-bold text-white">
          Configurazione Clerk mancante
        </Text>
        <Text className="text-center text-sm leading-5 text-pronto-mist">
          Aggiungi EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY al file .env e riavvia Expo.
        </Text>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {clerkPublishableKey ? (
        <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </ClerkProvider>
      ) : (
        <>
          <StatusBar style="light" />
          <MissingClerkConfig />
        </>
      )}
    </SafeAreaProvider>
  );
}
