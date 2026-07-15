import { useSignIn, useSignUp } from "@clerk/expo";
// Social auth is intentionally disabled for now.
// Restore these imports if Google or Apple sign-in is added later.
// import {
//   useSignInWithApple,
//   type StartAppleAuthenticationFlowReturnType,
// } from "@clerk/expo/apple";
// import {
//   useSignInWithGoogle,
//   type StartGoogleAuthenticationFlowReturnType,
// } from "@clerk/expo/google";
import { Link, router } from "expo-router";
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

type AuthMode = "login" | "signup";

type AuthScreenProps = {
  mode: AuthMode;
};

function getNameParts(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const [firstName, ...lastNameParts] = parts;

  return {
    firstName,
    lastName: lastNameParts.length > 0 ? lastNameParts.join(" ") : undefined,
  };
}

export function AuthScreen({ mode }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { signIn: clerkSignIn } = useSignIn();
  const { signUp: clerkSignUp } = useSignUp();
  // Social auth is intentionally disabled for now.
  // Restore these hooks if Google or Apple sign-in is added later.
  // const { startAppleAuthenticationFlow } = useSignInWithApple();
  // const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const placeholderTextColor = useCSSVariable("--color-pronto-placeholder");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationPending, setIsVerificationPending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSignup = mode === "signup";
  const isLoaded = Boolean(clerkSignIn && clerkSignUp);

  // Social auth is intentionally disabled for now.
  // Restore this helper if Google or Apple sign-in is added later.
  // async function activateSocialSession(
  //   result: StartAppleAuthenticationFlowReturnType | StartGoogleAuthenticationFlowReturnType,
  // ) {
  //   if (result.createdSessionId && result.setActive) {
  //     await result.setActive({ session: result.createdSessionId });
  //     router.replace("/");
  //     return;
  //   }
  //
  //   setErrorMessage("Autenticazione non completata. Riprova.");
  // }

  async function handleSignIn() {
    if (!clerkSignIn) {
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage("Inserisci email e password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await clerkSignIn.password({
        emailAddress: email.trim(),
        password,
      });

      if (result.error) {
        throw result.error;
      }

      if (clerkSignIn.status === "complete") {
        const finalizeResult = await clerkSignIn.finalize();

        if (finalizeResult.error) {
          throw finalizeResult.error;
        }

        router.replace("/");
        return;
      }

      setErrorMessage("Accesso non completato. Controlla i dati e riprova.");
    } catch (error) {
      setErrorMessage(getClerkErrorMessage(error, "Accesso non riuscito. Riprova."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignUp() {
    if (!clerkSignUp) {
      return;
    }

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage("Inserisci nome, email e password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await clerkSignUp.password({
        emailAddress: email.trim(),
        password,
        ...getNameParts(fullName),
      });

      if (result.error) {
        throw result.error;
      }

      if (clerkSignUp.status === "complete") {
        const finalizeResult = await clerkSignUp.finalize();

        if (finalizeResult.error) {
          throw finalizeResult.error;
        }

        router.replace("/");
        return;
      }

      const verificationResult = await clerkSignUp.verifications.sendEmailCode();

      if (verificationResult.error) {
        throw verificationResult.error;
      }

      setIsVerificationPending(true);
    } catch (error) {
      setErrorMessage(getClerkErrorMessage(error, "Registrazione non riuscita. Riprova."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyEmail() {
    if (!clerkSignUp) {
      return;
    }

    if (!verificationCode.trim()) {
      setErrorMessage("Inserisci il codice ricevuto via email.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await clerkSignUp.verifications.verifyEmailCode({
        code: verificationCode.trim(),
      });

      if (result.error) {
        throw result.error;
      }

      if (clerkSignUp.status === "complete") {
        const finalizeResult = await clerkSignUp.finalize();

        if (finalizeResult.error) {
          throw finalizeResult.error;
        }

        router.replace("/");
        return;
      }

      setErrorMessage("Verifica non completata. Controlla il codice e riprova.");
    } catch (error) {
      setErrorMessage(getClerkErrorMessage(error, "Verifica email non riuscita. Riprova."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit() {
    if (isVerificationPending) {
      await handleVerifyEmail();
      return;
    }

    if (isSignup) {
      await handleSignUp();
      return;
    }

    await handleSignIn();
  }

  // Social auth is intentionally disabled for now.
  // Restore these handlers if Google or Apple sign-in is added later.
  // async function handleGoogleSignIn() {
  //   if (Platform.OS === "web") {
  //     setErrorMessage("Google non e configurato per il web in questa app.");
  //     return;
  //   }
  //
  //   setIsSubmitting(true);
  //   setErrorMessage(null);
  //
  //   try {
  //     await activateSocialSession(await startGoogleAuthenticationFlow());
  //   } catch (error) {
  //     setErrorMessage(getClerkErrorMessage(error, "Accesso con Google non riuscito. Riprova."));
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }
  //
  // async function handleAppleSignIn() {
  //   if (Platform.OS !== "ios") {
  //     return;
  //   }
  //
  //   setIsSubmitting(true);
  //   setErrorMessage(null);
  //
  //   try {
  //     await activateSocialSession(await startAppleAuthenticationFlow());
  //   } catch (error) {
  //     setErrorMessage(getClerkErrorMessage(error, "Accesso con Apple non riuscito. Riprova."));
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }

  const submitLabel = isSignup ? "Crea account" : "Accedi";
  const currentSubmitLabel = isSubmitting
    ? "Attendi..."
    : isVerificationPending
      ? "Verifica email"
      : submitLabel;
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
          </View>

          <View className="gap-5 rounded-lg border border-pronto-line bg-pronto-surface p-5 shadow-lg">
            {isSignup && isVerificationPending ? (
              <>
                <View className="gap-2">
                  <Text className="text-sm font-bold text-pronto-ink">Codice email</Text>
                  <TextInput
                    autoCapitalize="none"
                    inputMode="numeric"
                    keyboardType="number-pad"
                    placeholder="Codice di verifica"
                    placeholderTextColor={placeholderTextColor}
                    value={verificationCode}
                    onChangeText={(value) => {
                      setVerificationCode(value);
                      setErrorMessage(null);
                    }}
                    className="min-h-[52px] rounded-lg border border-pronto-line bg-white px-4 text-base text-pronto-ink"
                  />
                </View>
                <Text className="text-sm leading-5 text-pronto-secondary">
                  Inserisci il codice inviato a {email.trim()} per completare la registrazione.
                </Text>
              </>
            ) : (
              <>
                {isSignup ? (
                  <View className="gap-2">
                    <Text className="text-sm font-bold text-pronto-ink">Nome e cognome</Text>
                    <TextInput
                      autoCapitalize="words"
                      autoComplete="name"
                      placeholder="Es. Maria Rossi"
                      placeholderTextColor={placeholderTextColor}
                      value={fullName}
                      onChangeText={(value) => {
                        setFullName(value);
                        setErrorMessage(null);
                      }}
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
                    onChangeText={(value) => {
                      setEmail(value);
                      setErrorMessage(null);
                    }}
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
                    onChangeText={(value) => {
                      setPassword(value);
                      setErrorMessage(null);
                    }}
                    className="min-h-[52px] rounded-lg border border-pronto-line bg-white px-4 text-base text-pronto-ink"
                  />
                </View>
              </>
            )}

            {errorMessage ? (
              <View className="rounded-lg border border-pronto-line bg-pronto-teal-soft px-4 py-3">
                <Text className="text-sm font-bold text-pronto-ink">{errorMessage}</Text>
              </View>
            ) : null}

            {/* Required by Clerk Smart CAPTCHA for custom sign-up flows on web. */}
            {isSignup ? <View nativeID="clerk-captcha" /> : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !isLoaded || isSubmitting }}
              disabled={!isLoaded || isSubmitting}
              onPress={handleSubmit}
              className="min-h-[54px] items-center justify-center rounded-lg bg-pronto-teal-dark px-4 active:bg-pronto-ink"
            >
              <Text className="text-base font-bold text-white">{currentSubmitLabel}</Text>
            </Pressable>

            {/* Social auth is intentionally disabled for now.
                Restore this block if Google or Apple sign-in is added later.
            {!isVerificationPending ? (
              <>
                <View className="h-px bg-pronto-line" />

                <View className="gap-3">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isSubmitting }}
                    disabled={isSubmitting}
                    onPress={handleGoogleSignIn}
                    className="min-h-[52px] items-center justify-center rounded-lg border border-pronto-line bg-white px-4 active:bg-pronto-teal-soft"
                  >
                    <Text className="text-base font-bold text-pronto-teal-dark">
                      Continua con Google
                    </Text>
                  </Pressable>

                  {Platform.OS === "ios" ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ disabled: isSubmitting }}
                      disabled={isSubmitting}
                      onPress={handleAppleSignIn}
                      className="min-h-[52px] items-center justify-center rounded-lg border border-pronto-line bg-white px-4 active:bg-pronto-teal-soft"
                    >
                      <Text className="text-base font-bold text-pronto-teal-dark">
                        Continua con Apple
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </>
            ) : null}
            */}
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
