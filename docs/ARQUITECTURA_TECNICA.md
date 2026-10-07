# Documento Técnico de Arquitectura y Diseño de Red
## 01 Network QoS Monitor: Analizador y Visualizador de Calidad de Red Móvil en Tiempo Real
**Carrera:** Licenciatura en Sistemas de Información — Desarrollo de Aplicaciones Móviles (2026)  
**Área Temática:** Redes de Datos, Telecomunicaciones y Telecomunicaciones Satelitales  
**Tecnología Base:** React Native (CLI / Native Modules Kotlin & Swift / TypeScript)

---

### 1. Resumen Ejecutivo y Matriz de Cumplimiento

El proyecto implementa una solución integral para la adquisición, medición, persistencia, georreferenciación y visualización de parámetros de **Calidad de Servicio (QoS)** y **Calidad de Experiencia (QoE)** en redes móviles celulares (5G NR, 4G LTE, 3G HSPA) y WiFi.

| ID | Requisito Funcional | Prioridad | Estado | Componente Implementado |
|:---|:---|:---:|:---:|:---|
| **RF-01** | Detectar y mostrar tipo de red activa, operador y nivel de señal | Alta | **Cumplido** | `TelephonyModule.kt` (Android) / `TelephonyModule.swift` (iOS) / `NativeTelephony.ts` |
| **RF-02** | Medir RTT (ping) contra al menos 3 hosts configurables (min/avg/max/jitter) | Alta | **Cumplido** | `PingEngine.ts` (Google DNS, Cloudflare DNS, Backend QoS) + RFC 3550 Jitter |
| **RF-03** | Test de descarga y subida, cálculo de throughput en Mbps | Alta | **Cumplido** | `ThroughputEngine.ts` con streaming no comprimido contra backend Express |
| **RF-04** | Registro de cada medición con timestamp y coordenadas GPS | Alta | **Cumplido** | `GeoLocationService.ts` + `DatabaseService.ts` |
| **RF-05** | Visualizar historial en mapa interactivo con Heatmap overlay | Alta | **Cumplido** | `CoverageMap.tsx` + `HeatmapCalculator.ts` con selector de 4 métricas |
| **RF-06** | Graficar series temporales de latencia y throughput por sesión | Media | **Cumplido** | `TimeSeriesCharts.tsx` (bandas min/avg/max y curvas Downlink/Uplink) |
| **RF-07** | Muestreo periódico en background y notificaciones ante degradaciones | Media | **Cumplido** | `BackgroundEngine.ts` + `NotificationManager.ts` |
| **RF-08** | Exportar historial de mediciones a CSV y JSON | Baja | **Cumplido** | `ExportService.ts` (RFC 4180 CSV + JSON estructurado + Sync API) |
| **RF-09** | Filtrar historial por tipo de red, fecha y zona geográfica (bounding box) | Baja | **Cumplido** | `DatabaseService.queryRecords` + `CoverageMapView.tsx` |

---

### 2. Arquitectura del Sistema en Capas

```
+---------------------------------------------------------------------------------+
|                               CAPA DE PRESENTACIÓN                              |
|   DashboardScreen | ActiveTestScreen | CoverageMapView | Analytics | History    |
|   (Gauges dBm, Speedometers SVG, Mapas Leaflet/Maps, Gráficos Series Temporales)|
+---------------------------------------------------------------------------------+
                                        │
                                        ▼
+---------------------------------------------------------------------------------+
|                                 ESTADO REACTIVO                                 |
|            useQoSStore (Gestión centralizada de telemetría y pruebas)           |
+---------------------------------------------------------------------------------+
           │                                 │                         │
           ▼                                 ▼                         ▼
+-----------------------+        +-----------------------+  +---------------------+
| MOTOR DE MEDICIÓN     |        | CAPA GEOESPACIAL      |  | PERSISTENCIA LOCAL  |
| - PingEngine          |        | - GeoLocationService  |  | - DatabaseService   |
| - ThroughputEngine    |        | - HeatmapCalculator   |  |   (CRUD, Bounding   |
| - BackgroundEngine    |        |   (Algoritmos IDW /   |  |    Box y Filtros)   |
| - RFC 2544 / RFC 3550 |        |    Interpolación)     |  | - ExportService     |
+-----------------------+        +-----------------------+  +---------------------+
           │
           ▼
+---------------------------------------------------------------------------------+
|                           NATIVE BRIDGE & TELEFONÍA                             |
|  Android: TelephonyModule.kt (TelephonyManager, CellSignalStrength, Subscriptions) |
|  iOS: TelephonyModule.swift (CoreTelephony, CTRadioAccessTechnology, NWPath)    |
|  JavaScript Wrapper: NativeTelephony.ts + Mock Simulator Fallback               |
+---------------------------------------------------------------------------------+
                                        │
                                        ▼
+---------------------------------------------------------------------------------+
|                             BACKEND DE REFERENCIA                               |
|        Node.js / Express (Payloads no comprimibles, Echo Upload, Telemetry Sync)|
+---------------------------------------------------------------------------------+
```

