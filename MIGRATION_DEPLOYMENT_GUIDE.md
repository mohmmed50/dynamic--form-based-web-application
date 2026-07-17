# Complete Migration, Setup & IIS Deployment Guide

This guide details the complete local setup, database creation, and production IIS deployment of the **Student Equivalent Certificate Web Application** using ASP.NET Core API and Angular SPA with Microsoft SQL Server 2017 on Windows Server 2022.

---

## 1. Local Development Installation Prerequisites

Please download and install the following software in order:

| Install Sequence | Software | Version / Recommendation | Purpose |
| :---: | :--- | :--- | :--- |
| **1** | **Git** | Latest (2.x) | Clone and manage codebase repositories. |
| **2** | **Node.js (LTS)** | Version 20.x LTS | Runtime for Angular CLI build tooling. |
| **3** | **Angular CLI** | Version 17.x or higher | Build and serve Angular SPA frontend. |
| **4** | **.NET 8.0 SDK** | SDK 8.0.x | Compiler and runtime engine for C# backend. |
| **5** | **Visual Studio 2022** | Community/Professional (v17.8+) | C# IDE (Select ".NET and Web Development" workload). |
| **6** | **SQL Server 2017** | Developer or Express Edition | Database engine containing student data. |
| **7** | **SSMS** | SQL Server Management Studio v19+ | Graphical database query and administration interface. |
| **8** | **.NET EF CLI Tool** | Run `dotnet tool install -g dotnet-ef` | Entity Framework Core CLI migrations engine. |

---

## 2. Step-by-Step Local Setup Guide

Follow these steps to run the application on your local machine:

### Step 1: Clone the Project
Open PowerShell and clone the codebase:
```powershell
git clone https://github.com/mohmmed50/dynamic--form-based-web-application.git
cd dynamic--form-based-web-application
```

### Step 2: Restore NuGet Packages
Open the backend solution folder (`backend/`) in Visual Studio 2022 or run in CLI:
```powershell
cd backend
dotnet restore
```

### Step 3: Restore npm Packages
Navigate to the frontend folder (`frontend/`) and restore the Angular dependencies:
```powershell
cd ../frontend
npm install
```

### Step 4: Configure `appsettings.json`
Verify the local SQL connection string in `backend/StudentRegistry.API/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=StudentRegistryDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```

### Step 5: Initialize the SQL Server Database
1. Open **SQL Server Management Studio (SSMS)**.
2. Connect to your local database engine (`localhost\SQLEXPRESS`).
3. Run the schema creation query script located in `database/schema.sql` to build the required tables, keys, and indexes.

### Step 6: Generate EF Core Migrations
Ensure the Entity Framework Core migrations match your schema. In the `backend/` directory:
```powershell
cd ../backend
dotnet ef migrations add InitialMigration --project StudentRegistry.Data --startup-project StudentRegistry.API
```

### Step 7: Apply Migrations to Database
Sync the migration history:
```powershell
dotnet ef database update --project StudentRegistry.Data --startup-project StudentRegistry.API
```

### Step 8: Run the ASP.NET Core API
Run the backend web API server:
```powershell
dotnet run --project StudentRegistry.API
```
The API will start locally. Open `http://localhost:5000/swagger` in your browser to view the Swagger UI.

### Step 9: Run the Angular Frontend
In another PowerShell console, navigate to the `frontend/` folder and run:
```powershell
cd frontend
ng serve
```
Open `http://localhost:4200` to interact with the responsive certification step form.

---

## 3. Production IIS Deployment Guide (Windows Server 2022)

To deploy the application to IIS on a Windows Server 2022 machine without Docker or Linux components:

```
                            ┌────────────────────────┐
                            │    Client Browser      │
                            └───────────┬────────────┘
                                        │ HTTP/HTTPS
                                        ▼
                  ┌──────────────────────────────────────────────┐
                  │                 IIS Server                   │
                  │                                              │
                  │  ┌──────────────────┐  ┌──────────────────┐  │
                  │  │   Angular Site   │  │  ASP.NET Core API│  │
                  │  │   (Port 80/443)  │  │  (Port 5000/5001)│  │
                  │  └────────┬─────────┘  └────────┬─────────┘  │
                  └───────────┼─────────────────────┼────────────┘
                              │                     │
                  ┌───────────▼─────────────────────▼────────────┐
                  │                 File System                  │
                  │  C:\inetpub\wwwroot\student-registry-app\   │
                  └──────────────────────────────────────────────┘
```

