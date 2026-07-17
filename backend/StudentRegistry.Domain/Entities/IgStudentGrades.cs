namespace StudentRegistry.Domain.Entities
{
    public class IgStudentGrades
    {
        public int StudentId { get; set; }
        public string IgProgram { get; set; } = string.Empty; // e.g. IGCSE, AS-Levels, A-Levels
        public decimal Factor { get; set; }
        public decimal SportsBonus { get; set; }
        public decimal ScorePercentage { get; set; }
        public decimal GovernmentScore { get; set; }

        // Navigation property
        public virtual Student Student { get; set; } = null!;
    }
}
