#ifndef PANTALLA_H
#define PANTALLA_H

void inicializarPantalla();

// Se llama cada vez que hay una lectura nueva del sensor — muestra
// temperatura, humedad, el modo (Manual/Automático) y si el
// calefactor/ventilador están encendidos ahora mismo.

void actualizarPantalla(float temperatura, float humedad);

#endif
