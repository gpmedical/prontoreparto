import { SymbolView, type AndroidSymbol, type SFSymbol } from "expo-symbols";
import type { ComponentProps } from "react";

const symbols = {
  add: { ios: "plus.circle.fill", android: "add_circle" },
  check: { ios: "checkmark.circle.fill", android: "check_circle" },
  chevronDown: { ios: "chevron.down", android: "expand_more" },
  chevronLeft: { ios: "chevron.left", android: "arrow_back" },
  chevronRight: { ios: "chevron.right", android: "chevron_right" },
  chevronUp: { ios: "chevron.up", android: "expand_less" },
  email: { ios: "envelope.fill", android: "email" },
  favorite: { ios: "star.fill", android: "star" },
  favoriteOutline: { ios: "star", android: "star_outline" },
  home: { ios: "house.fill", android: "home" },
  hospital: { ios: "cross.case.fill", android: "local_hospital" },
  info: { ios: "info.circle.fill", android: "info" },
  pager: { ios: "dot.radiowaves.left.and.right", android: "notifications_active" },
  phone: { ios: "phone.fill", android: "phone" },
  search: { ios: "magnifyingglass", android: "search" },
  settings: { ios: "gearshape.fill", android: "settings" },
} as const satisfies Record<string, { ios: SFSymbol; android: AndroidSymbol }>;

export type AppSymbolName = keyof typeof symbols;

type AppSymbolProps = Omit<ComponentProps<typeof SymbolView>, "name"> & {
  name: AppSymbolName;
};

export function AppSymbol({ name, ...props }: AppSymbolProps) {
  const symbol = symbols[name];

  return (
    <SymbolView
      accessibilityElementsHidden
      importantForAccessibility="no"
      name={{ ...symbol, web: symbol.android }}
      resizeMode="scaleAspectFit"
      {...props}
    />
  );
}
