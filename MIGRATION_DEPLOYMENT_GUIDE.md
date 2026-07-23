# Complete Setup & IIS Deployment Guide

This guide details the local setup, database creation, and production IIS deployment of the **Student Equivalent Certificate Web Application** — a single ASP.NET Core 8 project (`StudentRegistry.API`) that serves both the Razor Pages UI and the JSON API, backed by Microsoft SQL Server, on Windows Server 2022.

There is no separate frontend project and no PHP — one `dotnet publish` output, one IIS site.

---

## 1. Local Development Installation Prerequisites

| Install Sequence | Software | Version / Recommendation | Purpose |
| :---: | :--- | :--- | :--- |
| **1** | **Git** | Latest (2.x) | Clone and manage the codebase. |
| **2** | **.NET 8.0 SDK** | SDK 8.0.x | Compiler and runtime for the whole application. |
| **3** | **Visual Studio 2022** | Community/Professional (v17.8+) | C# IDE (select ".NET and Web Development" workload) — optional, CLI works fine too. |
| **4** | **SQL Server** | Developer or Express Edition | Database engine containing student data. |
| **5** | **SSMS** | SQL Server Management Studio v19+ | Graphical database query and administration interface. |
| **6** | **.NET EF CLI Tool** | Run `dotnet tool install -g dotnet-ef` | Entity Framework Core CLI migrations engine. |

---

## 2. Step-by-Step Local Setup Guide

### Step 1: Clone the Project
```powershell
git clone https://github.com/mohmmed50/dynamic--form-based-web-application.git
cd dynamic--form-based-web-application
```

### Step 2: Restore NuGet Packages
```powershell
cd backend
dotnet restore
```

### Step 3: Configure `appsettings.Development.json`
Verify the local SQL connection string in `backend/StudentRegistry.API/appsettings.Development.json` matches your local SQL Server instance name, e.g.:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=StudentRegistryDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```
(Use `Server=localhost\\SQLEXPRESS` instead if you installed SQL Server Express with the default named instance.)

### Step 4: Apply EF Core Migrations
Migrations are committed to the repo (`StudentRegistry.Data/Migrations/`) — this creates the database and all tables:
```powershell
dotnet ef database update --project StudentRegistry.Data --startup-project StudentRegistry.API
```

### Step 5: Run the Application
```powershell
dotnet run --project StudentRegistry.API
```
Open `http://localhost:5000/` — the registration form loads directly. Swagger is available at `http://localhost:5000/swagger` (Development environment only).

That's it — there is no second process to start. The Razor Pages UI and the JSON API (`/api/students/register`, `/api/config/subjects`, `/api/config/subjects-saudi`) are served by the same Kestrel process on the same port, so there's no CORS to configure locally.

---

## 3. Production IIS Deployment Guide (Windows Server 2022)

```
                            ┌────────────────────────┐
                            │    Client Browser      │
                            └───────────┬────────────┘
                                        │ HTTP/HTTPS
                                        ▼
                  ┌──────────────────────────────────────────────┐
                  │                 IIS Server                   │
                  │                                              │
                  │        ┌────────────────────────────┐        │
                  │        │   StudentRegistryApp Site   │        │
                  │        │   (Razor Pages UI + API)    │        │
                  │        │      Port 80 / 443          │        │
                  │        └──────────────┬───────────────┘        │
                  └───────────────────────┼──────────────────────┘
                                          │
                              ┌───────────▼────────────┐
                              │       File System        │
                              │  C:\publish\api          │
                              │  (incl. wwwroot\uploads) │
                              └───────────────────────────┘
```

