@echo off
TITLE Taxi Sabana - Modo Web
color 0A
echo ==================================================
echo   INICIANDO TAXI SABANA WEB
echo ==================================================
echo.
echo 1. NO cierres esta ventana negra.
echo 2. Espera a que cargue (puede tardar 1-2 minutos la primera vez).
echo 3. Google Chrome se abrira automaticamente en LOCALHOST.
echo.
echo NO abras el archivo index.html directamente.
echo Deja que este programa haga la magia...
echo.
echo Cargando...
flutter run -d chrome --web-renderer html --web-port 8080
pause
