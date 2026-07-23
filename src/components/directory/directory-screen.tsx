import { useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";

import { DirectoryLoadError } from "@/components/directory/directory-load-error";
import { ContactRow } from "@/components/directory/contact-row";
import { HospitalSelector } from "@/components/directory/hospital-selector";
import { AppSymbol } from "@/components/ui/app-symbol";
import { useDirectory, type HospitalId } from "@/features/directory";
import { Pressable, ScrollView, Text, TextInput, useCSSVariable, View } from "@/tw";

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it-IT");
}

export function DirectoryScreen() {
  const {
    directoryError,
    hospitals,
    isFavorite,
    isHydrated,
    reloadDirectory,
    selectHospital,
    selectedContacts,
    selectedHospital,
    storageError,
  } = useDirectory();
  const placeholderTextColor = useCSSVariable("--color-pronto-placeholder");
  const [isHospitalMenuOpen, setIsHospitalMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredContacts = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query.trim());
    const matchingContacts = normalizedQuery
      ? selectedContacts.filter((contact) => {
          const searchableText = [contact.name, contact.value, ...(contact.searchTerms ?? [])]
            .join(" ");
          return normalizeSearchText(searchableText).includes(normalizedQuery);
        })
      : selectedContacts;

    return [...matchingContacts].sort((firstContact, secondContact) =>
      firstContact.name.localeCompare(secondContact.name, "it-IT", { sensitivity: "base" }),
    );
  }, [query, selectedContacts]);

  if (directoryError) {
    return <DirectoryLoadError onRetry={reloadDirectory} />;
  }

  if (!isHydrated || !selectedHospital) {
    return (
      <ScrollView
        className="flex-1 bg-pronto-surface"
        contentContainerClassName="grow items-center justify-center gap-3 px-5 py-8"
        contentInsetAdjustmentBehavior="automatic"
      >
        <ActivityIndicator color="#007c83" size="large" />
        <Text selectable className="text-sm font-bold text-pronto-secondary">
          Caricamento della rubrica…
        </Text>
      </ScrollView>
    );
  }

  const handleHospitalChange = (hospitalId: HospitalId) => {
    selectHospital(hospitalId);
    setIsHospitalMenuOpen(false);
  };

  return (
    <View className="flex-1 bg-pronto-surface">
      <ScrollView
        alwaysBounceVertical
        className="flex-1"
        contentContainerClassName="gap-5 px-4 pb-8 pt-3"
        contentInsetAdjustmentBehavior="automatic"
        decelerationRate="normal"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        <HospitalSelector
          hospitals={hospitals}
          isOpen={false}
          onChange={handleHospitalChange}
          onToggle={() => setIsHospitalMenuOpen(true)}
          selectedHospital={selectedHospital}
        />

        {storageError ? (
        <View className="flex-row gap-2 rounded-xl border border-pronto-danger/20 bg-pronto-danger-soft px-3.5 py-3">
          <AppSymbol name="info" size={18} tintColor="#b42318" />
          <Text selectable className="min-w-0 flex-1 text-sm leading-5 text-pronto-danger">
            Le preferenze restano attive in questa sessione, ma non è stato possibile salvarle.
          </Text>
        </View>
        ) : null}

        <View className="min-h-[50px] flex-row items-center gap-2.5 rounded-xl border border-pronto-line bg-white px-3.5">
        <AppSymbol name="search" size={19} tintColor="#5c7d84" />
        <TextInput
          accessibilityLabel="Cerca nella rubrica"
          autoCapitalize="none"
          autoCorrect={false}
          className="min-w-0 flex-1 py-3 text-base text-pronto-ink"
          onChangeText={setQuery}
          placeholder="Cerca reparto, servizio o ruolo"
          placeholderTextColor={placeholderTextColor}
          returnKeyType="search"
          value={query}
        />
        </View>

        <Animated.View
          entering={FadeInDown.duration(220).reduceMotion(ReduceMotion.System)}
          key={selectedHospital.id}
        >
        {filteredContacts.length > 0 ? (
          <View className="overflow-hidden rounded-2xl border border-pronto-line">
            {filteredContacts.map((contact, index) => (
              <View
                className={index > 0 ? "border-t border-pronto-line" : ""}
                key={contact.id}
              >
                <ContactRow
                  contact={contact}
                  isFavorite={isFavorite(contact.id)}
                  showDetails={false}
                />
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center gap-2 rounded-2xl border border-pronto-line bg-white px-5 py-8">
            <AppSymbol name="search" size={28} tintColor="#5c7d84" />
            <Text selectable className="text-base font-bold text-pronto-ink">
              Nessun contatto trovato
            </Text>
            <Text selectable className="text-center text-sm leading-5 text-pronto-secondary">
              Prova con un altro nome, reparto o numero.
            </Text>
          </View>
        )}
        </Animated.View>
      </ScrollView>

      {isHospitalMenuOpen ? (
        <View
          accessibilityViewIsModal
          className="absolute inset-0 z-50 px-4 pb-3 pt-3"
        >
          <Pressable
            accessibilityLabel="Chiudi l'elenco degli ospedali"
            accessibilityRole="button"
            className="absolute inset-0 bg-pronto-ink/10"
            onPress={() => setIsHospitalMenuOpen(false)}
          />
          <HospitalSelector
            hospitals={hospitals}
            isOpen
            onChange={handleHospitalChange}
            onToggle={() => setIsHospitalMenuOpen(false)}
            selectedHospital={selectedHospital}
          />
        </View>
      ) : null}
    </View>
  );
}