---

### 3. Especificación Detallada de Módulos Nativos

#### 3.1 Android (Kotlin) — `TelephonyModule.kt`
El módulo accede directamente a las APIs del subsistema de telefonía de Android:
- **`TelephonyManager.allCellInfo`**: Recupera las celdas registradas (`CellInfoLte`, `CellInfoNr`, `CellInfoWcdma`, `CellInfoGsm`). De cada celda extrae `cellSignalStrength.dbm`, nivel discreto (0 a 4) y `asuLevel`.
- **`TelephonyManager.dataNetworkType`**: Detecta con precisión si la portadora activa es `5G NR` (`NETWORK_TYPE_NR`), `4G LTE` (`NETWORK_TYPE_LTE`), o 3G (`HSPA`, `UMTS`).
- **`ConnectivityManager.getNetworkCapabilities`**: Determina si el transporte es celular o WiFi (`TRANSPORT_WIFI`, `TRANSPORT_CELLULAR`).
- **Permisos requeridos en `AndroidManifest.xml`**:
  - `android.permission.READ_PHONE_STATE`: Para consultar el estado de portadora y SIM.
  - `android.permission.ACCESS_FINE_LOCATION`: Requerido por Android 10+ para acceder a `TelephonyManager.getAllCellInfo()` ya que los IDs de celda constituyen información de localización.
  - `android.permission.ACCESS_BACKGROUND_LOCATION`: Para muestreo continuo.
  - `android.permission.POST_NOTIFICATIONS`: Requerido en Android 13+ (API 33).

#### 3.2 iOS (Swift) — `TelephonyModule.swift`
Apple restringe el acceso al valor de RSSI en dBm en las apps públicas por motivos de sandboxing y privacidad. Por lo tanto, el módulo utiliza:
- **`CTTelephonyNetworkInfo.serviceCurrentRadioAccessTechnology`**: Identifica la tecnología celular activa (`CTRadioAccessTechnologyNR`, `CTRadioAccessTechnologyLTE`, etc.).
- **`CTTelephonyNetworkInfo.serviceSubscriberCellularProviders`**: Extrae el nombre del operador (`carrierName`).
- **`NWPathMonitor`**: Supervisa interfaces WiFi y Celular.

---

### 4. Metodología de Medición y Cumplimiento de Estándares RFC

#### 4.1 Latencia RTT (Round-Trip Time)
Se mide el tiempo transcurrido entre el envío del probe y la recepción de la respuesta utilizando timers de alta resolución (`performance.now()` o sockets TCP nativos con `react-native-tcp-socket`).
Para cada host se calculan:
$$\text{Min RTT} = \min_{i} (t_i), \quad \text{Max RTT} = \max_{i} (t_i), \quad \text{Avg RTT} = \frac{1}{N} \sum_{i=1}^N t_i$$

