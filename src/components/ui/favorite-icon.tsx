import { AppSymbol } from "@/components/ui/app-symbol";

type FavoriteIconProps = {
  selected: boolean;
  size?: number;
  tintColor?: string;
};

export function FavoriteIcon({ selected, size = 27, tintColor }: FavoriteIconProps) {
  return (
    <AppSymbol
      name={selected ? "favorite" : "favoriteOutline"}
      size={size}
      tintColor={tintColor ?? (selected ? "#b45309" : "#5c7d84")}
    />
  );
}
