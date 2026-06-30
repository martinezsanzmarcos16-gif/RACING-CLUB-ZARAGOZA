'use client'

import { useState, useEffect } from 'react'
import { Equipo } from '@/types'
import { supabase } from '@/lib/supabase'
import { Plus, Loader2, Search } from 'lucide-react'
import EquipoCard from '@/components/equipos/EquipoCard'
import EquipoFormModal from '@/components/equipos/EquipoFormModal'

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [equipoToEdit, setEquipoToEdit] = useState<Equipo | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchEquipos = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .order('nombre', { ascending: true })
    
    if (error) {
      console.error('Error fetching equipos:', error)
    } else {
      setEquipos(data || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchEquipos()
  }, [])

  const handleEdit = (equipo: Equipo) => {
    setEquipoToEdit(equipo)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
      const { error } = await supabase.from('equipos').delete().eq('id', id)
      if (error) {
        console.error('Error deleting equipo:', error)
        alert('Hubo un error al eliminar el equipo.')
      } else {
        fetchEquipos()
      }
    }
  }

  const handleOpenNew = () => {
    setEquipoToEdit(null)
    setIsModalOpen(true)
  }

  const filteredEquipos = equipos.filter(eq => eq.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            Equipos
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-sm font-bold px-3 py-1 rounded-full align-middle">
              {equipos.length}
            </span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Gestiona los clubes de la liga y sus respectivos escudos.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-shadow shadow-sm"
            />
          </div>
          <button 
            onClick={handleOpenNew}
            className="flex flex-shrink-0 items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Añadir Equipo</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
          <p className="text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">Cargando equipos...</p>
        </div>
      ) : equipos.length > 0 ? (
        <>
          {filteredEquipos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipos.map((equipo) => (
                <div key={equipo.id} style={{ animation: '0.3s ease-out 0s 1 normal forwards running popIn' }}>
                  <EquipoCard 
                    equipo={equipo} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <Search className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">No se encontraron equipos para "{searchTerm}"</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-lg shadow-zinc-200/50 dark:shadow-none max-w-2xl mx-auto mt-12">
          <div className="bg-blue-50 dark:bg-blue-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus size={40} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">La liga está vacía</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
            Aún no has añadido ningún equipo a la base de datos. Comienza añadiendo el primer equipo con su escudo oficial.
          </p>
          <button 
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-xl font-bold transition-transform hover:scale-105 shadow-xl shadow-zinc-900/20 dark:shadow-white/10"
          >
            Añadir mi primer equipo
          </button>
        </div>
      )}

      <EquipoFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchEquipos}
        equipoToEdit={equipoToEdit}
      />
      
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
