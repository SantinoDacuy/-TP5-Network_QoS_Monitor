@echo off
title Network QoS Monitor - Iniciador Rapido
echo ======================================================================
echo           01 Network QoS Monitor - LSI 2026
echo   Iniciando Backend (Puerto 3001) y Visualizador Web (Puerto 5173)
echo ======================================================================

echo.
echo [1/2] Iniciando Servidor Backend de Referencia...
start "QoS Backend :3001" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 2 /nobreak > nul

echo [2/2] Iniciando Visualizador y Consola de Pruebas...
start "QoS Web App :5173" cmd /k "cd /d %~dp0web && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo Abriendo aplicacion en el navegador predeterminado...
start http://localhost:5173

echo.
echo ======================================================================
echo  Todo listo! La aplicacion se abrio en: http://localhost:5173
echo  Backend respondiendo en:             http://localhost:3001
echo ======================================================================
pause
