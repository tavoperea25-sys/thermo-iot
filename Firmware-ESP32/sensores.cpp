#include "sensores.h"

#include <DHT.h>

#include "config.h"

DHT dht(DHTPIN, DHTTYPE);

void inicializarSensor() {

    dht.begin();

}

float leerTemperatura() {

    return dht.readTemperature();

}

float leerHumedad() {

    return dht.readHumidity();

}
