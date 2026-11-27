/* Carrega os tipos do Vite neste arquivo.
 Sem isso, o TypeScript não reconhece o `import.meta.env` e mostra erro no editor.
 Isso afeta só o editor; o app roda normalmente com ou sem essa linha. */
/// <reference types="vite/client" />
import { clearCache } from './cache';

const apiUrl = import.meta.env.VITE_API_URL;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  account: Record<string, unknown>;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao fazer login');
  }

  clearCache();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('account', JSON.stringify(data.account));

  return data as LoginResponse;
}

export function getLoggedUser() {
  const account = localStorage.getItem('account');
  return account ? JSON.parse(account) : null;
}

export async function logout(): Promise<{ message: string }> {
  clearCache();
  const token = localStorage.getItem('accessToken');

  const response = await fetch(`${apiUrl}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao fazer logout');
  }

  localStorage.removeItem('accessToken');
  localStorage.removeItem('account');

  return data as { message: string };
}

async function postAuthJson<T>(path: string, body: unknown, fallbackError: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message;
    throw new Error(message || fallbackError);
  }

  return data as T;
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return postAuthJson<{ message: string }>(
    '/auth/forgot-password',
    { email },
    'Erro ao solicitar recuperação de senha',
  );
}

export function resetPassword(payload: {
  token: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return postAuthJson<{ message: string }>(
    '/auth/reset-password',
    payload,
    'Erro ao redefinir senha',
  );
}