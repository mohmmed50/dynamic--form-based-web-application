using Microsoft.AspNetCore.Hosting;
using StudentRegistry.Application.Interfaces;
using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace StudentRegistry.Infrastructure.Storage
{
    public class FileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _env;
        private const long MaxFileSizeInBytes = 5 * 1024 * 1024; // 5MB

        public FileStorageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> SaveBase64ImageAsync(string base64String, string nationalId)
        {
            if (string.IsNullOrEmpty(base64String))
                throw new ArgumentException("بيانات الصورة الشخصية مفقودة.");

            // 1. Parse base64 header and extract extension
            var match = Regex.Match(base64String, @"^data:image/(?<type>\w+);base64,(?<data>.+)$");
            if (!match.Success)
                throw new ArgumentException("تنسيق الصورة غير صالح.");

            string fileType = match.Groups["type"].Value.ToLower();
            string base64Data = match.Groups["data"].Value;

            if (fileType == "jpeg") fileType = "jpg";

            // 2. Validate MIME type extension
            if (fileType != "jpg" && fileType != "png" && fileType != "webp")
                throw new ArgumentException("صيغة الصورة غير مدعومة. يجب أن تكون JPG أو PNG أو WebP.");

            // 3. Decode base64 to byte array
            byte[] imageBytes;
            try
            {
                imageBytes = Convert.FromBase64String(base64Data);
            }
            catch
            {
                throw new ArgumentException("فشل فك تشفير الصورة الشخصية.");
            }

            // 4. Validate image file size (max 5MB)
            if (imageBytes.Length > MaxFileSizeInBytes)
                throw new ArgumentException("حجم الصورة كبير جداً. الحد الأقصى هو 5 ميجابايت.");

            // 5. Generate secure unique filename
            // Clean national ID for filesystem safety
            string safeNationalId = Regex.Replace(nationalId, @"[^a-zA-Z0-9_\-]", "");
            string uniqueFilename = $"{safeNationalId}_{Guid.NewGuid():N}.{fileType}";

            // 6. Resolve absolute upload path in wwwroot
            string uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            string absolutePath = Path.Combine(uploadsFolder, uniqueFilename);

            // 7. Write files asynchronously to disk
            await File.WriteAllBytesAsync(absolutePath, imageBytes);

            // 8. Return relative path for database storage
            return $"uploads/{uniqueFilename}";
        }

        public void DeleteFile(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath)) return;

            string absolutePath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), relativePath);
            if (File.Exists(absolutePath))
            {
                File.Delete(absolutePath);
            }
        }
    }
}
