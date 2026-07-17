using System;
using System.Threading.Tasks;

namespace StudentRegistry.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IStudentRepository Students { get; }
        Task<int> CompleteAsync();
    }
}
