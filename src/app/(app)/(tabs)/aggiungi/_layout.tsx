import { Stack } from "expo-router";

export default function AddStackLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#f7fdfe" },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#f7fdfe" },
        headerTitleStyle: { color: "#082f3a", fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
