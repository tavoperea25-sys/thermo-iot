#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

extern const char* ssid;
extern const char* password;

extern String esp32_id;
extern const char* deviceApiKey;

extern const char* SERVER_IP;
extern const int SERVER_PORT;

extern float temperaturaMin;
extern float temperaturaMax;

extern float humedadMin;
extern float humedadMax;

extern int intervaloLectura;

// Pines de hardware

#define DHTPIN 15
#define DHTTYPE DHT22

#define LED_PIN 2    // Calefactor
#define FAN_PIN 4    // Ventilador

// Display GMT130 (ST7789) — SCLK y MOSI usan los pines SPI por
// defecto del ESP32 (18 y 23), no hace falta declararlos aparte.
#define TFT_RST 16
#define TFT_DC  17

#endif
