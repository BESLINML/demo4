# HMS — How to Deploy (build here, run on the client server)

You build on **your** machine, copy the **built files** to the client server, and
run them there. No source code and no building on the client side.

- **Frontend build** → `frontend/dist` (the screens, as plain files)
- **Backend build** → `backend/target/hms-api.jar` (one Java file)

One Java process then serves **both** on a single port.

> The detailed version of this — systemd, nginx, TLS, health probes, rollback —
> is in [`backend/docs/DEPLOYMENT.md`](../backend/docs/DEPLOYMENT.md).
> This page is the short, practical route.

---

## PART A — On YOUR machine: make the build (once per version)

**The easy way — one command from the project root:**

```powershell
powershell -File scripts\release.ps1
```

That builds both sides and assembles a `release\` folder ready to zip. Skip to
PART C.

**Or by hand, two commands:**

```powershell
cd frontend
npm install                  # first time only
npm run build:production     # reads frontend\.env.production

cd ..\backend
.\mvnw.cmd clean package -DskipITs
```

After this you have two things:
- `frontend/dist/` — the screens
- `backend/target/hms-api.jar` — the server

> **Which env file a build uses depends on the command.** `build:production` →
> `.env.production`, `build:testing` → `.env.testing`. Set `VITE_API_URL` in that
> file to the address the client's browser will use — unless the Java service is
> serving the screens itself (`WEB_DIST_PATH` below), in which case leave it
> empty.

---

## PART B — Copy these to the client server

Copy the following, e.g. into `C:\HMS` on the client PC:

```
HMS/
├── application.yml    ← your settings (see below)
├── hms-api.jar        ← THE SERVER (from backend/target/)
└── web/               ← THE SCREENS (the contents of frontend/dist/)
```

That is all. **No `node_modules`, no source code, no npm on the client.**

The jar contains the entire backend and every library it needs.

---

## PART C — On the CLIENT server: run it

**1. Install once:**
- **Java 21** — https://adoptium.net (choose the JRE or JDK, 21)
- **PostgreSQL 15+** — set a password, then create an empty database named `hms`.

Check Java is right:
```powershell
java -version      # must say 21
```

**2. Create `C:\HMS\application.yml`** — the server reads it automatically because
it sits next to the jar:

```yaml
spring:
  profiles:
    active: prod
  datasource:
    url: jdbc:postgresql://localhost:5432/hms
    username: postgres
    password: YOUR_PG_PASSWORD

server:
  # Staff open http://<pc-ip>:8226   (use 80 for no port number)
  port: 8226

hms:
  jwt:
    # Each must be AT LEAST 32 characters. Generate with:
    #   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
    access-secret: PUT_A_LONG_RANDOM_STRING_HERE_32_PLUS
    refresh-secret: PUT_A_DIFFERENT_LONG_RANDOM_STRING_HERE
  super-admin:
    email: admin@cityhospital.local
    password: YourStrongPassword
  hospital:
    name: City Care Hospital
    state: Karnataka
    gstin: none          # a real 15-character GSTIN, or the word "none"
  cors:
    allowed-origins: http://localhost:8226
  web:
    # Lets this one process serve the screens too. Point it at the web folder.
    dist-path: C:\HMS\web
```

> **The server checks these and refuses to start if they are wrong.** That is
> deliberate — it is better to fail now than to run insecurely:
> - both JWT secrets **32+ characters**, and not left as a placeholder
> - the admin password **changed** from the default
> - `allowed-origins` **not** `*`
>
> If it will not start, read the message — it names every problem at once.

**Prefer environment variables?** They work too and take priority over this file
(`SPRING_PROFILES_ACTIVE`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `API_PORT`, …).
The file is simply easier on a Windows machine.

**3. Start it (in `C:\HMS`, PowerShell):**
```powershell
java -jar hms-api.jar
```

**There is no database setup step.** The server creates and updates all tables
itself on first start. Give it up to a minute the first time.

Open a browser:
- On this PC: `http://localhost:8226`
- On other clinic PCs: `http://<this-pc-ip>:8226`

Log in with the admin email/password from `application.yml`.

**Check it is healthy:**
```powershell
curl http://localhost:8226/actuator/health/readiness    # {"status":"UP"}
```

---

## PART D — Auto-start every time the PC turns on

Without this, somebody has to double-click `start.bat` after every restart and
leave the window open. On a clinic PC that is switched on and left alone, that is
not good enough.

**Right-click `autostart.bat` → Run as administrator.** Once, after `setup.bat`.

That is all. HMS then:

- starts about 45 seconds after the PC is switched on,
- starts **before anyone logs in** — nobody has to sign in for the system to work,
- restarts itself if it ever stops,
- leaves no window on anyone's desktop to close by accident.

To undo it: right-click **`autostart-off.bat`** → Run as administrator. No data is
touched; you simply go back to starting it by hand.

### What it actually does

Registers a Windows scheduled task named `HMS` that runs

```
java -XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError -jar hms-api.jar
```

as `SYSTEM`, triggered at boot, retrying every minute if it fails.

The 45-second delay is for PostgreSQL: it is a service and starts on its own, but
not instantly, and HMS cannot open its database until it is up. The retry covers a
slow machine where 45 seconds is not enough.

`-XX:+ExitOnOutOfMemoryError` is deliberate — a server that has run out of memory
should die and be restarted cleanly rather than limp on half-working.

### Checking and controlling it

```powershell
Get-ScheduledTask HMS | Get-ScheduledTaskInfo   # last run, last result, next run
Stop-ScheduledTask  HMS                         # stop it now
Start-ScheduledTask HMS                         # start it now
```

Or use the **Task Scheduler** app in Windows and look for `HMS`.

### Why not a Windows service

A Java program cannot be registered as a Windows service without a wrapper such as
[NSSM](https://nssm.cc), which has to be downloaded and installed on the client's
machine. A scheduled task is built into Windows, needs no internet, and gives the
same three things that matter: starts at boot, runs without a login, restarts on
failure. If you already use NSSM elsewhere it works too — just do not run both.

> **Run exactly ONE copy.** The appointment-reminder scheduler runs inside the
> server, so two copies send every patient two reminders. If you turn on
> `autostart.bat`, do not also double-click `start.bat`.

---

## Updating to a new version later

1. On your machine: `powershell -File scripts\release.ps1` again.
2. Copy the new `hms-api.jar` and the new `web/` folder over the old ones.
3. On the client: `nssm restart HMS`.

Any database changes apply themselves on restart. **Back up first** (below).

---

## Backups (do regularly)

```powershell
"C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -U postgres hms > C:\HMS-backups\hms-2026-07-29.sql
```

Or use `scripts\backup.ps1`.

**A database backup is a complete backup.** There is no file storage — logos and
signatures live in the database, and PDFs are generated fresh each time.

---

## Moving to AWS / a static IP later

Same jar, same steps. Nothing in the app changes — it works at whatever address it
runs on (e.g. `http://117.247.193.197:8226`). Only the machine changes.
