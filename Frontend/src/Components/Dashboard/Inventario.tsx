import { useState, useEffect } from "react";
import Logo from "../../assets/Logo.png";
import Fondo2 from "../../assets/Fondo2.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";

interface Producto {
    id: string;
    usuario_id: string;
    alias: string;
    nombre_producto: string;
    precio_unitario: number;
    stock: number;
}

interface Movimiento {
    id: string;
    producto_id: string;
    usuario_id: string;
    tipo: 'entrada' | 'salida';
    cantidad: number;
    fecha: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const TABS = [
  { label: "Ventas", value: "ventas" },
  { label: "Billeteras", value: "billeteras" },
  { label: "Inventario", value: "inventario" },
];

const Inventario = () => {
    const navigate = useNavigate();
    // Estado para el formulario de nuevo producto
    const [nuevoProducto, setNuevoProducto] = useState({
        alias: "",
        nombre_producto: "",
        precio_unitario: "",
        stock: ""
    });

    // Estado para la lista de productos
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [productoEditando, setProductoEditando] = useState<string | null>(null);

    // Estado para los movimientos
    const [nuevoMovimiento, setNuevoMovimiento] = useState({
        producto_id: "",
        cantidad: "",
        tipo: "entrada",
        fecha: ""
    });
    const [movimientoEditando, setMovimientoEditando] = useState<string | null>(null);
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

    const [activeTab, setActiveTab] = useState("inventario");
    // Elimino paginación, solo muestro los primeros 10 productos
    const productosToShow = productos.slice(0, 10);

    // Función para cargar los productos
    const cargarProductos = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await axios.get(`${API_URL}/api/productos`, {
                params: {
                    email: user.email
                }
            });
            setProductos(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar los productos');
            console.error('Error al cargar productos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar los movimientos
    const cargarMovimientos = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await axios.get(`${API_URL}/api/movimientos`, {
                params: {
                    email: user.email
                }
            });
            setMovimientos(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar los movimientos');
            console.error('Error al cargar movimientos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cargar productos y movimientos al montar el componente
    useEffect(() => {
        cargarProductos();
        cargarMovimientos();
    }, []);

    // Función para manejar cambios en el formulario de producto
    const handleChangeProducto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNuevoProducto(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Función para manejar cambios en el formulario de movimiento
    const handleChangeMovimiento = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNuevoMovimiento(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Función para iniciar la edición de un producto
    const handleIniciarEdicionProducto = (producto: Producto) => {
        setProductoEditando(producto.id);
        setNuevoProducto({
            alias: producto.alias,
            nombre_producto: producto.nombre_producto,
            precio_unitario: producto.precio_unitario.toString(),
            stock: producto.stock.toString()
        });
    };

    // Función para iniciar la edición de un movimiento
    const handleIniciarEdicionMovimiento = (movimiento: Movimiento) => {
        setMovimientoEditando(movimiento.id);
        setNuevoMovimiento({
            producto_id: movimiento.producto_id,
            cantidad: movimiento.cantidad.toString(),
            tipo: movimiento.tipo,
            fecha: movimiento.fecha
        });
    };

    // Función para guardar producto
    const handleGuardarProducto = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('Usuario actual:', user);

            const productoData = {
                alias: nuevoProducto.alias,
                nombre_producto: nuevoProducto.nombre_producto,
                precio_unitario: parseFloat(nuevoProducto.precio_unitario),
                stock: parseFloat(nuevoProducto.stock),
                email: user.email
            };

            console.log('Datos a enviar:', productoData);
            console.log('ID del producto editando:', productoEditando);

            if (productoEditando) {
                // Actualizar producto existente
                console.log('Intentando actualizar producto...');
                const response = await axios.put(`${API_URL}/api/productos/${productoEditando}`, productoData);
                console.log('Respuesta del servidor:', response.data);
            } else {
                // Crear nuevo producto
                console.log('Intentando crear nuevo producto...');
                const response = await axios.post(`${API_URL}/api/productos`, productoData);
                console.log('Respuesta del servidor:', response.data);
            }

            setNuevoProducto({ alias: "", nombre_producto: "", precio_unitario: "", stock: "" });
            setProductoEditando(null);
            cargarProductos();
        } catch (err: any) {
            console.error('Error completo:', err);
            console.error('Detalles del error:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message,
                config: {
                    url: err.config?.url,
                    method: err.config?.method,
                    data: err.config?.data
                }
            });
            setError(`Error al guardar el producto: ${err.response?.data?.message || err.message}`);
        }
    };

    // Función para guardar movimiento
    const handleGuardarMovimiento = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const movimientoData = {
                producto_id: nuevoMovimiento.producto_id,
                cantidad: parseFloat(nuevoMovimiento.cantidad),
                tipo: nuevoMovimiento.tipo,
                fecha: nuevoMovimiento.fecha,
                email: user.email
            };

            if (movimientoEditando) {
                // Actualizar movimiento existente
                await axios.put(`${API_URL}/api/movimientos/${movimientoEditando}`, movimientoData);
            } else {
                // Crear nuevo movimiento
                await axios.post(`${API_URL}/api/movimientos`, movimientoData);
            }

            setNuevoMovimiento({ producto_id: "", cantidad: "", tipo: "entrada", fecha: "" });
            setMovimientoEditando(null);
            cargarMovimientos();
        } catch (err) {
            setError('Error al guardar el movimiento');
            console.error('Error al guardar movimiento:', err);
        }
    };

    // Función para eliminar un producto
    const handleEliminarProducto = async (id: string) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await axios.delete(`${API_URL}/api/productos/${id}`, {
                params: {
                    email: user.email
                }
            });
            setProductoEditando(null);
            setNuevoProducto({ alias: "", nombre_producto: "", precio_unitario: "", stock: "" });
            cargarProductos();
        } catch (err) {
            setError('Error al eliminar el producto');
            console.error('Error al eliminar producto:', err);
        }
    };

