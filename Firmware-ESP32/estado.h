#ifndef ESTADO_H
#define ESTADO_H

#include <Arduino.h>

extern bool estadoCalefactor;
extern bool estadoVentilador;
extern bool modoAutomatico;
extern bool ultimoModoAutomatico;

void inicializarEstado();

#endif
