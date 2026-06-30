"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { InformeRival } from "@/types";
import { Loader2, Save, FileVideo, Presentation } from "lucide-react";

interface InformeRivalTabProps {
  partidoId: string;
}

const TACTICS_OPTIONS = {
  salida_balon: ["En corto", "En largo", "Mixto"],
  presion: ["Alta", "Media", "Baja"],
  linea_defensiva: ["Adelantada", "Media", "Retrasada"],
};

export default function InformeRivalTab({ partidoId }: InformeRivalTabProps) {
  const [informe, setInforme] = useState<Partial<InformeRival>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetchInforme();
  }, [partidoId]);

  const fetchInforme = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("informes_rival")
      .select("*")
      .eq("partido_id", partidoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching informe rival:", error);
    } else if (data) {
      setInforme(data);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

    const payload = {
      partido_id: partidoId,
      salida_balon: informe.salida_balon || null,
      presion: informe.presion || null,
      linea_defensiva: informe.linea_defensiva || null,
      google_slides_url: informe.google_slides_url || null,
      video_url: informe.video_url || null,
    };

    const { error } = await supabase
      .from("informes_rival")
      .upsert(payload, { onConflict: "partido_id" });

    if (error) {
      setSaveMessage("Error al guardar: " + error.message);
    } else {
      setSaveMessage("Guardado correctamente.");
      setTimeout(() => setSaveMessage(""), 3000);
    }
    setIsSaving(false);
  };

  const updateTactic = (field: keyof InformeRival, value: string) => {
    setInforme((prev) => ({
      ...prev,
      [field]: prev[field] === value ? null : value,
    }));
  };

  const renderBadge = (field: keyof InformeRival, option: string) => {
    const isSelected = informe[field] === option;
    return (
      <button
        key={option}
        onClick={() => updateTactic(field, option)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
          isSelected
            ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20"
            : "bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:border-red-500/50"
        }`}
      >
        {option}
      </button>
    );
  };

  const getEmbedUrl = (url: string | undefined | null) => {
    if (!url) return null;
    try {
      // Google Slides
      if (url.includes("docs.google.com/presentation")) {
        return url.replace("/pub?", "/embed?");
      }
      // YouTube
      if (url.includes("youtube.com/watch")) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get("v");
        return v ? `https://www.youtube.com/embed/${v}` : url;
      }
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
      // Vimeo
      if (url.includes("vimeo.com/")) {
        const id = url.split("vimeo.com/")[1]?.split("?")[0];
        return id ? `https://player.vimeo.com/video/${id}` : url;
      }
      return url;
    } catch {
      return url;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Tácticas */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tácticas del Rival</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
              Salida de Balón
            </h4>
            <div className="flex flex-wrap gap-3">
              {TACTICS_OPTIONS.salida_balon.map((opt) => renderBadge("salida_balon", opt))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
              Presión
            </h4>
            <div className="flex flex-wrap gap-3">
              {TACTICS_OPTIONS.presion.map((opt) => renderBadge("presion", opt))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
              Línea Defensiva
            </h4>
            <div className="flex flex-wrap gap-3">
              {TACTICS_OPTIONS.linea_defensiva.map((opt) => renderBadge("linea_defensiva", opt))}
            </div>
          </div>
        </div>
      </div>

      {/* Multimedia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Presentación (Google Slides) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Presentation className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Presentación (Slides)</h3>
          </div>
          <input
            type="url"
            placeholder="Pega el enlace de Google Slides (Publicar en la web)"
            value={informe.google_slides_url || ""}
            onChange={(e) => setInforme({ ...informe, google_slides_url: e.target.value })}
            className="w-full px-4 py-2 mb-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 dark:text-white"
          />
          <div className="flex-1 aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
            {informe.google_slides_url ? (
              <iframe
                src={getEmbedUrl(informe.google_slides_url) || ""}
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Sin presentación
              </div>
            )}
          </div>
        </div>

        {/* Video (YouTube/Vimeo) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <FileVideo className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Video Análisis</h3>
          </div>
          <input
            type="url"
            placeholder="Pega el enlace de YouTube o Vimeo"
            value={informe.video_url || ""}
            onChange={(e) => setInforme({ ...informe, video_url: e.target.value })}
            className="w-full px-4 py-2 mb-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 dark:text-white"
          />
          <div className="flex-1 aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
            {informe.video_url ? (
              <iframe
                src={getEmbedUrl(informe.video_url) || ""}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Sin video
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón Guardar Flotante o al final */}
      <div className="flex items-center justify-end gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm sticky bottom-6 z-10">
        {saveMessage && (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {saveMessage}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-red-600/20 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Informe
        </button>
      </div>
    </div>
  );
}
