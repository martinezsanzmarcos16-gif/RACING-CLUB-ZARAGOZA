'use client'

import { useState, useEffect } from 'react'
import { Jugador } from '@/types'
import { supabase } from '@/lib/supabase'
import { Plus, Loader2, Users2, Filter } from 'lucide-react'
import JugadorCard from '@/components/plantilla/JugadorCard'
import JugadorFormModal from '@/components/plantilla/JugadorFormModal'

export default function PlantillaPage() {
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [jugadorToEdit, setJugadorToEdit] = useState<Jugador | null>(null)
  const [filterDemarcacion, setFilterDemarcacion] = useState('Todos')

  const fetchJugadores = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('jugadores')
      .select('*')
      .order('dorsal', { ascending: true })
    
    if (error) {
      console.error('Error fetching jugadores:', error)
    } else {
      setJugadores(data || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchJugadores()
  }, [])

  const handleEdit = (jugador: Jugador) => {
    setJugadorToEdit(jugador)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este jugador de la plantilla?')) {
      const { error } = await supabase.from('jugadores').delete().eq('id', id)
      if (error) {
        console.error('Error deleting jugador:', error)
        alert('Hubo un error al eliminar el jugador.')
      } else {
        fetchJugadores()
      }
    }
  }

  const handleOpenNew = () => {
    setJugadorToEdit(null)
    setIsModalOpen(true)
  }

  const demarcacionesSet = new Set(jugadores.map(j => j.demarcacion))
  const demarcacionesDisponibles = ['Todos', ...Array.from(demarcacionesSet)]

  const filteredJugadores = filterDemarcacion === 'Todos' 
    ? jugadores 
    : jugadores.filter(j => j.demarcacion === filterDemarcacion)

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3 mb-2">
            Plantilla
            <span className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-lg px-4 py-1.5 rounded-full align-middle">
              {jugadores.length}
            </span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">Gestiona tu equipo principal. Como cromos coleccionables.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          {jugadores.length > 0 && (
            <div className="relative hidden md:flex items-center">
              <Filter className="absolute left-3 text-zinc-400" size={16} />
              <select 
                value={filterDemarcacion}
                onChange={(e) => setFilterDemarcacion(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer"
              >
                {demarcacionesDisponibles.map(dem => (
                  <option key={dem} value={dem}>{dem}</option>
                ))}
              </select>
            </div>
          )}
          <button 
            onClick={handleOpenNew}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} />
            <span>Fichar Jugador</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <Loader2 className="animate-spin text-zinc-400 h-10 w-10" />
          <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest animate-pulse text-sm">Cargando Plantilla...</p>
        </div>
      ) : jugadores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredJugadores.map((jugador, i) => (
            <div key={jugador.id} style={{ animation: `0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s 1 normal forwards running popIn` }} className="opacity-0">
              <JugadorCard 
                jugador={jugador} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-12 md:p-20 text-center shadow-xl shadow-zinc-200/50 dark:shadow-none max-w-3xl mx-auto mt-12">
          <div className="bg-zinc-100 dark:bg-zinc-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Users2 size={48} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">Plantilla Vacía</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-10 text-lg max-w-lg mx-auto leading-relaxed">
            Tu equipo aún no tiene jugadores registrados. ¡Es hora de empezar a crear tu alineación ideal!
          </p>
          <button 
            onClick={handleOpenNew}
            className="inline-flex items-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-xl font-black text-lg transition-transform hover:scale-105 shadow-xl shadow-zinc-900/20 dark:shadow-white/10"
          >
            <Plus size={24} />
            Crear Primer Jugador
          </button>
        </div>
      )}

      <JugadorFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchJugadores}
        jugadorToEdit={jugadorToEdit}
      />

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
