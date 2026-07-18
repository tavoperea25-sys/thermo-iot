import StatCard from "../StatCard";

const DashboardCards = ({ temperatura, humedad, online, alarmas }) => {

    return (

        <div className="dashboard-cards-grid" data-tour="cards">

            <StatCard
                title="Estado"
                value={online ? "En línea" : "Desconectado"}
                color={online ? "var(--success)" : "var(--danger)"}
            />

            <StatCard
                title="Temperatura"
                value={`${temperatura} °C`}
                color="var(--ember)"
            />

            <StatCard
                title="Humedad"
                value={`${humedad} %`}
                color="var(--cyan)"
            />

            <StatCard
                title="Alarmas activas"
                value={String(alarmas)}
                color={alarmas > 0 ? "var(--danger)" : "var(--success)"}
            />

        </div>

    );

};

export default DashboardCards;
