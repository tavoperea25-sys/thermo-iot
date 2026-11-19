#include "incubadora.h"

#include "config.h"
#include "wifi_manager.h"
#include "sensores.h"
#include "api.h"
#include "automatico.h"
#include "estado.h"
#include "heartbeat.h"
#include "pantalla.h"

unsigned long ultimaLectura = 0;
unsigned long ultimaConsultaComando = 0;
unsigned long ultimaConsultaConfig = 0;

#define INTERVALO_CONSULTA_COMANDO 2000
#define INTERVALO_CONSULTA_CONFIG 5000

void actualizarIncubadora() {

    verificarConexion();

    // --- Lectura periódica del sensor ---

    if (millis() - ultimaLectura >= (unsigned long) intervaloLectura) {

        ultimaLectura = millis();

        float temperatura = leerTemperatura();
        float humedad = leerHumedad();

        if (!isnan(temperatura) && !isnan(humedad)) {

            Serial.print("Temperatura: ");
            Serial.print(temperatura);
            Serial.println(" °C");

            Serial.print("Humedad: ");
            Serial.print(humedad);
            Serial.println(" %");

            enviarLectura(temperatura, humedad);

            actualizarPantalla(temperatura, humedad);

            if (modoAutomatico) {

                controlAutomatico(temperatura, humedad);

            }

        } else {

            Serial.println("Error leyendo el sensor DHT22.");

        }

    }

    // --- Consultar comandos pendientes (más seguido) ---

    if (millis() - ultimaConsultaComando >= INTERVALO_CONSULTA_COMANDO) {

        ultimaConsultaComando = millis();
        consultarComando();

    }

    // --- Consultar configuración vigente (menos seguido) ---

    if (millis() - ultimaConsultaConfig >= INTERVALO_CONSULTA_CONFIG) {

        ultimaConsultaConfig = millis();
        consultarConfiguracion();

    }

    actualizarHeartbeat();

}
