import { Link, router } from "expo-router";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logotype } from "@/components/brand/logotype";
import { useMockAuth } from "@/features/auth/mock-auth-context";
import { KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from "@/tw";

type AuthMode = "login" | "signup";

type AuthScreenProps = {
  mode: AuthMode;
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const { signIn } = useMockAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const isSignup = mode === "signup";

  function handleSubmit() {
    signIn();
    router.replace("/");
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-pronto-teal" behavior="padding">
      <ScrollView
        className="flex-1 bg-pronto-teal"
        contentContainerClassName="grow justify-center gap-7 px-6"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24),
          paddingTop: Math.max(insets.top, 36),
        }}
      >
        <View className="gap-3.5">
          <Logotype />
          <View className="gap-2">
            <Text className="text-[30px] font-extrabold text-pronto-mist">
              {isSignup ? "Crea il tuo accesso" : "Accedi al reparto"}
            </Text>
            <Text className="text-base leading-[22px] text-pronto-muted">
              {isSignup
                ? "Prepara il profilo per consultare contatti e turni ospedalieri."
                : "Entra per raggiungere rapidamente rubrica, preferiti e contatti interni."}
            </Text>
          </View>
        </View>

        <View
          className="gap-4 rounded-lg bg-[#f7ffff] p-[18px]"
        >
          {isSignup ? (
            <View className="gap-2">
              <Text className="text-sm font-bold text-pronto-ink">Nome e cognome</Text>
              <TextInput
                autoCapitalize="words"
                autoComplete="name"
                placeholder="Es. Maria Rossi"
                placeholderTextColor="#6d8585"
                value={fullName}
                onChangeText={setFullName}
                className="rounded-lg border border-[#cfe4e4] px-3.5 py-3 text-base text-pronto-ink"
              />
            </View>
          ) : null}

          <View className="gap-2">
            <Text className="text-sm font-bold text-pronto-ink">Email istituzionale</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              inputMode="email"
              keyboardType="email-address"
              placeholder="nome@ospedale.it"
              placeholderTextColor="#6d8585"
              value={email}
              onChangeText={setEmail}
              className="rounded-lg border border-[#cfe4e4] px-3.5 py-3 text-base text-pronto-ink"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-bold text-pronto-ink">Password</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="Password"
              placeholderTextColor="#6d8585"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="rounded-lg border border-[#cfe4e4] px-3.5 py-3 text-base text-pronto-ink"
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleSubmit}
            className="min-h-[50px] items-center justify-center rounded-lg bg-pronto-teal px-4 active:bg-pronto-teal-dark"
          >
            <Text className="text-base font-extrabold text-white">
              {isSignup ? "Crea account" : "Accedi"}
            </Text>
          </Pressable>

          <View className="items-center">
            <Text className="text-sm text-[#4c6666]">
              {isSignup ? "Hai gia un account?" : "Non hai ancora un account?"}
            </Text>
            <Link href={isSignup ? "/login" : "/signup"} asChild>
              <Pressable className="p-2">
                <Text className="text-[15px] font-extrabold text-pronto-teal-dark">
                  {isSignup ? "Vai al login" : "Registrati"}
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
