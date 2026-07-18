import { Text, View } from "@/tw";

type PreviewStepProps = {
  description: string;
  number: string;
  title: string;
};

export function PreviewStep({ description, number, title }: PreviewStepProps) {
  return (
    <View className="flex-row items-start gap-3">
      <View
        accessible
        accessibilityLabel={`Passaggio ${number}`}
        className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pronto-teal-soft"
      >
        <Text className="text-sm font-extrabold text-pronto-teal-dark">{number}</Text>
      </View>
      <View className="flex-1 gap-1 pt-0.5">
        <Text selectable className="text-base font-bold text-pronto-ink">
          {title}
        </Text>
        <Text selectable className="text-sm leading-5 text-pronto-secondary">
          {description}
        </Text>
      </View>
    </View>
  );
}