    // Función para eliminar un movimiento
    const handleEliminarMovimiento = async (id: string) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await axios.delete(`${API_URL}/api/movimientos/${id}`, {
                params: {
                    email: user.email
                }
            });
            setMovimientoEditando(null);
            setNuevoMovimiento({ producto_id: "", cantidad: "", tipo: "entrada", fecha: "" });
            cargarMovimientos();
        } catch (err) {
            setError('Error al eliminar el movimiento');
            console.error('Error al eliminar movimiento:', err);
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
        } else if (tab === 'billeteras') {
            navigate('/billeteras');
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
                                {productoEditando ? 'Editar producto' : 'Nuevo producto'}
                            </span>
                        </div>
                        <input
                            type="text"
                            name="alias"
                            placeholder="Alias"
                            value={nuevoProducto.alias}
                            onChange={handleChangeProducto}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        />
                        <input
                            type="text"
                            name="nombre_producto"
                            placeholder="Nombre del Producto"
                            value={nuevoProducto.nombre_producto}
                            onChange={handleChangeProducto}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        />
                        <input
                            type="number"
                            name="precio_unitario"
                            placeholder="Precio Unitario"
                            value={nuevoProducto.precio_unitario}
                            onChange={handleChangeProducto}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        />
                        <input
                            type="number"
                            name="stock"
                            placeholder="Stock"
                            value={nuevoProducto.stock}
                            onChange={handleChangeProducto}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleGuardarProducto}
                                className="px-3 py-1 rounded-lg font-semibold text-green-500 bg-black  shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm"
                            >
                                {productoEditando ? 'Actualizar' : 'Guardar'}
                            </button>
                            {productoEditando && (
                                <button
                                    onClick={() => {
                                        setProductoEditando(null);
                                        setNuevoProducto({ alias: "", nombre_producto: "", precio_unitario: "", stock: "" });
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
                                {'Movimiento'}
                            </span>
                        </div>
                        <select
                            name="producto_id"
                            value={nuevoMovimiento.producto_id}
                            onChange={handleChangeMovimiento}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        >
                            <option value="">Seleccione un producto</option>
                            {productos.map((producto) => (
                                <option key={producto.id} value={producto.id}>
                                    {producto.alias} - {producto.nombre_producto}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            name="cantidad"
                            placeholder="Cantidad"
                            value={nuevoMovimiento.cantidad}
                            onChange={handleChangeMovimiento}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        />
                        <select
                            name="tipo"
                            value={nuevoMovimiento.tipo}
                            onChange={handleChangeMovimiento}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-4"
                        >
                            <option value="entrada">Entrada</option>
                            <option value="salida">Salida</option>
                        </select>
                        <input
                            type="date"
                            name="fecha"
                            value={nuevoMovimiento.fecha}
                            onChange={handleChangeMovimiento}
                            className="bg-white w-[232px] h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-500 mb-9"
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleGuardarMovimiento}
                                className="px-3 py-1 rounded-lg font-semibold text-green-500 bg-black  shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm"
                            >
                                {movimientoEditando ? 'Actualizar' : 'Guardar'}
                            </button>
                            {movimientoEditando && (
                                <button
                                    onClick={() => {
                                        setMovimientoEditando(null);
                                        setNuevoMovimiento({ producto_id: "", cantidad: "", tipo: "entrada", fecha: "" });
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
                        <h2 className="text-xl font-semibold mb-4">Productos</h2>
                        {/* ALERTA DE ERROR */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}
                        {/* TABLA DE BILLETERAS */}
                        {loading ? (
                            <p>Cargando productos...</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alias</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {productosToShow.map((producto) => (
                                                <tr key={producto.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.nombre_producto}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.alias}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${producto.precio_unitario}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.stock}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <button
                                                            onClick={() => handleIniciarEdicionProducto(producto)}
                                                            className="text-emerald-600 hover:text-emerald-900 mr-3"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleEliminarProducto(producto.id)}
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
                        <h2 className="text-xl font-semibold mb-4">Movimientos</h2>
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
                                            Producto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cantidad
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
                                    {movimientos.map((movimiento) => (
                                        <tr key={movimiento.id} className="border-b border-gray-200">
                                            <td className="py-3 px-4 text-sm text-gray-500">{movimiento.producto_id}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">{movimiento.cantidad}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">{movimiento.tipo}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">{movimiento.fecha}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                <button
                                                    onClick={() => handleIniciarEdicionMovimiento(movimiento)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleEliminarMovimiento(movimiento.id)}
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

export default Inventario;