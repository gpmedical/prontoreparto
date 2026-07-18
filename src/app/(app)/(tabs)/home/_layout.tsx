import { Stack } from "expo-router";

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#f7fdfe" },
        headerBackButtonDisplayMode: "minimal",
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#f7fdfe" },
        headerTintColor: "#006978",
        headerTitleStyle: { color: "#082f3a", fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Rubrica" }} />
      <Stack.Screen name="contatto/[id]" options={{ title: "Dettaglio contatto" }} />
    </Stack>
  );
}
