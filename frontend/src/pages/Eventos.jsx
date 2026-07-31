import { useEffect, useState } from "react";
import { ClipboardX, AlertCircle } from "lucide-react";

import api from "../services/api";
import { useIncubadora } from "../context/IncubadoraContext";
import { exportarCSV } from "../utils/csv";
import ExportButton from "../components/ExportButton";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import FiltroFechas from "../components/FiltroFechas";

import "../styles/eventos.css";
import "../styles/filtrofechas.css";

const Eventos = () => {

    const { esp32Id } = useIncubadora();

    const [eventos, setEventos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");

    useEffect(() => {

        if (!esp32Id) return;

        const obtenerEventos = async () => {

            try {

                const respuesta = await api.get("/iot/eventos", {
                    params: { esp32_id: esp32Id, desde: desde || undefined, hasta: hasta || undefined }
                });

                setEventos(respuesta.data);
                setError("");

            } catch {

                setError("No se pudieron cargar los eventos");

            } finally {

                setCargando(false);

            }

        };

        // Reactiva el skeleton de carga en cada cambio de filtro/dispositivo,
        // no solo al montar — por eso va antes de obtenerEventos() y no en
        // el useState inicial.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCargando(true);
        obtenerEventos();

        // Solo auto-refrescamos cuando no hay filtro activo — si estás
        // revisando un rango de fechas específico, no queremos que la
        // lista se mueva sola cada 5 segundos.

        if (desde || hasta) return;

        const intervalo = setInterval(obtenerEventos, 5000);

        return () => clearInterval(intervalo);

    }, [esp32Id, desde, hasta]);

    const limpiarFiltro = () => {
        setDesde("");
        setHasta("");
    };

    const exportar = () => {

        exportarCSV(
            eventos,
            [
                { key: "fecha", label: "Fecha" },
                { key: "esp32_id", label: "Dispositivo" },
                { key: "evento", label: "Evento" }
            ],
            `eventos_${esp32Id}_${Date.now()}.csv`
        );

    };

    return (

        <div>

            <div className="page-header-row">

                <div>
                    <h1 className="page-title">Eventos</h1>
                    <p className="page-subtitle">
                        Historial de acciones y cambios de estado del sistema.
                    </p>
                </div>

                <ExportButton onClick={exportar} disabled={eventos.length === 0} />

            </div>

            <FiltroFechas
                desde={desde}
                hasta={hasta}
                onCambiarDesde={setDesde}
                onCambiarHasta={setHasta}
                onLimpiar={limpiarFiltro}
            />

            <div className="eventos-panel">

                {cargando && [0, 1, 2, 3, 4].map((i) => (

                    <div className="skeleton-row" key={i}>
                        <Skeleton width="165px" height="12px" />
                        <Skeleton width="90px" height="20px" radius="999px" />
                        <Skeleton height="14px" />
                    </div>

                ))}

                {!cargando && error && (
                    <EmptyState icon={AlertCircle} mensaje={error} variante="error" />
                )}

                {!cargando && !error && eventos.length === 0 && (
                    <EmptyState
                        icon={ClipboardX}
                        mensaje={
                            desde || hasta
                                ? "No hay eventos en ese rango de fechas."
                                : "Todavía no hay eventos registrados."
                        }
                    />
                )}

                {!cargando && !error && eventos.map((item) => (

                    <div className="evento-item" key={item.id}>

                        <span className="evento-fecha">
                            {new Date(item.fecha).toLocaleString()}
                        </span>

                        <span className="evento-esp32">{item.esp32_id}</span>

                        <span className="evento-texto">{item.evento}</span>

                    </div>

                ))}

            </div>

        </div>

    );

};

export default Eventos;
