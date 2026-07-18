import { Text, View } from "@/tw";

type SettingRowProps = {
  description: string;
  label: string;
  value: string;
};

export function SettingRow({ description, label, value }: SettingRowProps) {
  return (
    <View className="gap-2 py-1">
      <View className="flex-row items-start justify-between gap-4">
        <Text selectable className="flex-1 text-base font-bold text-pronto-ink">
          {label}
        </Text>
        <Text selectable className="text-sm font-bold text-pronto-teal-dark">
          {value}
        </Text>
      </View>
      <Text selectable className="text-sm leading-5 text-pronto-secondary">
        {description}
      </Text>
    </View>
  );
}
