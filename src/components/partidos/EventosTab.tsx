"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Partido, EventoPartido } from "@/types";
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;
import { Loader2, Play, CircleDot, AlertCircle, Save, Clock, Film, History, ShieldAlert } from "lucide-react";

const EVENT_TYPES = [
  { 
    id: "GOL", 
    label: "GOL", 
    color: "from-red-500 to-rose-600", 
    shadow: "shadow-red-500/30",
    hoverShadow: "group-hover:shadow-red-500/50",
    icon: CircleDot 
  },
  { 
    id: "OCASION", 
    label: "OCASIÓN", 
    color: "from-amber-400 to-orange-500", 
    shadow: "shadow-orange-500/30",
    hoverShadow: "group-hover:shadow-orange-500/50",
    icon: AlertCircle 
  },
  { 
    id: "DUELO", 
    label: "DUELO", 
    color: "from-emerald-400 to-teal-500", 
    shadow: "shadow-emerald-500/30",
    hoverShadow: "group-hover:shadow-emerald-500/50",
    icon: ShieldAlert 
  },
  { 
    id: "NOTA", 
    label: "NOTA", 
    color: "from-slate-400 to-slate-600", 
    shadow: "shadow-slate-500/30",
    hoverShadow: "group-hover:shadow-slate-500/50",
    icon: Save 
  },
];

export default function EventosTab({ partidoId, partido }: { partidoId: string, partido: Partido }) {
  const [videoUrl, setVideoUrl] = useState(partido.video_url || "");
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [eventos, setEventos] = useState<EventoPartido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const playerRef = useRef<any>(null);

  useEffect(() => {
    fetchEventos();
  }, [partidoId]);

  const fetchEventos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("eventos_partido")
        .select("*")
        .eq("partido_id", partidoId)
        .order("timestamp_video", { ascending: true });
      
      if (!error && data) {
        setEventos(data);
      } else {
         console.warn("Tabla eventos_partido podría no existir aún o no tener datos.");
      }
    } catch (err) {
      console.warn("Error fetching eventos", err);
    }
    setIsLoading(false);
  };

  const handleSaveVideoUrl = async () => {
    setIsSavingUrl(true);
    const { error } = await supabase
      .from("partidos")
      .update({ video_url: videoUrl })
      .eq("id", partidoId);
    
    setIsSavingUrl(false);
  };

  const handleAddEvent = async (tipo: string) => {
    let currentTimestamp = 0;
    if (playerRef.current) {
      currentTimestamp = playerRef.current.getCurrentTime() || 0;
    }

    const minutes = Math.floor(currentTimestamp / 60);
    const seconds = Math.floor(currentTimestamp % 60);

    const newEvent = {
      partido_id: partidoId,
      tipo,
      minuto: minutes,
      segundo: seconds,
      timestamp_video: currentTimestamp,
    };

    // Optimistic UI update
    const tempId = Math.random().toString();
    setEventos(prev => [...prev, { ...newEvent, id: tempId, created_at: new Date().toISOString() }].sort((a, b) => a.timestamp_video - b.timestamp_video));

    try {
      const { data, error } = await supabase
        .from("eventos_partido")
        .insert([newEvent])
        .select()
        .single();
      
      if (data) {
        setEventos(prev => prev.map(e => e.id === tempId ? data : e));
      } else if (error) {
        console.warn("Error al guardar evento:", error);
      }
    } catch (err) {
      console.warn('Error capturado en evento:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Column: Event Buttons */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
              <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Panel de Eventos
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">
            Reproduce el video y marca las acciones clave del partido en tiempo real.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {EVENT_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => handleAddEvent(type.id)}
                className={`relative group overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg ${type.shadow} ${type.hoverShadow}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-90 transition-opacity group-hover:opacity-100`}></div>
                <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-6 flex flex-col items-center justify-center text-white">
                  <type.icon className="w-10 h-10 mb-3 drop-shadow-md transform group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                  <span className="font-bold text-sm tracking-wider drop-shadow-md">{type.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Desktop version (hidden on mobile, shown here for larger screens) */}
        <div className="hidden lg:block bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
              <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Historial de Acciones
            </h3>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">No hay eventos registrados</p>
              <p className="text-xs text-gray-400 mt-1">Utiliza los botones de arriba para marcar acciones.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-indigo-100 dark:border-indigo-900/50 ml-4 pl-6 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 py-2">
              {eventos.map(evento => {
                const typeConfig = EVENT_TYPES.find(t => t.id === evento.tipo) || EVENT_TYPES[3];
                return (
                  <div 
                    key={evento.id} 
                    onClick={() => {
                      if (playerRef.current) {
                        playerRef.current.seekTo(evento.timestamp_video);
                      }
                    }}
                    className="relative group cursor-pointer"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-gradient-to-br ${typeConfig.color} border-2 border-white dark:border-gray-900 shadow-sm group-hover:scale-125 transition-transform duration-300`}></div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-transparent group-hover:border-indigo-200 dark:group-hover:border-indigo-800/50 group-hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${typeConfig.color}`}>
                          {evento.tipo}
                        </span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                          {formatTime(evento.timestamp_video)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2">
                        Haz clic para ver la jugada
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Video & Mobile Timeline */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Video Player Area */}
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Film className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Pegar URL del Video (YouTube o Vimeo)..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors dark:text-white"
              />
            </div>
            <button 
              onClick={handleSaveVideoUrl}
              disabled={isSavingUrl || !videoUrl || videoUrl === partido.video_url}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isSavingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Video
            </button>
          </div>

          <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 flex items-center justify-center group">
            {videoUrl ? (
              <ReactPlayer 
                ref={playerRef}
                url={videoUrl}
                width="100%"
                height="100%"
                controls={true}
                className="absolute top-0 left-0"
              />
            ) : (
              <div className="text-gray-400 text-sm flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <Play className="w-8 h-8 text-gray-500 ml-1" />
                </div>
                <p className="font-medium text-gray-500">No hay video configurado para este partido</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Timeline (hidden on desktop) */}
        <div className="lg:hidden bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
              <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Historial de Acciones
            </h3>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay eventos registrados aún.
            </div>
          ) : (
            <div className="relative border-l-2 border-indigo-100 dark:border-indigo-900/50 ml-4 pl-6 space-y-6">
              {eventos.map(evento => {
                const typeConfig = EVENT_TYPES.find(t => t.id === evento.tipo) || EVENT_TYPES[3];
                return (
                  <div 
                    key={evento.id} 
                    onClick={() => {
                      if (playerRef.current) {
                        playerRef.current.seekTo(evento.timestamp_video);
                      }
                    }}
                    className="relative group cursor-pointer"
                  >
                    <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-gradient-to-br ${typeConfig.color} border-2 border-white dark:border-gray-900 shadow-sm group-hover:scale-125 transition-transform duration-300`}></div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-transparent group-hover:border-indigo-200 dark:group-hover:border-indigo-800/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${typeConfig.color}`}>
                          {evento.tipo}
                        </span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                          {formatTime(evento.timestamp_video)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.4);
        }
      `}} />
    </div>
  );
}
