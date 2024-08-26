#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHTPIN 4      // Пін підключення DHT22
#define DHTTYPE DHT22 // Тип датчика DHT22
#define WIND_SPEED_PIN 34
#define WIND_DIRECTION_PIN 35
#define BATTERY_PIN 36
#define REB_PIN 2

const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* serverUrl = "http://192.168.0.175:5000/api/Stats/updateByDroneIdAndStatsType/e986e16b-dfa0-48be-8ed7-1cba583b9bac";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  pinMode(REB_PIN, INPUT_PULLUP);

  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println(" Connected to WiFi");
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  float windSpeed = analogRead(WIND_SPEED_PIN) / 4095.0 * 100; // Примірне значення
  int windDirection = analogRead(WIND_DIRECTION_PIN); 
  float batteryLevel = analogRead(BATTERY_PIN) / 4095.0 * 100; // Примірне значення
  bool rebPresence = !digitalRead(REB_PIN);

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  sendSensorData("Temperature", String(temperature));
  sendSensorData("Humidity", String(humidity));
  sendSensorData("WindSpeed", String(windSpeed));
  sendSensorData("WindDirection", String(windDirection));
  sendSensorData("BatteryLevel", String(batteryLevel));
  sendSensorData("REBPresence", String(rebPresence));

  delay(60000); // Відправка даних кожні 60 секунд
}

void sendSensorData(const String& statsType, const String& statsInformation) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{";
    payload += "\"StatsType\":\"" + statsType + "\",";
    payload += "\"StatsInformation\":\"" + statsInformation + "\"";
    payload += "}";

    Serial.print("Sending data: ");
    Serial.println(payload);

    int httpResponseCode = http.PUT(payload);
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.print("Error on sending PUT: ");
      Serial.println(httpResponseCode);
      Serial.print("Error message: ");
      Serial.println(http.errorToString(httpResponseCode));
    }
    http.end();
  } else {
    Serial.println("WiFi not connected");
  }
}