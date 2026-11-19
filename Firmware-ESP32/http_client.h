#ifndef HTTP_CLIENT_H
#define HTTP_CLIENT_H

#include <Arduino.h>

String httpGET(String url);

int httpPOST(String url, String json);

int httpPUT(String url);

#endif
