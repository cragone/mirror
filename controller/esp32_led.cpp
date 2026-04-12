#include <WiFi.h>
#include <WebSocketsClient.h>
#include <helpers.h>

#define LED_PIN 33

const char* ssid = "";
const char* password = "";

WebSocketsClient ws;

void onEvent(WStype_t type, uint8_t* payload, size_t length){
  switch(type) {
    case WStype_CONNECTED:
      Serial.println("WS connected!");
      break;
    case WStype_TEXT: {
      Serial.println("Got: " + String((char*) payload));
      lightSwitchResult r = lightSwitch(payload, length);
      if (r.error){
        Serial.println("[error] light switch failed");
      }
      if (r.success) {
        digitalWrite(LED_PIN, HIGH);
      } else {
        digitalWrite(LED_PIN, LOW);
      }
      break;
    }
    case WStype_DISCONNECTED:
      Serial.println("WS Disconnected");
      break;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());  // e.g. 192.168.1.105
  ws.begin("192.168.1.43", 8000, "/ws");
  ws.onEvent(onEvent);
  ws.setReconnectInterval(3000);
}

void loop() {
  ws.loop();
}
