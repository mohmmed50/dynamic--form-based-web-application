using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentRegistry.Domain.Entities;

namespace StudentRegistry.Data.Configurations
{
    public class SaudiStudentGradesConfiguration : IEntityTypeConfiguration<SaudiStudentGrades>
    {
        public void Configure(EntityTypeBuilder<SaudiStudentGrades> builder)
        {
            builder.ToTable("SaudiStudentGrades", "dbo");

            builder.HasKey(g => g.Id);

            builder.Property(g => g.YearLabel)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(g => g.SubjectName)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(g => g.Achieved)
                .HasPrecision(18, 2);

            builder.Property(g => g.Weighted)
                .HasPrecision(18, 2);

            builder.HasIndex(g => new { g.StudentId, g.YearLabel });

            builder.HasOne(g => g.Student)
                .WithMany(s => s.SaudiGrades)
                .HasForeignKey(g => g.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
