import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

import {
    LayoutDashboard,
    Cpu,
    Bell,
    ClipboardList,
    Settings,
    Monitor
} from "lucide-react";

import { useIncubadora } from "../context/IncubadoraContext";
import MarcaThermo from "./MarcaThermo";

import "../styles/sidebar.css";

const enlaces = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/incubadoras", label: "Incubadoras", icon: Cpu },
    { to: "/alarmas", label: "Alarmas", icon: Bell },
    { to: "/eventos", label: "Eventos", icon: ClipboardList },
    { to: "/configuracion", label: "Configuración", icon: Settings },
    { to: "/sistema", label: "Sistema", icon: Monitor }
];

const Sidebar = ({ abierto, onCerrar }) => {

    const { esp32Id } = useIncubadora();

    return (

        <>

            {abierto && (
                <div className="sidebar-overlay" onClick={onCerrar} />
            )}

            <aside className={`sidebar ${abierto ? "sidebar-abierto" : ""}`} data-tour="sidebar">

                <div className="sidebar-logo">

                    <MarcaThermo />

                    <div className="sidebar-logo-text">
                        <h2>Thermo-IoT</h2>
                        <span>Platform</span>
                    </div>

                    <button
                        className="sidebar-cerrar"
                        onClick={onCerrar}
                        aria-label="Cerrar menú de navegación"
                    >
                        <X size={20} />
                    </button>

                </div>

                <nav className="sidebar-menu">

                    {enlaces.map(({ to, label, icon: Icon, end }) => (

                        <NavLink
                            key={label}
                            to={to}
                            end={end}
                            onClick={onCerrar}
                            className={({ isActive }) =>
                                isActive ? "active" : undefined
                            }
                        >
                            <Icon size={19} />
                            <span>{label}</span>
                        </NavLink>

                    ))}

                </nav>

                <div className="sidebar-footer">
                    {esp32Id || "Sin dispositivo"} · Incubadora
                </div>

            </aside>

        </>
    );
};

export default Sidebar;
