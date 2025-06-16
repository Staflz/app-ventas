import { useState, useEffect } from "react";
import Logo from "../../assets/Logo.png";
import Fondo2 from "../../assets/Fondo2.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";

interface Billetera {
    id: string;
    nombre: string;
    saldo: number;
    ultima_actualizacion: string;
}

interface Transferencia {
    id: string;
    monto: number;
    billetera_origen: {
        nombre: string;
    };
    billetera_destino: {
        nombre: string;
    };
    fecha: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const TABS = [
  { label: "Ventas", value: "ventas" },
  { label: "Billeteras", value: "billeteras" },
  { label: "Inventario", value: "inventario" },
];

const Billeteras = () => {
    const navigate = useNavigate();
    // Estado para el formulario de nueva billetera
    const [nuevaBilletera, setNuevaBilletera] = useState({
        nombre: "",
        saldo: ""
    });

    // Estado para la lista de billeteras
    const [billeteras, setBilleteras] = useState<Billetera[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [billeteraEditando, setBilleteraEditando] = useState<string | null>(null);

    // Estado para las transferencias
    const [nuevaTransferencia, setNuevaTransferencia] = useState({
        monto: "",
        billetera_origen: "",
        billetera_destino: "",
        fecha: ""
    });
    const [transferenciaEditando, setTransferenciaEditando] = useState<string | null>(null);
    const [transferencias, setTransferencias] = useState<Transferencia[]>([]);

    const [activeTab, setActiveTab] = useState("billeteras");
    // Elimino paginación, solo muestro las primeras 10 billeteras
    const billeterasToShow = billeteras.slice(0, 10);

    // Función para cargar las billeteras
    const cargarBilleteras = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await axios.get(`${API_URL}/api/billeteras`, {
                params: {
                    email: user.email
                }
            });
            setBilleteras(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las billeteras');
            console.error('Error al cargar billeteras:', err);
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar las transferencias
    const cargarTransferencias = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await axios.get(`${API_URL}/api/transferencias`, {
                params: {
                    email: user.email
                }
            });
            setTransferencias(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las transferencias');
            console.error('Error al cargar transferencias:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cargar billeteras y transferencias al montar el componente
    useEffect(() => {
        cargarBilleteras();
        cargarTransferencias();
    }, []);

    // Función para manejar cambios en el formulario de billetera
    const handleChangeBilletera = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNuevaBilletera(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Función para manejar cambios en el formulario de transferencia
    const handleChangeTransferencia = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNuevaTransferencia(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Función para iniciar la edición de una billetera
    const handleIniciarEdicion = (billetera: Billetera) => {
        setBilleteraEditando(billetera.id);
        setNuevaBilletera({
            nombre: billetera.nombre,
            saldo: billetera.saldo.toString()
        });
    };

    // Función para iniciar la edición de una transferencia
    const handleIniciarEdicionTransferencia = (transferencia: Transferencia) => {
        setTransferenciaEditando(transferencia.id);
        setNuevaTransferencia({
            monto: transferencia.monto.toString(),
            billetera_origen: transferencia.billetera_origen.nombre,
            billetera_destino: transferencia.billetera_destino.nombre,
            fecha: transferencia.fecha
        });
    };

    // Función para guardar billetera
    const handleGuardarBilletera = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const billeteraData = {
                ...nuevaBilletera,
                saldo: parseFloat(nuevaBilletera.saldo),
                email: user.email
            };

            if (billeteraEditando) {
                // Actualizar billetera existente
                await axios.put(`${API_URL}/api/billeteras/${billeteraEditando}`, billeteraData);
            } else {
                // Crear nueva billetera
                await axios.post(`${API_URL}/api/billeteras`, billeteraData);
            }

            setNuevaBilletera({ nombre: "", saldo: "" });
            setBilleteraEditando(null);
            cargarBilleteras(); // Recargar la lista de billeteras
        } catch (err) {
            setError('Error al guardar la billetera');
            console.error('Error al guardar billetera:', err);
        }
    };

    // Función para guardar transferencia
    const handleGuardarTransferencia = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const transferenciaData = {
                ...nuevaTransferencia,
                monto: parseFloat(nuevaTransferencia.monto),
                email: user.email
            };

            if (transferenciaEditando) {
                // Actualizar transferencia existente
                await axios.put(`${API_URL}/api/transferencias/${transferenciaEditando}`, transferenciaData);
            } else {
                // Crear nueva transferencia
                await axios.post(`${API_URL}/api/transferencias`, transferenciaData);
            }

            setNuevaTransferencia({ monto: "", billetera_origen: "", billetera_destino: "", fecha: "" });
            setTransferenciaEditando(null);
            cargarTransferencias(); // Recargar las transferencias
        } catch (err) {
            setError('Error al guardar la transferencia');
            console.error('Error al guardar transferencia:', err);
        }
    };

    // Función para eliminar una billetera
    const handleEliminarBilletera = async (id: string) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await axios.delete(`${API_URL}/api/billeteras/${id}`, {
                params: {
                    email: user.email
                }
            });
            setBilleteraEditando(null);
            setNuevaBilletera({ nombre: "", saldo: "" });
            cargarBilleteras();
        } catch (err) {
            setError('Error al eliminar la billetera');
            console.error('Error al eliminar billetera:', err);
        }
    };

    // Función para eliminar una transferencia
    const handleEliminarTransferencia = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/api/transferencias/${id}`);
            setTransferenciaEditando(null);
            setNuevaTransferencia({ monto: "", billetera_origen: "", billetera_destino: "", fecha: "" });
            cargarTransferencias();
        } catch (err) {
            setError('Error al eliminar la transferencia');
            console.error('Error al eliminar transferencia:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (tab === 'ventas') {
            navigate('/dashboard');
        } else if (tab === 'inventario') {
            navigate('/inventario');
        }
    };

    return (
        <div className="min-h-screen w-full relative">
            {/* Fondo con imagen y efecto de oscurecimiento */}
            <div className="absolute inset-0 z-0">
                <img
                    src={Fondo2}
                    alt="Fondo"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            </div>

            {/* Contenido del dashboard */}
            <div className="relative z-10 w-full p-9">
                {/* Paneles superiores alineados y sin fondo blanco */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-2 ">
                    {/* Izquierda: Última venta y billeteras */}
                    {/* Derecha: Nueva venta */}
                    <div className="flex flex-col items-center w-[232px] h-[346px] mx-25">
                        <div className="bg-white w-[203px] h-[66px] border border-emerald-300 rounded-lg p-2 flex justify-center items-center shadow-sm bg-blue-50 mb-5">
                            <span className="font-semibold text-black text-base">
                                {billeteraEditando ? 'Editar billetera' : 'Nueva billetera'}
                            </span>
                        </div>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre"
                            value={nuevaBilletera.nombre}
                            onChange={handleChangeBilletera}
                            readOnly={billeteraEditando !== null}
                            className={` bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm ${
                                billeteraEditando !== null ? 'text-gray-400 bg-gray-100' : 'text-gray-500'
                            } mb-4`}
                        />
                        <input
                            type="number"
                            name="saldo"
                            placeholder="Saldo"
                            value={nuevaBilletera.saldo}
                            onChange={handleChangeBilletera}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleGuardarBilletera}
                                className="px-3 py-1 rounded-lg font-semibold text-green-500 bg-black  shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm"
                            >
                                {billeteraEditando ? 'Actualizar' : 'Guardar'}
                            </button>
                            {billeteraEditando && (
                                <button
                                    onClick={() => {
                                        setBilleteraEditando(null);
                                        setNuevaBilletera({ nombre: "", saldo: "" });
                                    }}
                                    className="px-3 py-1 rounded-lg font-semibold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30 hover:from-gray-600 hover:to-gray-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Centro: Balance Total */}
                    <div className="flex flex-col items-center w-[405px] h-[346px]">
                        <div className="w-[405px] h-[144px] border border-emerald-300 rounded-lg p-2 flex flex-col justify-center items-center shadow-sm bg-white mb-2">
                            <span className=" mb-5 text-2xl font-bold text-gray-700">Balance Total</span>
                            <span className="text-emerald-500 text-4xl font-bold">0$</span>
                        </div>
                        {/* Logo más grande */}
                        <div 
                            onClick={() => navigate('/account')}
                            className="w-20 h-20 rounded-full overflow-hidden shadow-md mt-9 cursor-pointer hover:scale-105 transition-transform duration-200"
                        >
                            <img src={Logo} alt="Logo" className="object-cover w-full h-full" />
                        </div>
                        {/* Botón de cerrar sesión pequeño y debajo de las tablas */}
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleLogout}
                                className="px-4 py-1 rounded-lg font-semibold bg-black text-red-500 shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-red-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm"
                                >
                                Cerrar Sesión
                            </button>
                        </div>
                         {/* Panel de navegación central más pequeño y debajo del logo */}
                        <div className="items-end flex justify-center mt-9">
                            <div className="flex bg-white rounded-lg shadow-md overflow-hidden scale-90">
                                {TABS.map(tab => (
                                <button
                                    key={tab.value}
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`px-4 py-1 font-semibold transition-colors duration-200 text-sm ${
                                        activeTab === tab.value
                                            ? 'bg-black text-white'
                                            : 'bg-white text-black hover:bg-gray-100'
                                        }`}
                                >
                                    {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Derecha: Nueva Transaccion */}
                    <div className="flex flex-col items-center w-[232px] h-[346px] mx-25">
                        <div className="bg-white w-[203px] h-[66px] border border-emerald-300 rounded-lg p-2 flex justify-center items-center shadow-sm bg-blue-50 mb-5">
                            <span className="font-semibold text-black text-base">
                                {'Transferencia'}
                            </span>
                        </div>
                        <input
                            type="number"
                            name="monto"
                            placeholder="Monto"
                            value={nuevaTransferencia.monto}
                            onChange={handleChangeTransferencia}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        />
                        <input
                            type="text"
                            name="billetera_origen"
                            placeholder="Origen"
                            value={nuevaTransferencia.billetera_origen}
                            onChange={handleChangeTransferencia}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        />
                        <input
                            type="text"
                            name="billetera_destino"
                            placeholder="Destino"
                            value={nuevaTransferencia.billetera_destino}
                            onChange={handleChangeTransferencia}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        />
                        <input
                            type="date"
                            name="fecha"
                            value={nuevaTransferencia.fecha}
                            onChange={handleChangeTransferencia}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-9"
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleGuardarTransferencia}
                                className="px-3 py-1 rounded-lg font-semibold text-green-500 bg-black  shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm"
                            >
                                {transferenciaEditando ? 'Actualizar' : 'Guardar'}
                            </button>
                            {transferenciaEditando && (
                                <button
                                    onClick={() => {
                                        setTransferenciaEditando(null);
                                        setNuevaTransferencia({ monto: "", billetera_origen: "", billetera_destino: "", fecha: "" });
                                    }}
                                    className="px-3 py-1 rounded-lg font-semibold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30 hover:from-gray-600 hover:to-gray-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {/* Parte inferior: tablas siempre visibles */}
                <div className="grid grid-cols-1 md:grid-cols-2 mt-9">
                    {/* Tabla de billeteras */}
                    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col mr-9">
                        <h2 className="text-xl font-semibold mb-4">Billeteras</h2>
                        {/* ALERTA DE ERROR */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}
                        {/* TABLA DE BILLETERAS */}
                        {loading ? (
                            <p>Cargando billeteras...</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Actualización</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {billeterasToShow.map((billetera) => (
                                                <tr key={billetera.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{billetera.nombre}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${billetera.saldo}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(billetera.ultima_actualizacion).toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <button
                                                            onClick={() => handleIniciarEdicion(billetera)}
                                                            className="text-emerald-600 hover:text-emerald-900 mr-3"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleEliminarBilletera(billetera.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Botón de filtro */}
                                <div className="flex justify-center mt-4">
                                    <button className="bg-gradient-to-b from-black to-black text-white rounded-lg px-4 py-1 text-lg hover:from-gray-800 hover:to-gray-800">...</button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Tabla de transferencias */}
                    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                        <h2 className="text-xl font-semibold mb-4">Transferencias</h2>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Monto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Origen
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Destino
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transferencias.map((transferencia) => (
                                        <tr key={transferencia.id} className="border-b border-gray-200">
                                            <td className="py-3 px-4 text-sm text-gray-500">{transferencia.monto}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">{transferencia.billetera_origen.nombre}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">{transferencia.billetera_destino.nombre}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">{transferencia.fecha}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                <button
                                                    onClick={() => handleIniciarEdicionTransferencia(transferencia)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleEliminarTransferencia(transferencia.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Botón de filtro */}
                        <div className="flex justify-center mt-4">
                                <button className="bg-gradient-to-b from-black to-black text-white rounded-lg px-4 py-1 text-lg hover:from-gray-800 hover:to-gray-800">...</button>
                        </div>
                    </div>
                </div>            
            </div>
        </div>
    );
}

export default Billeteras;