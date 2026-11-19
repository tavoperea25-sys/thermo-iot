#include "http_client.h"

#include <WiFi.h>
#include <HTTPClient.h>

#include "config.h"

String httpGET(String url)
{
    if (WiFi.status() != WL_CONNECTED)
        return "";

    HTTPClient http;

    http.begin(url);

    http.addHeader("X-Device-Key", deviceApiKey);

    int code = http.GET();

    String respuesta = "";

    if (code == 200)
        respuesta = http.getString();

    http.end();

    return respuesta;
}

int httpPOST(String url, String json)
{
    if (WiFi.status() != WL_CONNECTED)
        return -1;

    HTTPClient http;

    http.begin(url);

    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Key", deviceApiKey);

    int codigo = http.POST(json);

    http.end();

    return codigo;
}

int httpPUT(String url)
{
    if (WiFi.status() != WL_CONNECTED)
        return -1;

    HTTPClient http;

    http.begin(url);

    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Key", deviceApiKey);

    int codigo = http.PUT("");

    http.end();

    return codigo;
}
