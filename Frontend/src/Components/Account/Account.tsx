//import { useState, useEffect } from "react";
import Logo from "../../assets/Logo.png";
import Fondo2 from "../../assets/Fondo2.jpg";
//import axios from "axios";
//import { useNavigate } from "react-router-dom";

const Account = () => {
    return (
        <div className="h-full w-full items-center ">
            {/* Fondo con imagen y efecto de oscurecimiento */}
            <div className="absolute inset-0 z-0">
                <img
                    src={Fondo2}
                    alt="Fondo"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            </div>

            {/* Contenido */}
            <div className="relative z-10 w-full h-full p-9 items-center">
                <div className="flex r justify-center mt-25 px-4">
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
                        <div className="w-[400px] h-[500px] bg-white flex flex-col items-center p-9 rounded-lg shadow-md">
                            <h1 className="text-3xl font-bold mb-2 text-center text-black">Actualizar</h1>
                            <p className="text-lg mb-4 text-center text-black">Actualiza la siguiente informacion</p>

                            <input
                                type="text"
                                placeholder="Nombre"
                                className="w-full px-4 py-2 mb-4 border border-gray-200 rounded-lg text-sm text-gray-500"
                            />
                            <input
                                type="text"
                                placeholder="Apellido"
                                className="w-full px-4 py-2 mb-4 border border-gray-200 rounded-lg text-sm text-gray-500"
                            />
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                className="w-full px-4 py-2 mb-4 border border-gray-200 rounded-lg text-sm text-gray-500"
                            />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                className="w-full px-4 py-2 mb-4 border border-gray-200 rounded-lg text-sm text-gray-500"
                            />

                            <button className="w-full px-3 py-1 rounded-lg font-semibold text-green-500 bg-black shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm mb-4">
                                Actualizar
                            </button>

                            <hr className="w-full my-2 border-gray-200" />

                            <button className="w-full px-3 py-1 rounded-lg font-semibold text-red-500 bg-black shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-red-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm mb-4">
                                Eliminar cuenta
                            </button>

                            <button className="w-full px-3 py-1 rounded-lg font-semibold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30 hover:from-gray-600 hover:to-gray-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm">
                                Volver
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;