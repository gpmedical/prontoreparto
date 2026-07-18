import { ActivityIndicator } from "react-native";

import { ContactRow } from "@/components/directory/contact-row";
import { AppSymbol } from "@/components/ui/app-symbol";
import { useDirectory } from "@/features/directory";
import { ScrollView, Text, View } from "@/tw";

export function FavoritesScreen() {
  const { favoriteContacts, getHospitalByContactId, isHydrated } = useDirectory();

  if (!isHydrated) {
    return (
      <ScrollView
        className="flex-1 bg-pronto-surface"
        contentContainerClassName="grow items-center justify-center gap-3 px-5 py-8"
        contentInsetAdjustmentBehavior="automatic"
      >
        <ActivityIndicator color="#007c83" size="large" />
        <Text selectable className="text-sm font-bold text-pronto-secondary">
          Caricamento dei preferiti…
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-pronto-surface"
      contentContainerClassName="grow gap-5 px-4 pb-8 pt-3"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="gap-1 px-1">
        <Text className="text-lg font-extrabold text-pronto-ink">I tuoi contatti rapidi</Text>
        <Text selectable className="text-sm leading-5 text-pronto-secondary">
          I preferiti sono personali e restano salvati su questo dispositivo.
        </Text>
      </View>

      {favoriteContacts.length > 0 ? (
        <View className="overflow-hidden rounded-2xl border border-pronto-line">
          {favoriteContacts.map((contact, index) => (
            <View
              className={index > 0 ? "border-t border-pronto-line" : ""}
              key={contact.id}
            >
              <ContactRow
                contact={contact}
                detailTab="preferiti"
                hospitalName={getHospitalByContactId(contact.id)?.name}
                isFavorite
              />
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center gap-3 rounded-2xl border border-pronto-line bg-white px-7 py-10">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-pronto-pager-soft">
            <AppSymbol name="favoriteOutline" size={31} tintColor="#b45309" />
          </View>
          <Text selectable className="text-center text-lg font-extrabold text-pronto-ink">
            Nessun preferito
          </Text>
          <Text selectable className="text-center text-sm leading-5 text-pronto-secondary">
            Apri un contatto dalla Home e tocca la stella per ritrovarlo qui.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
