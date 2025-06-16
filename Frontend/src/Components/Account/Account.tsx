const Account = () => {
    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-white px-4">
            <div className="flex flex-col md:flex-row items-center
       gap-12 w-full max-w-3xl">
                {/* Columna de Imagen y Botón */}
                <div className="flex flex-col items-center top-0">
                    <img src={Logo} alt="logo" className="w-24 h-24 rounded-full object-cover" />
                    <button className="mt-2 bg-gradient-to-b from-black to-black hover:from-gray-800 hover:to-gray-800 text-white text-sm px-4 py-1 rounded-full">
                        Subir foto
                    </button>
                </div>

                {/* Formulario */}
                <div className="flex flex-col items-center w-full max-w-sm">
                    <h1 className="text-3xl font-bold mb-2 text-center text-black">Actualizar</h1>
                    <p className="text-lg mb-4 text-cente text-black">Actualiza la siguiente informacion</p>

                    <input
                        type="text"
                        placeholder="Nombre"
                        className="w-full mb-2 px-4 py-2 rounded border border-gray-300 focus:outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        className="w-full mb-2 px-4 py-2 rounded border border-gray-300 focus:outline-none"
                    />
                    <input
                        type="email"
                        placeholder="Correo"
                        className="w-full mb-4 px-4 py-2 rounded border border-gray-300 focus:outline-none"
                    />

                    <button className="w-full bg-gradient-to-b from-black to-black hover:from-gray-800 hover:to-gray-800 text-white py-2 rounded hover:bg-gray-800 mb-2">
                        Aceptar
                    </button>

                    <hr className="w-full my-2 border-gray-200" />

                    <p className="text-sm text-gray-500 mb-2">Digita un correo electrónico válido</p>
                    <button className="w-full bg-gradient-to-b from-black to-black hover:from-gray-800 hover:to-gray-800 text-white py-2 rounded hover:bg-gray-800 mb-2">
                        Volver
                    </button>
                    <button className="bg-gradient-to-b from-red-500 to-red-500 hover:from-red-300 hover:to-red-300 text-white px-8 py-1 rounded text-1x2">
                        Eliminar cuenta
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Account;