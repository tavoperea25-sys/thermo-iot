#include "automatico.h"

#include "config.h"
#include "estado.h"
#include "api.h"

// Margen de histéresis: evita que el actuador prenda/apague de
// forma intermitente cuando la lectura está justo en el límite.

#define MARGEN_HISTERESIS 0.5

void controlAutomatico(float temperatura, float humedad) {

    // --- Calefactor ---

    if (temperatura < temperaturaMin && !estadoCalefactor) {

        estadoCalefactor = true;
        digitalWrite(LED_PIN, HIGH);
        registrarEvento("AUTO -> Calefactor ENCENDIDO");

    } else if (temperatura > (temperaturaMin + MARGEN_HISTERESIS) &&
               temperatura < temperaturaMax &&
               estadoCalefactor) {

        estadoCalefactor = false;
        digitalWrite(LED_PIN, LOW);
        registrarEvento("AUTO -> Calefactor APAGADO");

    } else if (temperatura >= temperaturaMax && estadoCalefactor) {

        estadoCalefactor = false;
        digitalWrite(LED_PIN, LOW);
        registrarEvento("AUTO -> Calefactor APAGADO");

    }

    // --- Ventilador ---

    if (humedad > humedadMax && !estadoVentilador) {

        estadoVentilador = true;
        digitalWrite(FAN_PIN, HIGH);
        registrarEvento("AUTO -> Ventilador ENCENDIDO");

    } else if (humedad < (humedadMax - MARGEN_HISTERESIS) &&
               humedad > humedadMin &&
               estadoVentilador) {

        estadoVentilador = false;
        digitalWrite(FAN_PIN, LOW);
        registrarEvento("AUTO -> Ventilador APAGADO");

    } else if (humedad <= humedadMin && estadoVentilador) {

        estadoVentilador = false;
        digitalWrite(FAN_PIN, LOW);
        registrarEvento("AUTO -> Ventilador APAGADO");

    }

}
