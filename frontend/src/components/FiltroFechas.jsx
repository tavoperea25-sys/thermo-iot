import { Calendar, X } from "lucide-react";

const FiltroFechas = ({ desde, hasta, onCambiarDesde, onCambiarHasta, onLimpiar }) => {

    const hayFiltro = Boolean(desde || hasta);

    return (

        <div className="filtro-fechas">

            <Calendar size={15} className="filtro-fechas-icono" />

            <div className="filtro-fechas-campo">
                <label>Desde</label>
                <input
                    type="date"
                    value={desde}
                    onChange={(e) => onCambiarDesde(e.target.value)}
                    max={hasta || undefined}
                />
            </div>

            <div className="filtro-fechas-campo">
                <label>Hasta</label>
                <input
                    type="date"
                    value={hasta}
                    onChange={(e) => onCambiarHasta(e.target.value)}
                    min={desde || undefined}
                />
            </div>

            {hayFiltro && (

                <button
                    className="filtro-fechas-limpiar"
                    onClick={onLimpiar}
                    title="Quitar filtro de fechas"
                    aria-label="Quitar filtro de fechas"
                >
                    <X size={14} />
                    Limpiar
                </button>

            )}

        </div>

    );

};

export default FiltroFechas;
