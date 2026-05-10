import { authClient } from './auth-client';

export async function establishEmailSession(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  return authClient.signIn.email({
    email: normalized,
    password,
    rememberMe: true,
  });
}
