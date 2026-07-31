import { useEffect, useState } from "react";
import { Flame, Wind, Sparkles, Hand } from "lucide-react";

import api from "../../services/api";
import { useIncubadora } from "../../context/IncubadoraContext";
import { useToast } from "../../context/ToastContext";
import { useDemo } from "../../context/DemoContext";

const mensajeComando = (comando, valor) => {

    if (comando === "modo") {
        return valor === "AUTO_ON"
            ? "Modo automático activado"
            : "Modo manual activado";
    }

    const nombre = comando === "calefactor" ? "Calefactor" : "Ventilador";

    return `${nombre} ${valor === "ON" ? "encendido" : "apagado"}`;

};

const ControlPanel = () => {

    const { esp32Id } = useIncubadora();
    const toast = useToast();
    const { demoActivo } = useDemo();

    const [estado, setEstado] = useState({
        calefactor: "OFF",
        ventilador: "OFF",
        modo: "AUTO_OFF"
    });

    const [enviando, setEnviando] = useState(null);

    const esAutomatico = estado.modo === "AUTO_ON";

    const consultarEstado = async () => {

        if (!esp32Id || demoActivo) return;

        try {

            const respuesta = await api.get(`/iot/status/${esp32Id}`);
            setEstado(respuesta.data);

        } catch {

            // Si falla, dejamos el último estado conocido en pantalla.

        }

    };

    useEffect(() => {

        if (demoActivo) return;

        // Consulta inicial al montar/cambiar de incubadora — patrón
        // estándar de "fetch on mount", no un bucle de renders.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        consultarEstado();

        const intervalo = setInterval(consultarEstado, 5000);

        return () => clearInterval(intervalo);

    }, [esp32Id, demoActivo]);

    const enviarComando = async (comando, valor) => {

        setEnviando(`${comando}-${valor}`);

        // En modo demo no mandamos nada real al ESP32 — solo
        // simulamos el cambio en pantalla, para no confundir una
        // acción de demostración con un comando real al hardware.

        if (demoActivo) {

            setEstado((prev) => ({
                ...prev,
                [comando === "modo" ? "modo" : comando]: valor
            }));

            toast.success(`${mensajeComando(comando, valor)} (simulado)`);

            setEnviando(null);

            return;

        }

        try {

            await api.post("/iot/command", {
                esp32_id: esp32Id,
                comando,
                valor
            });

            // Actualización optimista: no esperamos a que el ESP32
            // ejecute el comando para reflejar el cambio en pantalla.

            setEstado((prev) => ({
                ...prev,
                [comando === "modo" ? "modo" : comando]: valor
            }));

            toast.success(mensajeComando(comando, valor));

        } catch {

            toast.error("No se pudo enviar el comando. Verifica la conexión.");

        } finally {

            setEnviando(null);

        }

    };

    return (

        <div className="panel" data-tour="control">

            <h3 className="chart-card-title">
                Centro de control
            </h3>

            <div className="modo-toggle">

                <button
                    className={`modo-btn ${!esAutomatico ? "modo-btn-activo" : ""}`}
                    onClick={() => enviarComando("modo", "AUTO_OFF")}
                    disabled={enviando !== null}
                >
                    <Hand size={16} />
                    Manual
                </button>

                <button
                    className={`modo-btn ${esAutomatico ? "modo-btn-activo" : ""}`}
                    onClick={() => enviarComando("modo", "AUTO_ON")}
                    disabled={enviando !== null}
                >
                    <Sparkles size={16} />
                    Automático
                </button>

            </div>

            {esAutomatico && (
                <p className="modo-nota">
                    En modo automático, el ESP32 controla el calefactor y el
                    ventilador según los umbrales configurados.
                </p>
            )}

            <div className="control-group">

                <div className="control-group-label">
                    <Flame size={15} />
                    Calefactor
                </div>

                <div className="control-buttons">

                    <button
                        className={`control-btn control-btn-on ${estado.calefactor === "ON" ? "control-btn-activo" : ""}`}
                        onClick={() => enviarComando("calefactor", "ON")}
                        disabled={esAutomatico || enviando !== null}
                        aria-label="Encender calefactor"
                    >
                        Encender
                    </button>

                    <button
                        className={`control-btn control-btn-off ${estado.calefactor === "OFF" ? "control-btn-activo" : ""}`}
                        onClick={() => enviarComando("calefactor", "OFF")}
                        disabled={esAutomatico || enviando !== null}
                        aria-label="Apagar calefactor"
                    >
                        Apagar
                    </button>

                </div>

            </div>

            <div className="control-group">

                <div className="control-group-label">
                    <Wind size={15} />
                    Ventilador
                </div>

                <div className="control-buttons">

                    <button
                        className={`control-btn control-btn-on ${estado.ventilador === "ON" ? "control-btn-activo" : ""}`}
                        onClick={() => enviarComando("ventilador", "ON")}
                        disabled={esAutomatico || enviando !== null}
                        aria-label="Encender ventilador"
                    >
                        Encender
                    </button>

                    <button
                        className={`control-btn control-btn-off ${estado.ventilador === "OFF" ? "control-btn-activo" : ""}`}
                        onClick={() => enviarComando("ventilador", "OFF")}
                        disabled={esAutomatico || enviando !== null}
                        aria-label="Apagar ventilador"
                    >
                        Apagar
                    </button>

                </div>

            </div>

        </div>

    );

};

export default ControlPanel;
