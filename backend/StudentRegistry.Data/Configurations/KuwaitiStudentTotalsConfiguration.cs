using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentRegistry.Domain.Entities;

namespace StudentRegistry.Data.Configurations
{
    public class KuwaitiStudentTotalsConfiguration : IEntityTypeConfiguration<KuwaitiStudentTotals>
    {
        public void Configure(EntityTypeBuilder<KuwaitiStudentTotals> builder)
        {
            builder.ToTable("KuwaitiStudentTotals", "dbo");

            builder.HasKey(t => t.StudentId);

            builder.Property(t => t.YearsCount)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(t => t.Grade10Percentage).HasPrecision(5, 2);
            builder.Property(t => t.Grade11Percentage).HasPrecision(5, 2);
            builder.Property(t => t.Grade12Percentage).HasPrecision(5, 2);

            builder.Property(t => t.Grade10Weight).HasPrecision(5, 2);
            builder.Property(t => t.Grade11Weight).HasPrecision(5, 2);
            builder.Property(t => t.Grade12Weight).HasPrecision(5, 2);

            builder.Property(t => t.FinalPercentage).HasPrecision(5, 2);
            builder.Property(t => t.EquivalentTotal).HasPrecision(7, 2);

            builder.HasOne(t => t.Student)
                .WithOne(s => s.KuwaitiTotals)
                .HasForeignKey<KuwaitiStudentTotals>(t => t.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
