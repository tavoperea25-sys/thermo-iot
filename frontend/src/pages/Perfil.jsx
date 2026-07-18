import { useEffect, useState } from "react";
import { User, Lock, Loader2 } from "lucide-react";

import api from "../services/api";
import { actualizarUsuarioLocal } from "../services/auth";
import { useToast } from "../context/ToastContext";
import PasswordInput from "../components/PasswordInput";
import Skeleton from "../components/Skeleton";

import "../styles/perfil.css";

const Perfil = () => {

    const toast = useToast();

    const [datos, setDatos] = useState({
        nombre: "",
        correo: "",
        usuario: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        passwordActual: "",
        passwordNueva: "",
        passwordConfirmar: ""
    });

    const [cargando, setCargando] = useState(true);
    const [guardandoPerfil, setGuardandoPerfil] = useState(false);
    const [guardandoPassword, setGuardandoPassword] = useState(false);

    useEffect(() => {

        const cargarPerfil = async () => {

            try {

                const respuesta = await api.get("/auth/me");
                setDatos(respuesta.data);

            } catch (err) {

                toast.error("No se pudo cargar tu perfil");

            } finally {

                setCargando(false);

            }

        };

        cargarPerfil();

    }, []);

    const manejarCambioDatos = (campo) => (evento) => {
        setDatos({ ...datos, [campo]: evento.target.value });
    };

    const manejarCambioPassword = (campo) => (evento) => {
        setPasswordForm({ ...passwordForm, [campo]: evento.target.value });
    };

    const guardarPerfil = async (evento) => {

        evento.preventDefault();

        setGuardandoPerfil(true);

        try {

            const respuesta = await api.put("/auth/perfil", {
                nombre: datos.nombre,
                correo: datos.correo
            });

            actualizarUsuarioLocal(respuesta.data.usuario);

            toast.success("Perfil actualizado correctamente");

        } catch (err) {

            toast.error("No se pudo actualizar el perfil");

        } finally {

            setGuardandoPerfil(false);

        }

    };

    const cambiarPassword = async (evento) => {

        evento.preventDefault();

        if (passwordForm.passwordNueva !== passwordForm.passwordConfirmar) {
            toast.error("Las contraseñas nuevas no coinciden");
            return;
        }

        if (passwordForm.passwordNueva.length < 6) {
            toast.error("La nueva contraseña debe tener al menos 6 caracteres");
            return;
        }

        setGuardandoPassword(true);

        try {

            await api.put("/auth/password", {
                passwordActual: passwordForm.passwordActual,
                passwordNueva: passwordForm.passwordNueva
            });

            toast.success("Contraseña actualizada correctamente");

            setPasswordForm({
                passwordActual: "",
                passwordNueva: "",
                passwordConfirmar: ""
            });

        } catch (err) {

            const mensaje =
                err.response?.data?.mensaje ||
                "No se pudo cambiar la contraseña";

            toast.error(mensaje);

        } finally {

            setGuardandoPassword(false);

        }

    };

    if (cargando) {
        return (
            <div>

                <h1 className="page-title">Mi perfil</h1>
                <p className="page-subtitle">Cargando tu información...</p>

                <div className="perfil-grid">

                    {[0, 1].map((panel) => (

                        <div className="perfil-panel" key={panel}>

                            <Skeleton width="50%" height="11px" style={{ marginBottom: "18px" }} />

                            {[0, 1, 2].map((i) => (
                                <div key={i} style={{ marginBottom: "16px" }}>
                                    <Skeleton width="40%" height="10px" style={{ marginBottom: "7px" }} />
                                    <Skeleton height="40px" radius="8px" />
                                </div>
                            ))}

                            <Skeleton height="42px" radius="8px" />

                        </div>

                    ))}

                </div>

            </div>
        );
    }

    return (

        <div>

            <h1 className="page-title">Mi perfil</h1>

            <p className="page-subtitle">
                Datos de tu cuenta en Thermo-IoT.
            </p>

            <div className="perfil-grid">

                <form className="perfil-panel" onSubmit={guardarPerfil}>

                    <div className="perfil-panel-titulo">
                        <User size={16} />
                        Información de la cuenta
                    </div>

                    <div className="perfil-campo">
                        <label>Nombre completo</label>
                        <input
                            type="text"
                            value={datos.nombre}
                            onChange={manejarCambioDatos("nombre")}
                            required
                        />
                    </div>

                    <div className="perfil-campo">
                        <label>Correo</label>
                        <input
                            type="email"
                            value={datos.correo}
                            onChange={manejarCambioDatos("correo")}
                            required
                        />
                    </div>

                    <div className="perfil-campo">
                        <label>Usuario</label>
                        <input
                            type="text"
                            value={datos.usuario}
                            disabled
                        />
                    </div>

                    <button type="submit" disabled={guardandoPerfil}>
                        {guardandoPerfil
                            ? (<><Loader2 size={16} className="spin" /> Guardando...</>)
                            : "Guardar cambios"}
                    </button>

                </form>

                <form className="perfil-panel" onSubmit={cambiarPassword}>

                    <div className="perfil-panel-titulo">
                        <Lock size={16} />
                        Cambiar contraseña
                    </div>

                    <div className="perfil-campo">
                        <label>Contraseña actual</label>
                        <PasswordInput
                            value={passwordForm.passwordActual}
                            onChange={manejarCambioPassword("passwordActual")}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="perfil-campo">
                        <label>Nueva contraseña</label>
                        <PasswordInput
                            value={passwordForm.passwordNueva}
                            onChange={manejarCambioPassword("passwordNueva")}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="perfil-campo">
                        <label>Confirmar nueva contraseña</label>
                        <PasswordInput
                            value={passwordForm.passwordConfirmar}
                            onChange={manejarCambioPassword("passwordConfirmar")}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button type="submit" disabled={guardandoPassword}>
                        {guardandoPassword
                            ? (<><Loader2 size={16} className="spin" /> Actualizando...</>)
                            : "Cambiar contraseña"}
                    </button>

                </form>

            </div>

        </div>

    );

};

export default Perfil;
