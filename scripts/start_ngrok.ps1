# ==============================================================================
# LEADPULSE ENTERPRISE: NGROK WEBHOOK TUNNEL LAUNCHER
# Exposes local Fastify backend (http://127.0.0.1:4000) to the public internet
# ==============================================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🌐 STARTING NGROK TUNNEL FOR LEADPULSE ENTERPRISE" -ForegroundColor Cyan
Write-Host "   Local Port: 4000 (Fastify Backend)" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan

& "C:\Users\alfaz\AppData\Local\Microsoft\WindowsApps\ngrok.exe" http 4000
