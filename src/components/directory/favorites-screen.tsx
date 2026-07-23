import { ActivityIndicator } from "react-native";

import { ContactRow } from "@/components/directory/contact-row";
import { DirectoryLoadError } from "@/components/directory/directory-load-error";
import { FavoriteIcon } from "@/components/ui/favorite-icon";
import { useDirectory } from "@/features/directory";
import { ScrollView, Text, View } from "@/tw";

export function FavoritesScreen() {
  const {
    directoryError,
    favoriteContacts,
    getHospitalByContactId,
    isHydrated,
    reloadDirectory,
  } = useDirectory();

  if (directoryError) {
    return <DirectoryLoadError onRetry={reloadDirectory} />;
  }

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
      <View
        className={
          favoriteContacts.length > 0
            ? "overflow-hidden rounded-2xl border border-pronto-line bg-white"
            : "flex-1 overflow-hidden rounded-2xl border border-pronto-line bg-white"
        }
      >
        <View className="px-5 py-4">
          <Text className="text-center text-lg font-bold text-pronto-ink">
            Contatti preferiti
          </Text>
        </View>

        {favoriteContacts.length > 0 ? (
          <View>
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
                  showDetails={false}
                />
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center gap-3 px-7 py-10">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-pronto-pager-soft">
              <FavoriteIcon
                selected={false}
                size={31}
                tintColor="#b45309"
              />
            </View>
            <Text selectable className="text-center text-lg font-bold text-pronto-ink">
              Nessun preferito
            </Text>
            <Text selectable className="text-center text-sm leading-5 text-pronto-secondary">
              Apri un contatto dalla Home e tocca la stella per ritrovarlo qui.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
