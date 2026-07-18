document.querySelectorAll(".section").forEach(section => {
    section.style.display = "none";
});

document.getElementById("dashboard").style.display = "block";

function showSection(id) {
    document.querySelectorAll(".section").forEach(section => {
        section.style.display = "none";
    });

    document.getElementById(id).style.display = "block";
}

let target = 37;

function increaseTemp() {
    target++;
    document.getElementById("targetTemp").innerText =
        target + "°C";
}

function decreaseTemp() {
    target--;
    document.getElementById("targetTemp").innerText =
        target + "°C";
}

let temperatureChart;
let humidityChart;

async function cargarDatosDashboard() {

    try {

        const response = await fetch(
            "http://localhost:3000/api/iot/latest"
        );

        const data = await response.json();

        document.getElementById("tempValue").innerText =
            data.temperatura + "°C";

        document.getElementById("humValue").innerText =
            data.humedad + "%";

        const estadoResponse = await fetch(
            "http://localhost:3000/api/iot/online-status/ESP32_001"
        );

        const estadoData = await estadoResponse.json();

        if (estadoData.online) {

            document.getElementById("statusValue").innerText =
                "🟢 ONLINE";

        } else {

            document.getElementById("statusValue").innerText =
                "🔴 OFFLINE";

        }    


        let alarmas = 0;

        if (parseFloat(data.temperatura) > 40)
            alarmas++;

        if (parseFloat(data.temperatura) < 35)
            alarmas++;

        if (parseFloat(data.humedad) < 50)
            alarmas++;

        if (parseFloat(data.humedad) > 70)
            alarmas++;

        document.getElementById("alarmValue").innerText =
            alarmas;

    }
    catch (error) {

        console.error(error);

        document.getElementById("statusValue").innerText =
            "🔴 OFFLINE";
    }
}

async function cargarGraficas() {

    const response = await fetch(
        "http://localhost:3000/api/iot/history"
    );

    const data = await response.json();

    const labels = data.map(item => {
        const fecha = new Date(item.fecha);

        return fecha.toLocaleTimeString(
            [],
            {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }
        );
    });

    const temperaturas = data.map(
        item => parseFloat(item.temperatura)
    );

    const humedades = data.map(
        item => parseFloat(item.humedad)
    );

    if (temperatureChart) {
        temperatureChart.destroy();
    }

    if (humidityChart) {
        humidityChart.destroy();
    }

    temperatureChart = new Chart(
        document.getElementById("temperatureChart"),
        {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Temperatura °C",
                    data: temperaturas,
                    borderWidth: 3,
                    tension: 0.4
                }]
            }
        }
    );

    humidityChart = new Chart(
        document.getElementById("humidityChart"),
        {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Humedad %",
                    data: humedades,
                    borderWidth: 3,
                    tension: 0.4
                }]
            }
        }
    );
}


async function enviarComando(comando, valor) {

    try {

        const response = await fetch(
            "http://localhost:3000/api/iot/command",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    esp32_id: "ESP32_001",
                    comando: comando,
                    valor: valor
                })
            }
        );

        const data = await response.json();

        alert(data.mensaje);

    }
    catch(error) {

        console.log(error);

        alert("Error enviando comando");

    }

}


async function cargarEstadoDispositivos() {

    const response = await fetch(
        "http://localhost:3000/api/iot/status/ESP32_001"
    );

    const data = await response.json();

    document.getElementById("estadoCalefactor").innerHTML =
        `🔥 Calefactor: ${data.calefactor}`;

    document.getElementById("estadoVentilador").innerHTML =
        `🌬 Ventilador: ${data.ventilador}`;
}


