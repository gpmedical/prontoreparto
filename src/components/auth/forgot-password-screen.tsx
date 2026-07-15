import { useSignIn } from "@clerk/expo";
import { Link } from "expo-router";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logotype } from "@/components/brand/logotype";
import { getClerkErrorMessage } from "@/features/auth/clerk-errors";
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
  const { signIn } = useSignIn();
  const placeholderTextColor = useCSSVariable("--color-pronto-placeholder");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [isResetPending, setIsResetPending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const contentWidth = Math.min(Math.max(width - 40, 280), 440);

  async function handleSendResetCode() {
    if (!signIn) {
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Inserisci la tua email.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const createResult = await signIn.create({
        identifier: email.trim(),
      });

      if (createResult.error) {
        throw createResult.error;
      }

      const sendCodeResult = await signIn.resetPasswordEmailCode.sendCode();

      if (sendCodeResult.error) {
        throw sendCodeResult.error;
      }

      setIsResetPending(true);
      setMessage("Se l'indirizzo e corretto, riceverai un codice per reimpostare la password.");
    } catch (error) {
      setErrorMessage(getClerkErrorMessage(error, "Invio del codice non riuscito. Riprova."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword() {
    if (!signIn) {
      return;
    }

    if (!code.trim() || !password) {
      setErrorMessage("Inserisci codice e nuova password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const verifyResult = await signIn.resetPasswordEmailCode.verifyCode({
        code: code.trim(),
      });

      if (verifyResult.error) {
        throw verifyResult.error;
      }

      const passwordResult = await signIn.resetPasswordEmailCode.submitPassword({
        password,
      });

      if (passwordResult.error) {
        throw passwordResult.error;
      }

      if (signIn.status === "complete") {
        const finalizeResult = await signIn.finalize();

        if (finalizeResult.error) {
          throw finalizeResult.error;
        }

        return;
      }

      setErrorMessage("Reimpostazione non completata. Controlla il codice e riprova.");
    } catch (error) {
      setErrorMessage(
        getClerkErrorMessage(error, "Reimpostazione password non riuscita. Riprova."),
      );
    } finally {
      setIsSubmitting(false);
    }
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
                Inserisci la tua email. Ti invieremo un codice per impostare una nuova password.
              </Text>
            </View>
          </View>

          <View className="gap-5 rounded-lg border border-pronto-line bg-pronto-surface p-5 shadow-lg">
            {!isResetPending ? (
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
                    setMessage(null);
                    setErrorMessage(null);
                  }}
                  className="min-h-[52px] rounded-lg border border-pronto-line bg-white px-4 text-base text-pronto-ink"
                />
              </View>
            ) : (
              <>
                <View className="gap-2">
                  <Text className="text-sm font-bold text-pronto-ink">Codice email</Text>
                  <TextInput
                    autoCapitalize="none"
                    inputMode="numeric"
                    keyboardType="number-pad"
                    placeholder="Codice di verifica"
                    placeholderTextColor={placeholderTextColor}
                    value={code}
                    onChangeText={(value) => {
                      setCode(value);
                      setErrorMessage(null);
                    }}
                    className="min-h-[52px] rounded-lg border border-pronto-line bg-white px-4 text-base text-pronto-ink"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-bold text-pronto-ink">Nuova password</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="new-password"
                    placeholder="Nuova password"
                    placeholderTextColor={placeholderTextColor}
                    secureTextEntry
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      setErrorMessage(null);
                    }}
                    className="min-h-[52px] rounded-lg border border-pronto-line bg-white px-4 text-base text-pronto-ink"
                  />
                </View>
              </>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !signIn || isSubmitting }}
              disabled={!signIn || isSubmitting}
              onPress={isResetPending ? handleResetPassword : handleSendResetCode}
              className="min-h-[54px] items-center justify-center rounded-lg bg-pronto-teal-dark px-4 active:bg-pronto-ink"
            >
              <Text className="text-base font-bold text-white">
                {isSubmitting ? "Attendi..." : isResetPending ? "Reimposta password" : "Invia codice"}
              </Text>
            </Pressable>

            {message ? (
              <View className="rounded-lg border border-pronto-line bg-pronto-teal-soft px-4 py-3">
                <Text className="text-sm font-bold text-pronto-ink">{message}</Text>
              </View>
            ) : null}

            {errorMessage ? (
              <View className="rounded-lg border border-pronto-line bg-pronto-teal-soft px-4 py-3">
                <Text className="text-sm font-bold text-pronto-ink">{errorMessage}</Text>
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
