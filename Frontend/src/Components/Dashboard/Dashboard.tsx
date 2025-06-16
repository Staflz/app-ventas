import { useState, useEffect } from "react";
import Logo from "../../assets/Logo.png";
import Fondo2 from "../../assets/Fondo2.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";

interface Venta {
    id: string;
    producto_id: string;
    producto_alias: string;
    nombre_producto: string;
    cantidad: number;
    total: number;
    fecha: string;
    hora: string;
}

interface Transaccion {
    id: string;
    categoria: string;
    monto: string;
    tipo: 'ingreso' | 'gasto';
    fecha: string;
    usuario_id: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const TABS = [
  { label: "Ventas", value: "ventas" },
  { label: "Billeteras", value: "billeteras" },
  { label: "Inventario", value: "inventario" },
];

const Dashboard = () => {
    const navigate = useNavigate();
    // Estado para el formulario de nueva venta
    const [nuevaVenta, setNuevaVenta] = useState({
        producto_alias: "",
        cantidad: "",
        fecha: "",
        hora: ""
    });

    // Estado para la lista de ventas
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ventaEditando, setVentaEditando] = useState<string | null>(null);

    // Estado para las transacciones
    const [nuevaTransaccion, setNuevaTransaccion] = useState({
        categoria: "",
        monto: "",
        tipo: "ingreso",
        fecha: ""
    });
    const [transaccionEditando, setTransaccionEditando] = useState<string | null>(null);
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);

    const [activeTab, setActiveTab] = useState("ventas");
    // Elimino paginación, solo muestro las primeras 10 ventas
    const ventasToShow = ventas.slice(0, 10);

    // Función para cargar las ventas
    const cargarVentas = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/ventas`);
            setVentas(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las ventas');
            console.error('Error al cargar ventas:', err);
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar las transacciones
    const cargarTransacciones = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/transacciones`);
            setTransacciones(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las transacciones');
            console.error('Error al cargar transacciones:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cargar ventas y transacciones al montar el componente
    useEffect(() => {
        cargarVentas();
        cargarTransacciones();
    }, []);

    // Función para manejar cambios en el formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNuevaVenta(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Función para manejar cambios en el formulario de transacciones
    const handleChangeTransaccion = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNuevaTransaccion(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Función para iniciar la edición de una venta
    const handleIniciarEdicion = (venta: Venta) => {
        setVentaEditando(venta.id);
        setNuevaVenta({
            producto_alias: venta.producto_alias,
            cantidad: venta.cantidad.toString(),
            fecha: venta.fecha,
            hora: venta.hora
        });
    };

    const handleGuardarVenta = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const ventaData = {
                ...nuevaVenta,
                cantidad: parseInt(nuevaVenta.cantidad),
                email: user.email
            };

            console.log('Datos a enviar:', ventaData);

            if (ventaEditando) {
                // Actualizar venta existente
                await axios.put(`${API_URL}/api/ventas/${ventaEditando}`, ventaData);
            } else {
                // Crear nueva venta
                await axios.post(`${API_URL}/api/ventas`, ventaData);
            }

            setNuevaVenta({ producto_alias: "", cantidad: "", fecha: "", hora: "" });
            setVentaEditando(null);
            cargarVentas(); // Recargar la lista de ventas
        } catch (err) {
            console.error('Error completo:', err);
            if (axios.isAxiosError(err) && err.response) {
                console.error('Datos del error:', err.response.data);
            }
            setError('Error al guardar la venta');
        }
    };

    // Función para guardar transacción
    const handleGuardarTransaccion = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const transaccionData = {
                ...nuevaTransaccion,
                monto: parseFloat(nuevaTransaccion.monto),
                email: user.email
            };

            if (transaccionEditando) {
                // Actualizar transacción existente
                await axios.put(`${API_URL}/api/transacciones/${transaccionEditando}`, transaccionData);
            } else {
                // Crear nueva transacción
                await axios.post(`${API_URL}/api/transacciones`, transaccionData);
            }

            setNuevaTransaccion({ categoria: "", monto: "", tipo: "ingreso", fecha: "" });
            setTransaccionEditando(null);
            cargarTransacciones(); // Recargar las transacciones después de guardar
        } catch (err) {
            setError('Error al guardar la transacción');
            console.error('Error al guardar transacción:', err);
        }
    };

    // Función para eliminar una venta
    const handleEliminarVenta = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/api/ventas/${id}`);
            setVentaEditando(null); // Volver al modo añadir
            setNuevaVenta({ producto_alias: "", cantidad: "", fecha: "", hora: "" }); // Limpiar el formulario
            cargarVentas(); // Recargar la lista de ventas
        } catch (err) {
            setError('Error al eliminar la venta');
            console.error('Error al eliminar venta:', err);
        }
    };

    // Función para iniciar la edición de una transacción
    const handleIniciarEdicionTransaccion = (transaccion: Transaccion) => {
        setTransaccionEditando(transaccion.id);
        setNuevaTransaccion({
            categoria: transaccion.categoria,
            monto: transaccion.monto,
            tipo: transaccion.tipo,
            fecha: transaccion.fecha
        });
    };

    // Función para eliminar una transacción
    const handleEliminarTransaccion = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/api/transacciones/${id}`);
            setTransaccionEditando(null);
            setNuevaTransaccion({ categoria: "", monto: "", tipo: "ingreso", fecha: "" });
            cargarTransacciones();
        } catch (err) {
            setError('Error al eliminar la transacción');
            console.error('Error al eliminar transacción:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
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
                                {ventaEditando ? 'Editar venta' : 'Nueva venta'}
                            </span>
                        </div>
                        <input
                            type="text"
                            name="producto_alias"
                            placeholder="ID/Nombre"
                            value={nuevaVenta.producto_alias}
                            onChange={handleChange}
                            readOnly={ventaEditando !== null}
                            className={` bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm ${
                                ventaEditando !== null ? 'text-gray-400 bg-gray-100' : 'text-gray-500'
                            } mb-4`}
                        />
                        <input
                            type="number"
                            name="cantidad"
                            placeholder="Cantidad"
                            value={nuevaVenta.cantidad}
                            onChange={handleChange}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        />
                        <input
                            type="date"
                            name="fecha"
                            value={nuevaVenta.fecha}
                            onChange={handleChange}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        />
                        <input
                            type="time"
                            name="hora"
                            value={nuevaVenta.hora}
                            onChange={handleChange}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-9"
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleGuardarVenta}
                                className="px-3 py-1 rounded-lg font-semibold text-green-500 bg-black  shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm"
                            >
                                {ventaEditando ? 'Actualizar' : 'Guardar'}
                            </button>
                            {ventaEditando && (
                                <button
                                    onClick={() => {
                                        setVentaEditando(null);
                                        setNuevaVenta({ producto_alias: "", cantidad: "", fecha: "", hora: "" });
                                    }}
                                    className="px-3 py-1 rounded-lg font-semibold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30 hover:from-gray-600 hover:to-gray-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                    {/* <div className="flex flex-col items-center w-[232px] mx-25">
                        <div className=" bg-white w-[203px] h-[66px] border border-emerald-300 rounded-lg p-2 flex flex-col items-center justify-center shadow-sm bg-blue-50 mb-5">
                            <span className="text-2xl text-gray-700 font-semibold">Billeteras</span>
                        </div>
                        <div className="space-y-2">
                            <div className="w-[232px] h-[60px] text-center p-2 bg-blue-50 rounded-lg bg-white">
                                <p className="text-base text-black font-semibold">Billetera 1</p>
                                <p className="text-emerald-500 font-medium">0$</p>
                            </div>
                            <div className="w-[232px] h-[60px] text-center p-2 bg-blue-50 rounded-lg bg-white">
                                <p className="text-base text-black font-semibold">Billetera 2</p>
                                <p className="text-emerald-500 font-medium">0$</p>
                            </div>
                            <div className="w-[232px] h-[60px] text-center p-2 bg-blue-50 rounded-lg bg-white">
                                <p className="text-base text-black font-semibold">Billetera 3</p>
                                <p className="text-emerald-500 font-medium">0$</p>
                            </div>
                        </div>
                    </div> */}
                    {/* Centro: Balance Total */}
                    <div className="flex flex-col items-center w-[405px] h-[346px]">
                        <div className="w-[405px] h-[144px] border border-emerald-300 rounded-lg p-2 flex flex-col justify-center items-center shadow-sm bg-white mb-2">
                            <span className=" mb-5 text-2xl font-bold text-gray-700">Balance Total</span>
                            <span className="text-emerald-500 text-4xl font-bold">0$</span>
                        </div>
                        {/* Logo más grande */}
                        <div className="w-20 h-20 rounded-full overflow-hidden shadow-md mt-9">
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
                                    onClick={() => setActiveTab(tab.value)}
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
                                {'Transaccion'}
                            </span>
                        </div>
                        <input
                            type="text"
                            name="categoria"
                            placeholder="categoria"
                            value={nuevaTransaccion.categoria}
                            onChange={handleChangeTransaccion}
                            readOnly={transaccionEditando !== null}
                            className={` bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm ${
                                transaccionEditando !== null ? 'text-gray-400 bg-gray-100' : 'text-gray-500'
                            } mb-4`}
                        />
                        <input
                            type="number"
                            name="monto"
                            placeholder="monto"
                            value={nuevaTransaccion.monto}
                            onChange={handleChangeTransaccion}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        />
                        <select
                            name="tipo"
                            value={nuevaTransaccion.tipo}
                            onChange={handleChangeTransaccion}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        >
                            <option value="ingreso">Ingreso</option>
                            <option value="gasto">Gasto</option>
                        </select>
                        <input
                            type="date"
                            name="fecha"
                            value={nuevaTransaccion.fecha}
                            onChange={handleChangeTransaccion}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-9"
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleGuardarTransaccion}
                                className="px-3 py-1 rounded-lg font-semibold text-green-500 bg-black  shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm"
                            >
                                {transaccionEditando ? 'Actualizar' : 'Guardar'}
                            </button>
                            {transaccionEditando && (
                                <button
                                    onClick={() => {
                                        setTransaccionEditando(null);
                                        setNuevaTransaccion({ categoria: "", monto: "", tipo: "ingreso", fecha: "" });
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
                    {/* Tabla de ventas */}
                    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col mr-9">
                        <h2 className="text-xl font-semibold mb-4">Historial de Ventas</h2>
                        {/* ALERTA DE ERROR */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}
                        {/* TABLA DE VENTAS */}
                        {loading ? (
                            <p>Cargando ventas...</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {ventasToShow.map((venta) => (
                                                <tr key={venta.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{venta.nombre_producto}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{venta.cantidad}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{venta.total}$</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{venta.fecha}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{venta.hora}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <button
                                                            onClick={() => handleIniciarEdicion(venta)}
                                                            className="text-emerald-600 hover:text-emerald-900 mr-3"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleEliminarVenta(venta.id)}
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

                    {/* Tabla de transacciones */}
                    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                        <h2 className="text-xl font-semibold mb-4">Historial de Transacciones</h2>
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
                                            Categoría
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Monto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
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
                                    {transacciones.map((transaccion) => (
                                        <tr key={transaccion.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {transaccion.categoria}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${transaccion.monto}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    transaccion.tipo === 'ingreso' 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaccion.tipo.charAt(0).toUpperCase() + transaccion.tipo.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(transaccion.fecha).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleIniciarEdicionTransaccion(transaccion)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleEliminarTransaccion(transaccion.id)}
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
                    </div>
                </div>            
            </div>
        </div>
    );
}

export default Dashboard;