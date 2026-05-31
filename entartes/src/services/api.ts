const DEFAULT_API_BASE_URL = 'http://localhost:3000/api';
const AUTH_TOKEN_KEY = 'entartes_auth_token';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiRequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl && envUrl.trim()) {
    return envUrl.replace(/\/+$/, '');
  }

  return DEFAULT_API_BASE_URL;
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

function normalizeEndpoint(endpoint: string) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${baseUrl}${cleanEndpoint}`;
}

function isNativeBody(body: unknown): body is BodyInit {
  return (
    typeof body === 'string' ||
    (typeof FormData !== 'undefined' && body instanceof FormData) ||
    (typeof Blob !== 'undefined' && body instanceof Blob) ||
    (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams)
  );
}

function buildBody(body: unknown) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isNativeBody(body)) {
    return body;
  }

  return JSON.stringify(body);
}

function getErrorMessage(data: unknown) {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;

    if (typeof record.erro === 'string') return record.erro;
    if (typeof record.message === 'string') return record.message;
    if (typeof record.mensagem === 'string') return record.mensagem;
  }

  return 'Ocorreu um erro ao comunicar com o servidor.';
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (response.status === 204) {
    return undefined;
  }

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, token, auth = true, headers, ...fetchOptions } = options;

  const requestHeaders = new Headers(headers);
  const requestBody = buildBody(body);

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json');
  }

  if (
    body !== undefined &&
    body !== null &&
    !isNativeBody(body) &&
    !requestHeaders.has('Content-Type')
  ) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const authToken = token ?? getAuthToken();

  if (auth && authToken) {
    requestHeaders.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(normalizeEndpoint(endpoint), {
    ...fetchOptions,
    method: fetchOptions.method ?? 'GET',
    headers: requestHeaders,
    body: requestBody,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
    }

    throw new ApiError(getErrorMessage(data), response.status, data);
  }

  return data as T;
}

export const api = {
  get<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  post<T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body,
    });
  },

  patch<T>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    });
  },

  delete<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },
};