### A. Server Roles & Software Setup
1. **Web Server (IIS) Role:** Enable common HTTP features (Static Content, Default Document), Security (Request Filtering), and Application Development.
2. **.NET 8.0 Hosting Bundle:** Download and install the [.NET 8.0 Hosting Bundle](https://dotnet.microsoft.com/en-us/download/dotnet/8.0). This adds `AspNetCoreModuleV2` to IIS, allowing Kestrel to run behind IIS.
3. Run `iisreset` in PowerShell after installing the Hosting Bundle.

(The IIS URL Rewrite module and a separate SPA rewrite `web.config` are **not needed** — Razor Pages routing is handled entirely by ASP.NET Core, not client-side JavaScript routing.)

### B. Compile & Publish the Codebase
```powershell
cd backend
dotnet publish StudentRegistry.API -c Release -o C:\publish\api
```
This single output folder contains the compiled API, the Razor Pages views, and `wwwroot/` (CSS, JS, and the `uploads/` folder) — everything needed to run the app.

### C. Configure the IIS Website
* **Site Name:** `StudentRegistryApp`
* **Physical Path:** `C:\publish\api`
* **Binding Port:** `80` (or `443` for SSL)
* **Application Pool:**
  * Set **.NET CLR Version** to **No Managed Code** (ASP.NET Core runs out-of-process/in-process via `AspNetCoreModuleV2`).
  * Set **Managed Pipeline Mode** to **Integrated**.

### D. web.config
The `web.config` is generated automatically inside `C:\publish\api` by `dotnet publish` — verify it looks like this:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet" arguments=".\StudentRegistry.API.dll" stdoutLogEnabled="false" stdoutLogFile=".\logs\stdout" hostingModel="inprocess" />
    </system.webServer>
  </location>
</configuration>
```

### E. Apply Database Migrations on the Server
Run once against the production database (from a machine with `dotnet-ef` and network access to the DB, or via a published migrations bundle):
```powershell
dotnet ef database update --project StudentRegistry.Data --startup-project StudentRegistry.API --connection "<production connection string>"
```

### F. File System Folder Permissions
Since photos are uploaded directly to the server:
1. Ensure `C:\publish\api\wwwroot\uploads` exists (the app creates it automatically on first run if missing).
2. Right-click the `wwwroot` or `uploads` folder → **Properties** → **Security** → **Edit**.
3. Add `IIS_IUSRS` and the **ApplicationPoolIdentity** (e.g. `IIS AppPool\StudentRegistryApp`), grant **Modify**, **Read & Execute**, **List Folder Contents**, **Read**, **Write**.

---

## 4. Production Release Checklist

- [ ] **Configure HTTPS (SSL):** Obtain a certificate, configure the 443 binding with SNI enabled.
- [ ] **Secure SQL connection strings:** Use a real secret store or Windows Integrated Security instead of a plaintext SQL password in `appsettings.Production.json`.
- [ ] **Disable Swagger in Production:** Already guarded by `app.Environment.IsDevelopment()` in `Program.cs` — don't remove that guard.
- [ ] **Validate upload size limits:** Set IIS Request Filtering `maxAllowedContentLength` to at least `6291456` bytes (~6MB) — photos are capped at 5MB in code.
- [ ] **Apply pending EF Core migrations** before first traffic hits the new deployment.

---

## 5. Common Troubleshooting Guide

### 1. HTTP Error 500.19 - Internal Server Error
* **Symptom:** Config error page with error code `0x8007000d`.
* **Root Cause:** The **.NET Hosting Bundle** is missing or was not installed correctly.
* **Resolution:** Install the hosting bundle, then `iisreset`.

### 2. HTTP Error 502.5 - Process Failure
* **Symptom:** The app fails to start or Kestrel crashes.
* **Root Cause:** The SQL Server connection string is incorrect, the SQL service has stopped, or the folder lacks execution permissions.
* **Resolution:**
  1. `cd C:\publish\api` and run `dotnet .\StudentRegistry.API.dll` directly to see the CLI error stack.
  2. Verify SQL Server is running (`services.msc`) and allows TCP/IP connections.

### 3. Photo upload fails / 500 on registration
* **Symptom:** Registration succeeds for text fields but the photo save fails.
* **Root Cause:** `wwwroot/uploads` doesn't exist or `IIS_IUSRS`/app pool identity lacks write permission.
* **Resolution:** Re-check step 3.F above.
