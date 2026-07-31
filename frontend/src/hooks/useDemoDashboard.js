import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { useIncubadora } from "../context/IncubadoraContext";

// Límites por defecto si no se puede leer una configuración real
// (el modo demo debe poder funcionar solo, sin depender de nada).

const LIMITES_DEFECTO = {
    temperatura_min: 36.5,
    temperatura_max: 38,
    humedad_min: 50,
    humedad_max: 70
};

const PUNTOS_HISTORIAL = 30;

// Paso aleatorio suave, tipo "random walk" — cada lectura se mueve
// un poco respecto a la anterior, en vez de saltar sin sentido.

const pasoSuave = (valor, minimo, maximo, variacion) => {

    const delta = (Math.random() - 0.5) * variacion;
    let nuevo = valor + delta;

    // Rebote suave en los bordes, para que a veces sí salga
    // de rango (y se vea la alarma) pero no se dispare sin control.

    const margen = (maximo - minimo) * 0.3;

    if (nuevo < minimo - margen) nuevo = minimo - margen;
    if (nuevo > maximo + margen) nuevo = maximo + margen;

    return Number(nuevo.toFixed(1));

};

const useDemoDashboard = (activo = true) => {

    const { esp32Id } = useIncubadora();

    const [limites, setLimites] = useState(LIMITES_DEFECTO);
    const [historial, setHistorial] = useState([]);
    const [temperatura, setTemperatura] = useState("--");
    const [humedad, setHumedad] = useState("--");

    const temperaturaRef = useRef(null);
    const humedadRef = useRef(null);

    useEffect(() => {

        if (!activo) return;

        // Intenta usar la configuración real como punto de partida
        // (más realista), pero si falla, sigue con los valores por
        // defecto — el modo demo nunca debe depender de esto.

        const cargarLimites = async () => {

            if (!esp32Id) return;

            try {

                const respuesta = await api.get(`/iot/configuracion/${esp32Id}`);
                setLimites(respuesta.data);

            } catch {

                setLimites(LIMITES_DEFECTO);

            }

        };

        cargarLimites();

    }, [esp32Id, activo]);

    useEffect(() => {

        if (!activo) return;

        // Arranca cerca del centro del rango configurado.

        temperaturaRef.current =
            (Number(limites.temperatura_min) + Number(limites.temperatura_max)) / 2;

        humedadRef.current =
            (Number(limites.humedad_min) + Number(limites.humedad_max)) / 2;

        const generarLectura = () => {

            temperaturaRef.current = pasoSuave(
                temperaturaRef.current,
                Number(limites.temperatura_min),
                Number(limites.temperatura_max),
                0.5
            );

            humedadRef.current = pasoSuave(
                humedadRef.current,
                Number(limites.humedad_min),
                Number(limites.humedad_max),
                1.5
            );

            const lectura = {
                fecha: new Date().toISOString(),
                temperatura: temperaturaRef.current,
                humedad: humedadRef.current
            };

            setTemperatura(lectura.temperatura);
            setHumedad(lectura.humedad);

            setHistorial((actual) => {

                const nuevo = [...actual, lectura];

                if (nuevo.length > PUNTOS_HISTORIAL) {
                    nuevo.shift();
                }

                return nuevo;

            });

        };

        generarLectura();

        const intervalo = setInterval(generarLectura, 3000);

        return () => clearInterval(intervalo);

    }, [limites, activo]);

    let alarmas = 0;

    if (temperatura !== "--" && humedad !== "--") {

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
        online: true,
        alarmas,
        limites
    };

};

export default useDemoDashboard;
