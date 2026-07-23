import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppScreen } from "@/components/app/app-screen";
import { ContactMethodSelector } from "@/components/app/contact-method-selector";
import { AppSymbol } from "@/components/ui/app-symbol";
import { HospitalSelector } from "@/components/directory/hospital-selector";
import {
  isFourDigitExtension,
  isValidEmailAddress,
  type ContactType,
  type HospitalId,
  useDirectory,
} from "@/features/directory";
import { submitContactSuggestion } from "@/features/suggestions/contact-suggestions-api";
import { createClerkSupabaseClient } from "@/features/supabase/client";
import {
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  useCSSVariable,
  View,
} from "@/tw";

function getValuePlaceholder(methodType: ContactType): string {
  if (methodType === "fisso") {
    return "Es. 8442";
  }

  if (methodType === "cicalino") {
    return "Es. 9093";
  }

  return "Es. contatto@ospedale.it";
}

function validateSuggestion({
  contactName,
  displayedValue,
  hospitalId,
  methodType,
  notes,
}: {
  contactName: string;
  displayedValue: string;
  hospitalId: HospitalId | null;
  methodType: ContactType;
  notes: string;
}): string | null {
  const normalizedName = contactName.trim();
  const normalizedValue = displayedValue.trim();

  if (!hospitalId) {
    return "Seleziona l'ospedale.";
  }

  if (normalizedName.length < 2) {
    return "Inserisci il nome completo del contatto.";
  }

  if (normalizedName.length > 160) {
    return "Il nome del contatto non può superare 160 caratteri.";
  }

  if (methodType === "fisso" && !isFourDigitExtension(normalizedValue)) {
    return "Un interno fisso deve contenere esattamente quattro cifre.";
  }

  if (methodType === "cicalino" && !/^\d{2,12}$/.test(normalizedValue)) {
    return "Il cicalino deve contenere da 2 a 12 cifre.";
  }

  if (methodType === "email" && !isValidEmailAddress(normalizedValue)) {
    return "Inserisci un indirizzo email valido.";
  }

  if (notes.length > 1000) {
    return "Le note non possono superare 1000 caratteri.";
  }

  return null;
}

