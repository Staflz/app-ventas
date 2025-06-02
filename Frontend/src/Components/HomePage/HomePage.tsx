import { Link } from "react-router-dom";
import Video from "../../assets/Video.mp4";
import Logo from "../../assets/Logo.png";

const HomePage = () => {
    return(
        <div className="min-h-screen w-full bg-gradient-to-t from-green-100 to-green-300 flex items-center justify-center fixed inset-0">
            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-4  justify-between flex overflow-hidden m-auto h-[75%] w-[60%] shadow-lg ">
                
                <div className="flex basis-[50%] w-[70%] h-[100%] p-0 text-center justify-center flex-col m-auto border-radius-2xl overflow-hidden relative">
                    <video src={Video} autoPlay loop muted className="w-full h-full object-cover "></video>
                    <div className="absolute color-white bg-opacity-50">
                        <h2 className="text-3xl font-bold">Administra tu negocio con una sola App</h2>
                        <p>Facil y rapido</p>
                    </div>
                </div>

                <div className=" basis-[50%] flex-col m-auto grid gap-[1.5rem] items-center ">
                    <div className="text-center justify-items-center">
                        <img src={Logo} alt="logo" className="w-[80px]"/>
                        <h3 className="text-4xl">Bienvenido</h3>
                        <p>¿Que desea hacer?</p>
                    <div className="h-8" />
                        <div className="justify-around w-full flex">
                            <Link to="/register">
                            <button>Registrar</button>
                            </Link>
                            <Link to="/login">
                            <button>Ingresar</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage;