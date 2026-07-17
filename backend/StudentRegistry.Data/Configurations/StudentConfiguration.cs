using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentRegistry.Domain.Entities;

namespace StudentRegistry.Data.Configurations
{
    public class StudentConfiguration : IEntityTypeConfiguration<Student>
    {
        public void Configure(EntityTypeBuilder<Student> builder)
        {
            builder.ToTable("Students", "dbo");

            builder.HasKey(s => s.Id);

            builder.Property(s => s.StudentName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(s => s.NationalId)
                .IsRequired()
                .HasMaxLength(20);

            builder.HasIndex(s => s.NationalId)
                .IsUnique();

            builder.Property(s => s.Certification)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(s => s.Track)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(s => s.PhotoPath)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(s => s.SubmittedAt)
                .IsRequired()
                .HasDefaultValueSql("SYSUTCDATETIME()");
        }
    }
}
