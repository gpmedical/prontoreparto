import { isClerkAPIResponseError } from "@clerk/expo";

import { getTranslatedClerkError } from "@/features/auth/clerk-error-translations";

export function getClerkErrorMessage(error: unknown, fallback: string) {
  if (isClerkAPIResponseError(error)) {
    const primaryError = error.errors[0];

    return (
      getTranslatedClerkError(primaryError) ??
      primaryError?.longMessage ??
      primaryError?.message ??
      fallback
    );
  }

  const translatedError = getTranslatedClerkError(error);
  if (translatedError) {
    return translatedError;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    if ("longMessage" in error && typeof error.longMessage === "string") {
      return error.longMessage;
    }

    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return fallback;
}