async function cargarEventos() {

    try {

        const response = await fetch(
            "http://localhost:3000/api/iot/eventos"
        );

        const eventos = await response.json();

        const lista =
            document.getElementById(
                "listaEventos"
            );

        lista.innerHTML = "";

        eventos.forEach(evento => {

            const fecha =
                new Date(evento.fecha);

            let descripcion =
                evento.evento;

            // Traducciones bonitas

            if (evento.evento === "calefactor -> ON")
                descripcion =
                    "🔥 Calefactor encendido";

            if (evento.evento === "calefactor -> OFF")
                descripcion =
                    "❄️ Calefactor apagado";

            if (evento.evento === "ventilador -> ON")
                descripcion =
                    "🌬 Ventilador encendido";

            if (evento.evento === "ventilador -> OFF")
                descripcion =
                    "🛑 Ventilador apagado";

            if (evento.evento === "modo -> AUTO_ON")
                descripcion =
                    "🤖 Modo automático activado";

            if (evento.evento === "modo -> AUTO_OFF")
                descripcion =
                    "🎮 Modo manual activado";

            lista.innerHTML += `
                <div class="card">
                    <strong>
                        ${fecha.toLocaleString()}
                    </strong>
                    <br><br>
                    ${descripcion}
                </div>
            `;

        });

    }
    catch(error) {

        console.log(error);

    }

}


// =====================================
// CARGAR CONFIGURACIÓN
// =====================================

async function cargarConfiguracion() {

    try {

        const response = await fetch(
            "http://localhost:3000/api/iot/configuracion/ESP32_001"
        );

        const data = await response.json();

        document.getElementById("tempMin").value =
            data.temperatura_min;

        document.getElementById("tempMax").value =
            data.temperatura_max;

        document.getElementById("humMin").value =
            data.humedad_min;

        document.getElementById("humMax").value =
            data.humedad_max;

        document.getElementById("intervalo").value =
            data.tiempo_lectura;

    }
    catch (error) {

        console.log(error);

    }

}


// =====================================
// GUARDAR CONFIGURACIÓN
// =====================================

async function guardarConfiguracion() {

    try {

        const configuracion = {

            temperatura_min:
                parseFloat(
                    document.getElementById("tempMin").value
                ),

            temperatura_max:
                parseFloat(
                    document.getElementById("tempMax").value
                ),

            humedad_min:
                parseFloat(
                    document.getElementById("humMin").value
                ),

            humedad_max:
                parseFloat(
                    document.getElementById("humMax").value
                ),

            tiempo_lectura:
                parseInt(
                    document.getElementById("intervalo").value
                )

        };

        const response = await fetch(

            "http://localhost:3000/api/iot/configuracion/ESP32_001",

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(configuracion)

            }

        );

        const data = await response.json();

        alert(data.mensaje);

    }
    catch(error){

        console.log(error);

        alert("Error guardando configuración");

    }

}


async function cargarAlarmas() {

    try {

        const response = await fetch(
            "http://localhost:3000/api/iot/latest"
        );

        const data = await response.json();

        let alarmas = [];

        const temperatura = parseFloat(data.temperatura);
        const humedad = parseFloat(data.humedad);

        if (temperatura > 39) {
            alarmas.push(
                "🔥 Temperatura crítica: " +
                temperatura + "°C"
            );
        }

        if (temperatura < 36) {
            alarmas.push(
                "❄ Temperatura baja: " +
                temperatura + "°C"
            );
        }

        if (humedad < 50) {
            alarmas.push(
                "💧 Humedad baja: " +
                humedad + "%"
            );
        }

        if (humedad > 75) {
            alarmas.push(
                "💦 Humedad alta: " +
                humedad + "%"
            );
        }

        const contenedor =
            document.getElementById(
                "listaAlarmas"
            );

        contenedor.innerHTML = "";

        if (alarmas.length === 0) {

            contenedor.innerHTML =
                `
                <div class="alarm">
                    ✅ No hay alarmas activas
                </div>
                `;

            return;
        }

        alarmas.forEach(alarm => {

            contenedor.innerHTML +=
                `
                <div class="alarm critical">
                    ${alarm}
                </div>
                `;

        });

    }
    catch(error) {

        console.log(error);

    }
}

cargarDatosDashboard();

cargarGraficas();

setInterval(() => {
    cargarDatosDashboard();
    cargarGraficas();
}, 5000);

cargarEstadoDispositivos();

setInterval(
    cargarEstadoDispositivos,
    3000
);

cargarAlarmas();

setInterval(
    cargarAlarmas,
    5000
);

cargarEventos();

setInterval(
    cargarEventos,
    5000
);

cargarConfiguracion();