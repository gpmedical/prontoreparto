import { NativeTabs } from "expo-router/unstable-native-tabs";

const teal = "#007c83";

export default function AppTabsLayout() {
  return (
    <NativeTabs
      backgroundColor="#ffffff"
      disableTransparentOnScrollEdge
      iconColor={{ default: "#617477", selected: teal }}
      indicatorColor="#d9f6f8"
      labelStyle={{ default: { color: "#617477" }, selected: { color: teal } }}
      minimizeBehavior="onScrollDown"
      tintColor={teal}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
        />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="preferiti">
        <NativeTabs.Trigger.Icon
          sf={{ default: "star", selected: "star.fill" }}
          md={{ default: "favorite_border", selected: "favorite" }}
        />
        <NativeTabs.Trigger.Label>Preferiti</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="aggiungi">
        <NativeTabs.Trigger.Icon
          sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
          md="add_circle"
        />
        <NativeTabs.Trigger.Label>Aggiungi</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="impostazioni">
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md="settings"
        />
        <NativeTabs.Trigger.Label>Impostazioni</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
