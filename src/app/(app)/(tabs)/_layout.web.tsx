import { Tabs } from "expo-router";
import { Text, View, type ColorValue } from "react-native";

import { AppSymbol, type AppSymbolName } from "@/components/ui/app-symbol";

const tabIcons = {
  home: "home",
  preferiti: "favorite",
  impostazioni: "settings",
} as const satisfies Record<string, AppSymbolName>;

function AddTabIcon({ color, size }: { color: ColorValue; size: number }) {
  const strokeWidth = Math.max(2, size * 0.1);
  const barLength = size * 0.46;

  return (
    <View
      style={{
        alignItems: "center",
        borderColor: color,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        height: size,
        justifyContent: "center",
        width: size,
      }}
    >
      <View
        style={{
          backgroundColor: color,
          borderRadius: strokeWidth / 2,
          height: strokeWidth,
          position: "absolute",
          width: barLength,
        }}
      />
      <View
        style={{
          backgroundColor: color,
          borderRadius: strokeWidth / 2,
          height: barLength,
          position: "absolute",
          width: strokeWidth,
        }}
      />
    </View>
  );
}

function TabBarLabel({ children, color }: { children: string; color: ColorValue }) {
  return (
    <Text
      style={{
        color,
        fontSize: 12,
        fontWeight: "700",
        lineHeight: 20,
        paddingBottom: 2,
        textAlign: "center",
      }}
    >
      {children}
    </Text>
  );
}

export default function AppTabsWebLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007c83",
        tabBarInactiveTintColor: "#617477",
        tabBarLabel: ({ children, color }) => (
          <TabBarLabel color={color}>{children}</TabBarLabel>
        ),
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#c7e8ed",
          height: 76,
          paddingBottom: 12,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <AppSymbol name={tabIcons.home} size={size} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="preferiti"
        options={{
          title: "Preferiti",
          tabBarIcon: ({ color, size }) => (
            <AppSymbol name={tabIcons.preferiti} size={size} tintColor={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="aggiungi"
        options={{
          title: "Aggiungi",
          tabBarIcon: ({ color, size }) => <AddTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="impostazioni"
        options={{
          title: "Impostazioni",
          tabBarIcon: ({ color, size }) => (
            <AppSymbol name={tabIcons.impostazioni} size={size} tintColor={color} />
          ),
        }}
      />
    </Tabs>
  );
}
