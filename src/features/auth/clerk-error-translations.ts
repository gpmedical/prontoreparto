const CLERK_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  form_password_incorrect:
    "La password non è corretta. Riprova oppure usa un altro metodo.",
  form_password_or_identifier_incorrect:
    "Email o password non corrette. Controlla i dati e riprova.",
  form_password_validation_failed:
    "La password non è corretta. Controllala e riprova.",
};

export function getTranslatedClerkError(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return CLERK_ERROR_MESSAGES[error.code];
  }

  return undefined;
}
