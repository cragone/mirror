#ifndef HELPERS_H
#define HELPERS_H

#include <ArduinoJson.h>

struct lightSwitchResult {
  bool success;
  bool error;
};

lightSwitchResult lightSwitch(uint8_t* payload, size_t length) {
  Serial.println("[lights] flipping light switch");

  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, payload, length);

  if (err) {
    Serial.println("parse failed");
    return {false, true};
  }

  const char* light = doc["light"];
  if (light == nullptr) {
    return {false, true};
  }

  if (strcmp(light, "on") == 0) {
    Serial.println("[lights] flipping ON");
    return {true, false};
  }

  Serial.println("[lights] flipping OFF");
  return {false, false};
}

#endif
