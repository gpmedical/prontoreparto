import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ContactType,
  HospitalId,
} from "@/features/directory";

export interface ContactSuggestionInput {
  readonly hospitalId: HospitalId;
  readonly contactName: string;
  readonly methodType: ContactType;
  readonly displayedValue: string;
  readonly notes?: string;
}

export async function submitContactSuggestion(
  client: SupabaseClient,
  suggestion: ContactSuggestionInput,
): Promise<void> {
  const notes = suggestion.notes?.trim();
  const { error } = await client.from("contact_suggestions").insert({
    hospital_id: suggestion.hospitalId,
    contact_name: suggestion.contactName.trim(),
    method_type: suggestion.methodType,
    displayed_value: suggestion.displayedValue.trim(),
    notes: notes || null,
  });

  if (error) {
    throw new Error("Supabase non ha accettato la proposta.");
  }
}
