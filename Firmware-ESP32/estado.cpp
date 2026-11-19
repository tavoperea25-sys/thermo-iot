#include "estado.h"
#include "config.h"

bool estadoCalefactor = false;
bool estadoVentilador = false;
bool modoAutomatico = false;
bool ultimoModoAutomatico = false;

void inicializarEstado() {

    pinMode(LED_PIN, OUTPUT);
    pinMode(FAN_PIN, OUTPUT);

    digitalWrite(LED_PIN, LOW);
    digitalWrite(FAN_PIN, LOW);

    estadoCalefactor = false;
    estadoVentilador = false;

}
