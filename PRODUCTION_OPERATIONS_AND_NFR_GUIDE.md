# Production Operations & Non-Functional Requirements (NFR) Guide

This guide describes operational procedures, administration strategies, and system configurations designed to maintain the security, reliability, scalability, and performance of the migrated student registration system on **Windows Server 2022 / IIS** and **SQL Server 2017**.

---

## 1. Monitoring & Health Checks

The ASP.NET Core API implements built-in, lightweight health checks exposing system statuses.

*   **Endpoint URL**: `https://<api-domain>/health`
*   **Response**: Returns `Healthy` (HTTP 200) or `Unhealthy` (HTTP 503).
*   **IIS / Load Balancer Integration**: Configure IIS Application Initialization or external load balancers (e.g. F5 BIG-IP, HAProxy) to poll `/health` every 15-30 seconds.
*   **Database Check (Optional Extension)**: The endpoint monitors DB connectivity. If connections fail, the health check automatically reports `Unhealthy`, prompting load balancers to route requests to healthy nodes.

---

## 2. Performance Tuning

### A. API Optimization
*   **In-Process Hosting**: Configured in `web.config` using `hostingModel="inprocess"`. This bypasses reverse-proxy HTTP hop overhead between IIS and Kestrel, improving request throughput.
*   **Static Asset Caching**: Set IIS caching headers for static content served from `wwwroot/uploads` (e.g. `Cache-Control: public, max-age=31536000`).
*   **AsNoTracking Queries**: Retrieve configuration data (certifications, tracks) using Entity Framework Core's `.AsNoTracking()` to avoid object-tracking memory overhead.

### B. Angular Frontend
*   **Standalone Components**: Minimizes angular module overhead.
*   **Production Compilation**: Run `npm run build` to enable tree-shaking, bundle minification, and Ahead-of-Time (AOT) compilation.

---

## 3. Structured Logging & Auditing

ASP.NET Core uses Microsoft's built-in structured logger configured in `appsettings.json`.

### A. Log Levels Configuration
In production `appsettings.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning",
      "StudentRegistry": "Information"
    }
  }
}
```

### B. Finding Logs on Windows Server 2022
1.  **Event Viewer**: Warnings and critical application errors are automatically logged to **Windows Logs -> Application** under the `.NET Runtime` source.
2.  **IIS stdout logs**: Enabled by setting `stdoutLogEnabled="true"` in the backend [web.config](file:///c:/Users/mohmm/Documents/GitHub/dynamic--form-based-web-application/backend/StudentRegistry.API/web.config). Logs are saved in the `.\logs` folder inside the deployment directory.
    > [!IMPORTANT]
    > **Log Rotation Warning**: Disable `stdoutLogEnabled` or establish a task scheduler script to compress and delete files in `.\logs` periodically to avoid disk space exhaustion.

---

## 4. Database Backup & Restore (SQL Server 2017)

To prevent data loss, the SQL Server database `StudentRegistryDb` must be backed up using a scheduled maintenance plan.

### A. Backup Strategy
1.  **Full Database Backup**: Run daily at midnight (off-peak hours).
2.  **Differential Database Backup**: Run every 6 hours.
3.  **Transaction Log Backup**: Run hourly to support Point-in-Time Recovery (PITR).

### B. Automated T-SQL Backup Script
Schedule this script using **SQL Server Agent**:
```sql
-- Full Database Backup script
DECLARE @BackupFile NVARCHAR(500);
SET @BackupFile = 'C:\Backups\StudentRegistryDb_Full_' + FORMAT(GETDATE(), 'yyyyMMdd_HHmmss') + '.bak';

BACKUP DATABASE [StudentRegistryDb]
TO DISK = @BackupFile
WITH NOFORMAT, NOINIT, 
NAME = 'StudentRegistryDb-Full Database Backup', 
SKIP, NOREWIND, NOUNLOAD, STATS = 10;
GO
```

### C. Database Restoration
To restore the database to a specific backup file:
```sql
USE [master];
ALTER DATABASE [StudentRegistryDb] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

RESTORE DATABASE [StudentRegistryDb]
FROM DISK = 'C:\Backups\StudentRegistryDb_Full_20260718_000000.bak'
WITH REPLACE, RECOVERY;

ALTER DATABASE [StudentRegistryDb] SET MULTI_USER;
GO
```

---

## 5. Global Error Handling

*   **Global Exception Middleware**: `ExceptionMiddleware.cs` intercepts all unhandled errors in the pipeline.
*   **Security Masking**: In Production mode, the stack trace is masked, returning a generic error payload:
    ```json
    {
      "status": "error",
      "message": "Reason for failure (e.g. Invalid national ID format)",
      "details": null
    }
    ```
*   **HTTP Status Mappings**: 
    *   Validation exceptions/FluentValidation failures -> `400 Bad Request`
    *   Database connection failures/Unexpected server faults -> `500 Internal Server Error`

---

## 6. Scalability & High Availability

If the application requires scaling to multiple Windows servers behind a load balancer:

1.  **Stateless API Design**: The backend maintains no in-memory session states. JWT validation (if configured) or cookies are verified per request.
2.  **Shared Uploads Directory**: Instead of local `wwwroot/uploads`, configure `FileStorageService` to save base64 uploads to a high-performance shared network drive (UNC path like `\\SharedNAS\uploads`) or a clustered DFS (Distributed File System) folder.
3.  **Application Pool Recyclers**: IIS Application Pools should recycle off-hours (e.g., 3:00 AM) to clear system memory.

---

## 7. Maintainability & Code Quality

*   **Clean Layered Architecture**: Strictly separates concerns into Domain (Models), Application (Business Logic & Validators), Data (DbContext), Repository (Queries), Infrastructure (File Storage), and API (Controllers).
*   **Regression Tests**: Located in `frontend/src/app/app.component.spec.ts`. Run `npm run test` to verify that GPA and IG scoring logic match the legacy JavaScript functions verbatim.
