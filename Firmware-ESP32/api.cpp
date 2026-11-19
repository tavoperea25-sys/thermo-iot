#include "api.h"

#include <ArduinoJson.h>

#include "config.h"
#include "http_client.h"
#include "estado.h"

String urlBase() {

    return "http://" + String(SERVER_IP) + ":" + String(SERVER_PORT);

}

void enviarLectura(float temperatura, float humedad) {

    if (isnan(temperatura) || isnan(humedad)) {

        Serial.println("Lectura inválida del sensor, no se envía.");
        return;

    }

    String url = urlBase() + "/api/iot/sensor";

    DynamicJsonDocument doc(256);
    doc["esp32_id"] = esp32_id;
    doc["temperatura"] = temperatura;
    doc["humedad"] = humedad;

    String json;
    serializeJson(doc, json);

    int codigo = httpPOST(url, json);

    Serial.print("Sensor enviado -> ");
    Serial.println(codigo);

}

void consultarConfiguracion() {

    String url = urlBase() + "/api/iot/configuracion/" + esp32_id;

    String respuesta = httpGET(url);

    if (respuesta == "") return;

    DynamicJsonDocument doc(512);

    DeserializationError error = deserializeJson(doc, respuesta);

    if (error) {

        Serial.println("Error interpretando configuración.");
        return;

    }

    if (doc.containsKey("temperatura_min")) temperaturaMin = doc["temperatura_min"];
    if (doc.containsKey("temperatura_max")) temperaturaMax = doc["temperatura_max"];
    if (doc.containsKey("humedad_min")) humedadMin = doc["humedad_min"];
    if (doc.containsKey("humedad_max")) humedadMax = doc["humedad_max"];
    if (doc.containsKey("tiempo_lectura")) intervaloLectura = doc["tiempo_lectura"];

    Serial.println(respuesta);
    Serial.println("Configuración actualizada");
    Serial.print("Temp Min: "); Serial.println(temperaturaMin);
    Serial.print("Temp Max: "); Serial.println(temperaturaMax);
    Serial.print("Hum Min: "); Serial.println(humedadMin);
    Serial.print("Hum Max: "); Serial.println(humedadMax);
    Serial.print("Intervalo: "); Serial.println(intervaloLectura);

}

void consultarComando() {

    String url = urlBase() + "/api/iot/command/" + esp32_id;

    String respuesta = httpGET(url);

    if (respuesta == "") return;

    DynamicJsonDocument doc(512);

    DeserializationError error = deserializeJson(doc, respuesta);

    if (error) return;

    int idComando = doc["id"] | 0;

    if (idComando == 0) return;

    String comando = doc["comando"] | "";
    String valor = doc["valor"] | "";

    Serial.println(respuesta);

    if (comando == "calefactor") {

        estadoCalefactor = (valor == "ON");
        digitalWrite(LED_PIN, estadoCalefactor ? HIGH : LOW);
        registrarEvento(estadoCalefactor ? "Calefactor ENCENDIDO" : "Calefactor APAGADO");
        Serial.println(estadoCalefactor ? "Calefactor ENCENDIDO" : "Calefactor APAGADO");

    } else if (comando == "ventilador") {

        estadoVentilador = (valor == "ON");
        digitalWrite(FAN_PIN, estadoVentilador ? HIGH : LOW);
        registrarEvento(estadoVentilador ? "Ventilador ENCENDIDO" : "Ventilador APAGADO");
        Serial.println(estadoVentilador ? "Ventilador ENCENDIDO" : "Ventilador APAGADO");

    } else if (comando == "modo") {

        modoAutomatico = (valor == "AUTO_ON");
        registrarEvento(modoAutomatico ? "Modo AUTOMATICO activado" : "Modo MANUAL activado");
        Serial.println(modoAutomatico ? "Modo AUTOMATICO activado" : "Modo MANUAL activado");

    }

    // Se marca como ejecutado siempre, incluso si el comando no se
    // reconoció — así nunca se queda atascada la cola.

    marcarComandoEjecutado(idComando);

}

void marcarComandoEjecutado(int idComando) {

    String url = urlBase() + "/api/iot/command/" + String(idComando) + "/ejecutado";

    int codigo = httpPUT(url);

    Serial.print("Comando marcado como ejecutado -> ");
    Serial.println(codigo);

}

void registrarEvento(String texto) {

    String url = urlBase() + "/api/iot/evento";

    DynamicJsonDocument doc(256);
    doc["esp32_id"] = esp32_id;
    doc["evento"] = texto;

    String json;
    serializeJson(doc, json);

    httpPOST(url, json);

}

void enviarHeartbeat() {

    String url = urlBase() + "/api/iot/heartbeat";

    DynamicJsonDocument doc(128);
    doc["esp32_id"] = esp32_id;

    String json;
    serializeJson(doc, json);

    httpPOST(url, json);

}
