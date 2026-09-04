@echo off
chcp 65001 >nul
title FONAVANZAR - Abrir página directamente
echo Abriendo index.html en el navegador predeterminado...
echo.
echo Esta version funciona completamente OFFLINE.
echo No requiere internet ni servidor local.
start "" "index.html"
echo.
timeout /t 3 >nul
