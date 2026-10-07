# Network QoS Monitor 📡⚡
> **Analizador y visualizador de calidad de red móvil en tiempo real con mapeo de cobertura personal**  
> **Carrera:** Licenciatura en Sistemas de Información — Desarrollo de Aplicaciones Móviles 2026  
> **Área temática:** Redes de Datos, Telecomunicaciones y Telecomunicaciones Satelitales  
> **Tecnología:** React Native (CLI, Kotlin/Swift TurboModules, TypeScript)

---

## 📌 01. Descripción del Proyecto

Aplicación multiplataforma diseñada para medir, almacenar y visualizar en tiempo real la calidad de la conexión de red celular (5G NR, 4G LTE, 3G) y WiFi. Correlaciona las métricas de red (RTT, Jitter RFC 3550, Pérdida de paquetes, Throughput y RSSI en dBm) con la ubicación geográfica del usuario, generando un **historial navegable y un mapa de calor (heatmap) interactivo**.

---

## 🚀 02. Inicio Rápido (Quick Start)

El proyecto cuenta con **tres módulos integrados**:
1. **`backend/`**: Servidor de referencia en Node.js/Express para pruebas de throughput y telemetría.
2. **`web/`**: Entorno interactivo de ejecución web con mapa de calor Leaflet, velocímetro en tiempo real y gráficos de series temporales para pruebas y grabación de la demo.
3. **`mobile/`**: Proyecto React Native CLI con módulos nativos Android (Kotlin) e iOS (Swift).

### Paso 1: Iniciar el Backend de Referencia
```bash
cd backend
npm install
npm start
```
*El servidor estará activo en `http://localhost:3001` con endpoints para download de 5MB, upload echo y sincronización de telemetría.*

### Paso 2: Iniciar la Aplicación (Visualizador y Consola de Pruebas)
En otra terminal:
```bash
cd web
npm install
npm run dev
```
*Abre tu navegador en `http://localhost:5173`. Tendrás acceso inmediato al panel de control, velocímetro, heatmap y gráficos.*

---

## 📱 03. Estructura del Repositorio

```
network-qos-monitor/
├── backend/                  # Servidor de referencia Node.js/Express (RFC 2544)
│   ├── server.js             # Endpoints /download, /upload, /ping, /telemetry
│   ├── package.json
│   ├── Dockerfile            # Despliegue en contenedor Docker
│   └── docker-compose.yml
├── mobile/                   # Proyecto React Native CLI
│   ├── android/              # Módulos nativos Android en Kotlin
│   │   └── app/src/main/java/com/networkqosmonitor/telephony/
│   │       ├── TelephonyModule.kt      # TelephonyManager, CellSignalStrength, RSSI
│   │       └── TelephonyPackage.kt     # ReactPackage registration
│   ├── ios/                  # Módulos nativos iOS en Swift
│   │   └── NetworkQoSMonitor/
│   │       ├── TelephonyModule.swift   # CoreTelephony, CTRadioAccessTechnology
│   │       └── TelephonyModule.m       # RCTBridge interface
│   ├── src/                  # Código TypeScript compartido
│   │   ├── core/             # Tipos, configuración y algoritmos RFC 2544 / RFC 3550
│   │   ├── engine/           # PingEngine (RTT multi-host), ThroughputEngine, BackgroundEngine
│   │   ├── geo/              # GeoLocationService y HeatmapCalculator
│   │   ├── storage/          # DatabaseService (SQLite/Storage) y ExportService (CSV/JSON)
│   │   ├── notifications/    # NotificationManager (Alertas de degradación)
│   │   └── state/            # useQoSStore (Gestor reactivo de estado)
│   └── App.tsx               # Componente móvil principal
├── web/                      # Entorno de pruebas interactivo con Leaflet & Chart.js
│   ├── src/
│   │   ├── components/       # SignalGauge, SpeedometerGauge, PingHostCard, CoverageMap
│   │   ├── screens/          # Dashboard, ActiveTest, CoverageMap, Analytics, History, ExportSettings
│   │   └── App.tsx
│   └── vite.config.ts
└── docs/                     # Documentación técnica extendida
    ├── ARQUITECTURA_TECNICA.md # Especificación formal, fórmulas RFC, permisos y arquitectura
    └── DEMO_SCRIPT.md        # Guión paso a paso para el video demo de 3-5 minutos
```

---

## 📊 04. Cumplimiento de Requisitos Funcionales

- **RF-01 (Alta):** Detección de tipo de red (5G NR, 4G LTE, 3G, WiFi), operador y señal RSSI en dBm.
- **RF-02 (Alta):** Medición de latencia RTT contra 3 hosts configurables con cálculo de min/avg/max y Jitter RFC 3550.
- **RF-03 (Alta):** Test de descarga y subida con cálculo de Throughput en Mbps en tiempo real.
- **RF-04 (Alta):** Registro persistente de cada medición georreferenciada con timestamp y coordenadas GPS.
- **RF-05 (Alta):** Mapa interactivo de cobertura con Heatmap overlay y selector de métricas.
- **RF-06 (Media):** Gráficos de series temporales de latencia y throughput por sesión.
- **RF-07 (Media):** Muestreo en segundo plano con alertas locales ante degradaciones severas.
- **RF-08 (Baja):** Exportación del historial a archivos CSV (RFC 4180) y JSON estructurado.
- **RF-09 (Baja):** Filtros geoespaciales por tipo de red, fecha y zona de cobertura.

---

## 📖 05. Documentación Adicional

- Consulta [ARQUITECTURA_TECNICA.md](file:///C:/Users/santi/.gemini/antigravity-ide/scratch/network-qos-monitor/docs/ARQUITECTURA_TECNICA.md) para el análisis formal de los estándares RFC 2544 / 3550, diagramas de capas y modelos de permisos de Android e iOS.
- Consulta [DEMO_SCRIPT.md](file:///C:/Users/santi/.gemini/antigravity-ide/scratch/network-qos-monitor/docs/DEMO_SCRIPT.md) para el guión estructurado del video de defensa de 3 a 5 minutos.
