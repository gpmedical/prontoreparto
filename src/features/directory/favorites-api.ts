import type { SupabaseClient } from "@supabase/supabase-js";

import type { ContactId } from "./types";

type FavoriteRow = {
  readonly contact_id: string;
};

function parseFavoriteRows(value: unknown): ContactId[] {
  if (!Array.isArray(value)) {
    throw new Error("La risposta dei preferiti non e valida.");
  }

  return Array.from(
    new Set(
      value.map((row) => {
        if (
          typeof row !== "object" ||
          row === null ||
          typeof (row as FavoriteRow).contact_id !== "string"
        ) {
          throw new Error("Un preferito ricevuto non e valido.");
        }

        return (row as FavoriteRow).contact_id;
      }),
    ),
  );
}

export async function fetchFavoriteContactIds(
  client: SupabaseClient,
  userId: string,
): Promise<ContactId[]> {
  const result = await client
    .from("user_favorites")
    .select("contact_id")
    .eq("user_id", userId)
    .order("created_at");

  if (result.error) {
    throw new Error("Supabase non ha restituito i preferiti.");
  }

  return parseFavoriteRows(result.data);
}

export async function saveFavoriteContact(
  client: SupabaseClient,
  userId: string,
  contactId: ContactId,
): Promise<void> {
  const result = await client.from("user_favorites").upsert(
    {
      user_id: userId,
      contact_id: contactId,
    },
    {
      ignoreDuplicates: true,
      onConflict: "user_id,contact_id",
    },
  );

  if (result.error) {
    throw new Error("Supabase non ha salvato il preferito.");
  }
}

export async function deleteFavoriteContact(
  client: SupabaseClient,
  userId: string,
  contactId: ContactId,
): Promise<void> {
  const result = await client
    .from("user_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("contact_id", contactId);

  if (result.error) {
    throw new Error("Supabase non ha rimosso il preferito.");
  }
}

export async function deleteAllFavoriteContacts(
  client: SupabaseClient,
  userId: string,
): Promise<void> {
  const result = await client
    .from("user_favorites")
    .delete()
    .eq("user_id", userId);

  if (result.error) {
    throw new Error("Supabase non ha rimosso i preferiti.");
  }
}
