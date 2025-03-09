import { createClient } from "@supabase/supabase-js";

export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await createSupabaseClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export const signOut = async () => {
  const { error } = await createSupabaseClient().auth.signOut();
  if (error) throw error;
}

