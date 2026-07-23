import { AppSymbol, type AppSymbolName } from "@/components/ui/app-symbol";
import type { ContactType } from "@/features/directory";
import { Pressable, Text, View } from "@/tw";

type MethodPresentation = {
  readonly icon: AppSymbolName;
  readonly iconColor: string;
  readonly label: string;
  readonly selectedClassName: string;
  readonly textClassName: string;
  readonly unselectedClassName: string;
};

const METHOD_PRESENTATION = {
  fisso: {
    icon: "phone",
    iconColor: "#2563eb",
    label: "Fisso",
    selectedClassName: "border-2 border-pronto-phone bg-pronto-phone-soft",
    textClassName: "text-pronto-phone",
    unselectedClassName: "border border-pronto-phone/25 bg-pronto-phone-soft/60",
  },
  cicalino: {
    icon: "pager",
    iconColor: "#b45309",
    label: "Cicalino",
    selectedClassName: "border-2 border-pronto-pager bg-pronto-pager-soft",
    textClassName: "text-pronto-pager",
    unselectedClassName: "border border-pronto-pager/25 bg-pronto-pager-soft/60",
  },
  email: {
    icon: "email",
    iconColor: "#7c3aed",
    label: "Email",
    selectedClassName: "border-2 border-pronto-email bg-pronto-email-soft",
    textClassName: "text-pronto-email",
    unselectedClassName: "border border-pronto-email/25 bg-pronto-email-soft/60",
  },
} as const satisfies Record<ContactType, MethodPresentation>;

const METHOD_TYPES = ["fisso", "cicalino", "email"] as const;

type ContactMethodSelectorProps = {
  readonly onChange: (value: ContactType) => void;
  readonly value: ContactType;
};

export function ContactMethodSelector({
  onChange,
  value,
}: ContactMethodSelectorProps) {
  return (
    <View className="gap-2">
      <Text selectable className="text-sm font-bold text-pronto-ink">
        Tipo di contatto
      </Text>
      <View accessibilityRole="radiogroup" className="flex-row gap-2">
        {METHOD_TYPES.map((methodType) => {
          const presentation = METHOD_PRESENTATION[methodType];
          const isSelected = value === methodType;

          return (
            <Pressable
              accessibilityLabel={`Tipo di contatto: ${presentation.label}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              className={`min-h-[72px] flex-1 items-center justify-center gap-1.5 rounded-2xl px-2 py-2 ${
                isSelected
                  ? presentation.selectedClassName
                  : presentation.unselectedClassName
              }`}
              key={methodType}
              onPress={() => onChange(methodType)}
            >
              <AppSymbol
                name={presentation.icon}
                size={22}
                tintColor={presentation.iconColor}
              />
              <Text className={`text-sm font-bold ${presentation.textClassName}`}>
                {presentation.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
