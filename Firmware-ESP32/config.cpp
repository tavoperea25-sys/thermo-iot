#include "config.h"
#include "config_secrets.h"

const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;

String esp32_id = DEVICE_ID;
const char* deviceApiKey = DEVICE_API_KEY;

const char* SERVER_IP = SERVER_IP_ADDR;
const int SERVER_PORT = SERVER_PORT_NUM;


float temperaturaMin = 36.8;
float temperaturaMax = 37.8;

float humedadMin = 50;
float humedadMax = 70;

int intervaloLectura = 3000;
