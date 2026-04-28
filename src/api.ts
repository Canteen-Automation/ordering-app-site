/**
 * Authenticated fetch for the ordering app.
 * Reads JWT from the stored user object and attaches it to every request.
 */
export function getOrderingToken(): string | null {
  const saved = localStorage.getItem('user');
  if (!saved) return null;
  try {
    return JSON.parse(saved).token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getOrderingToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  // If token expired, clear session and redirect to login
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return response;
}
