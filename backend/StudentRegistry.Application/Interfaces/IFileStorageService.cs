using System.Threading.Tasks;

namespace StudentRegistry.Application.Interfaces
{
    public interface IFileStorageService
    {
        /// <summary>
        /// Saves a base64 encoded photo and returns the relative path of the saved file.
        /// </summary>
        Task<string> SaveBase64ImageAsync(string base64String, string nationalId);
        
        /// <summary>
        /// Deletes a file from physical storage.
        /// </summary>
        void DeleteFile(string relativePath);
    }
}
