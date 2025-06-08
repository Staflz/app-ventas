import Logo from "../../assets/Logo.png";

const ventas = [
    {
        producto: "Nombre",
        cantidad: 1,
        total: "0$",
        fecha: "dd/mm/yy",
        hora: "00:00",
    },
    {
        producto: "Nombre",
        cantidad: 1,
        total: "0$",
        fecha: "dd/mm/yy",
        hora: "00:00",
    },
];

const transacciones = [
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
];

const HomePage = () => {
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

                            {/* Logo */}
                            <div className="w-20 h-20 rounded-full overflow-hidden shadow-md">
                                <img src={Logo} alt="Logo" className="object-cover w-full h-full" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-cyan-50">
                        <div className="bg-blue-50 p-6 rounded-md flex flex-col items-center space-y-4">
                            {/* Título */}
                            <div className="w-40 h-12 bg-white border border-emerald-300 rounded-md flex justify-center items-center shadow-sm">
                                <span className="font-semibold text-black">Nueva venta</span>
                            </div>

                            {/* Inputs */}
                            <input
                                type="text"
                                placeholder="ID/Nombre"
                                className="bg-white w-70 h-8 px-2 border border-gray-200 rounded-md text-sm text-gray-500"
                            />
                            <input
                                type="number"
                                placeholder="Cantidad"
                                className="bg-white w-70 h-8 px-2 border border-gray-200 rounded-md text-sm text-gray-500"
                            />
                            <input
                                type="text"
                                placeholder="Fecha"
                                className="bg-white w-70 h-8 px-2 border border-gray-200 rounded-md text-sm text-gray-500"
                            />
                            <input
                                type="text"
                                placeholder="Hora"
                                className="bg-white w-70 h-8 px-2 border border-gray-200 rounded-md text-sm text-gray-500"
                            />

                            {/* Botones */}
                            <div className="flex space-x-2">
                                <button className="bg-gradient-to-b from-black to-black text-emerald-400 px-1 py-1 rounded-md font-semibold shadow-md hover:from-gray-800 hover:to-gray-800">
                                    Hecho
                                </button>
                                <button className="bg-gradient-to-b from-red-300 to-red-300 border-red-500 text-black px-4 py-1 rounded-md font-semibold shadow-md hover:from-red-200 hover:to-red-200">
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parte inferior: 2 secciones */}
                <div className="grid grid-cols-2 h-90">
                    {/*tabla VENTAS*/}
                    <div className="bg-white border border-emerald-300 rounded-lg p-4 max-w-2xl mx-auto">
                        <h2 className="text-emerald-500 font-semibold mb-4">Ventas</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-500 border-b">
                                    <tr>
                                        <th className="px-4 py-2 text-black">Producto</th>
                                        <th className="px-4 py-2 text-black">Cantidad</th>
                                        <th className="px-4 py-2 text-emerald-500">Total</th>
                                        <th className="px-4 py-2 text-black">Fecha</th>
                                        <th className="px-4 py-2 text-black">Hora</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ventas.map((venta, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-1 font-semibold text-gray-900">{venta.producto}</td>
                                            <td className="px-4 py-1 text-gray-900">{venta.cantidad}</td>
                                            <td className="px-4 py-1 text-emerald-500">{venta.total}</td>
                                            <td className="px-4 py-1 text-gray-900">{venta.fecha}</td>
                                            <td className="px-4 py-1 text-gray-900">{venta.hora}</td>
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
                                    {transacciones.map((transaccion, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-1 font-semibold text-gray-900">{transaccion.razon}</td>
                                            <td
                                                className={`px-4 py-1 font-semibold ${transaccion.tipo === "Ingreso" ? "text-emerald-500" : "text-red-400"
                                                    }`}
                                            >
                                                {transaccion.monto}
                                            </td>
                                            <td
                                                className={`px-4 py-1 font-semibold ${transaccion.tipo === "Ingreso" ? "text-emerald-500" : "text-red-400"
                                                    }`}
                                            >
                                                {transaccion.tipo === "Ingreso" ? "Ingreso" : "Gasto"}
                                            </td>
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

export default HomePage;