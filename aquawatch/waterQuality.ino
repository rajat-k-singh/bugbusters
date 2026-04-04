#define BLYNK_PRINT Serial
#define BLYNK_TEMPLATE_ID "TMPL3rCaiW6dt"
#define BLYNK_TEMPLATE_NAME "IOT Project"
#define BLYNK_AUTH_TOKEN "PloBVZAJuXX3topbpdp0ccvqB6Zn8OWr"

#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <OneWire.h>
#include <DallasTemperature.h>

char auth[] = BLYNK_AUTH_TOKEN;

char ssid[] = "projectwifi";
char pass[] = "source.pyc";

BlynkTimer timer;

// ---------- SENSOR PINS ----------
#define BUZZER 25
#define TDS_PIN 32          //ADC PIN
 
#define SOIL_PIN 34       // ADC PIN
	
#define TURBIDITY_PIN 33      //  SAFE ADC
#define ONE_WIRE_BUS 4        // SAFE 


// ---------- DS18B20 ----------
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ---------- VARIABLES ----------
float temperature = 0;
int tdsValue = 0;
int turbidityValue = 0;
int soilRaw = 0;
int soilPercent = 0;

bool buzzerState = false;

unsigned long buzzerMillis = 0;
const int buzzerInterval = 300;

// ---------- SENSOR + BLYNK TASK ----------
void sensorAndUploadTask()
{
  Serial.println("----- SENSOR UPDATE -----");

  // Read Sensors
  tdsValue = analogRead(TDS_PIN);
  turbidityValue = analogRead(TURBIDITY_PIN);
  soilRaw = analogRead(SOIL_PIN);

  // Convert Soil to Percentage
  soilPercent = map(soilRaw, 4095, 1500, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);

  // Temperature with error checking
  sensors.requestTemperatures();
  temperature = sensors.getTempCByIndex(0);
  
  // Check for invalid temperature
  if (temperature == -127.00 || temperature == 85.00) {
    temperature = 0;  // or handle appropriately
    Serial.println("Temperature sensor error!");
  }

  // Serial Print
  Serial.print("TDS: "); Serial.println(tdsValue);
  Serial.print("Turbidity: "); Serial.println(turbidityValue);
  Serial.print("Temperature: "); Serial.println(temperature);
  Serial.print("Soil Raw: "); Serial.println(soilRaw);
  Serial.print("Soil %: "); Serial.println(soilPercent);

  // Buzzer condition
  if (tdsValue > 1500 || turbidityValue > 2000 || soilPercent < 20)
    buzzerState = true;
  else
    buzzerState = false;

  // Upload
  if (Blynk.connected())
  {
    Blynk.virtualWrite(V0, temperature);
    Blynk.virtualWrite(V1, turbidityValue);
    Blynk.virtualWrite(V2, tdsValue);
    Blynk.virtualWrite(V3, soilPercent);
  }

  Serial.println("--------------------------\n");
}
// ---------- BUZZER ----------
void buzzerTask()
{
  if (!buzzerState)
  {
    digitalWrite(BUZZER, LOW);
    return;
  }

  if (millis() - buzzerMillis > buzzerInterval)
  {
    buzzerMillis = millis();
    digitalWrite(BUZZER, !digitalRead(BUZZER));
  }
}

// ---------- SETUP ----------
void setup()
{
  Serial.begin(115200);

  pinMode(BUZZER, OUTPUT);

  sensors.begin();

 WiFi.begin(ssid, pass);

Serial.print("Connecting WiFi");
while (WiFi.status() != WL_CONNECTED)
{
  delay(500);
  Serial.print(".");
}
Serial.println("\nWiFi Connected!");
Serial.println(WiFi.localIP());
  Blynk.begin(auth, ssid, pass);

  timer.setInterval(2000L, sensorAndUploadTask);
}

// ---------- LOOP ----------
void loop()
{
  if (!Blynk.connected()) {
    if (WiFi.status() == WL_CONNECTED) {
      Blynk.connect();
    } else {
      WiFi.reconnect();
    }
  }
  
  Blynk.run();
  timer.run();
  buzzerTask();
}