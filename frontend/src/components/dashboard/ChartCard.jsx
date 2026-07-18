import {

    Chart as ChartJS,

    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend

} from "chart.js";

import { Line } from "react-chartjs-2";
import { LineChart } from "lucide-react";

import EmptyState from "../EmptyState";

ChartJS.register(

    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend

);

// Plugin propio (sin dependencias externas) que sombrea la franja
// entre rangoMin y rangoMax — el rango "seguro" configurado.

const bandaSeguraPlugin = {

    id: "bandaSegura",

    beforeDraw(chart, args, opciones) {

        const { rangoMin, rangoMax, color, colorBorde } = opciones;

        if (rangoMin == null || rangoMax == null) return;

        const { ctx, chartArea, scales } = chart;

        if (!chartArea) return;

        const yMin = scales.y.getPixelForValue(rangoMin);
        const yMax = scales.y.getPixelForValue(rangoMax);

        ctx.save();

        ctx.fillStyle = color || "rgba(52, 211, 153, 0.08)";
        ctx.fillRect(
            chartArea.left,
            yMax,
            chartArea.right - chartArea.left,
            yMin - yMax
        );

        // Líneas punteadas en los bordes del rango, para que se
        // distingan incluso si la franja queda muy angosta.

        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = colorBorde || "rgba(52, 211, 153, 0.5)";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(chartArea.left, yMin);
        ctx.lineTo(chartArea.right, yMin);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(chartArea.left, yMax);
        ctx.lineTo(chartArea.right, yMax);
        ctx.stroke();

        ctx.restore();

    }

};

ChartJS.register(bandaSeguraPlugin);

const ChartCard = ({

    titulo,
    color,
    historial,
    campo,
    rangoMin,
    rangoMax,
    colorBanda,
    colorBandaBorde

}) => {

    const data = {

        labels: historial.map(item =>

            new Date(item.fecha).toLocaleTimeString([], {

                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"

            })

        ),

        datasets: [

            {

                label: titulo,

                data: historial.map(item => item[campo]),

                borderColor: color,

                backgroundColor: color + "26",

                fill: true,

                tension: 0.4,

                pointRadius: 0,

                borderWidth: 2

            }

        ]

    };

    const options = {

        responsive: true,

        plugins: {

            legend: { display: false },

            bandaSegura: {
                rangoMin,
                rangoMax,
                color: colorBanda,
                colorBorde: colorBandaBorde
            }

        },

        scales: {

            x: {
                ticks: { color: "#5b6478", maxTicksLimit: 6 },
                grid: { color: "rgba(255,255,255,0.04)" }
            },

            y: {
                ticks: { color: "#5b6478" },
                grid: { color: "rgba(255,255,255,0.04)" }
            }

        }

    };

    const hayRango = rangoMin != null && rangoMax != null;

    return (

        <div className="panel">

            <div className="chart-card-header">

                <h3 className="chart-card-title">
                    {titulo}
                </h3>

                {hayRango && (
                    <span className="chart-card-rango">
                        Rango seguro: {rangoMin}–{rangoMax}
                    </span>
                )}

            </div>

            {historial.length === 0 ? (

                <EmptyState
                    icon={LineChart}
                    mensaje="Todavía no hay lecturas para graficar."
                />

            ) : (

                <Line data={data} options={options} />

            )}

        </div>

    );

};

export default ChartCard;
