@echo off
REM ====================================================================
REM  HMS - FIRST TIME SETUP.  Double-click this ONCE, before start.bat.
REM
REM  It checks Java and PostgreSQL, creates the database, and writes
REM  application.yml for you. Running it again is safe.
REM ====================================================================

REM Run from this file's own folder no matter where it is launched from.
cd /d "%~dp0"

REM -ExecutionPolicy Bypass: client machines often block scripts by default,
REM and this only affects this one run.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1"

echo.
pause
