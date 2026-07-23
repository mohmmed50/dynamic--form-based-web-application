using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace StudentRegistry.API.Middleware
{
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityHeadersMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Add Content-Security-Policy (CSP)
            context.Response.Headers.Append("Content-Security-Policy", 
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                "font-src 'self' data: https://fonts.gstatic.com; " +
                "img-src 'self' data:; " +
                "connect-src 'self'; " +
                "frame-ancestors 'none'; " +
                "form-action 'self';");

            // Prevent Clickjacking
            context.Response.Headers.Append("X-Frame-Options", "DENY");

            // Prevent MIME Sniffing
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

            // Enable Browser XSS Filtering
            context.Response.Headers.Append("X-Xss-Protection", "1; mode=block");

            // Set Referrer Policy
            context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

            // Set Permissions Policy
            context.Response.Headers.Append("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

            await _next(context);
        }
    }
}
