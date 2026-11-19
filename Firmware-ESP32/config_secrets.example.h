#ifndef CONFIG_SECRETS_H
#define CONFIG_SECRETS_H

//====================================
// CREDENCIALES REALES DEL PROYECTO
// Este archivo NO debe subirse a git.
//====================================

#define WIFI_SSID "tu_red_wifi"
#define WIFI_PASSWORD "tu_password_wifi"

#define DEVICE_ID "ESP32_001"

// Debe coincidir EXACTAMENTE con DEVICE_API_KEY en el .env del backend.
#define DEVICE_API_KEY "genera-una-llave-larga-y-unica"

#define SERVER_IP_ADDR "192.168.1.100"
#define SERVER_PORT_NUM 3000

#endif
