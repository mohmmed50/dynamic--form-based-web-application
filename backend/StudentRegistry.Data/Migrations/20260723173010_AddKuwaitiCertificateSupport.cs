using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentRegistry.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddKuwaitiCertificateSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GradeLevel",
                schema: "dbo",
                table: "StandardStudentGrades",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxMark",
                schema: "dbo",
                table: "StandardStudentGrades",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "KuwaitiStudentTotals",
                schema: "dbo",
                columns: table => new
                {
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    YearsCount = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Grade10Percentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    Grade10Weight = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    Grade11Percentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    Grade11Weight = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    Grade12Percentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Grade12Weight = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    FinalPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    EquivalentTotal = table.Column<decimal>(type: "decimal(7,2)", precision: 7, scale: 2, nullable: false),
                    HasSecondAttempt = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KuwaitiStudentTotals", x => x.StudentId);
                    table.ForeignKey(
                        name: "FK_KuwaitiStudentTotals_Students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "dbo",
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KuwaitiStudentTotals",
                schema: "dbo");

            migrationBuilder.DropColumn(
                name: "GradeLevel",
                schema: "dbo",
                table: "StandardStudentGrades");

            migrationBuilder.DropColumn(
                name: "MaxMark",
                schema: "dbo",
                table: "StandardStudentGrades");
        }
    }
}
