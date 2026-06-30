'use client'

import { useState, useRef, useEffect } from 'react'
import { Jugador } from '@/types'
import { X, Upload, Loader2 } from 'lucide-react'
import { uploadImageToStorage } from '@/lib/supabase-storage'
import { supabase } from '@/lib/supabase'

interface JugadorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  jugadorToEdit?: Jugador | null;
}

const demarcaciones = [
  'Portero', 'Defensa Central', 'Lateral Derecho', 'Lateral Izquierdo',
  'Pivote', 'Medio Centro', 'Media Punta', 'Extremo Derecho', 'Extremo Izquierdo', 'Delantero Centro'
]

export default function JugadorFormModal({ isOpen, onClose, onSaved, jugadorToEdit }: JugadorFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [dorsal, setDorsal] = useState<number | ''>('')
  const [demarcacion, setDemarcacion] = useState(demarcaciones[0])
  const [edad, setEdad] = useState<number | ''>('')
  const [formaFisica, setFormaFisica] = useState<number>(100)
  
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (jugadorToEdit) {
      setNombre(jugadorToEdit.nombre)
      setDorsal(jugadorToEdit.dorsal)
      setDemarcacion(jugadorToEdit.demarcacion)
      setEdad(jugadorToEdit.edad)
      setFormaFisica(jugadorToEdit.forma_fisica)
      setPreviewUrl(jugadorToEdit.foto_url)
    } else {
      setNombre('')
      setDorsal('')
      setDemarcacion(demarcaciones[0])
      setEdad('')
      setFormaFisica(100)
      setFile(null)
      setPreviewUrl(null)
    }
    setError('')
  }, [jugadorToEdit, isOpen])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || dorsal === '' || edad === '') {
      setError('Por favor, completa todos los campos obligatorios.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      let foto_url = jugadorToEdit?.foto_url || ''

      if (file) {
        const uploadedUrl = await uploadImageToStorage(file, 'FOTOS JUGADORES')
        if (uploadedUrl) {
          foto_url = uploadedUrl
        } else {
          setError('Error al subir la imagen. Verifica que el bucket "FOTOS JUGADORES" existe y es público.')
          setIsSubmitting(false)
          return
        }
      }

      const payload = {
        nombre,
        dorsal: Number(dorsal),
        demarcacion,
        edad: Number(edad),
        forma_fisica: Number(formaFisica),
        foto_url
      }

      if (jugadorToEdit) {
        const { error: updateError } = await supabase
          .from('jugadores')
          .update(payload)
          .eq('id', jugadorToEdit.id)
        
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('jugadores')
          .insert([payload])
        
        if (insertError) throw insertError
      }

      onSaved()
      onClose()
    } catch (err: any) {
      console.warn('Error al guardar jugador:', err)
      setError(err.message || 'Error al guardar el jugador')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-auto border border-zinc-200 dark:border-zinc-800"
        style={{ animation: '0.2s ease-out 0s 1 normal forwards running popIn' }}
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-800/20">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            {jugadorToEdit ? (
               <><span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span> Editar Jugador</>
            ) : (
               <><span className="w-2 h-6 bg-green-500 rounded-full inline-block"></span> Fichar Jugador</>
            )}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Foto Upload */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Fotografía (Opcional)
              </label>
              <div 
                className={`flex-1 min-h-[250px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden relative ${previewUrl ? 'border-zinc-200 dark:border-zinc-700 bg-black' : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Vista previa" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity text-white font-bold backdrop-blur-sm">
                      Cambiar foto
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 text-center p-6">
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <Upload className="h-10 w-10 text-zinc-400" />
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                      <span className="text-blue-600 dark:text-blue-400">Sube una foto</span>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Datos Formulario */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Nombre completo *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white uppercase font-bold"
                  placeholder="EJ. LIONEL MESSI"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Dorsal *</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={dorsal}
                    onChange={(e) => setDorsal(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Edad *</label>
                  <input
                    type="number"
                    min="15"
                    max="50"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold"
                    placeholder="25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Demarcación *</label>
                <select
                  value={demarcacion}
                  onChange={(e) => setDemarcacion(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium"
                >
                  {demarcaciones.map(dem => (
                    <option key={dem} value={dem}>{dem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex justify-between text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  <span>Forma Física</span>
                  <span className={formaFisica >= 80 ? 'text-green-600 dark:text-green-400' : formaFisica >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}>
                    {formaFisica}%
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formaFisica}
                  onChange={(e) => setFormaFisica(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-2 font-medium">
                  <span>Lesionado (0%)</span>
                  <span>Perfecto (100%)</span>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/60 flex justify-end gap-3 bg-zinc-50/50 dark:bg-zinc-800/20">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 flex items-center justify-center min-w-[140px] shadow-sm shadow-blue-500/20 transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (jugadorToEdit ? 'Guardar Cambios' : 'Añadir Jugador')}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
