#ifndef API_H
#define API_H

#include <Arduino.h>

void enviarLectura(float temperatura, float humedad);

void consultarConfiguracion();

void consultarComando();

void marcarComandoEjecutado(int idComando);

void registrarEvento(String texto);

void enviarHeartbeat();

String urlBase();

#endif