export function AddContactScreen() {
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { hospitals, isHydrated, selectedHospitalId } = useDirectory();
  const placeholderTextColor = useCSSVariable("--color-pronto-placeholder");
  const getTokenRef = useRef(getToken);
  const [hospitalId, setHospitalId] = useState<HospitalId | null>(
    selectedHospitalId,
  );
  const [isHospitalSelectorOpen, setIsHospitalSelectorOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [methodType, setMethodType] = useState<ContactType>("fisso");
  const [displayedValue, setDisplayedValue] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);

  getTokenRef.current = getToken;

  useEffect(() => {
    if (!hospitalId && selectedHospitalId) {
      setHospitalId(selectedHospitalId);
    }
  }, [hospitalId, selectedHospitalId]);

  const getAccessToken = useCallback(() => getTokenRef.current(), []);
  const supabaseClient = useMemo(() => {
    if (!isAuthLoaded || !isSignedIn) {
      return null;
    }

    try {
      return createClerkSupabaseClient(getAccessToken);
    } catch {
      return null;
    }
  }, [getAccessToken, isAuthLoaded, isSignedIn]);
  const selectedHospital =
    hospitals.find((hospital) => hospital.id === hospitalId) ?? null;

  function clearStatus() {
    setErrorMessage(null);
    setIsSubmissionComplete(false);
  }

  async function handleSubmit() {
    const validationMessage = validateSuggestion({
      contactName,
      displayedValue,
      hospitalId,
      methodType,
      notes,
    });

    if (validationMessage) {
      setErrorMessage(validationMessage);
      setIsSubmissionComplete(false);
      return;
    }

    if (!hospitalId || !supabaseClient) {
      setErrorMessage("Il servizio non è disponibile. Riprova tra poco.");
      setIsSubmissionComplete(false);
      return;
    }

    const normalizedContactName = contactName.trim();

    setIsSubmitting(true);
    setErrorMessage(null);
    setIsSubmissionComplete(false);

    try {
      await submitContactSuggestion(supabaseClient, {
        hospitalId,
        contactName: normalizedContactName,
        methodType,
        displayedValue,
        notes,
      });

      setIsSubmissionComplete(true);
      setContactName("");
      setDisplayedValue("");
      setNotes("");
    } catch {
      setErrorMessage(
        "Non è stato possibile inviare la proposta. Controlla la connessione e riprova.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <AppScreen>
        <View className="gap-3">
          <View className="gap-5 rounded-2xl border border-pronto-line bg-white p-5">
          <View className="gap-1.5">
            <Text
              accessibilityRole="header"
              selectable
              className="text-center text-lg font-bold text-pronto-ink"
            >
              Aggiungi contatto
            </Text>
            <Text selectable className="text-sm leading-5 text-pronto-secondary">
              Il contatto non sarà pubblicato automaticamente, ma verrà prima
              controllato.
            </Text>
          </View>

          {isHydrated && selectedHospital ? (
            <View className="gap-2">
              <Text selectable className="text-sm font-bold text-pronto-ink">
                Ospedale
              </Text>
              <HospitalSelector
                hospitals={hospitals}
                isOpen={isHospitalSelectorOpen}
                onChange={(nextHospitalId) => {
                  setHospitalId(nextHospitalId);
                  setIsHospitalSelectorOpen(false);
                  clearStatus();
                }}
                onToggle={() =>
                  setIsHospitalSelectorOpen((currentValue) => !currentValue)
                }
                selectedHospital={selectedHospital}
              />
            </View>
          ) : (
            <View className="rounded-xl bg-pronto-teal-soft px-4 py-3">
              <Text selectable className="text-sm font-bold text-pronto-ink">
                Caricamento degli ospedali…
              </Text>
            </View>
          )}

          <View className="gap-2">
            <Text selectable className="text-sm font-bold text-pronto-ink">
              Nome del contatto
            </Text>
            <TextInput
              autoCapitalize="sentences"
              className="min-h-[52px] rounded-xl border border-pronto-line bg-white px-4 text-base text-pronto-ink"
              maxLength={160}
              onChangeText={(value) => {
                setContactName(value);
                clearStatus();
              }}
              placeholder="Es. Guardia Cardiologica"
              placeholderTextColor={placeholderTextColor}
              value={contactName}
            />
          </View>

          <ContactMethodSelector
            onChange={(value) => {
              setMethodType(value);
              setDisplayedValue("");
              clearStatus();
            }}
            value={methodType}
          />

          <View className="gap-2">
            <Text selectable className="text-sm font-bold text-pronto-ink">
              Numero o indirizzo e-mail
            </Text>
            <TextInput
              autoCapitalize={methodType === "email" ? "none" : "sentences"}
              className="min-h-[52px] rounded-xl border border-pronto-line bg-white px-4 text-base text-pronto-ink"
              inputMode={methodType === "email" ? "email" : "numeric"}
              keyboardType={
                methodType === "email" ? "email-address" : "number-pad"
              }
              maxLength={methodType === "email" ? 320 : 12}
              onChangeText={(value) => {
                setDisplayedValue(value);
                clearStatus();
              }}
              placeholder={getValuePlaceholder(methodType)}
              placeholderTextColor={placeholderTextColor}
              value={displayedValue}
            />
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between gap-3">
              <Text selectable className="text-sm font-bold text-pronto-ink">
                Note
              </Text>
              <Text
                selectable
                className="text-xs text-pronto-secondary"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {notes.length}/1000
              </Text>
            </View>
            <TextInput
              className="min-h-28 rounded-xl border border-pronto-line bg-white px-4 py-3 text-base text-pronto-ink"
              maxLength={1000}
              multiline
              numberOfLines={4}
              onChangeText={(value) => {
                setNotes(value);
                clearStatus();
              }}
              placeholder="Facoltative: piano, orari o fonte da verificare"
              placeholderTextColor={placeholderTextColor}
              textAlignVertical="top"
              value={notes}
            />
          </View>

          {errorMessage ? (
            <View
              accessibilityLiveRegion="assertive"
              className="flex-row items-start gap-3 rounded-xl border border-pronto-danger/30 bg-pronto-danger-soft px-4 py-3"
            >
              <AppSymbol name="info" size={20} tintColor="#b42318" />
              <Text
                selectable
                className="min-w-0 flex-1 text-sm font-bold leading-5 text-pronto-danger"
              >
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: !isHydrated || !supabaseClient || isSubmitting,
            }}
            className={`min-h-[54px] flex-row items-center justify-center gap-2 rounded-xl border px-4 ${
              !isHydrated || !supabaseClient || isSubmitting
                ? "border-pronto-muted bg-pronto-muted"
                : isSubmissionComplete
                  ? "border-pronto-teal-dark bg-pronto-teal-soft"
                  : "border-pronto-teal-dark bg-pronto-teal-dark active:bg-pronto-ink"
            }`}
            disabled={!isHydrated || !supabaseClient || isSubmitting}
            onPress={handleSubmit}
          >
            {isSubmissionComplete ? (
              <AppSymbol name="check" size={21} tintColor="#006978" />
            ) : null}
            <Text
              accessibilityLiveRegion="polite"
              className={`text-base font-bold ${
                isSubmissionComplete ? "text-pronto-teal-dark" : "text-white"
              }`}
            >
              {isSubmitting
                ? "Invio in corso…"
                : isSubmissionComplete
                  ? "Proposta inviata"
                  : "Invia"}
            </Text>
          </Pressable>
          </View>

          <View className="rounded-2xl bg-pronto-teal-soft p-5">
            <Text selectable className="text-sm leading-5 text-pronto-secondary">
              Non includere informazioni cliniche, credenziali o numeri personali.
            </Text>
          </View>
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}
