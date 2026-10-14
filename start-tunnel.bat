@echo off
title LabOS - Public Cloudflare Tunnel
echo ========================================================
echo  LabOS - Zero-Cost Public Cloudflare Tunnel
echo ========================================================
echo.
echo Make sure your dev server is running (npm run dev)!
echo Connecting localhost:3000 to the public internet...
echo.
.\cloudflared.exe tunnel --protocol http2 --url http://localhost:3000
pause
