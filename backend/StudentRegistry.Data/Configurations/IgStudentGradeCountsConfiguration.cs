using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentRegistry.Domain.Entities;

namespace StudentRegistry.Data.Configurations
{
    public class IgStudentGradeCountsConfiguration : IEntityTypeConfiguration<IgStudentGradeCounts>
    {
        public void Configure(EntityTypeBuilder<IgStudentGradeCounts> builder)
        {
            builder.ToTable("IGStudentGradeCounts", "dbo");

            builder.HasKey(c => c.Id);

            builder.Property(c => c.GradeType)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(c => c.Grade)
                .IsRequired()
                .HasMaxLength(20);

            builder.HasIndex(c => c.StudentId);

            builder.HasOne(c => c.Student)
                .WithMany(s => s.IgGradeCounts)
                .HasForeignKey(c => c.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
