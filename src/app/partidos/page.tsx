"use client";

import { useState, useEffect } from "react";
import { Partido } from "@/types";
import { supabase } from "@/lib/supabase";
import { Plus, Loader2, Calendar, MapPin, ChevronRight, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import PartidoFormModal from "@/components/partidos/PartidoFormModal";

export default function PartidosPage() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPartidos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("partidos")
      .select(`
        *,
        equipo_local:equipos!partidos_equipo_local_id_fkey(id, nombre, escudo_url),
        equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(id, nombre, escudo_url)
      `)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error fetching partidos:", error);
    } else {
      setPartidos(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPartidos();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("¿Estás seguro de que deseas eliminar este partido?")) {
      const { error } = await supabase.from("partidos").delete().eq("id", id);
      if (!error) {
        fetchPartidos();
      } else {
        console.error("Error deleting partido:", error);
        alert("Error al eliminar el partido");
      }
    }
  };

  const mainTeam = {
    nombre: "RACING ZGZ",
    escudo_url: ""
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Partidos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los partidos y la preparación de los mismos.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-purple-600/20"
        >
          <Plus className="w-5 h-5" />
          Nuevo Partido
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : partidos.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay partidos</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            Aún no has registrado ningún partido. Crea el primero para comenzar a preparar la temporada.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Añadir partido
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {partidos.map((partido) => {
            const date = new Date(partido.fecha);
            
            // Format to YYYY-MM-DD for the card display as seen in the image
            const dateString = date.toISOString().split('T')[0];

            const rival = partido.equipo_visitante || partido.equipo_local;
            const es_local = !!partido.equipo_visitante;

            const localTeam = es_local ? mainTeam : rival;
            const visitanteTeam = es_local ? rival : mainTeam;

            // Simple logic to mock "AMISTOSO" vs "LIGA" if we don't have it in the DB
            // We can just use "AMISTOSO" as default for the visual
            const tipoPartido = "AMISTOSO";

            return (
              <Link href={`/partidos/${partido.id}`} key={partido.id}>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[20px] p-0 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col overflow-hidden h-full">
                  
                  {/* Top bar */}
                  <div className="flex justify-between items-center px-5 pt-5 pb-2">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {tipoPartido}
                    </span>
                    <button
                      onClick={(e) => handleDelete(partido.id, e)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-[18px] h-[18px]" />
                    </button>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-center gap-6 px-4 py-6">
                    {/* Local */}
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <div className="w-[72px] h-[72px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center p-2">
                        {localTeam?.escudo_url ? (
                          <img
                            src={localTeam.escudo_url}
                            alt={`Escudo de ${localTeam.nombre}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                            <span className="text-gray-400 font-bold text-xl">
                              {localTeam?.nombre?.substring(0, 2) || "?"}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white text-center uppercase break-words">
                        {localTeam?.nombre || "Local"}
                      </span>
                    </div>

                    {/* VS */}
                    <span className="text-2xl font-black text-gray-100 dark:text-gray-800 uppercase italic px-2">
                      VS
                    </span>

                    {/* Visitante */}
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <div className="w-[72px] h-[72px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center p-2">
                        {visitanteTeam?.escudo_url ? (
                          <img
                            src={visitanteTeam.escudo_url}
                            alt={`Escudo de ${visitanteTeam.nombre}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                            <span className="text-gray-400 font-bold text-xl">
                              {visitanteTeam?.nombre?.substring(0, 2) || "?"}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white text-center uppercase break-words">
                        {visitanteTeam?.nombre || "Visitante"}
                      </span>
                    </div>
                  </div>

                  {/* Date and Location */}
                  <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-[14px] h-[14px]" />
                      <span className="font-medium">{dateString}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-[14px] h-[14px]" />
                      <span className="uppercase text-xs tracking-wide">
                        {es_local ? "Local" : "Visitante"}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-[#f8fafc] dark:bg-gray-800/20 flex justify-between items-center">
                    <span className="text-[13px] text-gray-500 dark:text-gray-400">
                      Estado: <span className="text-gray-700 dark:text-gray-300">Planificado</span>
                    </span>
                    <span className="text-[13px] text-[#8b5cf6] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Abrir detalle <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <PartidoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPartidos}
      />
    </div>
  );
}

