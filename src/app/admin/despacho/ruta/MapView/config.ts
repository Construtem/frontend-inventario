// Configuración para Google Maps API
export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDNqVTuDN6yYgMkvpzB-zdp6rXDe8JjQtg",
  libraries: ['geometry', 'drawing'] as const,
  defaultCenter: {
    lat: -33.4489, // Santiago, Chile
    lng: -70.6693
  },
  defaultZoom: 10
};

// Tipos para direcciones en Chile
export interface AddressComponents {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

// Función helper para formatear direcciones chilenas
export const formatChileanAddress = (address: string): string => {
  // Si la dirección no incluye ciudad/región, agregar Santiago por defecto
  if (!address.includes('Santiago') && !address.includes('Chile')) {
    return `${address}, Santiago, Chile`;
  }
  return address;
};
