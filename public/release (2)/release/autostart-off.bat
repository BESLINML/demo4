@echo off
REM ====================================================================
REM  HMS - STOP STARTING AUTOMATICALLY.
REM
REM  Right-click this file and choose "Run as administrator".
REM
REM  HMS will no longer come up on its own. Start it by hand with
REM  start.bat when you need it. No data is touched.
REM ====================================================================

cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0autostart.ps1" -Remove
