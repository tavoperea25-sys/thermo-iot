import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { useTour } from "../context/TourContext";

import "../styles/tour.css";

const PASOS = [

    {
        selector: '[data-tour="sidebar"]',
        titulo: "Navegación",
        texto: "Desde aquí te mueves entre las secciones del sitio: Dashboard, Incubadoras, Alarmas, Eventos, Configuración y Sistema."
    },
    {
        selector: '[data-tour="selector"]',
        titulo: "Tu incubadora",
        texto: "Si tienes más de un dispositivo, aquí eliges cuál estás viendo. Todo lo demás en pantalla se actualiza según tu elección."
    },
    {
        selector: '[data-tour="cards"]',
        titulo: "Estado en tiempo real",
        texto: "Temperatura, humedad, si el dispositivo está conectado, y cuántas alarmas hay activas ahora mismo."
    },
    {
        selector: '[data-tour="graficas"]',
        titulo: "Gráficas",
        texto: "La franja de color sombreada marca el rango seguro configurado — mientras la línea esté adentro, todo está en orden."
    },
    {
        selector: '[data-tour="control"]',
        titulo: "Centro de control",
        texto: "Cambia entre modo Manual (tú decides) y Automático (el sistema regula solo), y enciende/apaga el calefactor o ventilador."
    },
    {
        selector: '[data-tour="alarmas"]',
        titulo: "Notificaciones",
        texto: "La campana te avisa cuando algo se sale de rango, con un número indicando cuántas alarmas hay activas."
    },
    {
        selector: '[data-tour="demo"]',
        titulo: "Modo Demo",
        texto: "Actívalo para ver el sitio funcionando con datos de ejemplo, sin necesitar el dispositivo físico conectado. Así terminamos — ¡listo para explorar!"
    }

];

const elementoVisible = (el) => {

    const r = el.getBoundingClientRect();

    return (
        r.width > 0 &&
        r.height > 0 &&
        r.right > 0 &&
        r.left < window.innerWidth
    );

};

const TourGuiado = () => {

    const { solicitudId } = useTour();
    const ultimaSolicitudProcesada = useRef(0);
    const elementoActual = useRef(null);

    const [pasoActual, setPasoActual] = useState(0);
    const [activo, setActivo] = useState(false);
    const [posicionTooltip, setPosicionTooltip] = useState(null);

    // Arranque automático la primera vez que alguien entra al sitio.

    useEffect(() => {

        const yaVisto = localStorage.getItem("tour_completado");

        if (!yaVisto) {

            const timeout = setTimeout(() => {
                setPasoActual(0);
                setActivo(true);
            }, 900);

            return () => clearTimeout(timeout);

        }

    }, []);

    // Reinicio manual desde el botón de ayuda del Navbar.

    useEffect(() => {

        if (solicitudId !== ultimaSolicitudProcesada.current) {

            ultimaSolicitudProcesada.current = solicitudId;
            setPasoActual(0);
            setActivo(true);

        }

    }, [solicitudId]);

    // Quita el resaltado del elemento anterior (si había uno) antes
    // de aplicar el nuevo, y limpia también al cerrar el tour.

    const limpiarResaltadoAnterior = () => {

        if (elementoActual.current) {
            elementoActual.current.classList.remove("tour-resaltado");
            elementoActual.current = null;
        }

    };

    const calcularPosicionTooltip = (rect) => {

        const margen = 16;
        const alturaTooltipEstimada = 230;

        const espacioAbajo = window.innerHeight - rect.bottom;
        const espacioArriba = rect.top;

        let top;

        if (espacioAbajo >= alturaTooltipEstimada) {
            top = rect.bottom + margen;
        } else if (espacioArriba >= alturaTooltipEstimada) {
            top = rect.top - alturaTooltipEstimada - margen;
        } else {
            top = (window.innerHeight - alturaTooltipEstimada) / 2;
        }

        top = Math.min(
            Math.max(16, top),
            window.innerHeight - alturaTooltipEstimada - 16
        );

        const left = Math.min(
            Math.max(16, rect.left),
            window.innerWidth - 336
        );

        return { top, left };

    };

    const terminar = () => {

        limpiarResaltadoAnterior();
        localStorage.setItem("tour_completado", "1");
        setActivo(false);

    };

    useEffect(() => {

        if (!activo) {
            limpiarResaltadoAnterior();
            return;
        }

        let cancelado = false;

        const aplicar = () => {

            limpiarResaltadoAnterior();

            const paso = PASOS[pasoActual];
            const el = document.querySelector(paso.selector);

            if (!el || !elementoVisible(el)) {

                if (pasoActual < PASOS.length - 1) {
                    setPasoActual((p) => p + 1);
                } else {
                    terminar();
                }

                return;

            }

            const r = el.getBoundingClientRect();
            const dentroDeVista = r.top >= 0 && r.bottom <= window.innerHeight;

            if (!dentroDeVista) {

                el.scrollIntoView({ block: "center", behavior: "instant" });

            }

            // El resaltado se lo ponemos directamente al elemento real
            // (una clase CSS), no a una caja aparte — así la posición
            // siempre es exacta, la calcula el navegador solo.

            requestAnimationFrame(() => {

                if (cancelado) return;

                el.classList.add("tour-resaltado");
                elementoActual.current = el;

                const rFinal = el.getBoundingClientRect();

                setPosicionTooltip(calcularPosicionTooltip(rFinal));

            });

        };

        aplicar();

        const reposicionar = () => {

            if (!elementoActual.current) return;

            setPosicionTooltip(
                calcularPosicionTooltip(elementoActual.current.getBoundingClientRect())
            );

        };

        window.addEventListener("resize", reposicionar);
        window.addEventListener("scroll", reposicionar, true);

        return () => {

            cancelado = true;

            window.removeEventListener("resize", reposicionar);
            window.removeEventListener("scroll", reposicionar, true);

        };

    }, [activo, pasoActual]);

    // Al desmontar el componente (cambiar de página), no dejamos
    // ningún resaltado pegado por accidente.

    useEffect(() => {

        return () => limpiarResaltadoAnterior();

    }, []);

    const siguiente = () => {

        if (pasoActual < PASOS.length - 1) {
            setPasoActual((p) => p + 1);
        } else {
            terminar();
        }

    };

    const anterior = () => {

        if (pasoActual > 0) {
            setPasoActual((p) => p - 1);
        }

    };

    if (!activo || !posicionTooltip) return null;

    return (

        <div className="tour-overlay">

            <div
                className="tour-tooltip"
                style={{ top: posicionTooltip.top, left: posicionTooltip.left }}
            >

                <button className="tour-cerrar" onClick={terminar} aria-label="Cerrar recorrido">
                    <X size={15} />
                </button>

                <span className="tour-paso-contador">
                    {pasoActual + 1} de {PASOS.length}
                </span>

                <h4>{PASOS[pasoActual].titulo}</h4>

                <p>{PASOS[pasoActual].texto}</p>

                <div className="tour-botones">

                    <button
                        className="tour-btn-saltar"
                        onClick={terminar}
                    >
                        Saltar
                    </button>

                    <div className="tour-botones-nav">

                        {pasoActual > 0 && (
                            <button className="tour-btn-anterior" onClick={anterior}>
                                Atrás
                            </button>
                        )}

                        <button className="tour-btn-siguiente" onClick={siguiente}>
                            {pasoActual === PASOS.length - 1 ? "Terminar" : "Siguiente"}
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default TourGuiado;
