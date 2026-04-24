import { Asset, AuthUser, Employee, UserRole } from '@/types';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message ?? 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function login(payload: {
  email: string;
  password: string;
  role: UserRole;
}): Promise<{ token: string; user: AuthUser }> {
  return request('/api/auth/login', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<{ token: string; user: AuthUser }> {
  return request('/api/auth/signup', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(token: string): Promise<{ user: AuthUser }> {
  return request('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function logout(token: string): Promise<void> {
  await request('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getAssets(token: string): Promise<{ assets: Asset[] }> {
  return request('/api/assets', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createAsset(
  token: string,
  payload: {
    name: string;
    assetTag: string;
    category: string;
    status: Asset['status'];
    holder: string;
  }
): Promise<{ asset: Asset }> {
  return request('/api/assets', {
    method: 'POST',
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateProfile(
  token: string,
  payload: {
    name: string;
    email: string;
    preferredTheme: 'light' | 'dark';
    notificationsEnabled: boolean;
  }
): Promise<{ user: AuthUser }> {
  return request('/api/users/profile', {
    method: 'PUT',
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function changePassword(
  token: string,
  payload: { currentPassword: string; newPassword: string }
): Promise<void> {
  await request('/api/users/password', {
    method: 'PUT',
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function getEmployees(token: string): Promise<{ employees: Employee[] }> {
  return request('/api/employees', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createEmployee(
  token: string,
  payload: { name: string; email: string; role: string }
): Promise<{ employee: Employee }> {
  return request('/api/employees', {
    method: 'POST',
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}
