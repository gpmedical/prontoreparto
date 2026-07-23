import * as Linking from "expo-linking";
import { Stack, useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, type LayoutChangeEvent } from "react-native";
import Animated, { FadeInRight, FadeOutRight } from "react-native-reanimated";

import { CONTACT_PRESENTATION } from "@/components/directory/contact-presentation";
import { DirectoryLoadError } from "@/components/directory/directory-load-error";
import { AppSymbol } from "@/components/ui/app-symbol";
import {
  getContactActionUrl,
  type ContactId,
  useDirectory,
} from "@/features/directory";
import { Pressable, ScrollView, Text, View } from "@/tw";

const webDetailEntering =
  process.env.EXPO_OS === "web" ? FadeInRight.duration(220) : undefined;
const webDetailExiting =
  process.env.EXPO_OS === "web" ? FadeOutRight.duration(160) : undefined;
const contactTitleBaseFontSize = 20;
const contactTitleMinimumFontSize = 16;

function getContactTitleLineHeight(fontSize: number) {
  return Math.round(fontSize * 1.4);
}

export function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const {
    directoryError,
    getContactById,
    getHospitalByContactId,
    isFavorite,
    isHydrated,
    reloadDirectory,
    toggleFavorite,
  } = useDirectory();
  const [isOpeningAction, setIsOpeningAction] = useState(false);
  const contactId = id as ContactId;
  const [contactTitleSizing, setContactTitleSizing] = useState({
    contactId,
    fontSize: contactTitleBaseFontSize,
  });
  const contact = getContactById(contactId);
  const hospital = getHospitalByContactId(contactId);
  const contactTitleFontSize =
    contactTitleSizing.contactId === contactId
      ? contactTitleSizing.fontSize
      : contactTitleBaseFontSize;
  const contactTitleLineHeight = getContactTitleLineHeight(contactTitleFontSize);

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
        <AppSymbol name="info" size={32} tintColor="#5c7d84" />
        <Text selectable className="text-center text-lg font-extrabold text-pronto-ink">
          Contatto non disponibile
        </Text>
        <Text selectable className="text-center text-sm leading-5 text-pronto-secondary">
          Potrebbe essere stato rimosso dalla rubrica.
        </Text>
      </ScrollView>
    );
  }

  const presentation = CONTACT_PRESENTATION[contact.type];
  const favorite = isFavorite(contact.id);
  const actionUrl = getContactActionUrl(contact, hospital);
  const isEmailAction = contact.type === "email";

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

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(pathname.startsWith("/preferiti") ? "/preferiti" : "/home");
  }

  function handleContactTitleLayout(event: LayoutChangeEvent) {
    const titleHeight = event.nativeEvent.layout.height;
    const fitsWithinTwoLines = titleHeight <= contactTitleLineHeight * 2 + 1;

    if (fitsWithinTwoLines || contactTitleFontSize <= contactTitleMinimumFontSize) {
      return;
    }

    setContactTitleSizing({
      contactId,
      fontSize: Math.max(
        contactTitleMinimumFontSize,
        contactTitleFontSize - 1,
      ),
    });
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.View
        entering={webDetailEntering}
        exiting={webDetailExiting}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 bg-pronto-surface"
          contentContainerClassName="grow gap-5 px-4 pb-8 pt-3"
          contentInsetAdjustmentBehavior="automatic"
        >
        <View className="flex-row items-start gap-2">
          <Pressable
            accessibilityLabel="Indietro"
            accessibilityRole="button"
            className="h-12 w-10 shrink-0 items-center justify-center rounded-full active:bg-pronto-teal-soft"
            onPress={handleBack}
          >
            <AppSymbol name="chevronLeft" size={26} tintColor="#006978" />
          </Pressable>

          <View className="min-w-0 flex-1 flex-row items-start gap-3 rounded-2xl border border-pronto-line bg-white px-4 py-3">
            <View className="min-w-0 flex-1 items-center gap-1">
              <Text
                onLayout={handleContactTitleLayout}
                selectable
                className="break-normal text-center font-bold text-pronto-ink"
                style={{
                  fontSize: contactTitleFontSize,
                  lineHeight: contactTitleLineHeight,
                }}
                textBreakStrategy="highQuality"
              >
                {contact.name}
              </Text>
              <Text
                selectable
                className="text-center text-sm leading-5 text-pronto-secondary"
              >
                {hospital.name} · {hospital.city}
              </Text>
            </View>

            <Pressable
              accessibilityLabel={favorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
              accessibilityRole="button"
              accessibilityState={{ selected: favorite }}
              className={`h-12 w-12 shrink-0 items-center justify-center rounded-full border active:bg-pronto-pager-soft ${
                favorite
                  ? "border-pronto-pager bg-pronto-pager-soft"
                  : "border-pronto-line bg-white"
              }`}
              onPress={() => toggleFavorite(contact.id)}
            >
              {favorite ? (
                <AppSymbol name="favorite" size={28} tintColor="#b45309" />
              ) : (
                <AppSymbol name="favoriteOutline" size={25} tintColor="#5c7d84" />
              )}
            </Pressable>
          </View>
        </View>

      <View className="flex-1 items-center justify-center gap-5 rounded-2xl border border-pronto-line bg-white px-5 py-10">
        <View
          className="flex-row items-center gap-2.5 rounded-full px-5 py-3"
          style={{ backgroundColor: presentation.softColor }}
        >
          <AppSymbol name={presentation.icon} size={22} tintColor={presentation.color} />
          <Text className="text-lg font-bold" style={{ color: presentation.color }}>
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

        {contact.type === "cicalino" ? (
          <View className="max-w-[360px] flex-row gap-2 rounded-xl bg-pronto-pager-soft px-3.5 py-3">
            <AppSymbol name="info" size={18} tintColor="#b45309" />
            <Text selectable className="min-w-0 flex-1 text-sm leading-5 text-pronto-pager">
              Il cicalino è utilizzabile soltanto dall'interno dell'ospedale.
            </Text>
          </View>
        ) : null}
      </View>

      {actionUrl ? (
        <Pressable
          accessibilityLabel={contact.type === "email" ? "Scrivi un'email" : "Chiama il contatto"}
          accessibilityRole="button"
          accessibilityState={{ busy: isOpeningAction, disabled: isOpeningAction }}
          className="min-h-[56px] flex-row items-center justify-center rounded-2xl bg-pronto-teal-dark px-5 active:bg-pronto-ink disabled:opacity-60"
          disabled={isOpeningAction}
          onPress={handleContactAction}
        >
          <Text className="text-base font-bold text-white">
            {isOpeningAction
              ? "Apertura…"
              : contact.type === "email"
                ? "Scrivi un'email"
                : "Chiama"}
          </Text>
        </Pressable>
      ) : null}

        </ScrollView>
      </Animated.View>
    </>
  );
}
