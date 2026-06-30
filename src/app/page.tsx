export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Bienvenido a <span className="text-purple-600 dark:text-purple-400">RACING CLUB ZGZ</span>
        </h1>
      </div>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
        Plataforma centralizada para la gestión deportiva. Selecciona una opción del menú lateral para acceder a la plantilla, equipos o información de partidos.
      </p>
    </div>
  );
}
