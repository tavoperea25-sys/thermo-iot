import { Thermometer, Sparkles, BellRing } from "lucide-react";

import MarcaThermo from "./MarcaThermo";

import "../styles/auth.css";

const caracteristicas = [
    {
        icon: Thermometer,
        titulo: "Monitoreo en tiempo real",
        texto: "Temperatura y humedad actualizadas cada pocos segundos."
    },
    {
        icon: Sparkles,
        titulo: "Control manual o automático",
        texto: "El sistema regula calefactor y ventilador según tus umbrales."
    },
    {
        icon: BellRing,
        titulo: "Alertas instantáneas",
        texto: "Te avisa apenas una lectura se sale de rango."
    }
];

const AuthLayout = ({ children }) => {

    return (

        <div className="auth-page">

            <aside className="auth-brand">

                <div className="auth-brand-glow" />

                <div className="auth-brand-content">

                    <div className="auth-brand-logo">
                        <MarcaThermo size={44} />
                        <span>Thermo-IoT</span>
                    </div>

                    <h1>
                        Monitoreo inteligente
                        <br />
                        para tus incubadoras
                    </h1>

                    <p className="auth-brand-tagline">
                        Controla temperatura, humedad y automatización de tu
                        incubadora desde cualquier lugar, en tiempo real.
                    </p>

                    <div className="auth-features">

                        {caracteristicas.map(({ icon: Icon, titulo, texto }) => (

                            <div className="auth-feature" key={titulo}>

                                <div className="auth-feature-icono">
                                    <Icon size={18} />
                                </div>

                                <div>
                                    <strong>{titulo}</strong>
                                    <p>{texto}</p>
                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </aside>

            <div className="auth-form-side">

                {children}

            </div>

        </div>

    );

};

export default AuthLayout;
