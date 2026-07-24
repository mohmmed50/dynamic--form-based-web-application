namespace StudentRegistry.Domain.Entities
{
    public class YemeniStudentTotals
    {
        public int StudentId { get; set; }
        public decimal FinalTotal { get; set; }   // out of 600 (§1.4)
        public decimal Percentage { get; set; }
        public virtual Student Student { get; set; } = null!;
    }
}
