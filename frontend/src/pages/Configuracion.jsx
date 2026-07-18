import { useEffect, useState } from "react";

import api from "../services/api";
import { useIncubadora } from "../context/IncubadoraContext";
import Skeleton from "../components/Skeleton";

import "../styles/configuracion.css";

const Configuracion = () => {

    const { esp32Id } = useIncubadora();

    const [form, setForm] = useState({
        temperatura_min: "",
        temperatura_max: "",
        humedad_min: "",
        humedad_max: "",
        tiempo_lectura: ""
    });

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {

        if (!esp32Id) return;

        const cargarConfiguracion = async () => {

            setCargando(true);

            try {

                const respuesta = await api.get(
                    `/iot/configuracion/${esp32Id}`
                );

                setForm({
                    temperatura_min: respuesta.data.temperatura_min,
                    temperatura_max: respuesta.data.temperatura_max,
                    humedad_min: respuesta.data.humedad_min,
                    humedad_max: respuesta.data.humedad_max,
                    tiempo_lectura: respuesta.data.tiempo_lectura
                });

            } catch (err) {

                setError("No se pudo cargar la configuración actual");

            } finally {

                setCargando(false);

            }

        };

        cargarConfiguracion();

    }, [esp32Id]);

    const manejarCambio = (campo) => (evento) => {

        setForm({
            ...form,
            [campo]: evento.target.value
        });

    };

    const manejarSubmit = async (evento) => {

        evento.preventDefault();

        setMensaje("");
        setError("");

        if (Number(form.temperatura_min) >= Number(form.temperatura_max)) {
            setError("La temperatura mínima debe ser menor que la máxima");
            return;
        }

        if (Number(form.humedad_min) >= Number(form.humedad_max)) {
            setError("La humedad mínima debe ser menor que la máxima");
            return;
        }

        setGuardando(true);

        try {

            await api.put(`/iot/configuracion/${esp32Id}`, form);

            setMensaje("Configuración actualizada. El ESP32 la tomará en su próxima consulta (máx. 5s).");

        } catch (err) {

            setError("No se pudo guardar la configuración");

        } finally {

            setGuardando(false);

        }

    };

    if (cargando) {
        return (
            <div>

                <h1 className="page-title">Configuración</h1>
                <p className="page-subtitle">Cargando parámetros...</p>

                <div className="config-panel">

                    <div className="config-grid">

                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i}>
                                <Skeleton width="55%" height="11px" style={{ marginBottom: "8px" }} />
                                <Skeleton height="41px" radius="8px" />
                            </div>
                        ))}

                    </div>

                    <Skeleton width="160px" height="42px" radius="8px" />

                </div>

            </div>
        );
    }

    return (

        <div>

            <h1 className="page-title">Configuración</h1>

            <p className="page-subtitle">
                Parámetros del dispositivo {esp32Id}.
            </p>

            <form className="config-panel" onSubmit={manejarSubmit}>

                {mensaje && <div className="config-mensaje-exito">{mensaje}</div>}
                {error && <div className="config-mensaje-error">{error}</div>}

                <div className="config-grid">

                    <div className="config-campo">
                        <label>Temperatura mínima (°C)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={form.temperatura_min}
                            onChange={manejarCambio("temperatura_min")}
                            required
                        />
                    </div>

                    <div className="config-campo">
                        <label>Temperatura máxima (°C)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={form.temperatura_max}
                            onChange={manejarCambio("temperatura_max")}
                            required
                        />
                    </div>

                    <div className="config-campo">
                        <label>Humedad mínima (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={form.humedad_min}
                            onChange={manejarCambio("humedad_min")}
                            required
                        />
                    </div>

                    <div className="config-campo">
                        <label>Humedad máxima (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={form.humedad_max}
                            onChange={manejarCambio("humedad_max")}
                            required
                        />
                    </div>

                    <div className="config-campo">
                        <label>Intervalo de lectura (ms)</label>
                        <input
                            type="number"
                            step="100"
                            value={form.tiempo_lectura}
                            onChange={manejarCambio("tiempo_lectura")}
                            required
                        />
                    </div>

                </div>

                <button type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar cambios"}
                </button>

            </form>

        </div>

    );

};

export default Configuracion;
