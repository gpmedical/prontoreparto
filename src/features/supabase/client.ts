import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type AccessTokenGetter = () => Promise<string | null>;

export function createClerkSupabaseClient(
  getAccessToken: AccessTokenGetter,
): SupabaseClient {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("La configurazione pubblica di Supabase e incompleta.");
  }

  return createClient(supabaseUrl, supabaseKey, {
    accessToken: getAccessToken,
  });
}

