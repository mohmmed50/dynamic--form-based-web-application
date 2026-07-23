namespace StudentRegistry.Domain.Entities
{
    public class KuwaitiStudentTotals
    {
        public int StudentId { get; set; }

        // "One Year" (grade 12 only), "Two Years" (grade 11 + 12), or "Three Years" (grade 10 + 11 + 12).
        public string YearsCount { get; set; } = string.Empty;

        // Grade 10 fields are null unless YearsCount is "Three Years".
        public decimal? Grade10Percentage { get; set; }
        public decimal? Grade10Weight { get; set; }

        // Grade 11 fields are null when YearsCount is "One Year".
        public decimal? Grade11Percentage { get; set; }
        public decimal? Grade11Weight { get; set; }

        public decimal Grade12Percentage { get; set; }
        public decimal Grade12Weight { get; set; }

        public decimal FinalPercentage { get; set; }
        public decimal EquivalentTotal { get; set; }
        public bool HasSecondAttempt { get; set; }

        // Navigation property
        public virtual Student Student { get; set; } = null!;
    }
}
