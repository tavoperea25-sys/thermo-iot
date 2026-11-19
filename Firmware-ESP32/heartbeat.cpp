#include "heartbeat.h"
#include "api.h"

#define INTERVALO_HEARTBEAT 10000

unsigned long ultimoHeartbeat = 0;

void actualizarHeartbeat() {

    if (millis() - ultimoHeartbeat < INTERVALO_HEARTBEAT) return;

    ultimoHeartbeat = millis();

    enviarHeartbeat();

}
