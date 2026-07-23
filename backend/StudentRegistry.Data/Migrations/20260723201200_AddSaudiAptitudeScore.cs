using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentRegistry.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSaudiAptitudeScore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AptitudeScore",
                schema: "dbo",
                table: "SaudiStudentTotals",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SchoolPercentage",
                schema: "dbo",
                table: "SaudiStudentTotals",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AptitudeScore",
                schema: "dbo",
                table: "SaudiStudentTotals");

            migrationBuilder.DropColumn(
                name: "SchoolPercentage",
                schema: "dbo",
                table: "SaudiStudentTotals");
        }
    }
}
