namespace StudentRegistry.Domain.Entities
{
    public class BahrainiStudentTotals
    {
        public int StudentId { get; set; }

        // "علمي" or "أدبي" — the only two tracks with a defined subject list today.
        public string Track { get; set; } = string.Empty;

        public decimal FinalTotal { get; set; }
        public decimal TotalMax { get; set; }   // 700 (علمي) or 800 (أدبي)
        public decimal Percentage { get; set; }
        public decimal EquivalentTotal { get; set; }   // out of 410

        public virtual Student Student { get; set; } = null!;
    }
}
