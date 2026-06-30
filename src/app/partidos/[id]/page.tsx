"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Partido } from "@/types";
import { Loader2, ArrowLeft, Shield, Calendar, MapPin, Target, ClipboardList } from "lucide-react";
import Link from "next/link";
import InformeRivalTab from "@/components/partidos/InformeRivalTab";
import PlanPartidoTab from "@/components/partidos/PlanPartidoTab";
import AlineacionTab from "@/components/partidos/AlineacionTab";
import EventosTab from "@/components/partidos/EventosTab";

type Tab = "informe" | "plan" | "alineacion" | "eventos";

export default function PartidoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [partido, setPartido] = useState<Partido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("informe");

  useEffect(() => {
    if (id) {
      fetchPartido();
    }
  }, [id]);

  const fetchPartido = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("partidos")
      .select(`
        *,
        equipo_local:equipos!partidos_equipo_local_id_fkey(id, nombre, escudo_url),
        equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(id, nombre, escudo_url)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching partido:", error);
      router.push("/partidos");
    } else {
      setPartido(data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!partido) return null;

  const date = new Date(partido.fecha);
  const dateString = date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const timeString = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const rival = partido.equipo_visitante || partido.equipo_local;
  const es_local = !!partido.equipo_visitante;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Back button & Header */}
      <div className="mb-8">
        <Link 
          href="/partidos"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Partidos
        </Link>
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          
          {/* Decoración fondo (opcional) */}
          <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
            {rival?.escudo_url ? (
               <img
                src={rival.escudo_url}
                className="w-48 h-48 object-contain"
                alt=""
              />
            ) : (
              <Shield className="w-48 h-48" />
            )}
          </div>

          <div className="flex items-center gap-6 relative z-10">
            {rival?.escudo_url ? (
              <img
                src={rival.escudo_url}
                alt={`Escudo de ${rival.nombre}`}
                className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-md"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-gray-400" />
              </div>
            )}
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
                Próximo Partido
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                vs {rival?.nombre || "Desconocido"}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5 capitalize">
                  <Calendar className="w-4 h-4" />
                  {dateString} - {timeString}h
                </div>
                <div className="hidden sm:block w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {es_local ? "Local" : "Visitante"}
                </div>
                {partido.resultado && (
                  <>
                    <div className="hidden sm:block w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                    <div className="font-bold text-gray-900 dark:text-white">
                      Resultado: {partido.resultado}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("informe")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
              activeTab === "informe"
                ? "bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800"
            }`}
          >
            <Target className="w-4 h-4" />
            Informe Rival
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
              activeTab === "plan"
                ? "bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Plan de Partido
          </button>
          <button
            onClick={() => setActiveTab("alineacion")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
              activeTab === "alineacion"
                ? "bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Alineación
          </button>
          <button
            onClick={() => setActiveTab("eventos")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
              activeTab === "eventos"
                ? "bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Eventos
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "informe" && <InformeRivalTab partidoId={id} />}
        {activeTab === "plan" && <PlanPartidoTab partidoId={id} />}
        {activeTab === "alineacion" && <AlineacionTab partidoId={id} />}
        {activeTab === "eventos" && <EventosTab partidoId={id} partido={partido} />}
      </div>

    </div>
  );
}
