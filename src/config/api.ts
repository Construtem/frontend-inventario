// =====================
// CONFIGURACIÓN DE API
// =====================

// URL base de la API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Endpoints de la API
export const API_ENDPOINTS = {
  despachos: `${API_BASE_URL}/api/despachos`,
  sucursales: `${API_BASE_URL}/api/sucursales`,
  // Agregar más endpoints aquí según sea necesario
} as const;

// Configuración para peticiones HTTP
export const HTTP_CONFIG = {
  timeout: 5000, // 5 segundos
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

// Función auxiliar para crear peticiones con timeout
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = HTTP_CONFIG.timeout
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...HTTP_CONFIG.headers,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Función para determinar el tipo de error
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return 'Tiempo de espera agotado al conectar con el servidor';
    } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      return 'No se pudo conectar al servidor backend';
    } else {
      return error.message;
    }
  }
  return 'Error desconocido al cargar datos';
};
