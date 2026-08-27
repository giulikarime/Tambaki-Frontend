const API_URL = 'http://localhost:3000';

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
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao fazer login');
  }

  return data as LoginResponse;
}

export async function logout(): Promise<{ message: string }> {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(`${API_URL}/auth/logout`, {
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