import { Link } from "react-router-dom";
import Video from "../../assets/Video.mp4";
import Logo from "../../assets/Logo.png";

const HomePage = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <video
                autoPlay
                loop
                muted
                className="absolute w-full h-full object-cover scale-105 blur-sm"
                src={Video}
            />
            {/* Overlay para oscurecer ligeramente el video */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Contenido */}
            <div className="relative flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/50">
                        <div className="flex flex-col items-center mb-6">
                            <img src={Logo} alt="logo" className="w-[80px] mb-2" />
                            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 text-center mb-2">Bienvenido</h3>
                            <p className="text-gray-700 text-center">Administra tu negocio con una sola App</p>
                            <p className="text-gray-700 text-center text-sm">Fácil y rápido</p>
                        </div>
                        <div className="h-8" />
                        <div className="flex justify-around w-full">
                            <Link to="/register" className="w-1/2 pr-2">
                                <button
                                    className="w-full px-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 rounded-lg font-semibold shadow-lg shadow-gray-900/30 hover:from-gray-800 hover:to-gray-700 hover:text-emerald-300 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Registrar
                                </button>
                            </Link>
                            <Link to="/login" className="w-1/2 pl-2">
                                <button
                                    className="w-full px-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 rounded-lg font-semibold shadow-lg shadow-gray-900/30 hover:from-gray-800 hover:to-gray-700 hover:text-emerald-300 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Ingresar
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;