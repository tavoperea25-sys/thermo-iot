import { createContext, useContext, useEffect, useState } from "react";

import api from "../services/api";
import { ESP32_ID } from "../config";

const IncubadoraContext = createContext(null);

export const IncubadoraProvider = ({ children }) => {

    const [incubadoras, setIncubadoras] = useState([]);

    const [esp32Id, setEsp32Id] = useState(
        localStorage.getItem("esp32_id_seleccionado") || ESP32_ID
    );

    const [cargando, setCargando] = useState(true);

    useEffect(() => {

        const cargar = async () => {

            try {

                const respuesta = await api.get("/incubadoras");

                setIncubadoras(respuesta.data);

                const guardado = localStorage.getItem("esp32_id_seleccionado");

                const existeGuardado = respuesta.data.some(
                    (item) => item.esp32_id === guardado
                );

                if (guardado && existeGuardado) {

                    setEsp32Id(guardado);

                } else if (respuesta.data.length > 0) {

                    setEsp32Id(respuesta.data[0].esp32_id);

                }

            } catch (error) {

                // Si falla, seguimos con el ESP32_ID por defecto.

            } finally {

                setCargando(false);

            }

        };

        cargar();

    }, []);

    const seleccionarIncubadora = (nuevoEsp32Id) => {

        setEsp32Id(nuevoEsp32Id);
        localStorage.setItem("esp32_id_seleccionado", nuevoEsp32Id);

    };

    return (

        <IncubadoraContext.Provider
            value={{
                esp32Id,
                incubadoras,
                cargando,
                seleccionarIncubadora
            }}
        >
            {children}
        </IncubadoraContext.Provider>

    );

};

export const useIncubadora = () => useContext(IncubadoraContext);
