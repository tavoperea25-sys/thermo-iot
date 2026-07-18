import useDashboard from "../hooks/useDashboard";
import useDemoDashboard from "../hooks/useDemoDashboard";
import { useIncubadora } from "../context/IncubadoraContext";
import { useDemo } from "../context/DemoContext";
import { exportarCSV } from "../utils/csv";
import DashboardCards from "../components/dashboard/DashboardCards";
import ChartCard from "../components/dashboard/ChartCard";
import EventPanel from "../components/dashboard/EventPanel";
import ControlPanel from "../components/dashboard/ControlPanel";
import EstadisticasDia from "../components/dashboard/EstadisticasDia";
import ExportButton from "../components/ExportButton";
import TourGuiado from "../components/TourGuiado";

import "../styles/dashboard.css";

const Dashboard = () => {

    const { esp32Id } = useIncubadora();
    const { demoActivo } = useDemo();

    const datosReales = useDashboard(!demoActivo);
    const datosDemo = useDemoDashboard(demoActivo);

    const {

        temperatura,
        humedad,
        historial,
        online,
        alarmas,
        limites

    } = demoActivo ? datosDemo : datosReales;

    const exportar = () => {

        exportarCSV(
            historial,
            [
                { key: "fecha", label: "Fecha" },
                { key: "temperatura", label: "Temperatura (°C)" },
                { key: "humedad", label: "Humedad (%)" }
            ],
            `mediciones_${esp32Id}_${Date.now()}.csv`
        );

    };

    return (

        <div>

            <div className="page-header-row">

                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">
                        Monitoreo en tiempo real de la incubadora.
                    </p>
                </div>

                <ExportButton onClick={exportar} disabled={historial.length === 0} />

            </div>

            <DashboardCards
                temperatura={temperatura}
                humedad={humedad}
                online={online}
                alarmas={alarmas}
            />

            <div className="dashboard-charts" data-tour="graficas">

                <ChartCard
                    titulo="Temperatura"
                    color="var(--ember)"
                    historial={historial}
                    campo="temperatura"
                    rangoMin={limites?.temperatura_min}
                    rangoMax={limites?.temperatura_max}
                    colorBanda="rgba(242, 146, 74, 0.08)"
                    colorBandaBorde="rgba(242, 146, 74, 0.45)"
                />

                <ChartCard
                    titulo="Humedad"
                    color="var(--cyan)"
                    historial={historial}
                    campo="humedad"
                    rangoMin={limites?.humedad_min}
                    rangoMax={limites?.humedad_max}
                    colorBanda="rgba(69, 216, 200, 0.08)"
                    colorBandaBorde="rgba(69, 216, 200, 0.45)"
                />

            </div>

            <div className="dashboard-stats-row">

                <EstadisticasDia />

            </div>

            <div className="dashboard-lower">

                <EventPanel historial={historial} />

                <ControlPanel />

            </div>

            <TourGuiado />

        </div>

    );

};

export default Dashboard;
