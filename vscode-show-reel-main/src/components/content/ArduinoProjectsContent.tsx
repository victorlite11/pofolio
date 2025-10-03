import { ProjectData } from '../VSCodeLayout';
import { Zap, Thermometer, Camera, Cpu } from 'lucide-react';

interface ArduinoProjectsContentProps {
  onProjectClick: (project: ProjectData) => void;
}

export const ArduinoProjectsContent = ({ onProjectClick }: ArduinoProjectsContentProps) => {
  const arduinoProjects: ProjectData[] = [
    {
      id: '6',
      name: 'Smart Home Controller',
      description: 'ESP32-based home automation system with web interface',
      category: 'arduino',
      technologies: ['ESP32', 'C++', 'WiFi', 'MQTT', 'React Dashboard'],
      codeSnippet: `// Smart Home Controller - ESP32 Arduino Code
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <DHT.h>

// Pin definitions
#define DHT_PIN 2
#define DHT_TYPE DHT22
#define RELAY_1 4
#define RELAY_2 5
#define RELAY_3 6
#define RELAY_4 7
#define LED_PIN 13

// Network credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "192.168.1.100";

// Initialize components
DHT dht(DHT_PIN, DHT_TYPE);
WiFiClient espClient;
PubSubClient client(espClient);
WebServer server(80);

// Device state
struct DeviceState {
  bool relay1 = false;
  bool relay2 = false;
  bool relay3 = false;
  bool relay4 = false;
  float temperature = 0.0;
  float humidity = 0.0;
  unsigned long lastSensorRead = 0;
};

DeviceState deviceState;

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(RELAY_1, OUTPUT);
  pinMode(RELAY_2, OUTPUT);
  pinMode(RELAY_3, OUTPUT);
  pinMode(RELAY_4, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  }
  
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  digitalWrite(LED_PIN, HIGH);
  
  // Setup MQTT
  client.setServer(mqtt_server, 1883);
  client.setCallback(mqttCallback);
  
  // Setup web server routes
  server.on("/", handleRoot);
  server.on("/api/status", handleStatus);
  server.on("/api/control", HTTP_POST, handleControl);
  server.on("/api/sensors", handleSensors);
  server.begin();
  
  Serial.println("Smart Home Controller ready!");
}

void loop() {
  server.handleClient();
  
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
  
  // Read sensors every 30 seconds
  if (millis() - deviceState.lastSensorRead > 30000) {
    readSensors();
    publishSensorData();
    deviceState.lastSensorRead = millis();
  }
  
  delay(100);
}

void readSensors() {
  deviceState.temperature = dht.readTemperature();
  deviceState.humidity = dht.readHumidity();
  
  if (isnan(deviceState.temperature) || isnan(deviceState.humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  
  Serial.printf("Temperature: %.2f°C, Humidity: %.2f%%\\n", 
                deviceState.temperature, deviceState.humidity);
}

void handleRoot() {
  String html = R"(
<!DOCTYPE html>
<html>
<head>
    <title>Smart Home Controller</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial; margin: 20px; background: #f0f0f0; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
        .sensor { background: #e7f3ff; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .relay { background: #f0f8ff; padding: 10px; margin: 5px 0; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; }
        button { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        .on { background: #4CAF50; color: white; }
        .off { background: #f44336; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Smart Home Controller</h1>
        
        <div class="sensor">
            <h3>Environmental Sensors</h3>
            <p>Temperature: <span id="temperature">--</span>°C</p>
            <p>Humidity: <span id="humidity">--%</span></p>
        </div>
        
        <div class="relay">
            <span>Living Room Lights</span>
            <button id="relay1" onclick="toggleRelay(1)">OFF</button>
        </div>
        
        <div class="relay">
            <span>Kitchen Lights</span>
            <button id="relay2" onclick="toggleRelay(2)">OFF</button>
        </div>
        
        <div class="relay">
            <span>Bedroom Fan</span>
            <button id="relay3" onclick="toggleRelay(3)">OFF</button>
        </div>
        
        <div class="relay">
            <span>Garden Sprinkler</span>
            <button id="relay4" onclick="toggleRelay(4)">OFF</button>
        </div>
    </div>
    
    <script>
        function updateStatus() {
            fetch('/api/status')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('temperature').textContent = data.temperature.toFixed(1);
                    document.getElementById('humidity').textContent = data.humidity.toFixed(1);
                    
                    for (let i = 1; i <= 4; i++) {
                        const button = document.getElementById('relay' + i);
                        const state = data['relay' + i];
                        button.textContent = state ? 'ON' : 'OFF';
                        button.className = state ? 'on' : 'off';
                    }
                });
        }
        
        function toggleRelay(relay) {
            fetch('/api/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ relay: relay, action: 'toggle' })
            }).then(() => updateStatus());
        }
        
        setInterval(updateStatus, 5000);
        updateStatus();
    </script>
</body>
</html>
  )";
  server.send(200, "text/html", html);
}

void handleStatus() {
  DynamicJsonDocument doc(1024);
  doc["relay1"] = deviceState.relay1;
  doc["relay2"] = deviceState.relay2;
  doc["relay3"] = deviceState.relay3;
  doc["relay4"] = deviceState.relay4;
  doc["temperature"] = deviceState.temperature;
  doc["humidity"] = deviceState.humidity;
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleControl() {
  if (server.hasArg("plain")) {
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, server.arg("plain"));
    
    int relay = doc["relay"];
    String action = doc["action"];
    
    if (relay >= 1 && relay <= 4) {
      bool* relayState = nullptr;
      int relayPin = 0;
      
      switch (relay) {
        case 1: relayState = &deviceState.relay1; relayPin = RELAY_1; break;
        case 2: relayState = &deviceState.relay2; relayPin = RELAY_2; break;
        case 3: relayState = &deviceState.relay3; relayPin = RELAY_3; break;
        case 4: relayState = &deviceState.relay4; relayPin = RELAY_4; break;
      }
      
      if (action == "toggle") {
        *relayState = !(*relayState);
      } else if (action == "on") {
        *relayState = true;
      } else if (action == "off") {
        *relayState = false;
      }
      
      digitalWrite(relayPin, *relayState ? HIGH : LOW);
      
      // Publish MQTT update
      String topic = "smarthome/relay" + String(relay);
      client.publish(topic.c_str(), *relayState ? "ON" : "OFF");
    }
  }
  
  server.send(200, "application/json", "{\\"status\\":\\"success\\"}");
}

void handleSensors() {
  DynamicJsonDocument doc(512);
  doc["temperature"] = deviceState.temperature;
  doc["humidity"] = deviceState.humidity;
  doc["timestamp"] = millis();
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.printf("MQTT message received [%s]: %s\\n", topic, message.c_str());
  
  // Handle remote commands
  if (String(topic).startsWith("smarthome/cmd/")) {
    // Parse and execute commands
  }
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("SmartHomeController")) {
      Serial.println("connected");
      client.subscribe("smarthome/cmd/+");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void publishSensorData() {
  if (client.connected()) {
    client.publish("smarthome/temperature", String(deviceState.temperature).c_str());
    client.publish("smarthome/humidity", String(deviceState.humidity).c_str());
  }
}`
    },
    {
      id: '7',
      name: 'Weather Station',
      description: 'Multi-sensor environmental monitoring with LCD display',
      category: 'arduino',
      technologies: ['Arduino Uno', 'DHT22', 'BMP180', 'LCD', 'SD Card'],
      codeSnippet: `// Weather Station - Arduino Code
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SFE_BMP180.h>
#include <SD.h>
#include <SPI.h>
#include <RTClib.h>

// Pin definitions
#define DHT_PIN 2
#define DHT_TYPE DHT22
#define SD_CS_PIN 10
#define LIGHT_SENSOR_PIN A0
#define RAIN_SENSOR_PIN A1

// Initialize components
DHT dht(DHT_PIN, DHT_TYPE);
LiquidCrystal_I2C lcd(0x27, 20, 4);
SFE_BMP180 pressure;
RTC_DS3231 rtc;

// Data structure
struct WeatherData {
  float temperature;
  float humidity;
  float pressure_hPa;
  float altitude;
  int lightLevel;
  int rainLevel;
  String timestamp;
};

WeatherData currentData;
unsigned long lastReading = 0;
unsigned long lastLog = 0;
const unsigned long READING_INTERVAL = 2000;  // 2 seconds
const unsigned long LOG_INTERVAL = 300000;    // 5 minutes

void setup() {
  Serial.begin(9600);
  
  // Initialize components
  dht.begin();
  lcd.init();
  lcd.backlight();
  
  // Initialize pressure sensor
  if (pressure.begin()) {
    Serial.println("BMP180 init success");
  } else {
    Serial.println("BMP180 init fail");
  }
  
  // Initialize RTC
  if (!rtc.begin()) {
    Serial.println("Couldn't find RTC");
  }
  
  // Initialize SD card
  if (!SD.begin(SD_CS_PIN)) {
    Serial.println("SD Card initialization failed!");
    lcd.setCursor(0, 0);
    lcd.print("SD Card Error!");
    delay(2000);
  } else {
    Serial.println("SD Card initialized");
    
    // Create header in CSV file if it doesn't exist
    if (!SD.exists("weather.csv")) {
      File dataFile = SD.open("weather.csv", FILE_WRITE);
      if (dataFile) {
        dataFile.println("Timestamp,Temperature,Humidity,Pressure,Altitude,Light,Rain");
        dataFile.close();
      }
    }
  }
  
  // Display startup message
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Weather Station v1.0");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  delay(2000);
  
  Serial.println("Weather Station Ready!");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Read sensors at specified interval
  if (currentTime - lastReading >= READING_INTERVAL) {
    readSensors();
    updateDisplay();
    sendSerialData();
    lastReading = currentTime;
  }
  
  // Log data to SD card at specified interval
  if (currentTime - lastLog >= LOG_INTERVAL) {
    logDataToSD();
    lastLog = currentTime;
  }
  
  delay(100);
}

void readSensors() {
  // Read DHT22 sensor
  currentData.temperature = dht.readTemperature();
  currentData.humidity = dht.readHumidity();
  
  // Read BMP180 pressure sensor
  char status;
  double T, P, p0, a;
  
  status = pressure.startTemperature();
  if (status != 0) {
    delay(status);
    status = pressure.getTemperature(T);
    if (status != 0) {
      status = pressure.startPressure(3);
      if (status != 0) {
        delay(status);
        status = pressure.getPressure(P, T);
        if (status != 0) {
          currentData.pressure_hPa = P;
          
          // Calculate altitude (assuming sea level pressure = 1013.25 hPa)
          p0 = 1013.25;
          currentData.altitude = pressure.altitude(P, p0);
        }
      }
    }
  }
  
  // Read analog sensors
  currentData.lightLevel = analogRead(LIGHT_SENSOR_PIN);
  currentData.rainLevel = analogRead(RAIN_SENSOR_PIN);
  
  // Get timestamp
  DateTime now = rtc.now();
  currentData.timestamp = String(now.year()) + "/" + 
                         String(now.month()) + "/" + 
                         String(now.day()) + " " +
                         String(now.hour()) + ":" + 
                         String(now.minute()) + ":" + 
                         String(now.second());
}

void updateDisplay() {
  lcd.clear();
  
  // Line 1: Temperature and Humidity
  lcd.setCursor(0, 0);
  if (!isnan(currentData.temperature)) {
    lcd.print("T:");
    lcd.print(currentData.temperature, 1);
    lcd.print("C ");
  }
  if (!isnan(currentData.humidity)) {
    lcd.print("H:");
    lcd.print(currentData.humidity, 1);
    lcd.print("%");
  }
  
  // Line 2: Pressure
  lcd.setCursor(0, 1);
  lcd.print("P:");
  lcd.print(currentData.pressure_hPa, 1);
  lcd.print(" hPa");
  
  // Line 3: Light and Rain
  lcd.setCursor(0, 2);
  lcd.print("Light:");
  lcd.print(map(currentData.lightLevel, 0, 1023, 0, 100));
  lcd.print("% ");
  
  String rainStatus = currentData.rainLevel > 500 ? "Dry" : "Wet";
  lcd.print(rainStatus);
  
  // Line 4: Timestamp
  lcd.setCursor(0, 3);
  DateTime now = rtc.now();
  lcd.print(now.hour());
  lcd.print(":");
  if (now.minute() < 10) lcd.print("0");
  lcd.print(now.minute());
  lcd.print(" ");
  lcd.print(now.day());
  lcd.print("/");
  lcd.print(now.month());
}

void sendSerialData() {
  Serial.println("=== Weather Station Data ===");
  Serial.print("Timestamp: ");
  Serial.println(currentData.timestamp);
  Serial.print("Temperature: ");
  Serial.print(currentData.temperature);
  Serial.println(" °C");
  Serial.print("Humidity: ");
  Serial.print(currentData.humidity);
  Serial.println(" %");
  Serial.print("Pressure: ");
  Serial.print(currentData.pressure_hPa);
  Serial.println(" hPa");
  Serial.print("Altitude: ");
  Serial.print(currentData.altitude);
  Serial.println(" m");
  Serial.print("Light Level: ");
  Serial.print(map(currentData.lightLevel, 0, 1023, 0, 100));
  Serial.println(" %");
  Serial.print("Rain Status: ");
  Serial.println(currentData.rainLevel > 500 ? "Dry" : "Wet");
  Serial.println("============================");
}

void logDataToSD() {
  File dataFile = SD.open("weather.csv", FILE_WRITE);
  
  if (dataFile) {
    // Write CSV row
    dataFile.print(currentData.timestamp);
    dataFile.print(",");
    dataFile.print(currentData.temperature);
    dataFile.print(",");
    dataFile.print(currentData.humidity);
    dataFile.print(",");
    dataFile.print(currentData.pressure_hPa);
    dataFile.print(",");
    dataFile.print(currentData.altitude);
    dataFile.print(",");
    dataFile.print(currentData.lightLevel);
    dataFile.print(",");
    dataFile.println(currentData.rainLevel);
    
    dataFile.close();
    
    Serial.println("Data logged to SD card");
    
    // Brief indication on LCD
    lcd.setCursor(19, 3);
    lcd.print("*");
    delay(200);
    lcd.setCursor(19, 3);
    lcd.print(" ");
  } else {
    Serial.println("Error opening weather.csv");
  }
}

// Function to manually trigger data logging (can be called via serial command)
void manualLog() {
  logDataToSD();
  Serial.println("Manual log completed");
}

// Function to display historical data (reads from SD card)
void displayHistory() {
  File dataFile = SD.open("weather.csv");
  
  if (dataFile) {
    Serial.println("=== Weather History ===");
    while (dataFile.available()) {
      Serial.write(dataFile.read());
    }
    dataFile.close();
    Serial.println("========================");
  } else {
    Serial.println("Error opening weather.csv for reading");
  }
}`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="font-code">
        <span className="syntax-comment">// Arduino & IoT projects</span>
        <br />
        <br />
        <span className="syntax-keyword">#include</span> <span className="syntax-string">&lt;Arduino.h&gt;</span>
        <br />
        <br />
        <span className="syntax-keyword">const</span> <span className="syntax-variable">int</span> projects[] = {"{"}
        <br />
        {arduinoProjects.map((project, index) => (
          <span key={project.id}>
            <span className="ml-4">
              <span className="syntax-string">"{project.name}"</span>, <span className="syntax-comment">// {project.technologies[0]}</span>
            </span>
            <br />
          </span>
        ))}
        <span>{"}"};
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {arduinoProjects.map((project) => (
          <div
            key={project.id}
            className="project-card"
            onClick={() => onProjectClick(project)}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold font-sans">{project.name}</h3>
              <div className="flex space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                {project.name.includes('Weather') && <Thermometer className="w-4 h-4 text-blue-400" />}
                {project.name.includes('Smart') && <Camera className="w-4 h-4 text-green-400" />}
              </div>
            </div>
            
            <p className="text-muted-foreground font-sans mb-4">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-sans"
                >
                  {tech}
                </span>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground font-sans">
              Click to view Arduino sketch →
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-card rounded-lg border border-border">
        <h3 className="text-xl font-bold mb-4 font-sans">Hardware Skills</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/50 rounded border border-border text-center">
            <Cpu className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold font-sans mb-1">Microcontrollers</h4>
            <p className="text-xs text-muted-foreground font-sans">Arduino, ESP32, Raspberry Pi</p>
          </div>
          <div className="p-4 bg-muted/50 rounded border border-border text-center">
            <Thermometer className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="font-semibold font-sans mb-1">Sensors</h4>
            <p className="text-xs text-muted-foreground font-sans">DHT, BMP, Ultrasonic, PIR</p>
          </div>
          <div className="p-4 bg-muted/50 rounded border border-border text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <h4 className="font-semibold font-sans mb-1">Communication</h4>
            <p className="text-xs text-muted-foreground font-sans">WiFi, Bluetooth, MQTT</p>
          </div>
          <div className="p-4 bg-muted/50 rounded border border-border text-center">
            <Camera className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="font-semibold font-sans mb-1">Interfaces</h4>
            <p className="text-xs text-muted-foreground font-sans">LCD, OLED, Web Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
};