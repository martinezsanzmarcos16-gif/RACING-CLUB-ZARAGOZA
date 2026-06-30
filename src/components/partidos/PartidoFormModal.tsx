"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Partido, Equipo } from "@/types";
import { X, Loader2, Calendar, MapPin } from "lucide-react";

interface PartidoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  partido?: Partido | null;
}

export default function PartidoFormModal({ isOpen, onClose, onSuccess, partido }: PartidoFormModalProps) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    equipo_rival_id: partido?.equipo_visitante_id || partido?.equipo_local_id || "",
    fecha: partido?.fecha ? new Date(partido.fecha).toISOString().slice(0, 16) : "",
    es_local: partido ? !!partido.equipo_visitante_id : true,
    resultado: partido?.resultado || "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchEquipos();
      if (partido) {
        setFormData({
          equipo_rival_id: partido.equipo_visitante_id || partido.equipo_local_id || "",
          fecha: new Date(partido.fecha).toISOString().slice(0, 16),
          es_local: !!partido.equipo_visitante_id,
          resultado: partido.resultado || "",
        });
      } else {
        setFormData({ equipo_rival_id: "", fecha: "", es_local: true, resultado: "" });
      }
      setError("");
    }
  }, [isOpen, partido]);

  const fetchEquipos = async () => {
    const { data, error } = await supabase.from("equipos").select("*").order("nombre");
    if (!error && data) {
      setEquipos(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        equipo_local_id: formData.es_local ? null : formData.equipo_rival_id,
        equipo_visitante_id: formData.es_local ? formData.equipo_rival_id : null,
        fecha: new Date(formData.fecha).toISOString(),
        resultado: formData.resultado || null,
      };

      let result;
      if (partido) {
        result = await supabase.from("partidos").update(payload).eq("id", partido.id);
      } else {
        result = await supabase.from("partidos").insert([payload]).select().single();
      }

      if (result.error) throw result.error;

      // If it's a new match, create empty rows for informes_rival and planes_partido
      if (!partido && result.data) {
        const partidoId = result.data.id;
        await supabase.from("informes_rival").insert([{ partido_id: partidoId }]);
        await supabase.from("planes_partido").insert([{ partido_id: partidoId }]);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar el partido");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {partido ? "Editar Partido" : "Nuevo Partido"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rival
            </label>
            <select
              required
              value={formData.equipo_rival_id}
              onChange={(e) => setFormData({ ...formData, equipo_rival_id: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            >
              <option value="">Selecciona un equipo</option>
              {equipos.map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Fecha y Hora
            </label>
            <input
              type="datetime-local"
              required
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Localización
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  checked={formData.es_local === true}
                  onChange={() => setFormData({ ...formData, es_local: true })}
                  className="text-purple-600 focus:ring-purple-500"
                />
                Local
              </label>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  checked={formData.es_local === false}
                  onChange={() => setFormData({ ...formData, es_local: false })}
                  className="text-purple-600 focus:ring-purple-500"
                />
                Visitante
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resultado (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: 2-1"
              value={formData.resultado}
              onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 focus:ring-4 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Partido"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
