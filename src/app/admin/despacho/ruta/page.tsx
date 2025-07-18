"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { MapView } from "./MapView";

// Configuración del API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_INVENTARIO || 'http://localhost:8080';

interface DespachoInfo {
  id: string;
  cliente: string;
  origen: string;
  destino: string;
  estado: string;
  distancia?: string;
  duracion?: string;
  precio?: string;
}

interface DespachoBackend {
  id: number;
  cotizacion_id: number;
  camion_id: number;
  origen: number;
  destino: number;
  fecha_despacho: string;
  valor_despacho: number;
  estado: string;
  cantidad_items: number;
  total_kg: number;
  distancia_calculada?: string;
  tiempo_estimado?: string;
  precio_calculado?: string;
  cotizacion?: {
    cliente?: {
      nombre: string;
      email: string;
    };
    estado?: string;
  };
  camion?: {
    patente: string;
  };
  origen_sucursal?: {
    nombre: string;
    direccion?: string;
    comuna?: string;
    ciudad?: string;
  };
  destino_dir_cliente?: {
    direccion: string;
    comuna: string;
    ciudad: string;
  };
}

export default function RutaDespachoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const despachoId = searchParams.get('despachoId');
  const [despachoInfo, setDespachoInfo] = useState<DespachoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener despacho específico
  const fetchDespachoById = async (id: string): Promise<DespachoInfo | null> => {
    try {
      console.log('📡 Intentando obtener despachos desde:', `${API_BASE_URL}/api/despachos`);
      
      const response = await axios.get(`${API_BASE_URL}/api/despachos`, {
        timeout: 10000, // 10 segundos de timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Respuesta recibida:', response.status, response.statusText);
      console.log('📦 Datos recibidos:', response.data);
      
      const despachos: DespachoBackend[] = response.data;
      
      if (!Array.isArray(despachos)) {
        console.error('❌ La respuesta no es un array:', typeof despachos);
        throw new Error('Formato de respuesta inválido del servidor');
      }
      
      console.log(`🔍 Buscando despacho con ID: ${id} en ${despachos.length} despachos`);
      
      const despacho = despachos.find(d => d.id.toString() === id);
      if (!despacho) {
        console.warn(`⚠️ Despacho con ID ${id} no encontrado en la lista`);
        throw new Error(`Despacho con ID ${id} no encontrado`);
      }

      console.log('✅ Despacho encontrado:', despacho);
      console.log('🔍 Estado del despacho:', despacho.estado);
      console.log('🔍 Estado de la cotización:', despacho.cotizacion?.estado);

      // Formatear direcciones
      const origenDir = despacho.origen_sucursal 
        ? `${despacho.origen_sucursal.nombre}${despacho.origen_sucursal.direccion ? `, ${despacho.origen_sucursal.direccion}` : ''}`
        : 'Origen no especificado';
      
      const destinoDir = despacho.destino_dir_cliente
        ? `${despacho.destino_dir_cliente.direccion}, ${despacho.destino_dir_cliente.comuna}, ${despacho.destino_dir_cliente.ciudad}`
        : 'Destino no especificado';

      const despachoFormateado = {
        id: despacho.id.toString(),
        cliente: despacho.cotizacion?.cliente?.nombre || 'Cliente no especificado',
        origen: origenDir,
        destino: destinoDir,
        estado: despacho.estado || 'pendiente',
        distancia: despacho.distancia_calculada,
        duracion: despacho.tiempo_estimado,
        precio: despacho.precio_calculado
      };

      console.log('✅ Despacho formateado:', despachoFormateado);
      return despachoFormateado;
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.warn('⚠️ Error al obtener despachos del backend:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          url: error.config?.url
        });
        
        // No lanzar error, simplemente devolver null para usar datos de ejemplo
        console.log('🔄 Servidor no disponible, se usarán datos de ejemplo');
        return null;
      } else {
        console.error('❌ Error desconocido:', error);
        return null;
      }
    }
  };

  /*// Función para calcular distancia si no está calculada
  const calcularDistancia = async (origen: string, destino: string) => {
    // Por ahora, no intentar calcular distancia desde el backend
    // Ya que los endpoints no están disponibles todavía
    console.log('ℹ️ Saltando cálculo de distancia del backend - endpoints no disponibles');
    console.log('🗺️ Google Maps calculará la distancia directamente en el mapa');
    return null;
  };*/

  useEffect(() => {
    const loadDespachoData = async () => {
      if (!despachoId) {
        setError('ID de despacho no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Intentar obtener el despacho del backend
        const despacho = await fetchDespachoById(despachoId);
        
        if (despacho) {
          // Si obtuvo datos del backend, usarlos
          console.log('✅ Usando datos del backend');
          setDespachoInfo(despacho);
        } else {
          // Si no obtuvo datos del backend, usar datos de ejemplo
          console.log('🔄 Usando datos de ejemplo');
          setError('Servidor no disponible - usando datos de ejemplo');
          setDespachoInfo({
            id: despachoId,
            cliente: "Universidad Tecnologica Metropolitana del Estado de Chile",
            origen: "Dieciocho 161, 8330383 Santiago, Región Metropolitana",
            destino: "Av. José Pedro Alessandri 1242, Ñuñoa, Región Metropolitana",
            estado: "En ruta",
            distancia: "6.2 km",
            duracion: "20 min",
          });
        }
      } catch (error) {
        console.error('❌ Error inesperado:', error);
        setError('Error inesperado - usando datos de ejemplo');
        
        // Fallback a datos de ejemplo
        setDespachoInfo({
          id: despachoId,
          cliente: "Cliente Ejemplo S.A.",
          origen: "Dieciocho 161, 8330383 Santiago, Región Metropolitana",
          destino: "Av. José Pedro Alessandri 1242, Ñuñoa, Región Metropolitana",
          estado: "En ruta",
          distancia: "15.3 km",
          duracion: "18 min",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDespachoData();
  }, [despachoId]);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <button 
            onClick={() => router.push('/admin/despacho')}
            style={backButtonStyle}
            title="Volver a Despachos"
          >
            <FaArrowLeft />
            Volver
          </button>
          <h1 style={titleStyle}>
            Ruta de Despacho {despachoId ? `#${despachoId}` : ""}
          </h1>
        </div>
        
        {loading ? (
          <div style={loadingContainerStyle}>
            <p style={loadingTextStyle}>
              Cargando información del despacho...
            </p>
          </div>
        ) : error ? (
          <div style={errorContainerStyle}>
            <p style={errorTextStyle}>
              ⚠️ Error: {error}
            </p>
            <p style={errorSubTextStyle}>
              Mostrando datos de ejemplo como respaldo.
            </p>
            <details style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
              <summary style={{ cursor: "pointer", color: "#6b7280" }}>
                💡 Información para desarrolladores
              </summary>
              <div style={{ marginTop: "0.5rem", padding: "0.5rem", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
                <p><strong>Estado actual:</strong></p>
                <ul style={{ marginLeft: "1rem", color: "#6b7280" }}>
                  <li>Los endpoints de cálculo de distancia aún no están disponibles</li>
                  <li>Google Maps mostrará la ruta visualmente en el mapa</li>
                  <li>Se están usando datos de ejemplo como respaldo</li>
                  <li>La aplicación funciona correctamente para visualización</li>
                </ul>
                <p style={{ marginTop: "0.5rem" }}>
                  <strong>Servidor:</strong> {API_BASE_URL}
                </p>
              </div>
            </details>
          </div>
        ) : null}
        
        {despachoInfo && (
          <MapView despachoInfo={despachoInfo} />
        )}
      </div>
    </div>
  );
}

// === Estilos Globales ===

const containerStyle: React.CSSProperties = {
  marginTop: "70px",
  padding: "1.5rem",
  boxSizing: "border-box",
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#f5f5f5",
  borderRadius: '20px',
  width: "100%",
  overflowX: "hidden",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "2rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  maxWidth: "100%",
  overflowX: "hidden",
  marginTop: "1.5rem",
  marginLeft: '1.5rem',
  marginRight: '1.5rem',
};

const titleStyle: React.CSSProperties = {
  color: '#1f2937',
  fontSize: "2rem",
  fontWeight: "700",
  margin: "0",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  letterSpacing: '-0.025em',
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "2rem",
};

const backButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  backgroundColor: "#ff7300",
  color: "white",
  border: "none",
  padding: "0.75rem 1.5rem",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.875rem",
  fontWeight: "600",
  fontFamily: "Montserrat, sans-serif",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const loadingContainerStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "2rem",
};

const loadingTextStyle: React.CSSProperties = {
  color: "#374151",
  fontSize: "1.125rem",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontWeight: "500",
};

const errorContainerStyle: React.CSSProperties = {
  textAlign: "center",
  padding: "2rem",
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  border: "1px solid #fecaca",
  marginBottom: "1rem",
};

const errorTextStyle: React.CSSProperties = {
  color: "#dc2626",
  fontSize: "1.125rem",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  marginBottom: "0.5rem",
  fontWeight: "600",
};

const errorSubTextStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "1rem",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontWeight: "500",
};
