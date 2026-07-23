namespace StudentRegistry.Domain.Entities
{
    public class QatariStudentTotals
    {
        public int StudentId { get; set; }

        public decimal FinalTotal { get; set; }   // out of 700 (§1.4)
        public decimal Percentage { get; set; }

        // Navigation property
        public virtual Student Student { get; set; } = null!;
    }
}
