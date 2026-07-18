import { Radio } from "lucide-react";

import EmptyState from "../EmptyState";

const EventPanel = ({ historial }) => {

    return (

        <div className="panel">

            <h3 className="chart-card-title">
                Últimas lecturas
            </h3>

            {historial.length === 0 && (
                <EmptyState
                    icon={Radio}
                    mensaje="Esperando la primera lectura del sensor..."
                />
            )}

            {historial
                .slice()
                .reverse()
                .slice(0, 10)
                .map((item, index) => (

                    <div className="reading-item" key={index}>

                        <span className="reading-time">
                            {new Date(item.fecha).toLocaleTimeString()}
                        </span>

                        <span className="reading-value reading-temp">
                            {item.temperatura} °C
                        </span>

                        <span className="reading-value reading-hum">
                            {item.humedad} %
                        </span>

                    </div>

                ))}

        </div>

    );

};

export default EventPanel;
