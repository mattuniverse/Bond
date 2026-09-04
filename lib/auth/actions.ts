"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { SignInWithPasswordCredentials } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export type AuthResult = { error?: string; field?: string } | undefined;

export async function signUp(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();

  if (!email || !password || !username) {
    return {
      error: "Please fill in every field so we know who's joining. 💕",
    };
  }
  if (password.length < 6) {
    return {
      field: "password",
      error: "Keep it safe — your password needs at least 6 characters. 🔒",
    };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return {
        field: "email",
        error: "Looks like that email is already in our corner. Try logging in? 💕",
      };
    }
    return { error: "Hmm, something went wrong signing up. Give it another try. 🙈" };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password to come back in. 💕" };
  }

  const credentials: SignInWithPasswordCredentials = { email, password };

  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return {
      error: "That email or password didn't match. Double-check and try again. 💕",
    };
  }

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
