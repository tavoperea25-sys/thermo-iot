import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let idContador = 0;

export const ToastProvider = ({ children }) => {

    const [toasts, setToasts] = useState([]);

    const quitarToast = useCallback((id) => {

        setToasts((actuales) => actuales.filter((t) => t.id !== id));

    }, []);

    const mostrarToast = useCallback((mensaje, tipo = "info") => {

        const id = ++idContador;

        setToasts((actuales) => [...actuales, { id, mensaje, tipo }]);

        setTimeout(() => quitarToast(id), 3500);

    }, [quitarToast]);

    const toast = {
        success: (mensaje) => mostrarToast(mensaje, "success"),
        error: (mensaje) => mostrarToast(mensaje, "error"),
        info: (mensaje) => mostrarToast(mensaje, "info")
    };

    return (

        <ToastContext.Provider value={toast}>

            {children}

            <div className="toast-container">

                {toasts.map((t) => (

                    <div key={t.id} className={`toast toast-${t.tipo}`}>
                        {t.mensaje}
                    </div>

                ))}

            </div>

        </ToastContext.Provider>

    );

};

// Exportar el hook junto al Provider (en vez de en un archivo aparte)
// rompe el análisis estático de Fast Refresh, pero es intencional:
// mantiene el contexto y su hook de acceso en un solo lugar.
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
