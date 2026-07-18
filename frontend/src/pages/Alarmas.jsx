import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";

import api from "../services/api";
import { useIncubadora } from "../context/IncubadoraContext";
import { exportarCSV } from "../utils/csv";
import ExportButton from "../components/ExportButton";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import FiltroFechas from "../components/FiltroFechas";

import "../styles/alarmas.css";
import "../styles/filtrofechas.css";

const Alarmas = () => {

    const { esp32Id } = useIncubadora();

    const [alarmas, setAlarmas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");

    useEffect(() => {

        if (!esp32Id) return;

        const hayFiltro = Boolean(desde || hasta);

        const cargar = async () => {

            setCargando(true);

            try {

                const paramsMediciones = hayFiltro
                    ? { desde: desde || undefined, hasta: hasta || undefined }
                    : { limit: 100 };

                const [medicionesRes, limitesRes] = await Promise.all([
                    api.get(`/iot/mediciones/${esp32Id}`, { params: paramsMediciones }),
                    api.get(`/iot/configuracion/${esp32Id}`)
                ]);

                const limites = limitesRes.data;

                const detectadas = medicionesRes.data
                    .filter((m) =>
                        m.temperatura < limites.temperatura_min ||
                        m.temperatura > limites.temperatura_max ||
                        m.humedad < limites.humedad_min ||
                        m.humedad > limites.humedad_max
                    )
                    .map((m) => {

                        const motivos = [];

                        if (m.temperatura < limites.temperatura_min) {
                            motivos.push(`Temperatura baja (${m.temperatura} °C)`);
                        }

                        if (m.temperatura > limites.temperatura_max) {
                            motivos.push(`Temperatura alta (${m.temperatura} °C)`);
                        }

                        if (m.humedad < limites.humedad_min) {
                            motivos.push(`Humedad baja (${m.humedad} %)`);
                        }

                        if (m.humedad > limites.humedad_max) {
                            motivos.push(`Humedad alta (${m.humedad} %)`);
                        }

                        return { ...m, motivos };

                    })
                    .reverse();

                setAlarmas(detectadas);
                setError("");

            } catch (err) {

                setError("No se pudieron cargar las alarmas");

            } finally {

                setCargando(false);

            }

        };

        cargar();

        // Igual que en Eventos: con un filtro de fechas activo, no
        // refrescamos solo cada 5s para no mover la lista mientras
        // la estás revisando.

        if (hayFiltro) return;

        const intervalo = setInterval(cargar, 5000);

        return () => clearInterval(intervalo);

    }, [esp32Id, desde, hasta]);

    const limpiarFiltro = () => {
        setDesde("");
        setHasta("");
    };

    const exportar = () => {

        exportarCSV(
            alarmas.map((a) => ({
                ...a,
                motivos: a.motivos.join(" | ")
            })),
            [
                { key: "fecha", label: "Fecha" },
                { key: "temperatura", label: "Temperatura (°C)" },
                { key: "humedad", label: "Humedad (%)" },
                { key: "motivos", label: "Motivo" }
            ],
            `alarmas_${esp32Id}_${Date.now()}.csv`
        );

    };

    return (

        <div>

            <div className="page-header-row">

                <div>
                    <h1 className="page-title">Alarmas</h1>
                    <p className="page-subtitle">
                        {desde || hasta
                            ? "Lecturas fuera del rango configurado en el período seleccionado."
                            : "Lecturas fuera del rango configurado (últimas 100 mediciones)."}
                    </p>
                </div>

                <ExportButton onClick={exportar} disabled={alarmas.length === 0} />

            </div>

            <FiltroFechas
                desde={desde}
                hasta={hasta}
                onCambiarDesde={setDesde}
                onCambiarHasta={setHasta}
                onLimpiar={limpiarFiltro}
            />

            <div className="alarmas-panel">

                {cargando && [0, 1, 2].map((i) => (

                    <div className="skeleton-row" key={i}>
                        <Skeleton width="17px" height="17px" radius="4px" />
                        <div style={{ flex: 1 }}>
                            <Skeleton width="140px" height="11px" style={{ marginBottom: "8px" }} />
                            <Skeleton width="220px" height="14px" />
                        </div>
                    </div>

                ))}

                {!cargando && error && (
                    <EmptyState icon={AlertCircle} mensaje={error} variante="error" />
                )}

                {!cargando && !error && alarmas.length === 0 && (
                    <EmptyState
                        icon={ShieldCheck}
                        mensaje={
                            desde || hasta
                                ? "Sin alarmas en ese rango de fechas."
                                : "Sin alarmas recientes — todo dentro de rango."
                        }
                    />
                )}

                {!cargando && !error && alarmas.map((item, index) => (

                    <div className="alarma-item" key={index}>

                        <AlertTriangle size={17} className="alarma-icono" />

                        <div className="alarma-info">

                            <span className="alarma-fecha">
                                {new Date(item.fecha).toLocaleString()}
                            </span>

                            <span className="alarma-motivo">
                                {item.motivos.join(" · ")}
                            </span>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

};

export default Alarmas;