### A. Server Roles & Software Setup
Log into Windows Server 2022 and open Server Manager to install the following features:
1. **Web Server (IIS) Role:** Enable common HTTP features (Static Content, Default Document), Security (Request Filtering), and Application Development (**ASP.NET 4.8**).
2. **URL Rewrite Module:** Download and install the [IIS URL Rewrite Extension](https://www.iis.net/downloads/microsoft/url-rewrite).
3. **.NET 8.0 Hosting Bundle:** Download and install the [.NET 8.0 Hosting Bundle](https://dotnet.microsoft.com/en-us/download/dotnet/8.0). This adds the `AspNetCoreModuleV2` to IIS, allowing Kestrel to run behind IIS.
4. Run `iisreset` in PowerShell after installing the Hosting Bundle.

### B. Compile & Publish the Codebase

#### Publish ASP.NET Core API:
In PowerShell, compile the API for release:
```powershell
cd backend
dotnet publish -c Release -o C:\publish\api
```

#### Build Angular Frontend:
Compile the Angular assets:
```powershell
cd ../frontend
ng build --configuration production
```
The compiled SPA output will be written to `frontend/dist/student-registry-frontend/browser/`. Copy these files to `C:\publish\frontend`.

### C. Configure IIS Websites

Create two websites or bind them as an application subfolder:

#### 1. Configure the API Website
* **Site Name:** `StudentRegistryAPI`
* **Physical Path:** `C:\publish\api`
* **Binding Port:** `8080` (or host headers on port 80/443, e.g., `api.student-registry.local`)
* **Application Pool:**
  * Double-click the App Pool in IIS.
  * Set **.NET CLR Version** to **No Managed Code** (ASP.NET Core runs out-of-process).
  * Set **Managed Pipeline Mode** to **Integrated**.

#### 2. Configure the Frontend Website
* **Site Name:** `StudentRegistryFrontend`
* **Physical Path:** `C:\publish\frontend`
* **Binding Port:** `80` (or `443` for SSL)
* **Application Pool:** Set **.NET CLR Version** to **No Managed Code**.

### D. web.config Configurations

#### Angular Rewrite Configuration (SPA Client-Side Routing)
Create a `web.config` file inside `C:\publish\frontend` to rewrite all routes back to `index.html` (preventing 404 errors when reloading pages):
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="AngularJS Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

#### ASP.NET Core Configuration
Verify the `web.config` created automatically inside `C:\publish\api` by the dotnet publish tool:
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

### E. File System Folder Permissions
Since photos are uploaded directly to the server:
1. Ensure the directory `C:\publish\api\wwwroot\uploads` exists.
2. Right-click the `wwwroot` or `uploads` folder and select **Properties** -> **Security** -> **Edit**.
3. Click **Add**, type `IIS_IUSRS` (IIS worker process group), and click **OK**.
4. Check the **Modify**, **Read & Execute**, **List Folder Contents**, **Read**, and **Write** permissions. Click **Apply**.
5. Do the same for the **ApplicationPoolIdentity** user (e.g. `IIS AppPool\StudentRegistryAPI`) if specific pool sandboxing is active.

---

## 4. Production Release Checklist

- [ ] **Configure HTTPS (SSL):** Obtain an SSL/TLS Certificate. Configure HTTPS binding (Port 443) on IIS with "Require Server Name Indication (SNI)" enabled.
- [ ] **Secure SQL connection strings:** Encrypt the connection string in `appsettings.Production.json` or use Windows Active Directory Service Accounts (Integrated Security) rather than standard SQL passwords.
- [ ] **Disable Swagger in Production:** Ensure `app.Environment.IsDevelopment()` checks are in place so API schemas are not exposed to the public.
- [ ] **Verify PHP/Apache Removal:** Ensure Apache/PHP hosting services are disabled on the Windows server to release port conflicts and reduce the server's attack surface.
- [ ] **Validate uploads size limits:** Set the IIS Request Filtering maximum allowed content length to `6291456` bytes (~6MB) to protect Kestrel from large file uploads.

---

## 5. Common Troubleshooting Guide

### 1. HTTP Error 500.19 - Internal Server Error
* **Symptom:** Config error page with error code `0x8007000d` when visiting the site.
* **Root Cause:** The **IIS URL Rewrite Module** or the **.NET Hosting Bundle** is missing or was not installed correctly.
* **Resolution:** Install the URL Rewrite module and the hosting bundle, then restart the server via command line: `iisreset`.

### 2. HTTP Error 502.5 - Process Failure
* **Symptom:** The backend web service fails to start or Kestrel crashes.
* **Root Cause:** The SQL Server connection string is incorrect, the SQL service has stopped, or the folder path lacks execution permissions.
* **Resolution:** 
  1. Open command prompt, change directory to `C:\publish\api`, and run: `dotnet .\StudentRegistry.API.dll` to view the CLI error stack.
  2. Verify that SQL Server 2017 service is running in Windows Services (`services.msc`).
  3. Ensure SQL Server allows TCP/IP connections in the SQL Server Configuration Manager.

### 3. CORS Policy Errors
* **Symptom:** Frontend loads, but console displays `Access to XMLHttpRequest at... blocked by CORS policy`.
* **Root Cause:** The domain of the frontend website is not listed in `appsettings.Production.json`'s `AllowedOrigins` collection.
* **Resolution:** Open `appsettings.Production.json` on the server and add your frontend domain (e.g., `https://student-registry.local`) to the `AllowedOrigins` array, then restart the IIS website.
