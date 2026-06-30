'use client'

import { useState, useRef, useEffect } from 'react'
import { Equipo } from '@/types'
import { X, Upload, Loader2, Pencil } from 'lucide-react'
import { uploadImageToStorage } from '@/lib/supabase-storage'
import { supabase } from '@/lib/supabase'

interface EquipoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  equipoToEdit?: Equipo | null;
}

export default function EquipoFormModal({ isOpen, onClose, onSaved, equipoToEdit }: EquipoFormModalProps) {
  const [nombre, setNombre] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (equipoToEdit) {
      setNombre(equipoToEdit.nombre)
      setPreviewUrl(equipoToEdit.escudo_url)
    } else {
      setNombre('')
      setFile(null)
      setPreviewUrl(null)
    }
    setError('')
  }, [equipoToEdit, isOpen])

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
    if (!nombre.trim()) {
      setError('El nombre del equipo es obligatorio')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      let escudo_url = equipoToEdit?.escudo_url || ''

      if (file) {
        const uploadedUrl = await uploadImageToStorage(file, 'FOTOS ESCUDOS')
        if (uploadedUrl) {
          escudo_url = uploadedUrl
        } else {
          setError('Error al subir la imagen. Verifica que el bucket "FOTOS ESCUDOS" existe y es público.')
          setIsSubmitting(false)
          return
        }
      }

      if (equipoToEdit) {
        const { error: updateError } = await supabase
          .from('equipos')
          .update({ nombre, escudo_url })
          .eq('id', equipoToEdit.id)
        
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('equipos')
          .insert([{ nombre, escudo_url }])
        
        if (insertError) throw insertError
      }

      onSaved()
      onClose()
    } catch (err: any) {
      console.warn('Error al guardar equipo:', err)
      setError(err.message || 'Error al guardar el equipo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200 dark:border-zinc-800"
        style={{ animation: '0.2s ease-out 0s 1 normal forwards running popIn' }}
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-800/20">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            {equipoToEdit ? (
               <><span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span> Editar Equipo</>
            ) : (
               <><span className="w-2 h-6 bg-green-500 rounded-full inline-block"></span> Nuevo Equipo</>
            )}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Nombre del Equipo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white transition-all outline-none uppercase font-bold tracking-wide"
                placeholder="EJ. REAL ZARAGOZA"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Escudo (Opcional)
              </label>
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${previewUrl ? 'border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10' : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-3 text-center">
                  {previewUrl ? (
                    <div className="relative inline-block">
                      <img src={previewUrl} alt="Vista previa" className="h-28 w-28 object-contain drop-shadow-md" />
                      <div className="absolute -bottom-3 -right-3 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 p-2 rounded-full shadow-lg border border-blue-200 dark:border-blue-800">
                        <Pencil size={14} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Upload className="h-8 w-8 text-zinc-400" />
                    </div>
                  )}
                  {!previewUrl && (
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                      <span className="text-blue-600 dark:text-blue-400 hover:underline">Selecciona un archivo</span> o arrástralo
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
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
            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 flex items-center justify-center min-w-[120px] shadow-sm shadow-blue-500/20 transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Guardar Equipo'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
