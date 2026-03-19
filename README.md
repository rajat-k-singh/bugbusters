# 💧 AquaWatch IoT — Water Quality Monitoring System 

AquaWatch is a real-time IoT-based water quality monitoring system that collects, analyzes, and visualizes key environmental parameters such as Moisture, Turbidity, Temperature, and TDS using a modern web dashboard.

---

## 🚀 Features

- 📊 Real-time sensor monitoring (5s interval)
- 🌡️ Multi-parameter tracking:
  - Moisture (%)
  - Turbidity (NTU)
  - Temperature (°C)
  - TDS (ppm)
- ⚠️ Smart alerts & threshold detection
- 📈 Historical data visualization (24h / 7d / 30d)
- 🧠 AI-based anomaly detection (configurable)
- 📡 IoT integration with NodeMCU ESP8266
- ☁️ Cloud connectivity via Blynk IoT
- 📱 Responsive dashboard UI

---

## 🏗️ System Architecture

The system follows a **4-layer IoT architecture**:

1. **Sensing Layer**
   - FC-28 Moisture Sensor
   - Turbidity Sensor
   - DS18B20 Temperature Sensor
   - TDS Sensor

2. **Processing Layer**
   - NodeMCU ESP8266
   - Arduino Firmware (C++)

3. **Network & Cloud Layer**
   - WiFi (802.11)
   - Blynk IoT Cloud
   - MQTT / HTTP Protocol

4. **Application Layer**
   - Web Dashboard (HTML, CSS, JavaScript)
   - Mobile Monitoring
   - Alerts & Notifications

---

## 🖥️ Project Structure


