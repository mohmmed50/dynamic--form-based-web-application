<?php
// Deprecated: This project has been migrated to ASP.NET Core and SQL Server.
// This PHP file is no longer functional.
http_response_code(410);
echo json_encode([
    "status" => "error",
    "message" => "This PHP endpoint has been deprecated and migrated to ASP.NET Core."
]);
exit();
