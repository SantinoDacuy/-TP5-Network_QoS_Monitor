# Guión de Video Demostración (3 a 5 Minutos)
## Network QoS Monitor — Analizador de Calidad de Red Móvil
**Materia:** Desarrollo de Aplicaciones Móviles 2026  
**Carrera:** Licenciatura en Sistemas de Información

Este guión describe la secuencia exacta paso a paso que debes seguir para grabar el video demo exigido en el punto 07 de la consigna.

---

### Segmento 1: Introducción y Detección de Red Nativa (0:00 - 0:50)
1. **Acción en pantalla**:
   - Abrir la aplicación en el navegador o dispositivo (`http://localhost:5173`).
   - Mostrar la barra superior y la tarjeta principal de **Nivel de Señal RF (RSSI / dBm)**.
2. **Relato sugerido**:
   > *"Buenas tardes. A continuación presentamos el proyecto 'Network QoS Monitor', una aplicación diseñada para supervisar parámetros de calidad de red móvil en tiempo real y mapeo de cobertura personal.  
   > En este primer panel observamos la integración del módulo nativo que recupera la operadora activa (Telecom Personal), la tecnología celular precisa (5G NR / LTE) y el nivel de potencia de señal en dBm (-78 dBm) junto con las coordenadas GPS activas."*
3. **Interacción**:
   - Hacer clic en el botón *"Actualizar"* para mostrar la respuesta inmediata de la telemetría.
   - En la barra inferior de simulador, pulsar *"Simular 5G Óptima"* y luego *"Simular 3G Degradada"* para mostrar cómo el medidor reacciona de forma dinámica cambiando de color verde a rojo y actualizando la calidad cualitativa.

---

### Segmento 2: Motor de Pruebas QoS RFC 2544 y Throughput (0:50 - 2:10)
1. **Acción en pantalla**:
   - Navegar a la pestaña **"Test Activo (RFC 2544)"**.
   - Hacer clic en el botón principal **"Comenzar Medición"**.
2. **Relato sugerido**:
   > *"Pasamos al motor de medición activa. Al iniciar el test, el sistema ejecuta tres etapas en paralelo sin bloquear la interfaz:  
   > Primero, en la Etapa 1, se envían sondas RTT contra tres hosts de referencia configurados: Google DNS (8.8.8.8), Cloudflare DNS (1.1.1.1) y nuestro Backend de referencia en Node.js. Para cada host calculamos latencia mínima, media, máxima y el Jitter estadístico según el estándar RFC 3550 de RTP, junto con el porcentaje de pérdida de paquetes.  
   > En las Etapas 2 y 3, medimos el Throughput de bajada y subida contra nuestro servidor backend. Noten el velocímetro en tiempo real que calcula la tasa en Mbps mediante streams de bytes pseudo-aleatorios sin compresión, evitando distorsiones de proxy."*
3. **Resultado visible**:
   - Se observa el tacómetro marcando la velocidad (ej. 45-180 Mbps en bajada, 15-40 Mbps en subida).
   - Aparece la tarjeta verde de diagnóstico final con la calificación asignada (Grado A+ / Score 95/100) y la persistencia automática con coordenadas GPS.

---

### Segmento 3: Visualización de Cobertura y Mapa de Calor (Heatmap) (2:10 - 3:15)
1. **Acción en pantalla**:
   - Hacer clic en la pestaña **"Mapa de Calor (Heatmap)"**.
   - Mostrar el mapa con los puntos georreferenciados y el heatmap overlay.
2. **Relato sugerido**:
   > *"Ingresamos a la capa geoespacial. Aquí podemos ver el mapa de calor de cobertura personal generado con mediciones georreferenciadas.  
   > La aplicación permite cambiar dinámicamente la métrica visualizada:  
   > Podemos alternar entre Puntaje QoS global, Potencia de Señal en dBm, Velocidad de Descarga en Mbps, y Latencia RTT.  
   > Los puntos rojos señalan zonas de sombra o túneles subterráneos donde la señal degradó a -116 dBm, mientras que las zonas verdes corresponden al corredor céntrico con 5G. Al hacer clic sobre cualquier punto, la aplicación despliega un popup con el detalle técnico completo de esa sesión."*
3. **Interacción**:
   - Cambiar los filtros de tecnología: seleccionar "5G", luego "4G", luego "Todas".
   - Mover el deslizador de "Puntaje Mínimo" para mostrar el filtrado espacial dinámico.

---

### Segmento 4: Analítica de Series Temporales y Alertas de Degradación (3:15 - 4:10)
1. **Acción en pantalla**:
   - Entrar a la pestaña **"Analítica & Gráficos"**.
   - Mostrar los gráficos de series temporales.
2. **Relato sugerido**:
   > *"En la pestaña de analítica observamos el cumplimiento del requisito RF-06: graficamos las series temporales de la latencia RTT junto con el Jitter y la cota máxima, así como la curva de ancho de banda de descarga versus subida a lo largo del tiempo.  
   > También calculamos métricas avanzadas de ingeniería de telecomunicaciones, como el Percentil 90 (P90) de latencia y la tasa de degradación histórica.  
   > Además, el motor de fondo cuenta con un detector de degradaciones severas configurables que genera alertas visuales inmediatas cuando el ping supera los 150ms o la pérdida es crítica."*

---

### Segmento 5: Historial, Exportación CSV/JSON y Backend Sync (4:10 - 4:50)
1. **Acción en pantalla**:
   - Navegar a **"Historial de Sesiones"** y luego a **"Exportar & Configuración"**.
   - Pulsar los botones *"Descargar Archivo CSV"* y *"Sincronizar con Backend"*.
2. **Relato sugerido**:
   > *"Por último, en la sección de gestión de datos, cumplimos con el requisito RF-08: podemos exportar el historial completo a un archivo CSV estándar RFC 4180 listo para analizar en Python/Pandas o Excel, exportarlo a formato JSON estructurado, o sincronizarlo directamente con la API REST de nuestro servidor de referencia.  
   > También es posible agregar o editar los hosts de sondeo y ajustar los intervalos de muestreo periódico.  
   > Con esto queda demostrada la operatividad total de la arquitectura, desde los módulos nativos hasta la visualización y persistencia. Muchas gracias."*
