#include "pantalla.h"

#include <Adafruit_GFX.h>
#include <Adafruit_ST7789.h>
#include <SPI.h>

#include "config.h"
#include "estado.h"

// -1 en el primer parámetro le dice a la librería que no hay pin CS
// físico que controlar — así es este display en particular (7 pines,
// sin CS). SCLK y MOSI se toman de los pines SPI por defecto del
// ESP32 (18 y 23) de forma automática.

Adafruit_ST7789 tft = Adafruit_ST7789(-1, TFT_DC, TFT_RST);

void inicializarPantalla() {

    tft.init(240, 240, SPI_MODE3);
    tft.setRotation(2);
    tft.invertDisplay(true);
    tft.fillScreen(ST77XX_BLACK);

    tft.setTextSize(2);
    tft.setTextColor(ST77XX_YELLOW);
    tft.setCursor(10, 10);
    tft.println("Thermo-IoT");

    tft.setTextSize(1);
    tft.setTextColor(ST77XX_WHITE);
    tft.setCursor(10, 35);
    tft.println("Esperando primera lectura...");

}

void actualizarPantalla(float temperatura, float humedad) {

    tft.fillScreen(ST77XX_BLACK);

    tft.setTextSize(2);
    tft.setTextColor(ST77XX_YELLOW);
    tft.setCursor(10, 10);
    tft.println("Thermo-IoT");

    tft.setTextSize(3);
    tft.setTextColor(ST77XX_WHITE);

    tft.setCursor(10, 50);
    tft.print(temperatura, 1);
    tft.println(" C");

    tft.setCursor(10, 90);
    tft.print(humedad, 1);
    tft.println(" %");

    tft.setTextSize(2);

    tft.setCursor(10, 140);
    tft.setTextColor(modoAutomatico ? ST77XX_CYAN : ST77XX_YELLOW);
    tft.println(modoAutomatico ? "Modo: AUTO" : "Modo: MANUAL");

    tft.setCursor(10, 170);
    tft.setTextColor(estadoCalefactor ? ST77XX_RED : ST77XX_WHITE);
    tft.print("Calefactor: ");
    tft.println(estadoCalefactor ? "ON" : "OFF");

    tft.setCursor(10, 200);
    tft.setTextColor(estadoVentilador ? ST77XX_GREEN : ST77XX_WHITE);
    tft.print("Ventilador: ");
    tft.println(estadoVentilador ? "ON" : "OFF");

}
