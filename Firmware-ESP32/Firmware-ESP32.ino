#include "config.h"
#include "wifi_manager.h"
#include "sensores.h"
#include "http_client.h"
#include "api.h"
#include "automatico.h"
#include "estado.h"
#include "heartbeat.h"
#include "incubadora.h"
#include "pantalla.h"

void setup() {

    Serial.begin(115200);

    inicializarSensor();
    inicializarPantalla();

    conectarWiFi();

    inicializarEstado();

}

void loop() {

    actualizarIncubadora();

}
