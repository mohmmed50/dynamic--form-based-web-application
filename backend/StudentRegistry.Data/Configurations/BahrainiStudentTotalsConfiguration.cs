using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentRegistry.Domain.Entities;

namespace StudentRegistry.Data.Configurations
{
    public class BahrainiStudentTotalsConfiguration : IEntityTypeConfiguration<BahrainiStudentTotals>
    {
        public void Configure(EntityTypeBuilder<BahrainiStudentTotals> builder)
        {
            builder.ToTable("BahrainiStudentTotals", "dbo");

            builder.HasKey(t => t.StudentId);

            builder.Property(t => t.Track).IsRequired().HasMaxLength(50);
            builder.Property(t => t.FinalTotal).HasPrecision(6, 2);
            builder.Property(t => t.TotalMax).HasPrecision(6, 2);
            builder.Property(t => t.Percentage).HasPrecision(5, 2);
            builder.Property(t => t.EquivalentTotal).HasPrecision(6, 2);

            builder.HasOne(t => t.Student)
                .WithOne(s => s.BahrainiTotals)
                .HasForeignKey<BahrainiStudentTotals>(t => t.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
