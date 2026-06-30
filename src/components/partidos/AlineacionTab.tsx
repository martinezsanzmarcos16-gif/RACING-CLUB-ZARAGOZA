"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Jugador } from "@/types";
import { DndContext, useDraggable, useDroppable, DragEndEvent } from "@dnd-kit/core";
import { Loader2, Brain, User, AlertCircle, Sparkles, Shield } from "lucide-react";

interface Position {
  id: string;
  label: string;
  top: string;
  left: string;
}

const FORMATIONS: Record<string, Position[]> = {
  "4-3-3": [
    { id: "gk", label: "POR", top: "85%", left: "50%" },
    { id: "lb", label: "LI", top: "65%", left: "15%" },
    { id: "lcb", label: "DFC", top: "70%", left: "35%" },
    { id: "rcb", label: "DFC", top: "70%", left: "65%" },
    { id: "rb", label: "LD", top: "65%", left: "85%" },
    { id: "lcm", label: "MC", top: "45%", left: "30%" },
    { id: "cm", label: "MCD", top: "50%", left: "50%" },
    { id: "rcm", label: "MC", top: "45%", left: "70%" },
    { id: "lw", label: "EI", top: "20%", left: "20%" },
    { id: "st", label: "DC", top: "15%", left: "50%" },
    { id: "rw", label: "ED", top: "20%", left: "80%" },
  ],
  "4-4-2": [
    { id: "gk", label: "POR", top: "85%", left: "50%" },
    { id: "lb", label: "LI", top: "65%", left: "15%" },
    { id: "lcb", label: "DFC", top: "70%", left: "35%" },
    { id: "rcb", label: "DFC", top: "70%", left: "65%" },
    { id: "rb", label: "LD", top: "65%", left: "85%" },
    { id: "lm", label: "MI", top: "40%", left: "15%" },
    { id: "lcm", label: "MC", top: "45%", left: "35%" },
    { id: "rcm", label: "MC", top: "45%", left: "65%" },
    { id: "rm", label: "MD", top: "40%", left: "85%" },
    { id: "lst", label: "DC", top: "15%", left: "35%" },
    { id: "rst", label: "DC", top: "15%", left: "65%" },
  ],
};

function DraggablePlayer({ jugador, inPitch = false }: { jugador: Jugador, inPitch?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: jugador.id,
    data: { jugador },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  if (inPitch) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`flex flex-col items-center justify-center cursor-grab active:cursor-grabbing group transition-all duration-300 ${isDragging ? 'opacity-70 scale-105' : 'hover:scale-110 hover:-translate-y-1'}`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-md group-hover:bg-white/40 transition-all"></div>
          <div className="relative w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-full border-[3px] border-indigo-500 shadow-xl flex items-center justify-center overflow-hidden bg-cover bg-center z-10 transition-transform" style={{ backgroundImage: jugador.foto_url ? `url(${jugador.foto_url})` : 'none' }}>
             {!jugador.foto_url && <User className="w-5 h-5 text-gray-400" />}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white z-20 shadow-sm">
            {jugador.dorsal || '-'}
          </div>
        </div>
        <div className="mt-1.5 bg-black/80 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/10 shadow-lg truncate max-w-[70px] md:max-w-[80px] text-center tracking-wide">
          {jugador.nombre.split(' ')[0]}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl flex items-center gap-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md hover:border-indigo-400/50 dark:hover:border-indigo-500/50 transition-all duration-200 group ${isDragging ? 'opacity-50 ring-2 ring-indigo-500' : ''}`}
    >
      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden bg-cover bg-center border-2 border-transparent group-hover:border-indigo-400 transition-colors shadow-inner" style={{ backgroundImage: jugador.foto_url ? `url(${jugador.foto_url})` : 'none' }}>
         {!jugador.foto_url && <User className="w-5 h-5 text-gray-400" />}
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{jugador.nombre}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded">
            {jugador.demarcacion}
          </span>
          <span className="text-xs text-gray-500 font-medium">#{jugador.dorsal}</span>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 text-gray-300 transition-opacity">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
      </div>
    </div>
  );
}

function DroppablePosition({ position, player }: { position: Position, player?: Jugador }) {
  const { isOver, setNodeRef } = useDroppable({
    id: position.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
      style={{ top: position.top, left: position.left }}
    >
      {player ? (
        <DraggablePlayer jugador={player} inPitch />
      ) : (
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-[2.5px] border-dashed flex items-center justify-center transition-all duration-300 ${isOver ? 'border-indigo-300 bg-indigo-500/40 scale-125 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-white/40 bg-black/10 hover:border-white/70 hover:bg-black/20'}`}>
          <span className="text-white/80 text-[10px] md:text-xs font-bold tracking-wider">{position.label}</span>
        </div>
      )}
    </div>
  );
}

