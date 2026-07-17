using StudentRegistry.Data.DbContext;
using StudentRegistry.Domain.Interfaces;
using System.Threading.Tasks;

namespace StudentRegistry.Repository.Implementations
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly StudentRegistryDbContext _context;
        private IStudentRepository? _students;

        public UnitOfWork(StudentRegistryDbContext context)
        {
            _context = context;
        }

        public IStudentRepository Students => _students ??= new StudentRepository(_context);

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
