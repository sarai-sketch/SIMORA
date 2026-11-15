// ESP32: experimental field rover. Does not control motors without safety mechanisms.
// Telemetry starting point only; no autonomous driving or movement is implemented.
void setup(){Serial.begin(115200);Serial.println("SIMORA field rover: safe mode, no actuators enabled");}
void loop(){delay(1000);}
