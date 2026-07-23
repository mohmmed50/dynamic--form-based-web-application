namespace StudentRegistry.Domain.Entities
{
    public class SaudiStudentTotals
    {
        public int StudentId { get; set; }
        public string YearsCount { get; set; } = string.Empty;
        public decimal TotalAchieved { get; set; }
        public decimal TotalWeighted { get; set; }
        public int TotalCoefficients { get; set; }
        public decimal SchoolPercentage { get; set; }
        public decimal AptitudeScore { get; set; }
        public decimal FinalPercentage { get; set; }

        // Navigation property
        public virtual Student Student { get; set; } = null!;
    }
}
