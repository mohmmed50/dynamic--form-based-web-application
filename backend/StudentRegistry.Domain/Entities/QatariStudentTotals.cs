namespace StudentRegistry.Domain.Entities
{
    public class QatariStudentTotals
    {
        public int StudentId { get; set; }

        public decimal FinalTotal { get; set; }   // out of 700 (§1.4)
        public decimal Percentage { get; set; }

        // Documentation-only fields — never fed into the calculation (§1.3, §1.5).
        public decimal? IslamicEducationMark { get; set; }
        public decimal? PrintedTotal { get; set; }
        public decimal? PrintedPercentage { get; set; }

        // Navigation property
        public virtual Student Student { get; set; } = null!;
    }
}
