# ===========================================================================
#  HMS -- FIRST TIME SETUP  (run on the CLIENT machine, once)
#
#  Does every manual step that used to be done by hand:
#    1. checks Java is installed
#    2. finds PostgreSQL
#    3. checks the database password actually works
#    4. creates the "hms" database if it is missing
#    5. writes application.yml with real, generated secrets
#
#  Then start.bat just works. Re-running it is safe -- nothing is destroyed.
# ===========================================================================
param(
  [string]$DbPassword,
  [string]$DbHost = '127.0.0.1',
  [int]$DbPort = 5432,
  [string]$DbName = 'hms',
  [string]$AdminEmail,
  [string]$AdminPassword,
  [string]$HospitalName,
  [string]$HospitalState,
  [int]$Port = 8226,
  # Log rotation. A clinic PC has one disk, so these are the guard rails that
  # stop a year of logs filling it.
  [string]$logMaxSize = '50MB',
  [int]$logMaxHistory = 30,
  [string]$logTotalCap = '2GB',
  # Set by the test harness so nothing blocks waiting for a human.
  [switch]$NonInteractive
)

# Deliberately NOT 'Stop'. Windows PowerShell 5.1 turns a native program's
# stderr into error records, so `java -version` (which prints to stderr) or any
# psql warning would abort the script under 'Stop'. Every external call below
# is checked explicitly through its exit code instead.
$ErrorActionPreference = 'Continue'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

