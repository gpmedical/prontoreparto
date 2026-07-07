import { Link } from "expo-router";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logotype } from "@/components/brand/logotype";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useCSSVariable,
  View,
} from "@/tw";

export function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const placeholderTextColor = useCSSVariable("--color-pronto-placeholder");
  const [email, setEmail] = useState("");
  const [hasSentLink, setHasSentLink] = useState(false);
  const contentWidth = Math.min(Math.max(width - 40, 280), 440);

  function handleSendResetLink() {
    setHasSentLink(true);
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-pronto-teal" behavior="padding">
      <ScrollView
        className="flex-1 bg-pronto-teal"
        contentContainerClassName="grow items-center justify-center gap-7 px-5"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24),
          paddingTop: Math.max(insets.top, 36),
        }}
      >
        <View className="gap-6" style={{ width: contentWidth }}>
          <Logotype />

          <View className="gap-4 rounded-lg border border-white/30 bg-white/10 p-4">
            <View className="gap-1 px-1">
              <Text className="text-[32px] text-white text-center font-bold">
                Reimposta la password
              </Text>
              <Text className="text-base text-center text-pronto-mist">
                Inserisci la tua email. Ti invieremo un link per impostare una nuova password.
              </Text>
            </View>
          </View>

          <View className="gap-5 rounded-lg border border-pronto-line bg-pronto-surface p-5 shadow-lg">
            <View className="gap-2">
              <Text className="text-sm font-bold text-pronto-ink">Email</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                inputMode="email"
                keyboardType="email-address"
                placeholder="nome@ospedale.it"
                placeholderTextColor={placeholderTextColor}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setHasSentLink(false);
                }}
                className="min-h-[52px] rounded-lg border border-pronto-line bg-white px-4 text-base text-pronto-ink"
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleSendResetLink}
              className="min-h-[54px] items-center justify-center rounded-lg bg-pronto-teal-dark px-4 active:bg-pronto-ink"
            >
              <Text className="text-base font-bold text-white">Invia link</Text>
            </Pressable>

            {hasSentLink ? (
              <View className="rounded-lg border border-pronto-line bg-pronto-teal-soft px-4 py-3">
                <Text className="text-sm font-bold text-pronto-ink">
                  Se l'indirizzo e corretto, riceverai un link per reimpostare la password.
                </Text>
              </View>
            ) : null}

            <View className="h-px bg-pronto-line" />

            <View className="flex-row flex-wrap items-center justify-center gap-x-1 gap-y-1">
              <Text className="text-sm text-pronto-secondary">Ti ricordi la password?</Text>
              <Link href="/login" asChild>
                <Pressable className="px-1 py-1">
                  <Text className="text-sm font-bold text-pronto-teal-dark">Accedi</Text>
                </Pressable>
              </Link>
            </View>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
