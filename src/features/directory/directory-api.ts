import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createFourDigitExtension,
  isValidEmailAddress,
  sortContactsAlphabetically,
} from "./helpers";
import type {
  DirectoryContact,
  DirectoryContactKind,
  Hospital,
} from "./types";

type DirectoryData = {
  readonly hospitals: readonly Hospital[];
  readonly contacts: readonly DirectoryContact[];
};

type ContactRow = {
  readonly id: string;
  readonly hospitalId: string;
  readonly name: string;
  readonly kind: DirectoryContactKind;
  readonly searchTerms: readonly string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(
  record: Record<string, unknown>,
  key: string,
): string {
  const value = record[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Campo directory non valido: ${key}.`);
  }

  return value;
}

function parseHospitalRows(value: unknown): Hospital[] {
  if (!Array.isArray(value)) {
    throw new Error("La risposta degli ospedali non e valida.");
  }

  return value.map((row) => {
    if (!isRecord(row)) {
      throw new Error("Un ospedale ricevuto non e valido.");
    }

    const phonePrefix = row.phone_prefix;

    if (phonePrefix !== null && typeof phonePrefix !== "string") {
      throw new Error("Il prefisso telefonico ricevuto non e valido.");
    }

    return {
      id: requireString(row, "id"),
      name: requireString(row, "name"),
      city: requireString(row, "city"),
      phonePrefix,
    };
  });
}

function parseContactRows(value: unknown): ContactRow[] {
  if (!Array.isArray(value)) {
    throw new Error("La risposta dei contatti non e valida.");
  }

  return value.map((row) => {
    if (!isRecord(row)) {
      throw new Error("Un contatto ricevuto non e valido.");
    }

    const kind = row.kind;
    const searchTerms = row.search_terms;

    if (kind !== "reparto" && kind !== "servizio" && kind !== "ruolo") {
      throw new Error("La categoria di un contatto non e valida.");
    }

    if (
      !Array.isArray(searchTerms) ||
      !searchTerms.every((term) => typeof term === "string")
    ) {
      throw new Error("I termini di ricerca di un contatto non sono validi.");
    }

    return {
      id: requireString(row, "id"),
      hospitalId: requireString(row, "hospital_id"),
      name: requireString(row, "name"),
      kind,
      searchTerms,
    };
  });
}

function parseDirectoryContacts(
  value: unknown,
  contactRows: readonly ContactRow[],
  hospitals: readonly Hospital[],
): DirectoryContact[] {
  if (!Array.isArray(value)) {
    throw new Error("La risposta dei recapiti non e valida.");
  }

  const contactById = new Map(
    contactRows.map((contact) => [contact.id, contact] as const),
  );
  const hospitalIds = new Set(hospitals.map((hospital) => hospital.id));

  const contacts = value.map((row): DirectoryContact => {
    if (!isRecord(row)) {
      throw new Error("Un recapito ricevuto non e valido.");
    }

    const sourceContact = contactById.get(requireString(row, "contact_id"));
    if (!sourceContact || !hospitalIds.has(sourceContact.hospitalId)) {
      throw new Error("Un recapito non appartiene a un contatto valido.");
    }

    const id = requireString(row, "id");
    const type = requireString(row, "type");
    const methodValue = requireString(row, "value");
    const base = {
      id,
      hospitalId: sourceContact.hospitalId,
      name: sourceContact.name,
      kind: sourceContact.kind,
      searchTerms: sourceContact.searchTerms,
    };

    if (type === "fisso") {
      const dialValue = row.dial_value;

      if (dialValue !== null && typeof dialValue !== "string") {
        throw new Error("Il numero componibile di un contatto non e valido.");
      }

      return {
        ...base,
        type,
        value: createFourDigitExtension(methodValue),
        ...(dialValue ? { dialValue } : {}),
      };
    }

    if (type === "cicalino") {
      return { ...base, type, value: methodValue };
    }

    if (type === "email" && isValidEmailAddress(methodValue)) {
      return { ...base, type, value: methodValue };
    }

    throw new Error("Il tipo o il valore di un recapito non e valido.");
  });

  return sortContactsAlphabetically(contacts);
}

export async function fetchDirectoryData(
  client: SupabaseClient,
): Promise<DirectoryData> {
  const [hospitalResult, contactResult, methodResult] = await Promise.all([
    client
      .from("hospitals")
      .select("id, name, city, phone_prefix")
      .order("name"),
    client
      .from("contacts")
      .select("id, hospital_id, name, kind, search_terms")
      .order("name"),
    client
      .from("contact_methods")
      .select("id, contact_id, type, value, dial_value, sort_order")
      .order("sort_order"),
  ]);

  if (hospitalResult.error || contactResult.error || methodResult.error) {
    throw new Error("Supabase non ha restituito la rubrica.");
  }

  const hospitals = parseHospitalRows(hospitalResult.data);

  if (hospitals.length === 0) {
    throw new Error("Nessun ospedale attivo e disponibile.");
  }

  const contactRows = parseContactRows(contactResult.data);
  const contacts = parseDirectoryContacts(
    methodResult.data,
    contactRows,
    hospitals,
  );

  return { hospitals, contacts };
}

