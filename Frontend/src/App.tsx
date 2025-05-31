import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center fixed inset-0">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-white mb-6">
          Prueba de Tailwind CSS
        </h1>
        
        <button className="bg-white text-blue-500 px-6 py-3 rounded-lg
                         font-semibold shadow-lg
                         hover:bg-blue-500 hover:text-white
                         transform transition-all duration-300
                         hover:scale-105 hover:shadow-xl
                         active:scale-95">
          Botón de Prueba
        </button>
      </div>
    </div>
  )
}

export default App
