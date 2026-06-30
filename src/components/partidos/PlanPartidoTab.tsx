"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PlanPartido } from "@/types";
import { Loader2, Save, FileVideo, Type, Image as ImageIcon, X } from "lucide-react";

interface PlanPartidoTabProps {
  partidoId: string;
}

type Fase = "ataque" | "defensa" | "transiciones";

export default function PlanPartidoTab({ partidoId }: PlanPartidoTabProps) {
  const [plan, setPlan] = useState<Partial<PlanPartido>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [uploadingFase, setUploadingFase] = useState<Fase | null>(null);

  useEffect(() => {
    fetchPlan();
  }, [partidoId]);

  const fetchPlan = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("planes_partido")
      .select("*")
      .eq("partido_id", partidoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching plan partido:", error);
    } else if (data) {
      setPlan(data);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

    const payload = {
      partido_id: partidoId,
      ...plan,
    };

    const { error } = await supabase
      .from("planes_partido")
      .upsert(payload, { onConflict: "partido_id" });

    if (error) {
      setSaveMessage("Error al guardar: " + error.message);
    } else {
      setSaveMessage("Guardado correctamente.");
      setTimeout(() => setSaveMessage(""), 3000);
    }
    setIsSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fase: Fase) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const key = `${fase}_imagenes` as keyof PlanPartido;
    const currentImages = (plan[key] as string[]) || [];

    if (currentImages.length >= 3) {
      alert("Máximo 3 imágenes permitidas por fase.");
      return;
    }

    setUploadingFase(fase);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${partidoId}_${fase}_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("planes_partido")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("planes_partido")
        .getPublicUrl(filePath);

      setPlan((prev) => ({
        ...prev,
        [key]: [...((prev[key] as string[]) || []), publicUrlData.publicUrl],
      }));
    } catch (error: any) {
      alert("Error al subir imagen: " + error.message);
    } finally {
      setUploadingFase(null);
    }
  };

  const removeImage = (fase: Fase, index: number) => {
    const key = `${fase}_imagenes` as keyof PlanPartido;
    setPlan((prev) => {
      const arr = [...((prev[key] as string[]) || [])];
      arr.splice(index, 1);
      return { ...prev, [key]: arr };
    });
  };

  const getEmbedUrl = (url: string | undefined | null) => {
    if (!url) return null;
    try {
      if (url.includes("youtube.com/watch")) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get("v");
        return v ? `https://www.youtube.com/embed/${v}` : url;
      }
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
      if (url.includes("vimeo.com/")) {
        const id = url.split("vimeo.com/")[1]?.split("?")[0];
        return id ? `https://player.vimeo.com/video/${id}` : url;
      }
      return url;
    } catch {
      return url;
    }
  };

  const renderFaseColumn = (fase: Fase, title: string, colorClass: string) => {
    const textoKey = `${fase}_texto` as keyof PlanPartido;
    const videoKey = `${fase}_video` as keyof PlanPartido;
    const imgKey = `${fase}_imagenes` as keyof PlanPartido;
    
    const imagenes = (plan[imgKey] as string[]) || [];

    return (
      <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm h-full">
        <h3 className={`text-lg font-bold uppercase tracking-wider ${colorClass}`}>{title}</h3>
        
        {/* Texto */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Type className="w-4 h-4" /> Descripción
          </label>
          <textarea
            value={(plan[textoKey] as string) || ""}
            onChange={(e) => setPlan({ ...plan, [textoKey]: e.target.value })}
            placeholder={`Plan ofensivo, defensivo...`}
            className="w-full flex-1 min-h-[120px] px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 dark:text-white resize-none"
          />
        </div>

        {/* Video */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <FileVideo className="w-4 h-4" /> Video (YouTube/Vimeo)
          </label>
          <input
            type="url"
            value={(plan[videoKey] as string) || ""}
            onChange={(e) => setPlan({ ...plan, [videoKey]: e.target.value })}
            placeholder="Enlace de video"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 dark:text-white"
          />
          {plan[videoKey] && (
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mt-2 relative border border-gray-200 dark:border-gray-700">
               <iframe
                src={getEmbedUrl(plan[videoKey] as string) || ""}
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}
        </div>

        {/* Imágenes */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4" /> Imágenes ({imagenes.length}/3)</span>
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {imagenes.map((url, idx) => (
              <div key={idx} className="aspect-square relative rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700">
                <img src={url} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(fase, idx)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {imagenes.length < 3 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:text-purple-600 hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors relative">
                {uploadingFase === fase ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Añadir</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, fase)}
                  disabled={uploadingFase === fase}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Tres columnas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {renderFaseColumn("ataque", "Ataque", "text-blue-600 dark:text-blue-400")}
        {renderFaseColumn("defensa", "Defensa", "text-red-600 dark:text-red-400")}
        {renderFaseColumn("transiciones", "Transiciones", "text-amber-500 dark:text-amber-400")}
      </div>

      {/* Botón Guardar */}
      <div className="flex items-center justify-end gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm sticky bottom-6 z-10">
        {saveMessage && (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {saveMessage}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-purple-600/20 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Plan
        </button>
      </div>

    </div>
  );
}
