import { Equipo } from '@/types'
import { Pencil, Trash2 } from 'lucide-react'

interface EquipoCardProps {
  equipo: Equipo;
  onEdit: (equipo: Equipo) => void;
  onDelete: (id: string) => void;
}

export default function EquipoCard({ equipo, onEdit, onDelete }: EquipoCardProps) {
  return (
    <div className="flex items-center p-3 pr-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 transition-all hover:shadow-md group">
      <div className="relative w-16 h-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex-shrink-0 overflow-hidden flex justify-center items-center border border-zinc-100 dark:border-zinc-800/80">
        {equipo.escudo_url ? (
          <img src={equipo.escudo_url} alt={equipo.nombre} className="w-10 h-10 object-contain drop-shadow-sm" />
        ) : (
          <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-md" />
        )}
      </div>
      <h3 className="text-xs sm:text-sm font-bold uppercase text-zinc-800 dark:text-zinc-100 flex-1 min-w-0 text-left ml-3 truncate" title={equipo.nombre}>
        {equipo.nombre}
      </h3>
      
      <div className="flex items-center gap-1 ml-2">
        <button 
          onClick={() => onEdit(equipo)}
          className="p-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          title="Editar equipo"
        >
          <Pencil size={18} strokeWidth={1.5} />
        </button>
        <button 
          onClick={() => onDelete(equipo.id)}
          className="p-2 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
          title="Eliminar equipo"
        >
          <Trash2 size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
