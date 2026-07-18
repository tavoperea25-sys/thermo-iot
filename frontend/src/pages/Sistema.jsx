import { useEffect, useState } from "react";
import { AlertCircle, Trash2 } from "lucide-react";

import api from "../services/api";
import { useIncubadora } from "../context/IncubadoraContext";
import { useToast } from "../context/ToastContext";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";

import "../styles/sistema.css";

const Sistema = () => {

    const { esp32Id } = useIncubadora();
    const toast = useToast();

    const [estado, setEstado] = useState(null);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(true);

    const [confirmarPurga, setConfirmarPurga] = useState(false);
    const [purgando, setPurgando] = useState(false);

    useEffect(() => {

        if (!esp32Id) return;

        const consultarEstado = async () => {

            try {

                const respuesta = await api.get(
                    `/iot/online-status/${esp32Id}`
                );

                setEstado(respuesta.data);
                setError("");

            } catch (err) {

                setError("No se pudo consultar el estado del sistema");

            } finally {

                setCargando(false);

            }

        };

        consultarEstado();

        const intervalo = setInterval(consultarEstado, 5000);

        return () => clearInterval(intervalo);

    }, [esp32Id]);

    const ejecutarPurga = async () => {

        setPurgando(true);

        try {

            const respuesta = await api.post("/iot/purgar");

            const { medicionesBorradas, eventosBorrados } = respuesta.data;

            if (medicionesBorradas === 0 && eventosBorrados === 0) {

                toast.info("No había datos viejos para eliminar.");

            } else {

                toast.success(
                    `Eliminadas ${medicionesBorradas} mediciones y ${eventosBorrados} eventos antiguos.`
                );

            }

            setConfirmarPurga(false);

        } catch (err) {

            toast.error("No se pudo completar la purga.");

        } finally {

            setPurgando(false);

        }

    };

    return (

        <div>

            <h1 className="page-title">Sistema</h1>

            <p className="page-subtitle">
                Estado de conexión del dispositivo {esp32Id}.
            </p>

            <div className="sistema-panel">

                {cargando && [0, 1, 2].map((i) => (

                    <div className="sistema-fila" key={i}>
                        <Skeleton width="120px" height="13px" />
                        <Skeleton width="90px" height="13px" />
                    </div>

                ))}

                {!cargando && error && (
                    <EmptyState icon={AlertCircle} mensaje={error} variante="error" />
                )}

                {!cargando && !error && estado && (

                    <>

                        <div className="sistema-fila">

                            <span>Estado</span>

                            <span
                                className={
                                    estado.online
                                        ? "sistema-badge sistema-online"
                                        : "sistema-badge sistema-offline"
                                }
                            >
                                {estado.online ? "En línea" : "Desconectado"}
                            </span>

                        </div>

                        <div className="sistema-fila">
                            <span>Última medición</span>
                            <span>
                                {estado.ultima_medicion
                                    ? new Date(estado.ultima_medicion).toLocaleString()
                                    : "Sin datos"}
                            </span>
                        </div>

                        <div className="sistema-fila">
                            <span>Segundos sin datos</span>
                            <span>{estado.segundos_sin_datos ?? "-"}</span>
                        </div>

                        <p className="sistema-nota">
                            Se considera "en línea" si el ESP32 envió datos en los
                            últimos 25 segundos (según la última lectura recibida).
                        </p>

                    </>

                )}

            </div>

            <div className="sistema-panel sistema-panel-purga">

                <h3 className="chart-card-title">Mantenimiento de datos</h3>

                <p className="sistema-nota sistema-nota-purga">
                    Para que la base de datos no crezca sin límite, las mediciones
                    de más de 30 días y los eventos de más de 90 días se eliminan
                    automáticamente una vez al día. También puedes forzarlo ahora
                    mismo si quieres liberar espacio de inmediato.
                </p>

                <button
                    className="sistema-btn-purgar"
                    onClick={() => setConfirmarPurga(true)}
                >
                    <Trash2 size={15} />
                    Purgar datos antiguos ahora
                </button>

            </div>

            {confirmarPurga && (

                <ConfirmModal
                    titulo="¿Purgar datos antiguos?"
                    mensaje="Se eliminarán permanentemente las mediciones de más de 30 días y los eventos de más de 90 días, de todos tus dispositivos. Esta acción no se puede deshacer."
                    textoConfirmar="Purgar"
                    procesando={purgando}
                    onConfirmar={ejecutarPurga}
                    onCancelar={() => setConfirmarPurga(false)}
                />

            )}

        </div>

    );

};

export default Sistema;
