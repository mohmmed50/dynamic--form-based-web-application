using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentRegistry.Domain.Entities;

namespace StudentRegistry.Data.Configurations
{
    public class IgStudentGradesConfiguration : IEntityTypeConfiguration<IgStudentGrades>
    {
        public void Configure(EntityTypeBuilder<IgStudentGrades> builder)
        {
            builder.ToTable("IGStudentGrades", "dbo");

            builder.HasKey(g => g.StudentId);

            builder.Property(g => g.IgProgram)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(g => g.Factor)
                .HasPrecision(18, 2);

            builder.Property(g => g.SportsBonus)
                .HasPrecision(18, 2);

            builder.Property(g => g.ScorePercentage)
                .HasPrecision(18, 2);

            builder.Property(g => g.GovernmentScore)
                .HasPrecision(18, 2);

            builder.HasOne(g => g.Student)
                .WithOne(s => s.IgGrades)
                .HasForeignKey<IgStudentGrades>(g => g.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
