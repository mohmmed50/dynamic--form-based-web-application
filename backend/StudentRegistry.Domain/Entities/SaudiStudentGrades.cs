namespace StudentRegistry.Domain.Entities
{
    public class SaudiStudentGrades
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string YearLabel { get; set; } = string.Empty; // e.g., 'Year 1', 'Year 2', 'Year 3'
        public string SubjectName { get; set; } = string.Empty;
        public int Coefficient { get; set; }
        public decimal Achieved { get; set; }
        public decimal Weighted { get; set; }

        // Navigation property
        public virtual Student Student { get; set; } = null!;
    }
}
