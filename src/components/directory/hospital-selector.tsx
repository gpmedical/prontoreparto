import { AppSymbol } from "@/components/ui/app-symbol";
import type { Hospital, HospitalId } from "@/features/directory";
import { Pressable, Text, View } from "@/tw";

type HospitalSelectorProps = {
  hospitals: readonly Hospital[];
  isOpen: boolean;
  onChange: (hospitalId: HospitalId) => void;
  onToggle: () => void;
  selectedHospital: Hospital;
};

export function HospitalSelector({
  hospitals,
  isOpen,
  onChange,
  onToggle,
  selectedHospital,
}: HospitalSelectorProps) {
  return (
    <View className="gap-2">
      <Pressable
        accessibilityHint="Apre l'elenco degli ospedali disponibili"
        accessibilityLabel={`Ospedale selezionato: ${selectedHospital.name}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        className="min-h-[72px] flex-row items-center gap-3 rounded-2xl border border-pronto-line bg-white px-4 py-3 active:bg-pronto-teal-soft"
        onPress={onToggle}
      >
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-pronto-teal-soft">
          <AppSymbol name="hospital" size={23} tintColor="#006978" />
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-[11px] font-bold uppercase tracking-wider text-pronto-placeholder">
            Ospedale selezionato
          </Text>
          <Text selectable className="text-base font-bold text-pronto-ink" numberOfLines={2}>
            {selectedHospital.name}
          </Text>
          <Text selectable className="text-xs text-pronto-secondary">
            {selectedHospital.city}
          </Text>
        </View>
        <AppSymbol
          name={isOpen ? "chevronUp" : "chevronDown"}
          size={18}
          tintColor="#006978"
        />
      </Pressable>

      {isOpen ? (
        <View className="overflow-hidden rounded-2xl border border-pronto-line bg-white">
          {hospitals.map((hospital, index) => {
            const isSelected = hospital.id === selectedHospital.id;

            return (
              <Pressable
                accessibilityLabel={`${hospital.name}, ${hospital.city}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={`min-h-[58px] flex-row items-center gap-3 px-4 py-3 active:bg-pronto-teal-soft ${
                  index > 0 ? "border-t border-pronto-line" : ""
                }`}
                key={hospital.id}
                onPress={() => onChange(hospital.id)}
              >
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-pronto-teal-dark bg-pronto-teal-dark"
                      : "border-pronto-line bg-white"
                  }`}
                >
                  {isSelected ? (
                    <Text className="text-xs font-bold text-white">✓</Text>
                  ) : null}
                </View>
                <View className="min-w-0 flex-1">
                  <Text selectable className="text-sm font-bold text-pronto-ink">
                    {hospital.name}
                  </Text>
                  <Text selectable className="text-xs text-pronto-secondary">
                    {hospital.city}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
