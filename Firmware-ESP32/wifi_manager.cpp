#include "wifi_manager.h"

#include <WiFi.h>

#include "config.h"

#define TIMEOUT_WIFI_INICIAL 15000
#define INTERVALO_PARPADEO_WIFI 300

unsigned long ultimaVerificacionWiFi = 0;
const unsigned long INTERVALO_VERIFICACION_WIFI = 5000;

void conectarWiFi() {

    pinMode(LED_PIN, OUTPUT);

    Serial.println();
    Serial.print("Conectando a WiFi: ");
    Serial.println(ssid);

    WiFi.begin(ssid, password);

    unsigned long inicio = millis();
    bool estadoLed = false;
    unsigned long ultimoParpadeo = 0;

    while (WiFi.status() != WL_CONNECTED &&
           millis() - inicio < TIMEOUT_WIFI_INICIAL) {

        if (millis() - ultimoParpadeo >= INTERVALO_PARPADEO_WIFI) {

            estadoLed = !estadoLed;
            digitalWrite(LED_PIN, estadoLed);
            ultimoParpadeo = millis();

            Serial.print(".");

        }

    }

    digitalWrite(LED_PIN, LOW);

    if (WiFi.status() == WL_CONNECTED) {

        Serial.println();
        Serial.print("WiFi conectado. IP: ");
        Serial.println(WiFi.localIP());

    } else {

        Serial.println();
        Serial.println("No se logró conectar en el tiempo esperado.");
        Serial.println("Se seguirá reintentando en segundo plano.");

    }

}

void verificarConexion() {

    if (millis() - ultimaVerificacionWiFi < INTERVALO_VERIFICACION_WIFI) {
        return;
    }

    ultimaVerificacionWiFi = millis();

    if (WiFi.status() != WL_CONNECTED) {

        Serial.println("WiFi desconectado. Reintentando...");
        WiFi.disconnect();
        WiFi.begin(ssid, password);

    }

}
