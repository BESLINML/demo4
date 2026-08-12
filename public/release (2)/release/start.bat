@echo off
REM ====================================================================
REM  HMS - double-click this file to start the system.
REM  Needs Java 21 and PostgreSQL installed, and a database named 'hms'.
REM  Settings are in application.yml, in this same folder.
REM ====================================================================

REM Run from this file's own folder, so the jar, application.yml and the
REM web folder are all found no matter where the shortcut is clicked from.
cd /d "%~dp0"

REM Settings still untouched? Say so here, in one line, instead of letting the
REM server fail forty lines into a Java stack trace.
findstr /C:"CHANGE_ME" application.yml >nul 2>&1
if not errorlevel 1 (
  echo.
  echo   ============================================================
  echo     SETUP HAS NOT BEEN RUN YET
  echo   ============================================================
  echo.
  echo     Close this window and double-click  setup.bat  first.
  echo.
  echo     It creates the database and fills in application.yml
  echo     for you. Then run start.bat again.
  echo.
  pause
  exit /b 1
)

REM The log location lives in application.yml (logging.file.name), not here,
REM so there is one place to change it.

REM MaxRAMPercentage lets the JVM size itself to the machine instead of
REM guessing. ExitOnOutOfMemoryError stops it limping on in a broken state
REM so the service manager can restart it cleanly.
java -XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError -jar hms-api.jar

REM Keep the window open if it stops, so the error can be read.
echo.
echo HMS has stopped. Read any message above.
pause
