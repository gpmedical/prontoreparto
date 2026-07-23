import type { AppSymbolName } from "@/components/ui/app-symbol";
import type { DirectoryContact } from "@/features/directory";

type ContactPresentation = {
  actionAccessibilityLabel: string;
  actionFailureMessage: string;
  actionLabel: string;
  actionUnavailableMessage: string;
  icon: AppSymbolName;
  label: string;
  color: string;
  softColor: string;
};

const phoneActionPresentation = {
  actionAccessibilityLabel: "Chiama il contatto",
  actionFailureMessage: "Non è stato possibile avviare la chiamata. Riprova.",
  actionLabel: "Chiama",
  actionUnavailableMessage: "Questo dispositivo non può effettuare chiamate.",
} as const;

export const CONTACT_PRESENTATION = {
  fisso: {
    ...phoneActionPresentation,
    icon: "phone",
    label: "Fisso",
    color: "#2563eb",
    softColor: "#eff6ff",
  },
  cicalino: {
    ...phoneActionPresentation,
    icon: "pager",
    label: "Cicalino",
    color: "#b45309",
    softColor: "#fffbeb",
  },
  email: {
    actionAccessibilityLabel: "Scrivi un'email",
    actionFailureMessage:
      "Non è stato possibile aprire l'app email. Riprova.",
    actionLabel: "Scrivi un'email",
    actionUnavailableMessage:
      "Non è stata trovata un'app email su questo dispositivo.",
    icon: "email",
    label: "Email",
    color: "#7c3aed",
    softColor: "#f5f3ff",
  },
} as const satisfies Record<DirectoryContact["type"], ContactPresentation>;
