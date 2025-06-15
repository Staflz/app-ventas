import { useState, useEffect } from "react";
import Logo from "../../assets/Logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Venta {
    id: string;
    producto: string;
    cantidad: number;
    total: number;
    fecha: string;
    hora: string;
}

interface Transaccion {
    razon: string;
    monto: string;
    tipo: 'Ingreso' | 'Gasto';
    fecha: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    const navigate = useNavigate();
    // Estado para el formulario de nueva venta
    const [nuevaVenta, setNuevaVenta] = useState({
        producto: "",
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
    const [transacciones] = useState<Transaccion[]>([
        {
            razon: "Nota",
            monto: "0$",
            tipo: "Ingreso",
            fecha: "dd/mm/yy"
        },
        {
            razon: "Nota",
            monto: "0$",
            tipo: "Gasto",
            fecha: "dd/mm/yy"
        },
    ]);

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

    // Cargar ventas al montar el componente
    useEffect(() => {
        cargarVentas();
    }, []);

    // Función para manejar cambios en el formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNuevaVenta(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Función para iniciar la edición de una venta
    const handleIniciarEdicion = (venta: Venta) => {
        setVentaEditando(venta.id);
        setNuevaVenta({
            producto: venta.producto,
            cantidad: venta.cantidad.toString(),
            fecha: venta.fecha,
            hora: venta.hora
        });
    };

    // Función para cancelar la edición
    //const handleCancelarEdicion = () => {
      //  setVentaEditando(null);
      //  setNuevaVenta({ producto: "", cantidad: "", fecha: "", hora: "" });
    //};

    // Función para guardar una venta (crear o editar)
    const handleGuardarVenta = async () => {
        try {
            const ventaData = {
                ...nuevaVenta,
                cantidad: parseInt(nuevaVenta.cantidad)
            };

            if (ventaEditando) {
                // Actualizar venta existente
                await axios.put(`${API_URL}/api/ventas/${ventaEditando}`, ventaData);
            } else {
                // Crear nueva venta
                await axios.post(`${API_URL}/api/ventas`, ventaData);
            }

            setNuevaVenta({ producto: "", cantidad: "", fecha: "", hora: "" });
            setVentaEditando(null);
            cargarVentas(); // Recargar la lista de ventas
        } catch (err) {
            setError('Error al guardar la venta');
            console.error('Error al guardar venta:', err);
        }
    };

    // Función para eliminar una venta
    const handleEliminarVenta = async (id: string) => {
        try {
            await axios.delete(`${API_URL}/api/ventas/${id}`);
            setVentaEditando(null); // Volver al modo añadir
            setNuevaVenta({ producto: "", cantidad: "", fecha: "", hora: "" }); // Limpiar el formulario
            cargarVentas(); // Recargar la lista de ventas
        } catch (err) {
            setError('Error al eliminar la venta');
            console.error('Error al eliminar venta:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        //div principal
        <div className="w-screen h-screen bg-blue-50 flex ">
            <div className="w-screen h-screen p-4 bg-blue-50 flex flex-col">
                {/* Parte superior: 3 secciones */}
                <div className="grid grid-cols-3 h-90">
                    {/*seccion BILLETERAS*/}
                    <div className="bg-blue-50">
                        <div className="flex flex-col items-center space-y-6 bg-blue-50 p-4 rounded-md">
                            {/* Última venta */}
                            <div className="w-50 h-18 border border-emerald-300 rounded-md flex flex-col items-center justify-center shadow-sm bg-white">
                                <span className="text-sm text-gray-700 font-semibold text-11">Última venta</span>
                                <span className="text-emerald-500 text-3xl font-bold">0$</span>
                            </div>

                            {/* Billeteras */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className="text-center">
                                    <p className="text-lg text-black font-semibold">Billetera 1</p>
                                    <p className="text-emerald-500 font-medium text-10">0$</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg text-black font-semibold">Billetera 2</p>
                                    <p className="text-emerald-500 font-medium text-10">0$</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg  text-black font-semibold">Billetera 3</p>
                                    <p className="text-emerald-500 font-medium text-10">0$</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*seccion BALANCE*/}
                    <div className="bg-blue-50">
                        <div className="flex flex-col items-center bg-blue-50 p-6 rounded-md space-y-6">
                            {/* Balance Total */}
                            <div className="w-70 h-20 bg-white border border-emerald-300 rounded-md flex flex-col justify-center items-center shadow-sm">
                                <span className="text-sm font-semibold text-gray-700 text-15">Balance Total</span>
                                <span className="text-emerald-500 text-4xl font-bold">0$</span>
                            </div>

                            {/* Logo y Botón de Cerrar Sesión */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-20 h-20 rounded-full overflow-hidden shadow-md">
                                    <img src={Logo} alt="Logo" className="object-cover w-full h-full" />
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-lg font-semibold
                                             bg-gradient-to-r from-red-500 to-red-600 text-white
                                             shadow-lg shadow-red-500/30
                                             hover:from-red-600 hover:to-red-700
                                             transform transition-all duration-300 hover:scale-[1.02]
                                             active:scale-[0.98]"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-cyan-50">
                        <div className="bg-blue-50 p-6 rounded-md flex flex-col items-center space-y-4">
                            {/* Título */}
                            <div className="w-40 h-12 bg-white border border-emerald-300 rounded-md flex justify-center items-center shadow-sm">
                                <span className="font-semibold text-black">
                                    {ventaEditando ? 'Editar venta' : 'Nueva venta'}
                                </span>
                            </div>

                            {/* Inputs */}
                            <input
                                type="text"
                                name="producto"
                                placeholder="ID/Nombre"
                                value={nuevaVenta.producto}
                                onChange={handleChange}
                                readOnly={ventaEditando !== null}
                                className={`bg-white w-70 h-8 px-2 border border-gray-200 rounded-md text-sm ${
                                    ventaEditando !== null ? 'text-gray-400 bg-gray-100' : 'text-gray-500'
                                }`}
                            />
                            <input
                                type="number"
                                name="cantidad"
                                placeholder="Cantidad"
                                value={nuevaVenta.cantidad}
                                onChange={handleChange}
                                className="bg-white w-70 h-8 px-2 border border-gray-200 rounded-md text-sm text-gray-500"
                            />
                            <input
                                type="date"
                                name="fecha"
                                value={nuevaVenta.fecha}
                                onChange={handleChange}
                                className="bg-white w-70 h-8 px-2 border border-gray-200 rounded-md text-sm text-gray-500"
                            />
                            <input
                                type="time"
                                name="hora"
                                value={nuevaVenta.hora}
                                onChange={handleChange}
                                className="bg-white w-70 h-8 px-2 border border-gray-200 rounded-md text-sm text-gray-500"
                            />

                            {/* Botones */}
                            <div className="flex space-x-4">
                                <button 
                                    onClick={handleGuardarVenta}
                                    className="bg-gradient-to-b from-black to-black text-emerald-400 px-1 py-1 rounded-md font-semibold shadow-md hover:from-gray-800 hover:to-gray-800"
                                >
                                    {ventaEditando ? 'Guardar' : 'Hecho'}
                                </button>
                                {ventaEditando && (
                                    <button 
                                        onClick={() => handleEliminarVenta(ventaEditando)}
                                        className="bg-gradient-to-b from-red-300 to-red-300 border-red-500 text-black px-4 py-1 rounded-md font-semibold shadow-md hover:from-red-200 hover:to-red-200"
                                    >
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parte inferior: 2 secciones */}
                <div className="grid grid-cols-2 h-90">
                    {/*tabla VENTAS*/}
                    <div className="bg-white border border-emerald-300 rounded-lg p-4 max-w-2xl mx-auto">
                        <h2 className="text-emerald-500 font-semibold mb-4">Ventas</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-500 border-b">
                                    <tr>
                                        <th className="px-4 py-2 text-black">Producto</th>
                                        <th className="px-4 py-2 text-black">Cantidad</th>
                                        <th className="px-4 py-2 text-emerald-500">Total</th>
                                        <th className="px-4 py-2 text-black">Fecha</th>
                                        <th className="px-4 py-2 text-black">Hora</th>
                                        <th className="px-4 py-2 text-black">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-2 text-center">Cargando...</td>
                                        </tr>
                                    ) : ventas.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-2 text-center">No hay ventas registradas</td>
                                        </tr>
                                    ) : (
                                        ventas.map((venta) => (
                                            <tr key={venta.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-1 font-semibold text-gray-900">{venta.producto}</td>
                                                <td className="px-4 py-1 text-gray-900">{venta.cantidad}</td>
                                                <td className="px-4 py-1 text-emerald-500">${venta.total}</td>
                                                <td className="px-4 py-1 text-gray-900">{venta.fecha}</td>
                                                <td className="px-4 py-1 text-gray-900">{venta.hora}</td>
                                                <td className="px-4 py-1">
                                                    <button
                                                        onClick={() => handleIniciarEdicion(venta)}
                                                        className="text-emerald-500 hover:text-emerald-700"
                                                    >
                                                        Editar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center mt-4">
                            <button className="bg-gradient-to-b from-black to-black text-white rounded-lg px-4 py-2 text-lg hover:from-gray-800 hover:to-gray-800">
                                ...
                            </button>
                        </div>
                    </div>
                    {/*tabla TRANSACCIONES*/}
                    <div className="bg-white border border-emerald-300 rounded-lg p-4 max-w-2xl mx-auto">
                        <h2 className="text-black font-semibold mb-4">Transacciones</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-500 border-b">
                                    <tr>
                                        <th className="px-4 py-2 text-black">Razon</th>
                                        <th className="px-4 py-2 text-black">Monto</th>
                                        <th className="px-4 py-2 text-emerald-500">Tipo</th>
                                        <th className="px-4 py-2 text-black">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transacciones.map((transaccion: Transaccion, index: number) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-1 font-semibold text-gray-900">{transaccion.razon}</td>
                                            <td className="px-4 py-1 text-gray-900">{transaccion.monto}</td>
                                            <td className="px-4 py-1 text-gray-900">{transaccion.tipo}</td>
                                            <td className="px-4 py-1 text-gray-900">{transaccion.fecha}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center mt-4">
                            <button className="bg-gradient-to-b from-black to-black text-white rounded-lg px-4 py-2 text-lg hover:from-gray-800 hover:to-gray-800">
                                ...
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default Dashboard;