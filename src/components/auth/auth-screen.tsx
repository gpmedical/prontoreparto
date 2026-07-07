import { Link, router } from "expo-router";
import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logotype } from "@/components/brand/logotype";
import { useMockAuth } from "@/features/auth/mock-auth-context";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useCSSVariable,
  View,
} from "@/tw";

type AuthMode = "login" | "signup";

type AuthScreenProps = {
  mode: AuthMode;
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { signIn } = useMockAuth();
  const placeholderTextColor = useCSSVariable("--color-pronto-placeholder");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const isSignup = mode === "signup";

  function handleSubmit() {
    signIn();
    router.replace("/");
  }

  const switchHref = isSignup ? "/login" : "/signup";
  const title = isSignup ? "Crea nuovo account" : "Accedi";
  const submitLabel = isSignup ? "Crea account" : "Accedi";
  const switchQuestion = isSignup ? "Hai già un account?" : "Non hai ancora un account?";
  const switchLabel = isSignup ? "Accedi" : "Crea account";
  const contentWidth = Math.min(Math.max(width - 40, 280), 440);

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

          <View className="gap-4 rounded-lg border border-white/30 bg-white/10 p-3">
            <View className="flex-row gap-2 rounded-lg bg-white/15 p-1">
              <Link href="/login" asChild>
                <Pressable
                  className={`min-h-10 flex-1 items-center justify-center rounded-lg px-3 ${
                    isSignup ? "bg-transparent" : "bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      isSignup ? "text-pronto-mist" : "text-pronto-teal-dark"
                    }`}
                  >
                    Accedi
                  </Text>
                </Pressable>
              </Link>
              <Link href="/signup" asChild>
                <Pressable
                  className={`min-h-10 flex-1 items-center justify-center rounded-lg px-3 ${
                    isSignup ? "bg-white" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      isSignup ? "text-pronto-teal-dark" : "text-pronto-mist"
                    }`}
                  >
                    Registrati
                  </Text>
                </Pressable>
              </Link>
            </View>

            <View className="gap-1 px-1">
              <Text className="text-[32px] text-white text-center font-bold">{title}</Text>
            </View>
          </View>

          <View className="gap-5 rounded-lg border border-pronto-line bg-pronto-surface p-5 shadow-lg">
            {isSignup ? (
              <View className="gap-2">
                <Text className="text-sm font-bold text-pronto-ink">Nome e cognome</Text>
                <TextInput
                  autoCapitalize="words"
                  autoComplete="name"
                  placeholder="Es. Maria Rossi"
                  placeholderTextColor={placeholderTextColor}
                  value={fullName}
                  onChangeText={setFullName}
                  className="min-h-[52px] rounded-lg border border-pronto-line bg-white px-4 text-base text-pronto-ink"
                />
              </View>
            ) : null}

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
                onChangeText={setEmail}
                className="min-h-[52px] rounded-lg border border-pronto-line bg-white px-4 text-base text-pronto-ink"
              />
            </View>

            <View className="gap-2">
              <View className="flex-row items-center justify-between gap-3">
                <Text className="text-sm font-bold text-pronto-ink">Password</Text>
                {!isSignup ? (
                  <Link href="/forgot-password" asChild>
                    <Pressable className="px-1 py-1">
                      <Text className="text-xs font-bold text-pronto-teal-dark">
                        Password dimenticata?
                      </Text>
                    </Pressable>
                  </Link>
                ) : null}
              </View>
              <TextInput
                autoCapitalize="none"
                autoComplete={isSignup ? "new-password" : "current-password"}
                placeholder="Password"
                placeholderTextColor={placeholderTextColor}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="min-h-[52px] rounded-lg border border-pronto-line bg-white px-4 text-base text-pronto-ink"
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleSubmit}
              className="min-h-[54px] items-center justify-center rounded-lg bg-pronto-teal-dark px-4 active:bg-pronto-ink"
            >
              <Text className="text-base font-bold text-white">{submitLabel}</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
