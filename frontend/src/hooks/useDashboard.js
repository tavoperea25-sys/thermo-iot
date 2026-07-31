import { useEffect, useState } from "react";
import api from "../services/api";
import { useIncubadora } from "../context/IncubadoraContext";

const useDashboard = (activo = true) => {

    const { esp32Id } = useIncubadora();

    const [temperatura, setTemperatura] = useState("--");
    const [humedad, setHumedad] = useState("--");
    const [historial, setHistorial] = useState([]);
    const [online, setOnline] = useState(false);
    const [limites, setLimites] = useState(null);

    useEffect(() => {

        if (!esp32Id || !activo) return;

        const obtenerDatos = async () => {

            try {

                const response = await api.get(
                    `/iot/mediciones/${esp32Id}?limit=30`
                );

                const datos = response.data;

                setHistorial(datos);

                if (datos.length > 0) {

                    const ultima = datos[datos.length - 1];

                    setTemperatura(ultima.temperatura);
                    setHumedad(ultima.humedad);

                }

            } catch (error) {

                console.error(error);

            }

        };

        const obtenerEstadoOnline = async () => {

            try {

                const response = await api.get(`/iot/online-status/${esp32Id}`);
                setOnline(Boolean(response.data.online));

            } catch {

                setOnline(false);

            }

        };

        const obtenerLimites = async () => {

            try {

                const response = await api.get(`/iot/configuracion/${esp32Id}`);
                setLimites(response.data);

            } catch {

                // Si no hay configuración todavía, simplemente no calculamos alarmas.

            }

        };

        obtenerDatos();
        obtenerEstadoOnline();
        obtenerLimites();

        const intervaloDatos = setInterval(obtenerDatos, 3000);
        const intervaloOnline = setInterval(obtenerEstadoOnline, 5000);

        return () => {
            clearInterval(intervaloDatos);
            clearInterval(intervaloOnline);
        };

    }, [esp32Id, activo]);

    let alarmas = 0;

    if (limites && temperatura !== "--" && humedad !== "--") {

        if (temperatura < limites.temperatura_min || temperatura > limites.temperatura_max) {
            alarmas += 1;
        }

        if (humedad < limites.humedad_min || humedad > limites.humedad_max) {
            alarmas += 1;
        }

    }

    return {
        temperatura,
        humedad,
        historial,
        online,
        alarmas,
        limites
    };

};

export default useDashboard;
