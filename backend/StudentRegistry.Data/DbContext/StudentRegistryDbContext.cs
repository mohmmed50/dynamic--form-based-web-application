using Microsoft.EntityFrameworkCore;
using StudentRegistry.Domain.Entities;
using System.Reflection;

namespace StudentRegistry.Data.DbContext
{
    public class StudentRegistryDbContext : Microsoft.EntityFrameworkCore.DbContext
    {
        public StudentRegistryDbContext(DbContextOptions<StudentRegistryDbContext> options)
            : base(options)
        {
        }

        public DbSet<Student> Students => Set<Student>();
        public DbSet<SaudiStudentTotals> SaudiStudentTotals => Set<SaudiStudentTotals>();
        public DbSet<SaudiStudentGrades> SaudiStudentGrades => Set<SaudiStudentGrades>();
        public DbSet<IgStudentGrades> IgStudentGrades => Set<IgStudentGrades>();
        public DbSet<IgStudentGradeCounts> IgStudentGradeCounts => Set<IgStudentGradeCounts>();
        public DbSet<StandardStudentGrades> StandardStudentGrades => Set<StandardStudentGrades>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Apply configurations from assembly
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}