export default function AlineacionTab({ partidoId }: { partidoId: string }) {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formation, setFormation] = useState<string>("4-3-3");
  const [pitchPlayers, setPitchPlayers] = useState<Record<string, Jugador>>({});
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rivalFormation, setRivalFormation] = useState("4-4-2");

  useEffect(() => {
    fetchJugadores();
  }, []);

  const fetchJugadores = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("jugadores")
      .select("*")
      .order("dorsal", { ascending: true });
    
    if (!error && data) {
      setJugadores(data);
    }
    setIsLoading(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      const positionId = Object.keys(pitchPlayers).find(key => pitchPlayers[key]?.id === active.id);
      if (positionId) {
        setPitchPlayers(prev => {
          const newState = { ...prev };
          delete newState[positionId];
          return newState;
        });
      }
      return;
    }

    const jugador = active.data.current?.jugador as Jugador;
    const targetPositionId = over.id as string;

    if (jugador && targetPositionId) {
      setPitchPlayers(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          if (newState[key]?.id === jugador.id) {
            delete newState[key];
          }
        });
        newState[targetPositionId] = jugador;
        return newState;
      });
    }
  };

  const availablePlayers = jugadores.filter(j => 
    !Object.values(pitchPlayers).find(p => p.id === j.id)
  );

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const response = await fetch('/api/tactics/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nuestraFormacion: formation,
          formacionRival: rivalFormation
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAiAnalysis(data.text);
      } else {
        setAiAnalysis(`**Error:** ${data.error || 'Ocurrió un problema al conectar con la IA.'}`);
      }
    } catch (error) {
      setAiAnalysis("**Error:** No se pudo completar la solicitud.");
    }
    setIsAnalyzing(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;
  }

  // Calculate percentage of pitch filled
  const pitchFilled = Object.keys(pitchPlayers).length;
  const totalPositions = FORMATIONS[formation].length;
  const isPitchFull = pitchFilled === totalPositions;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Pitch */}
        <div className="lg:col-span-8 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">Nuestra Formación</label>
                <select 
                  value={formation} 
                  onChange={(e) => {
                    setFormation(e.target.value);
                    setPitchPlayers({}); 
                  }}
                  className="bg-transparent border-0 text-gray-900 dark:text-white font-bold text-lg p-0 focus:ring-0 cursor-pointer"
                >
                  {Object.keys(FORMATIONS).map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-gray-200 dark:bg-gray-700"></div>

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !isPitchFull}
              className={`w-full sm:w-auto relative group overflow-hidden rounded-xl p-[1px] transition-all duration-300 ${!isPitchFull ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'}`}
            >
              <span className={`absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl ${isAnalyzing ? 'animate-[spin_2s_linear_infinite]' : 'opacity-100'}`}></span>
              <div className="relative flex items-center justify-center gap-2 bg-white dark:bg-gray-900 px-6 py-2.5 rounded-xl transition-all duration-300 group-hover:bg-opacity-0">
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                ) : (
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                )}
                <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors">
                  {isAnalyzing ? 'Analizando...' : 'Analizar Táctica'}
                </span>
              </div>
            </button>
          </div>

          {/* Football Pitch */}
          <div className="relative w-full aspect-[2/3] sm:aspect-[3/4] md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-800/50 bg-[#2d8f3e] bg-[repeating-linear-gradient(0deg,transparent,transparent_40px,rgba(0,0,0,0.06)_40px,rgba(0,0,0,0.06)_80px)] isolate">
            {/* Glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none"></div>

            {/* Pitch Lines - styled with realistic glow */}
            <div className="absolute inset-[4%] border-[3px] border-white/60 shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none rounded-md"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 border-b-[3px] border-white/60 shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] aspect-square border-[3px] border-white/60 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/80 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none"></div>
            
            {/* Penalty areas */}
            <div className="absolute top-[4%] left-1/2 -translate-x-1/2 w-[45%] h-[16%] border-[3px] border-white/60 border-t-0 shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none"></div>
            <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[45%] h-[16%] border-[3px] border-white/60 border-b-0 shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none"></div>
            
            {/* Goal areas */}
            <div className="absolute top-[4%] left-1/2 -translate-x-1/2 w-[20%] h-[6%] border-[3px] border-white/60 border-t-0 shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none"></div>
            <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[20%] h-[6%] border-[3px] border-white/60 border-b-0 shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none"></div>
            
            {/* Penalty spots */}
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/80 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)] pointer-events-none"></div>
            <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/80 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)] pointer-events-none"></div>

            {/* Droppable Slots */}
            {FORMATIONS[formation].map((pos) => (
              <DroppablePosition key={pos.id} position={pos} player={pitchPlayers[pos.id]} />
            ))}
          </div>
        </div>

        {/* Right Column: Players & Analysis */}
        <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
          {/* AI Analysis Panel */}
          <div className="bg-white/70 dark:bg-[#0f111a]/80 backdrop-blur-xl rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden flex flex-col h-[400px] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 border-b border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">ANÁLISIS TÁCTICO</h3>
              </div>
              <select 
                value={rivalFormation} 
                onChange={(e) => setRivalFormation(e.target.value)}
                className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block px-2.5 py-1.5 shadow-sm"
              >
                <option value="4-4-2">Rival: 4-4-2</option>
                <option value="4-3-3">Rival: 4-3-3</option>
                <option value="3-5-2">Rival: 3-5-2</option>
                <option value="5-3-2">Rival: 5-3-2</option>
                <option value="4-2-3-1">Rival: 4-2-3-1</option>
              </select>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
              {isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-[spin_1.5s_linear_infinite]"></div>
                    <Brain className="w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                  <p className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent animate-pulse">Analizando emparejamientos...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-indigo-600 dark:prose-headings:text-indigo-400 prose-li:marker:text-indigo-500">
                  {/* Rendering simple markdown-like text */}
                  <div className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                    {aiAnalysis.split('\n').map((line, i) => {
                      if (line.startsWith('**') || line.startsWith('##') || line.match(/^\d\./)) {
                         return <p key={i} className="font-bold text-indigo-900 dark:text-indigo-200 mt-4 mb-1">{line.replace(/[*#]/g, '')}</p>
                      }
                      if (line.startsWith('-')) {
                         return <li key={i} className="ml-4 pl-1">{line.replace('-', '')}</li>
                      }
                      return <p key={i} className="min-h-[1rem]">{line}</p>
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-4 px-4">
                  <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-inner">
                    <Sparkles className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Esperando instrucciones</p>
                    <p className="text-xs">Completa la alineación y haz clic en analizar para obtener un reporte táctico con IA.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Available Players List */}
          <div className="bg-white/70 dark:bg-[#0f111a]/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col flex-1 min-h-[400px]">
             <div className="p-5 border-b border-gray-100 dark:border-gray-800/50 flex justify-between items-end">
               <div>
                 <h3 className="font-bold text-gray-900 dark:text-white tracking-wide">Banquillo</h3>
                 <p className="text-xs text-gray-500 mt-1 font-medium">Arrastra al campo para alinear</p>
               </div>
               <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold">
                 {availablePlayers.length} / {jugadores.length}
               </div>
             </div>
             
             <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {availablePlayers.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
                      <Shield className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Equipo completo</p>
                    <p className="text-xs text-gray-500 mt-1">Todos los jugadores están en el campo</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {availablePlayers.map(jugador => (
                      <DraggablePlayer key={jugador.id} jugador={jugador} />
                    ))}
                  </div>
                )}
             </div>
          </div>

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
    </DndContext>
  );
}