function Say($msg, $colour = 'Gray') { Write-Host $msg -ForegroundColor $colour }
function Ok($msg) { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Bad($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red }

Say ""
Say "===========================================" Cyan
Say "  HMS - First time setup" Cyan
Say "===========================================" Cyan
Say ""

# -- 1. Java ----------------------------------------------------------------
Say "1/5  Checking Java..."
$javaOk = $false
# cmd.exe does the 2>&1 merge, so PowerShell never sees stderr as error records.
# `java -version` prints to stderr, so this matters even on success.
$v = (cmd /c "java -version 2>&1") -join ' '
if ($v -match 'version "(\d+)') {
  $major = [int]$Matches[1]
  if ($major -lt 21) {
    Bad "Java $major found, but Java 21 or newer is required."
    Say "       Install Java 21 from https://adoptium.net then run setup again." Yellow
    exit 1
  }
  Ok "Java $major found"
  $javaOk = $true
}
if (-not $javaOk) {
  Bad "Java is not installed."
  Say "       Install Java 21 from https://adoptium.net then run setup again." Yellow
  exit 1
}

# -- 2. PostgreSQL tools ----------------------------------------------------
Say ""
Say "2/5  Looking for PostgreSQL..."
$psql = $null
$cmd = Get-Command psql.exe -ErrorAction SilentlyContinue
if ($cmd) { $psql = $cmd.Source }
if (-not $psql) {
  # Newest version first, so a machine with several installs uses the latest.
  $found = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue |
           Sort-Object { [int]($_.Directory.Parent.Name) } -Descending
  if ($found) { $psql = $found[0].FullName }
}
if (-not $psql) {
  Bad "PostgreSQL not found."
  Say "       Install PostgreSQL from https://www.postgresql.org/download/windows/" Yellow
  Say "       then run setup again." Yellow
  exit 1
}
Ok "psql: $psql"
# Put psql on PATH for this process so the calls below can go through cmd.exe
# without fighting quoting on a path containing spaces.
$env:PATH = (Split-Path $psql) + ';' + $env:PATH

# -- 3. Database password ---------------------------------------------------
Say ""
Say "3/5  Checking the database password..."
if (-not $DbPassword) {
  if ($NonInteractive) { Bad "No -DbPassword supplied."; exit 1 }
  Say ""
  Say "       Type the PostgreSQL password for user 'postgres'." Yellow
  Say "       (the one chosen when PostgreSQL was installed)" Yellow
  $secure = Read-Host "       Password" -AsSecureString
  $DbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}

$env:PGPASSWORD = $DbPassword
cmd /c "psql -U postgres -h $DbHost -p $DbPort -d postgres -tAc ""select 1"" 2>&1" | Out-Null
if ($LASTEXITCODE -ne 0) {
  Bad "That password was refused by PostgreSQL on ${DbHost}:${DbPort}."
  Say "" Yellow
  Say "       Either the password is wrong, or PostgreSQL is on a different port." Yellow
  Say "       To see which ports it is listening on, run:" Yellow
  Say "           netstat -ano | findstr :543" Yellow
  Say "       To reset the password, open SQL Shell (psql) and run:" Yellow
  Say "           ALTER USER postgres WITH PASSWORD 'yourNewPassword';" Yellow
  $env:PGPASSWORD = $null
  exit 1
}
Ok "Password accepted"

# -- 4. Database ------------------------------------------------------------
Say ""
Say "4/5  Checking the '$DbName' database..."
$exists = cmd /c "psql -U postgres -h $DbHost -p $DbPort -d postgres -tAc ""select 1 from pg_database where datname = '$DbName'"" 2>&1"
if ("$exists".Trim() -eq '1') {
  Ok "Database '$DbName' already exists"
} else {
  Say "       Creating database '$DbName'..."
  $out = cmd /c "psql -U postgres -h $DbHost -p $DbPort -d postgres -c ""CREATE DATABASE $DbName;"" 2>&1"
  if ($LASTEXITCODE -ne 0) {
    Say "       $out" Red
    Bad "Could not create the database."
    $env:PGPASSWORD = $null
    exit 1
  }
  Ok "Database '$DbName' created"
}
$env:PGPASSWORD = $null

# -- 5. application.yml -----------------------------------------------------
Say ""
Say "5/5  Writing application.yml..."

# ProductionConfigGuard refuses to start on a secret containing any of these,
# so a random string that happens to spell one would produce an install that
# cannot boot. Rare, but it would be baffling on a clinic PC, so regenerate.
$WEAK = 'change-me|dev-|secret|password|test'

function New-Secret([int]$len = 64) {
  $chars = [char[]](([char]'a'..[char]'z') + ([char]'A'..[char]'Z') + ([char]'0'..[char]'9'))
  do {
    $s = -join (1..$len | ForEach-Object { $chars | Get-Random })
  } while ($s -match $WEAK)
  $s
}

if (-not $AdminEmail) {
  if ($NonInteractive) { $AdminEmail = 'admin@hospital.local' }
  else {
    $AdminEmail = Read-Host "       Admin login email [admin@hospital.local]"
    if (-not $AdminEmail) { $AdminEmail = 'admin@hospital.local' }
  }
}
if (-not $AdminPassword) {
  if ($NonInteractive) { $AdminPassword = 'Hms' + (New-Secret 12) + '#9' }
  else {
    $AdminPassword = Read-Host "       Admin login password (leave blank to generate one)"
    if (-not $AdminPassword) { $AdminPassword = 'Hms' + (New-Secret 12) + '#9' }
  }
}
# A password the user typed is checked too - the server would reject it at
# startup, and finding that out here beats finding it out from a stack trace.
if ($AdminPassword -match $WEAK) {
  Bad "That admin password contains a word the server rejects as a placeholder."
  Say "       Avoid: change-me, dev-, secret, password, test." Yellow
  exit 1
}
if (-not $HospitalName) {
  if ($NonInteractive) { $HospitalName = 'City Care Hospital' }
  else {
    $HospitalName = Read-Host "       Hospital name [City Care Hospital]"
    if (-not $HospitalName) { $HospitalName = 'City Care Hospital' }
  }
}
if (-not $HospitalState) {
  if ($NonInteractive) { $HospitalState = 'Karnataka' }
  else {
    $HospitalState = Read-Host "       State [Karnataka]"
    if (-not $HospitalState) { $HospitalState = 'Karnataka' }
  }
}

# Single-quoted YAML strings: the only escape is '' for a literal quote, so a
# password containing # : @ or " cannot break the file.
function Yaml($s) { "'" + ($s -replace "'", "''") + "'" }

$yml = @"
# ===========================================================================
#  HMS settings - written by setup.ps1. Run start.bat in this folder.
#  Log in at http://localhost:$Port
# ===========================================================================
spring:
  profiles:
    active: prod
  datasource:
    # 127.0.0.1 rather than "localhost": localhost can resolve to IPv6 ::1,
    # which pg_hba.conf often authenticates differently from 127.0.0.1.
    url: jdbc:postgresql://${DbHost}:${DbPort}/${DbName}
    username: postgres
    password: $(Yaml $DbPassword)

server:
  port: $Port

hms:
  jwt:
    access-secret: $(New-Secret 64)
    refresh-secret: $(New-Secret 64)
  super-admin:
    email: $(Yaml $AdminEmail)
    password: $(Yaml $AdminPassword)
  hospital:
    name: $(Yaml $HospitalName)
    state: $(Yaml $HospitalState)
    gstin: none
  cors:
    allowed-origins: http://localhost:$Port
  web:
    dist-path: ./web

# Where the log file goes. Set here rather than left to the packaged prod
# profile, whose default (/var/log/hms) lands in C:\var\log\hms on Windows --
# at the root of the drive, where nobody thinks to look.
# Rotates on its own: $logMaxSize per file, keeps $logMaxHistory days, gzipped.
logging:
  file:
    name: ./logs/hms-api.log
  logback:
    rollingpolicy:
      max-file-size: $logMaxSize
      max-history: $logMaxHistory
      total-size-cap: $logTotalCap
"@

# No BOM: a byte-order mark in front of a YAML document invites parser trouble.
[System.IO.File]::WriteAllText(
  (Join-Path $here 'application.yml'), $yml, (New-Object System.Text.UTF8Encoding $false))
Ok "application.yml written"

Say ""
Say "===========================================" Green
Say "  Setup complete" Green
Say "===========================================" Green
Say ""
Say "  Now double-click:  start.bat"
Say ""
Say "  Then open:         http://localhost:$Port"
Say ""
Say "  Log in with"
Say "      email    : $AdminEmail" Cyan
Say "      password : $AdminPassword" Cyan
Say ""
Say "  WRITE THAT PASSWORD DOWN - it is not shown again." Yellow
Say ""
