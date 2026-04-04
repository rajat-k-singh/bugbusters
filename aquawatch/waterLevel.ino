#define BLYNK_PRINT Serial
#define BLYNK_TEMPLATE_ID "TMPL3NTazi8KB"
#define BLYNK_TEMPLATE_NAME "WaterLevel"
#define BLYNK_AUTH_TOKEN "tqPLm4Sjmlzux56RfBZNZXlGqeIuJhxY"

#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>

char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "projectwifi";
char pass[] = "source.pyc";

BlynkTimer timer;

// ================= PINS =================
#define TRIGGER D1
#define ECHO D2

#define LED_LOW D5
#define LED_MED D6
#define LED_HIGH D7

#define TDS_PIN A0
#define STATUS_LED LED_BUILTIN

// ================= SETTINGS =================
#define TANK_HEIGHT 30.0
#define LOW_THRESHOLD 0.66
#define MID_THRESHOLD 0.33

// ================= VARIABLES =================
float distance = 0;
float tdsValue = 0;
unsigned long lastSensorRead = 0;
const int sensorInterval = 2000;

// ================= WIFI CONNECT =================
void connectWiFi() {
  Serial.print("Connecting to WiFi");

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(500);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Failed!");
    Serial.println("Please check:");
    Serial.println("1. SSID name: 'projectwifi'");
    Serial.println("2. Password: 'source.pyc'");
    Serial.println("3. Router is powered on and within range");
  }
}

// ================= TDS =================
float readTDS() {
  int raw = 0;

  for (int i = 0; i < 10; i++) {
    raw += analogRead(TDS_PIN);
    delay(10);
  }

  raw /= 10;
  float voltage = raw * (3.3 / 1024.0);
  float tds = voltage * 500.0;

  if (tds < 0) tds = 0;
  if (tds > 3000) tds = 3000;

  return tds;
}

// ================= ULTRASONIC (FIXED FOR ESP8266) =================
float readUltrasonic() {
  // Send trigger pulse
  digitalWrite(TRIGGER, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIGGER, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIGGER, LOW);

  // Wait for echo with timeout
  unsigned long timeout = 30000;  // 30ms timeout
  unsigned long startTime = micros();

  // Wait for echo to go HIGH
  while (digitalRead(ECHO) == LOW) {
    if (micros() - startTime > timeout) {
      Serial.println("❌ Echo timeout - no signal");
      return -1;
    }
  }

  // Measure HIGH pulse duration
  startTime = micros();
  while (digitalRead(ECHO) == HIGH) {
    if (micros() - startTime > timeout) {
      Serial.println("❌ Echo pulse too long");
      return -1;
    }
  }

  long duration = micros() - startTime;

  // Calculate distance (speed of sound = 340m/s = 0.034cm/μs)
  float dist = duration * 0.034 / 2;

  // Validate reading
  if (dist < 2 || dist > 400) {
    Serial.print("⚠️ Invalid distance: ");
    Serial.print(dist);
    Serial.println(" cm");
    return -1;
  }

  Serial.print("Duration: ");
  Serial.print(duration);
  Serial.print(" μs → Distance: ");
  Serial.print(dist);
  Serial.println(" cm");

  return dist;
}
 
// ================= MAIN SENSOR TASK =================
void sensorTask() {
  Serial.println("\n--- SENSOR UPDATE ---");

  // Read ultrasonic with retry
  int retryCount = 0;
  const int maxRetries = 3;
  float newDistance = -1;

  while (retryCount < maxRetries && newDistance <= 0) {
    newDistance = readUltrasonic();
    retryCount++;
    if (newDistance <= 0 && retryCount < maxRetries) {
      delay(200);
    }
  }

  if (newDistance > 0) {
    distance = newDistance;
    if (distance > TANK_HEIGHT) distance = TANK_HEIGHT;
  } else {
    Serial.println("⚠️ Using last good distance value");
  }

  // Read TDS
  tdsValue = readTDS();

  // Calculate water level
  float waterLevel = TANK_HEIGHT - distance;
  float percentage = (waterLevel / TANK_HEIGHT) * 100;
  if (percentage < 0) percentage = 0;
  if (percentage > 100) percentage = 100;

  // Control LEDs based on water level
  if (percentage < 33) {  // Low water
    digitalWrite(LED_LOW, HIGH);
    digitalWrite(LED_MED, LOW);
    digitalWrite(LED_HIGH, LOW);
    Serial.println("🔴 LOW WATER LEVEL");
  } else if (percentage < 66) {  // Medium water
    digitalWrite(LED_LOW, LOW);
    digitalWrite(LED_MED, HIGH);
    digitalWrite(LED_HIGH, LOW);
    Serial.println("🟡 MEDIUM WATER LEVEL");
  } else {  // High water
    digitalWrite(LED_LOW, LOW);
    digitalWrite(LED_MED, LOW);
    digitalWrite(LED_HIGH, HIGH);
    Serial.println("🟢 HIGH WATER LEVEL");
  }

  // Print readings
  Serial.print("Distance from top: ");
  Serial.print(distance);
  Serial.println(" cm");

  Serial.print("Water level: ");
  Serial.print(waterLevel);
  Serial.print(" cm (");
  Serial.print(percentage);
  Serial.println("%)");

  Serial.print("TDS: ");
  Serial.print(tdsValue);
  Serial.println(" ppm");

  // Send to Blynk if connected
  if (Blynk.connected()) {
    Blynk.virtualWrite(V0, tdsValue);
    Blynk.virtualWrite(V1, distance);
    Blynk.virtualWrite(V2, percentage);
    Serial.println("✓ Data sent to Blynk");
  } else {
    Serial.println("⚠️ Blynk not connected");
  }
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=================================");
  Serial.println("   WATER LEVEL MONITOR SYSTEM");
  Serial.println("=================================\n");

  // Initialize pins
  pinMode(TRIGGER, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LED_LOW, OUTPUT);
  pinMode(LED_MED, OUTPUT);
  pinMode(LED_HIGH, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  pinMode(TDS_PIN, INPUT);

  // Set initial states
  digitalWrite(TRIGGER, LOW);
  digitalWrite(STATUS_LED, HIGH);
  digitalWrite(LED_LOW, LOW);
  digitalWrite(LED_MED, LOW);
  digitalWrite(LED_HIGH, LOW);

  delay(1000);

 
  // Connect to WiFi
  connectWiFi();

  // Configure Blynk
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Connecting to Blynk...");

    Blynk.config(auth, "blynk.cloud", 80);  // ✅ server + port

    if (Blynk.connect(100000)) {  // wait 10 sec
      Serial.println("✅ Blynk CONNECTED");
    } else {
      Serial.println("❌ Blynk NOT CONNECTED");
    }
  } else {
    Serial.println("⚠️ Skipping Blynk - No WiFi");
  }

  // Set interval for sensor reading
  timer.setInterval(sensorInterval, sensorTask);

  Serial.println("\n✅ Setup Complete!");
  Serial.println("System is running...\n");
}

// ================= LOOP =================
void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    Blynk.run();
  }
  timer.run();

  // Blink status LED to show system is alive
  static unsigned long lastBlink = 0;
  if (millis() - lastBlink > 2000) {
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
    lastBlink = millis();
  }
}