import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, UserCircle, Wifi, WifiOff, ChevronDown, Menu, FlaskConical, HelpCircle } from "lucide-react";

import api from "../services/api";
import { cerrarSesion, obtenerUsuario } from "../services/auth";
import { useIncubadora } from "../context/IncubadoraContext";
import { useDemo } from "../context/DemoContext";
import { useTour } from "../context/TourContext";
import { notificarAlarma, pedirPermisoNotificaciones } from "../utils/notificaciones";

import "../styles/navbar.css";

const Navbar = ({ onAbrirMenu }) => {

    const usuario = obtenerUsuario();
    const navigate = useNavigate();

    const { esp32Id, incubadoras, seleccionarIncubadora } = useIncubadora();
    const { demoActivo, alternarDemo } = useDemo();
    const { iniciarTour } = useTour();

    const [online, setOnline] = useState(false);
    const [alarmasActivas, setAlarmasActivas] = useState(0);

    const alarmasAnteriores = useRef(0);

    useEffect(() => {

        pedirPermisoNotificaciones();

    }, []);

    useEffect(() => {

        if (!esp32Id || demoActivo) return;

        const consultarEstado = async () => {

            try {

                const respuesta = await api.get(`/iot/online-status/${esp32Id}`);
                setOnline(Boolean(respuesta.data.online));

            } catch {

                setOnline(false);

            }

        };

        const consultarAlarmas = async () => {

            try {

                const [medicionRes, limitesRes] = await Promise.all([
                    api.get(`/iot/mediciones/${esp32Id}?limit=1`),
                    api.get(`/iot/configuracion/${esp32Id}`)
                ]);

                const ultima = medicionRes.data[medicionRes.data.length - 1];
                const limites = limitesRes.data;

                if (!ultima) {
                    setAlarmasActivas(0);
                    return;
                }

                let count = 0;
                const motivos = [];

                if (ultima.temperatura < limites.temperatura_min ||
                    ultima.temperatura > limites.temperatura_max) {
                    count += 1;
                    motivos.push(`temperatura ${ultima.temperatura}°C`);
                }

                if (ultima.humedad < limites.humedad_min ||
                    ultima.humedad > limites.humedad_max) {
                    count += 1;
                    motivos.push(`humedad ${ultima.humedad}%`);
                }

                if (count > alarmasAnteriores.current) {

                    notificarAlarma(
                        `Fuera de rango: ${motivos.join(" y ")}`
                    );

                }

                alarmasAnteriores.current = count;

                setAlarmasActivas(count);

            } catch {

                setAlarmasActivas(0);

            }

        };

        consultarEstado();
        consultarAlarmas();

        const intervalo = setInterval(() => {
            consultarEstado();
            consultarAlarmas();
        }, 5000);

        return () => clearInterval(intervalo);

    }, [esp32Id, demoActivo]);

    useEffect(() => {

        // Al activar el modo demo, limpia de inmediato las alarmas
        // reales que hubiera en pantalla — no es un fetch, es
        // sincronizar la UI con el cambio de modo.
        if (demoActivo) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAlarmasActivas(0);
            alarmasAnteriores.current = 0;
        }

    }, [demoActivo]);

    const manejarLogout = () => {
        cerrarSesion();
        navigate("/login", { replace: true });
    };

    const manejarVerTutorial = () => {
        navigate("/");
        iniciarTour();
    };

    return (
        <header className="navbar">

            <button
                className="navbar-menu-btn"
                onClick={onAbrirMenu}
                aria-label="Abrir menú de navegación"
            >
                <Menu size={22} />
            </button>

            <div className="navbar-selector">

                {incubadoras.length > 0 ? (

                    <div className="select-wrapper" data-tour="selector">

                        <select
                            value={esp32Id}
                            onChange={(e) => seleccionarIncubadora(e.target.value)}
                            aria-label="Seleccionar incubadora"
                        >
                            {incubadoras.map((item) => (
                                <option key={item.esp32_id} value={item.esp32_id}>
                                    {item.nombre}
                                </option>
                            ))}
                        </select>

                        <ChevronDown size={15} className="select-arrow" />

                    </div>

                ) : (

                    <span className="navbar-title">Dashboard</span>

                )}

            </div>

            <div className="navbar-right">

                <button
                    className="navbar-ayuda"
                    onClick={manejarVerTutorial}
                    title="Ver el tutorial de nuevo"
                    aria-label="Ver el tutorial de nuevo"
                >
                    <HelpCircle size={19} />
                </button>

                <button
                    className={`demo-toggle ${demoActivo ? "demo-toggle-activo" : ""}`}
                    data-tour="demo"
                    onClick={alternarDemo}
                    title={demoActivo ? "Desactivar modo demo" : "Activar modo demo"}
                    aria-label={demoActivo ? "Desactivar modo demo" : "Activar modo demo"}
                >
                    <FlaskConical size={16} />
                    Demo
                </button>

                {demoActivo ? (

                    <div className="server-status server-status-demo" role="status">
                        <FlaskConical size={18} />
                        <span>Modo Demo</span>
                    </div>

                ) : (

                    <div
                        className={`server-status ${online ? "" : "server-status-off"}`}
                        role="status"
                    >
                        {online ? <Wifi size={18} /> : <WifiOff size={18} />}
                        <span>{online ? "Servidor Online" : "ESP32 Desconectado"}</span>
                    </div>

                )}

                <button
                    className="navbar-bell"
                    data-tour="alarmas"
                    onClick={() => navigate("/alarmas")}
                    title={alarmasActivas > 0 ? `${alarmasActivas} alarma(s) activa(s)` : "Sin alarmas"}
                    aria-label={alarmasActivas > 0 ? `Ver alarmas: ${alarmasActivas} activa(s)` : "Ver alarmas"}
                >
                    <Bell size={22} className="navbar-icon" />

                    {alarmasActivas > 0 && (
                        <span className="navbar-bell-badge">{alarmasActivas}</span>
                    )}

                </button>

                <button
                    className="navbar-user"
                    onClick={() => navigate("/perfil")}
                    aria-label="Ir a mi perfil"
                >
                    <UserCircle size={32} className="navbar-icon" />
                    {usuario && <span>{usuario.nombre}</span>}
                </button>

                <button
                    className="navbar-logout"
                    onClick={manejarLogout}
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                >
                    <LogOut size={22} className="navbar-icon" />
                </button>

            </div>

        </header>
    );
};

export default Navbar;
