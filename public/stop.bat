@echo off
REM ====================================================================
REM  HMS - STOP THE SERVER.
REM
REM  Right-click this file and choose "Run as administrator".
REM
REM  Staff cannot use HMS until you start it again with start.bat.
REM  No data is deleted. Nothing is changed except that it stops.
REM ====================================================================

cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop.ps1"
