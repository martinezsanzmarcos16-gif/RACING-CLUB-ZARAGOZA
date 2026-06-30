import { Jugador } from '@/types'
import { Pencil, Trash2, Activity, User2 } from 'lucide-react'

interface JugadorCardProps {
  jugador: Jugador;
  onEdit: (jugador: Jugador) => void;
  onDelete: (id: string) => void;
}

export default function JugadorCard({ jugador, onEdit, onDelete }: JugadorCardProps) {
  // Color based on fitness
  const fitnessColor = 
    jugador.forma_fisica >= 80 ? 'bg-green-500' :
    jugador.forma_fisica >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="group relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-zinc-200 dark:border-zinc-800 flex flex-col h-full hover:-translate-y-1">
      {/* Dorsal Badge */}
      <div className="absolute top-4 left-4 z-10 w-12 h-12 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center font-black text-xl text-zinc-900 dark:text-white shadow-lg border border-white/20 dark:border-zinc-700/50">
        {jugador.dorsal}
      </div>

      {/* Actions (visible on hover) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(jugador)}
          className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Editar"
        >
          <Pencil size={16} />
        </button>
        <button 
          onClick={() => onDelete(jugador.id)}
          className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Photo area */}
      <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-800 dark:to-zinc-950 flex justify-center items-end overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-500/5 mix-blend-overlay"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        {jugador.foto_url ? (
          <img 
            src={jugador.foto_url} 
            alt={jugador.nombre} 
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full opacity-50 pb-10">
            <User2 size={80} className="text-zinc-400 dark:text-zinc-600 mb-4" />
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-500">Sin Foto</span>
          </div>
        )}
        
        {/* Gradient overlay for text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-2xl font-black uppercase tracking-wide leading-tight drop-shadow-md">
            {jugador.nombre}
          </h3>
          <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mt-1 opacity-90 drop-shadow-sm">
            {jugador.demarcacion}
          </p>
        </div>
      </div>

      {/* Stats area */}
      <div className="p-5 flex flex-col gap-4 bg-white dark:bg-zinc-900 flex-1">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="text-center w-full">
            <span className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Edad</span>
            <span className="text-xl font-black text-zinc-800 dark:text-zinc-100">{jugador.edad} <span className="text-sm font-semibold text-zinc-500">años</span></span>
          </div>
          <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="text-center w-full">
            <span className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Forma</span>
            <div className="flex items-center justify-center gap-1.5">
              <Activity size={16} className={jugador.forma_fisica >= 80 ? 'text-green-500' : jugador.forma_fisica >= 50 ? 'text-yellow-500' : 'text-red-500'} />
              <span className="text-xl font-black text-zinc-800 dark:text-zinc-100">{jugador.forma_fisica}%</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-zinc-500 dark:text-zinc-400">Estado Físico</span>
            <span className="text-zinc-800 dark:text-zinc-200">{jugador.forma_fisica}/100</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden border border-zinc-200 dark:border-zinc-700/50">
            <div 
              className={`h-full rounded-full ${fitnessColor} transition-all duration-1000 ease-out`}
              style={{ width: `${jugador.forma_fisica}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
