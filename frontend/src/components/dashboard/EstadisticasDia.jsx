import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, Flame } from "lucide-react";

import api from "../../services/api";
import { useIncubadora } from "../../context/IncubadoraContext";
import { useDemo } from "../../context/DemoContext";

const formatearDuracion = (segundos) => {

    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);

    if (horas === 0 && minutos === 0) return "menos de 1 min";
    if (horas === 0) return `${minutos} min`;

    return `${horas} h ${minutos} min`;

};

const EstadisticasDia = () => {

    const { esp32Id } = useIncubadora();
    const { demoActivo } = useDemo();

    const [stats, setStats] = useState(null);

    useEffect(() => {

        if (!esp32Id || demoActivo) return;

        const cargar = async () => {

            try {

                const respuesta = await api.get(`/iot/estadisticas/${esp32Id}`);
                setStats(respuesta.data);

            } catch (error) {

                setStats(null);

            }

        };

        cargar();

        const intervalo = setInterval(cargar, 30000);

        return () => clearInterval(intervalo);

    }, [esp32Id, demoActivo]);

    if (demoActivo) {

        return (
            <div className="panel">
                <h3 className="chart-card-title">Estadísticas de hoy</h3>
                <p className="empty-state">No disponibles en modo demo.</p>
            </div>
        );

    }

    if (!stats || stats.total_lecturas === 0) {

        return (
            <div className="panel">
                <h3 className="chart-card-title">Estadísticas de hoy</h3>
                <p className="empty-state">Todavía no hay lecturas registradas hoy.</p>
            </div>
        );

    }

    return (

        <div className="panel">

            <h3 className="chart-card-title">Estadísticas de hoy</h3>

            <div className="stats-grid">

                <div className="stats-item">
                    <div className="stats-item-label">
                        <TrendingUp size={13} />
                        Temp. máxima
                    </div>
                    <div className="stats-item-valor stats-ember">
                        {Number(stats.temp_max).toFixed(1)} °C
                    </div>
                </div>

                <div className="stats-item">
                    <div className="stats-item-label">
                        <TrendingDown size={13} />
                        Temp. mínima
                    </div>
                    <div className="stats-item-valor stats-ember">
                        {Number(stats.temp_min).toFixed(1)} °C
                    </div>
                </div>

                <div className="stats-item">
                    <div className="stats-item-label">
                        <Activity size={13} />
                        Temp. promedio
                    </div>
                    <div className="stats-item-valor stats-ember">
                        {Number(stats.temp_avg).toFixed(1)} °C
                    </div>
                </div>

                <div className="stats-item">
                    <div className="stats-item-label">
                        <TrendingUp size={13} />
                        Hum. máxima
                    </div>
                    <div className="stats-item-valor stats-cyan">
                        {Number(stats.hum_max).toFixed(1)} %
                    </div>
                </div>

                <div className="stats-item">
                    <div className="stats-item-label">
                        <TrendingDown size={13} />
                        Hum. mínima
                    </div>
                    <div className="stats-item-valor stats-cyan">
                        {Number(stats.hum_min).toFixed(1)} %
                    </div>
                </div>

                <div className="stats-item">
                    <div className="stats-item-label">
                        <Activity size={13} />
                        Hum. promedio
                    </div>
                    <div className="stats-item-valor stats-cyan">
                        {Number(stats.hum_avg).toFixed(1)} %
                    </div>
                </div>

            </div>

            <div className="stats-calefactor">
                <Flame size={15} />
                Calefactor encendido hoy: <strong>{formatearDuracion(stats.calefactor_segundos_hoy)}</strong>
            </div>

        </div>

    );

};

export default EstadisticasDia;
