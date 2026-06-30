export interface Equipo {
  id: string;
  nombre: string;
  escudo_url: string;
  created_at: string;
}

export interface Jugador {
  id: string;
  nombre: string;
  dorsal: number;
  demarcacion: string;
  edad: number;
  forma_fisica: number;
  foto_url: string;
  equipo_id?: string;
  created_at: string;
}

export interface Partido {
  id: string;
  equipo_local_id?: string | null;
  equipo_visitante_id?: string | null;
  fecha: string;
  resultado?: string;
  created_at: string;
  equipo_local?: Equipo;
  equipo_visitante?: Equipo;
  alineacion_local?: any; // JSONB
  alineacion_visitante?: any; // JSONB
  video_url?: string;
}

export interface EventoPartido {
  id: string;
  partido_id: string;
  tipo: string;
  minuto: number;
  segundo: number;
  timestamp_video: number;
  descripcion?: string;
  created_at: string;
}

export interface InformeRival {
  partido_id: string;
  salida_balon: string;
  presion: string;
  linea_defensiva: string;
  google_slides_url: string;
  video_url: string;
  updated_at: string;
}

export interface PlanPartido {
  partido_id: string;
  ataque_texto: string;
  ataque_video: string;
  ataque_imagenes: string[];
  defensa_texto: string;
  defensa_video: string;
  defensa_imagenes: string[];
  transiciones_texto: string;
  transiciones_video: string;
  transiciones_imagenes: string[];
  updated_at: string;
}
