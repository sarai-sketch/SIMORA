// ESP32 - starter firmware template; not a calibrated physical sensor.
// Configure Wi-Fi, the API endpoint and real sensors before field use.
#include <WiFi.h>
#include <HTTPClient.h>
const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_PASSWORD";
const char* API_URL = "http://192.168.1.100:8000/api/sensors/readings";
void setup(){Serial.begin(115200);WiFi.begin(WIFI_SSID,WIFI_PASS);}
void loop(){
  if(WiFi.status()==WL_CONNECTED){
    // SYNTHETIC VALUES: replace with ADC readings and calibrated sensor values
    float temperature_c=18.5;
    float moisture_pct=35.0;
    HTTPClient http;http.begin(API_URL);http.addHeader("Content-Type","application/json");
    String payload=String("{\"device_id\":\"sensor-stake-demo\",\"temperature_c\":")+String(temperature_c)+String(",\"moisture_pct\":")+String(moisture_pct)+String("}");
    int code=http.POST(payload);Serial.printf("HTTP %d\n",code);http.end();
  }
  delay(60000);
}
