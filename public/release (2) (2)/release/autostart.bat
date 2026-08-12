@echo off
REM ====================================================================
REM  HMS - START AUTOMATICALLY WHEN THE COMPUTER TURNS ON.
REM
REM  Right-click this file and choose "Run as administrator".
REM  Do it ONCE, after setup.bat. Running it again is safe.
REM
REM  After this, nobody has to double-click start.bat. HMS comes up on
REM  its own when the PC is switched on, even before anyone logs in.
REM ====================================================================

cd /d "%~dp0"

REM -ExecutionPolicy Bypass: client machines often block scripts by default,
REM and this file is the one we are asking them to trust.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0autostart.ps1"
