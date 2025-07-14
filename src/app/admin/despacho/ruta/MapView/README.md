# MapView - Componente de Google Maps para Rutas de Despacho

## Descripción

Este directorio contiene los componentes organizados para mostrar rutas de despacho utilizando Google Maps API.

## Estructura de Archivos

```
MapView/
├── index.ts                    # Exportaciones principales
├── config.ts                   # Configuración de Google Maps
├── MapView.tsx                 # Componente principal
├── GoogleMapComponent.tsx      # Componente del mapa
├── RouteInfo.tsx              # Información de la ruta
└── README.md                  # Esta documentación
```

## Componentes

### MapView (Principal)

- **Archivo**: `MapView.tsx`
- **Propósito**: Componente principal que integra todos los demás
- **Props**:
  - `despachoInfo`: Información del despacho con origen y destino

### GoogleMapComponent

- **Archivo**: `GoogleMapComponent.tsx`
- **Propósito**: Maneja la lógica del mapa y cálculo de rutas
- **Características**:
  - Cálculo automático de rutas
  - Visualización de direcciones
  - Cálculo de distancia y tiempo

### RouteInfo

- **Archivo**: `RouteInfo.tsx`
- **Propósito**: Muestra información detallada del despacho
- **Características**:
  - Estados con colores
  - Información de ruta calculada
  - Diseño responsive

## Configuración

### API Key de Google Maps

La API Key está configurada en `config.ts`. Para uso en producción, se recomienda:

1. Crear una variable de entorno:

   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
   ```

2. La configuración automáticamente usará la variable de entorno si está disponible.

### API Key Actual

- **Key**: `AIzaSyDNqVTuDN6yYgMkvpzB-zdp6rXDe8JjQtg`
- **Librerías habilitadas**: geometry, drawing
- **Restricciones**: Configurar en Google Cloud Console para mayor seguridad

## Uso

```tsx
import { MapView } from "./MapView";

const despachoInfo = {
  id: "12345",
  cliente: "Cliente Ejemplo",
  origen: "Dirección de origen",
  destino: "Dirección de destino",
  estado: "En ruta",
};

<MapView despachoInfo={despachoInfo} />;
```

## Características

### Formateo de Direcciones Chilenas

- Automáticamente agrega "Santiago, Chile" si no está presente
- Mejora la precisión del geocoding

### Estados de Despacho

- **En ruta**: Verde
- **Pendiente**: Amarillo
- **Entregado**: Azul
- **Cancelado**: Rojo

### Información de Ruta

- Distancia calculada
- Tiempo estimado
- Ruta visual en el mapa

## Dependencias

- `@react-google-maps/api`: Integración con Google Maps
- `next/navigation`: Para parámetros de URL
- `react`: Framework base

## Seguridad

### Recomendaciones para Producción

1. Usar variables de entorno para la API Key
2. Configurar restricciones en Google Cloud Console:
   - Restricciones de dominio
   - Restricciones de API
   - Cuotas de uso

### Configuración en Google Cloud Console

1. Habilitar APIs necesarias:

   - Maps JavaScript API
   - Directions API
   - Geocoding API

2. Configurar restricciones:
   - Agregar dominios permitidos
   - Establecer límites de uso

## Personalización

### Estilos del Mapa

Editar en `GoogleMapComponent.tsx`:

```tsx
options={{
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
}}
```

### Colores de Estados

Editar en `RouteInfo.tsx` la función `getEstadoColor()`.

### Centro del Mapa

Editar en `config.ts`:

```tsx
defaultCenter: {
  lat: -33.4489, // Latitud
  lng: -70.6693  // Longitud
}
```
