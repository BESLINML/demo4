@echo off
REM ====================================================================
REM  HMS - UPDATE A PC THAT IS ALREADY RUNNING HMS.
REM
REM  Right-click this file and choose "Run as administrator".
REM
REM  It stops HMS, keeps a copy of the old version, puts the new one in,
REM  and starts it again. Your settings and your data are NOT touched.
REM
REM  For a brand new PC use setup.bat instead.
REM ====================================================================

cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update.ps1"
