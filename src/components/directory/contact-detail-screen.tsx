import * as Linking from "expo-linking";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert } from "react-native";

import { CONTACT_PRESENTATION, getContactValueLabel } from "@/components/directory/contact-presentation";
import { AppSymbol } from "@/components/ui/app-symbol";
import {
  formatDialNumber,
  getContactActionUrl,
  type ContactId,
  useDirectory,
} from "@/features/directory";
import { Pressable, ScrollView, Text, View } from "@/tw";

export function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getContactById,
    getHospitalByContactId,
    isFavorite,
    isHydrated,
    toggleFavorite,
  } = useDirectory();
  const [isOpeningAction, setIsOpeningAction] = useState(false);
  const contactId = id as ContactId;
  const contact = getContactById(contactId);
  const hospital = getHospitalByContactId(contactId);

  if (!isHydrated) {
    return (
      <ScrollView
        className="flex-1 bg-pronto-surface"
        contentContainerClassName="grow items-center justify-center gap-3 px-5 py-8"
        contentInsetAdjustmentBehavior="automatic"
      >
        <ActivityIndicator color="#007c83" size="large" />
        <Text selectable className="text-sm font-bold text-pronto-secondary">
          Caricamento del contatto…
        </Text>
      </ScrollView>
    );
  }

  if (!contact || !hospital) {
    return (
      <ScrollView
        className="flex-1 bg-pronto-surface"
        contentContainerClassName="grow items-center justify-center gap-3 px-6 py-10"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Stack.Screen options={{ title: "Contatto non trovato" }} />
        <AppSymbol name="info" size={32} tintColor="#5c7d84" />
        <Text selectable className="text-center text-lg font-extrabold text-pronto-ink">
          Contatto non disponibile
        </Text>
        <Text selectable className="text-center text-sm leading-5 text-pronto-secondary">
          Potrebbe essere stato rimosso dalla rubrica dimostrativa.
        </Text>
      </ScrollView>
    );
  }

  const presentation = CONTACT_PRESENTATION[contact.type];
  const favorite = isFavorite(contact.id);
  const actionUrl = getContactActionUrl(contact, hospital);
  const isEmailAction = contact.type === "email";
  const fullPhoneNumber =
    contact.type === "fisso"
      ? formatDialNumber(hospital.phonePrefix, contact.value)
      : null;

  async function handleContactAction() {
    if (!actionUrl) {
      return;
    }

    setIsOpeningAction(true);

    try {
      const canOpen = await Linking.canOpenURL(actionUrl);

      if (!canOpen) {
        Alert.alert(
          "Azione non disponibile",
          isEmailAction
            ? "Non è stata trovata un'app email su questo dispositivo."
            : "Questo dispositivo non può effettuare chiamate.",
        );
        return;
      }

      await Linking.openURL(actionUrl);
    } catch {
      Alert.alert(
        "Impossibile continuare",
        isEmailAction
          ? "Non è stato possibile aprire l'app email. Riprova."
          : "Non è stato possibile avviare la chiamata. Riprova.",
      );
    } finally {
      setIsOpeningAction(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-pronto-surface"
      contentContainerClassName="grow gap-5 px-4 pb-8 pt-3"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Stack.Screen options={{ title: contact.name }} />

      <View className="flex-row items-start gap-3 rounded-2xl border border-pronto-line bg-white p-5">
        <View className="min-w-0 flex-1 gap-2">
          <Text className="text-xs font-bold uppercase tracking-wider text-pronto-placeholder">
            {contact.kind === "reparto"
              ? "Reparto"
              : contact.kind === "servizio"
                ? "Servizio"
                : "Ruolo"}
          </Text>
          <Text selectable className="text-[27px] font-extrabold leading-8 text-pronto-ink">
            {contact.name}
          </Text>
          <Text selectable className="text-sm leading-5 text-pronto-secondary">
            {hospital.name} · {hospital.city}
          </Text>
        </View>

        <Pressable
          accessibilityLabel={favorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          accessibilityRole="button"
          accessibilityState={{ selected: favorite }}
          className={`h-12 w-12 items-center justify-center rounded-full border active:bg-pronto-pager-soft ${
            favorite
              ? "border-pronto-pager bg-pronto-pager-soft"
              : "border-pronto-line bg-white"
          }`}
          onPress={() => toggleFavorite(contact.id)}
        >
          <AppSymbol
            name={favorite ? "favorite" : "favoriteOutline"}
            size={25}
            tintColor={favorite ? "#b45309" : "#5c7d84"}
          />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center gap-5 rounded-2xl border border-pronto-line bg-white px-5 py-10">
        <View
          className="flex-row items-center gap-2 rounded-full px-3 py-2"
          style={{ backgroundColor: presentation.softColor }}
        >
          <AppSymbol name={presentation.icon} size={17} tintColor={presentation.color} />
          <Text className="text-sm font-bold" style={{ color: presentation.color }}>
            {presentation.label}
          </Text>
        </View>

        <Text
          selectable
          className={`text-center font-extrabold text-pronto-ink ${
            contact.type === "email" ? "text-[23px] leading-8" : "text-[42px] leading-[48px]"
          }`}
        >
          {contact.value}
        </Text>

        {contact.type === "fisso" ? (
          <View className="items-center gap-1">
            <Text selectable className="text-sm font-bold text-pronto-secondary">
              Interno a 4 cifre
            </Text>
            <Text selectable className="text-center text-xs leading-5 text-pronto-placeholder">
              Da fuori ospedale verrà composto {fullPhoneNumber}.
            </Text>
          </View>
        ) : null}

        {contact.type === "cicalino" ? (
          <View className="max-w-[360px] flex-row gap-2 rounded-xl bg-pronto-pager-soft px-3.5 py-3">
            <AppSymbol name="info" size={18} tintColor="#b45309" />
            <Text selectable className="min-w-0 flex-1 text-sm leading-5 text-pronto-pager">
              Il cicalino è utilizzabile soltanto dall'interno dell'ospedale.
            </Text>
          </View>
        ) : null}

        {contact.type === "email" ? (
          <Text selectable className="text-center text-sm text-pronto-secondary">
            Si aprirà l'app email predefinita.
          </Text>
        ) : null}
      </View>

      {actionUrl ? (
        <Pressable
          accessibilityLabel={contact.type === "email" ? "Scrivi un'email" : "Chiama il contatto"}
          accessibilityRole="button"
          accessibilityState={{ busy: isOpeningAction, disabled: isOpeningAction }}
          className="min-h-[56px] flex-row items-center justify-center gap-2.5 rounded-2xl bg-pronto-teal-dark px-5 active:bg-pronto-ink disabled:opacity-60"
          disabled={isOpeningAction}
          onPress={handleContactAction}
        >
          <AppSymbol
            name={contact.type === "email" ? "email" : "phone"}
            size={21}
            tintColor="#ffffff"
          />
          <Text className="text-base font-extrabold text-white">
            {isOpeningAction
              ? "Apertura…"
              : contact.type === "email"
                ? "Scrivi un'email"
                : `Chiama ${getContactValueLabel(contact)}`}
          </Text>
        </Pressable>
      ) : null}

      <Text selectable className="text-center text-xs leading-4 text-pronto-placeholder">
        Contatto dimostrativo · verifica sempre il destinatario prima di procedere.
      </Text>
    </ScrollView>
  );
}
