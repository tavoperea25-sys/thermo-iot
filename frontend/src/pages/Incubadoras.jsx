import { useEffect, useState } from "react";
import { Trash2, Cpu, AlertCircle } from "lucide-react";

import api from "../services/api";
import { obtenerUsuario } from "../services/auth";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

import "../styles/incubadoras.css";

const Incubadoras = () => {

    const toast = useToast();

    const [incubadoras, setIncubadoras] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [creando, setCreando] = useState(false);

    const [porEliminar, setPorEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        esp32_id: "",
        temperatura_objetivo: ""
    });

    const usuario = obtenerUsuario();

    const cargarIncubadoras = async () => {

        try {

            const respuesta = await api.get("/incubadoras");
            setIncubadoras(respuesta.data);
            setError("");

        } catch (err) {

            setError("No se pudieron cargar las incubadoras");

        } finally {

            setCargando(false);

        }

    };

    useEffect(() => {
        cargarIncubadoras();
    }, []);

    const manejarCambio = (campo) => (evento) => {
        setForm({ ...form, [campo]: evento.target.value });
    };

    const manejarSubmit = async (evento) => {

        evento.preventDefault();

        setCreando(true);

        try {

            await api.post("/incubadoras", {
                ...form,
                usuario_id: usuario?.id
            });

            setForm({
                nombre: "",
                descripcion: "",
                esp32_id: "",
                temperatura_objetivo: ""
            });

            toast.success("Incubadora creada correctamente");

            await cargarIncubadoras();

        } catch (err) {

            toast.error("No se pudo crear la incubadora");

        } finally {

            setCreando(false);

        }

    };

    const confirmarEliminacion = async () => {

        if (!porEliminar) return;

        setEliminando(true);

        try {

            await api.delete(`/incubadoras/${porEliminar.id}`);

            toast.success(`"${porEliminar.nombre}" eliminada`);

            setPorEliminar(null);

            await cargarIncubadoras();

        } catch (err) {

            toast.error("No se pudo eliminar la incubadora");

        } finally {

            setEliminando(false);

        }

    };

    return (

        <div>

            <h1 className="page-title">Incubadoras</h1>

            <p className="page-subtitle">
                Dispositivos registrados en tu cuenta.
            </p>

            <form className="incubadora-form" onSubmit={manejarSubmit}>

                <input
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={manejarCambio("nombre")}
                    required
                />

                <input
                    placeholder="Descripción"
                    value={form.descripcion}
                    onChange={manejarCambio("descripcion")}
                />

                <input
                    placeholder="ID del ESP32 (ej. ESP32_001)"
                    value={form.esp32_id}
                    onChange={manejarCambio("esp32_id")}
                    required
                />

                <input
                    type="number"
                    step="0.1"
                    placeholder="Temp. objetivo (°C)"
                    value={form.temperatura_objetivo}
                    onChange={manejarCambio("temperatura_objetivo")}
                    required
                />

                <button type="submit" disabled={creando}>
                    {creando ? "Creando..." : "Agregar incubadora"}
                </button>

            </form>

            <p className="incubadora-form-nota">
                La temperatura objetivo define el rango del modo automático
                (objetivo ± 2°C). Puedes ajustarlo con más precisión luego
                desde "Configuración".
            </p>

            {error && <EmptyState icon={AlertCircle} mensaje={error} variante="error" />}

            <div className="incubadora-lista">

                {cargando && [0, 1, 2].map((i) => (

                    <div className="skeleton-card" key={i}>
                        <Skeleton width="60%" height="16px" style={{ marginBottom: "10px" }} />
                        <Skeleton width="80%" height="12px" style={{ marginBottom: "8px" }} />
                        <Skeleton width="40%" height="12px" />
                    </div>

                ))}

                {!cargando && incubadoras.length === 0 && !error && (
                    <EmptyState
                        icon={Cpu}
                        mensaje="Todavía no tienes incubadoras registradas."
                    />
                )}

                {!cargando && incubadoras.map((item) => (

                    <div className="incubadora-card" key={item.id}>

                        <button
                            className="incubadora-eliminar"
                            onClick={() => setPorEliminar(item)}
                            title="Eliminar incubadora"
                            aria-label={`Eliminar incubadora ${item.nombre}`}
                        >
                            <Trash2 size={15} />
                        </button>

                        <div className="incubadora-nombre">{item.nombre}</div>

                        <div className="incubadora-detalle">
                            {item.esp32_id} · Objetivo: {item.temperatura_objetivo} °C
                        </div>

                        {item.descripcion && (
                            <div className="incubadora-descripcion">{item.descripcion}</div>
                        )}

                    </div>

                ))}

            </div>

            {porEliminar && (

                <ConfirmModal
                    titulo="¿Eliminar incubadora?"
                    mensaje={`Vas a eliminar "${porEliminar.nombre}" (${porEliminar.esp32_id}). Esta acción no se puede deshacer.`}
                    procesando={eliminando}
                    onConfirmar={confirmarEliminacion}
                    onCancelar={() => setPorEliminar(null)}
                />

            )}

        </div>

    );

};

export default Incubadoras;
