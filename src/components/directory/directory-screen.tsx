import { useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";

import { ContactRow } from "@/components/directory/contact-row";
import { HospitalSelector } from "@/components/directory/hospital-selector";
import { AppSymbol } from "@/components/ui/app-symbol";
import { useDirectory, type DirectoryContact } from "@/features/directory";
import { ScrollView, Text, TextInput, useCSSVariable, View } from "@/tw";

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("it-IT");
}

function groupContacts(contacts: readonly DirectoryContact[]) {
  const groups = new Map<string, DirectoryContact[]>();

  contacts.forEach((contact) => {
    const letter = contact.name.trim().charAt(0).toLocaleUpperCase("it-IT") || "#";
    const group = groups.get(letter) ?? [];
    group.push(contact);
    groups.set(letter, group);
  });

  return Array.from(groups, ([letter, items]) => ({ letter, items }));
}

export function DirectoryScreen() {
  const {
    hospitals,
    isFavorite,
    isHydrated,
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

    if (!normalizedQuery) {
      return selectedContacts;
    }

    return selectedContacts.filter((contact) => {
      const searchableText = [contact.name, contact.value, ...(contact.searchTerms ?? [])]
        .join(" ");
      return normalizeSearchText(searchableText).includes(normalizedQuery);
    });
  }, [query, selectedContacts]);
  const groupedContacts = useMemo(() => groupContacts(filteredContacts), [filteredContacts]);

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

  return (
    <ScrollView
      className="flex-1 bg-pronto-surface"
      contentContainerClassName="gap-5 px-4 pb-8 pt-3"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <HospitalSelector
        hospitals={hospitals}
        isOpen={isHospitalMenuOpen}
        onChange={(hospitalId) => {
          selectHospital(hospitalId);
          setIsHospitalMenuOpen(false);
        }}
        onToggle={() => setIsHospitalMenuOpen((current) => !current)}
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

      <View className="gap-3">
        <View className="px-1">
          <View className="gap-0.5">
            <Text className="text-lg font-extrabold text-pronto-ink">Rubrica A–Z</Text>
            <Text selectable className="text-sm text-pronto-secondary">
              {filteredContacts.length} {filteredContacts.length === 1 ? "contatto" : "contatti"}
            </Text>
          </View>
        </View>

        {groupedContacts.length > 0 ? (
          groupedContacts.map(({ letter, items }) => (
            <View className="gap-2" key={letter}>
              <Text className="px-1 text-sm font-extrabold text-pronto-teal-dark">
                {letter}
              </Text>
              <View className="overflow-hidden rounded-2xl border border-pronto-line">
                {items.map((contact, index) => (
                  <View
                    className={index > 0 ? "border-t border-pronto-line" : ""}
                    key={contact.id}
                  >
                    <ContactRow contact={contact} isFavorite={isFavorite(contact.id)} />
                  </View>
                ))}
              </View>
            </View>
          ))
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
      </View>
    </ScrollView>
  );
}
