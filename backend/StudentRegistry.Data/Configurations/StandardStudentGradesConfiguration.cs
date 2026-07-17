using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentRegistry.Domain.Entities;

namespace StudentRegistry.Data.Configurations
{
    public class StandardStudentGradesConfiguration : IEntityTypeConfiguration<StandardStudentGrades>
    {
        public void Configure(EntityTypeBuilder<StandardStudentGrades> builder)
        {
            builder.ToTable("StandardStudentGrades", "dbo");

            builder.HasKey(g => g.Id);

            builder.Property(g => g.YearOfStudy)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(g => g.SubjectName)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(g => g.Grade)
                .HasPrecision(18, 2);

            builder.Property(g => g.WeightedPercentage)
                .HasPrecision(18, 2);

            builder.Property(g => g.Achieved)
                .HasPrecision(18, 2);

            builder.HasIndex(g => new { g.StudentId, g.YearOfStudy });

            builder.HasOne(g => g.Student)
                .WithMany(s => s.StandardGrades)
                .HasForeignKey(g => g.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