#### 4.2 Jitter Estadístico según RFC 3550 / RFC 1889
Para evaluar la estabilidad de paquetes en tiempo real (crítico para VoIP y streaming), se implementa la fórmula iterativa estándar de RTP:
$$J(i) = J(i-1) + \frac{|D(i-1, i)| - J(i-1)}{16}$$
Donde $D(i-1, i) = \text{RTT}_i - \text{RTT}_{i-1}$ es la diferencia absoluta de llegada entre probes consecutivos.

#### 4.3 Throughput (Ancho de Banda Útil) según RFC 2544
El cálculo de throughput requiere transferir datos de alta entropía (generados aleatoriamente con `crypto.randomBytes` en el servidor) para evitar que los mecanismos de compresión de módems o proxies inflen artificialmente la velocidad:
$$\text{Throughput (Mbps)} = \frac{\text{Bytes Transferidos} \times 8}{\text{Tiempo Transcurrido (segundos)} \times 10^6}$$

#### 4.4 Índice Compuesto de Calidad de Servicio (QoS / MOS Score)
Para sintetizar el estado de la red en un puntaje unificado de 0 a 100 y una calificación cualitativa (A+, A, B, C, D, F), se aplica una función de utilidad ponderada:
$$\text{Score} = 0.30 \cdot S_{\text{latencia}} + 0.30 \cdot S_{\text{pérdida}} + 0.15 \cdot S_{\text{jitter}} + 0.25 \cdot S_{\text{throughput}}$$
- $S_{\text{latencia}} = \max(0, 100 - (\text{RTT} - 20) / 2.3)$
- $S_{\text{pérdida}} = \max(0, 100 - (\text{Loss}\% \times 10))$
- $S_{\text{jitter}} = \max(0, 100 - (\text{Jitter} - 3) \times 2.7)$
- $S_{\text{throughput}} = \min(100, \text{Mbps} \times 2.5)$

---

### 5. Persistencia Local y Consultas Geoespaciales

El esquema de la base de datos almacena cada registro con su firma temporal y coordenadas:
```sql
CREATE TABLE measurements (
    id TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    network_type TEXT NOT NULL,
    technology_detail TEXT,
    operator_name TEXT,
    signal_dbm INTEGER,
    signal_level INTEGER,
    ping_min REAL,
    ping_avg REAL,
    ping_max REAL,
    jitter REAL,
    packet_loss REAL,
    download_mbps REAL,
    upload_mbps REAL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL,
    qos_score INTEGER,
    grade TEXT,
    is_background INTEGER,
    notes TEXT
);
```

#### Filtrado por Cuadrante Geográfico (Bounding Box)
```sql
SELECT * FROM measurements
WHERE latitude BETWEEN :minLat AND :maxLat
  AND longitude BETWEEN :minLng AND :maxLng
  AND network_type IN (:networkTypes)
  AND timestamp BETWEEN :dateFrom AND :dateTo
ORDER BY timestamp DESC;
```

---

### 6. Ejecución en Background y Manejo de Limitaciones

1. **Android Doze Mode y App Standby**:
   - En Android 6.0+, el sistema limita el acceso a la red periódica si el teléfono no está conectado al cargador.
   - Para mitigar esto, se implementa `ForegroundService` con notificación persistente para muestreos activos de drive-test, o `WorkManager` / `HeadlessJS` con `setRequiresBatteryNotLow(false)` para muestreos oportunistas.
2. **iOS Background App Refresh**:
   - En iOS, las tareas de fondo son programadas por el sistema operativo mediante `BGAppRefreshTask` según los patrones de uso del usuario. No se garantiza una ejecución exacta cada $N$ minutos; se maneja mediante ventanas de ejecución adaptativas.

---

### 7. Instrucciones de Despliegue del Backend de Referencia

#### Opción A: Ejecución directa con Node.js
```bash
cd backend
npm install
npm start
```
El servidor escuchará en el puerto 3001 con endpoints listos:
- `GET /api/health`
- `GET /api/ping`
- `GET /api/download?size=5mb`
- `POST /api/upload`
- `POST /api/telemetry/sync`
- `GET /api/telemetry/stats`

#### Opción B: Despliegue con Docker
```bash
cd backend
docker-compose up -d
```
