import type { DirectoryContact } from "@/features/directory";
import type { AppSymbolName } from "@/components/ui/app-symbol";

type ContactPresentation = {
  icon: AppSymbolName;
  label: string;
  color: string;
  softColor: string;
};

export const CONTACT_PRESENTATION = {
  fisso: {
    icon: "phone",
    label: "Fisso",
    color: "#2563eb",
    softColor: "#eff6ff",
  },
  cicalino: {
    icon: "pager",
    label: "Cicalino",
    color: "#b45309",
    softColor: "#fffbeb",
  },
  email: {
    icon: "email",
    label: "Email",
    color: "#7c3aed",
    softColor: "#f5f3ff",
  },
} as const satisfies Record<DirectoryContact["type"], ContactPresentation>;

export function getContactValueLabel(contact: DirectoryContact) {
  if (contact.type === "fisso") {
    return `Interno ${contact.value}`;
  }

  if (contact.type === "cicalino") {
    return `Cicalino ${contact.value}`;
  }

  return contact.value;
}
