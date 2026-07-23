import type {
  DirectoryContact,
  DirectorySection,
  EmailContact,
  FissoContact,
  FourDigitExtension,
  Hospital,
  HospitalId,
} from "./types";

const FOUR_DIGIT_EXTENSION_PATTERN = /^\d{4}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ITALIAN_COLLATOR = new Intl.Collator("it-IT", {
  sensitivity: "base",
  usage: "sort",
});

export const CONTACT_TYPE_LABELS = {
  fisso: "Fisso",
  cicalino: "Cicalino",
  email: "Email",
} as const;

export const CONTACT_TYPE_COLORS = {
  fisso: "#0F766E",
  cicalino: "#D97706",
  email: "#2563EB",
} as const;

export function isFourDigitExtension(value: string): value is FourDigitExtension {
  return FOUR_DIGIT_EXTENSION_PATTERN.test(value);
}

export function createFourDigitExtension(value: string): FourDigitExtension {
  if (!isFourDigitExtension(value)) {
    throw new Error("Un interno fisso deve contenere esattamente quattro cifre.");
  }

  return value;
}

export function isEmailContact(contact: DirectoryContact): contact is EmailContact {
  return contact.type === "email";
}

export function isFissoContact(contact: DirectoryContact): contact is FissoContact {
  return contact.type === "fisso";
}

export function isValidEmailAddress(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

/** Removes visual separators while retaining an optional leading plus sign. */
export function normalizePhonePrefix(phonePrefix: string): string {
  const normalized = phonePrefix.trim().replace(/[\s().-]/g, "");

  if (!/^\+?\d+$/.test(normalized)) {
    throw new Error("Il prefisso telefonico dell'ospedale non è valido.");
  }

  return normalized;
}

export function formatDialNumber(
  phonePrefix: NonNullable<Hospital["phonePrefix"]>,
  extension: FourDigitExtension,
): string {
  return `${normalizePhonePrefix(phonePrefix)}${extension}`;
}

export function getContactActionUrl(
  contact: DirectoryContact,
  hospital: Hospital,
): string | null {
  if (contact.hospitalId !== hospital.id) {
    return null;
  }

  if (contact.type === "fisso") {
    if (contact.dialValue) {
      return `tel:${normalizePhonePrefix(contact.dialValue)}`;
    }

    if (!hospital.phonePrefix) {
      return null;
    }

    return `tel:${formatDialNumber(hospital.phonePrefix, contact.value)}`;
  }

  if (contact.type === "email") {
    return `mailto:${contact.value}`;
  }

  return null;
}

export function getContactDisplayValue(contact: DirectoryContact): string {
  if (contact.type === "fisso") {
    return `Interno ${contact.value}`;
  }

  if (contact.type === "cicalino") {
    return `Cicalino ${contact.value}`;
  }

  return contact.value;
}

export function sortContactsAlphabetically<T extends DirectoryContact>(
  contacts: readonly T[],
): T[] {
  return [...contacts].sort((left, right) =>
    ITALIAN_COLLATOR.compare(left.name, right.name),
  );
}

export function getContactsForHospital(
  contacts: readonly DirectoryContact[],
  hospitalId: HospitalId,
): DirectoryContact[] {
  return sortContactsAlphabetically(
    contacts.filter((contact) => contact.hospitalId === hospitalId),
  );
}

export function createDirectorySections(
  contacts: readonly DirectoryContact[],
): DirectorySection[] {
  const sections = new Map<string, DirectoryContact[]>();

  for (const contact of sortContactsAlphabetically(contacts)) {
    const title = contact.name.trim().charAt(0).toLocaleUpperCase("it-IT") || "#";
    const section = sections.get(title) ?? [];
    section.push(contact);
    sections.set(title, section);
  }

  return Array.from(sections, ([title, data]) => ({ title, data }));
}
