using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentRegistry.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.CreateTable(
                name: "Students",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StudentNameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NationalId = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    GuardianName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    GuardianPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    GuardianRelation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AddressGov = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AddressCenter = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AddressVillage = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AddressStreet = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AddressBuilding = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AddressFloor = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Certification = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Track = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PhotoPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Students", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IGStudentGradeCounts",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    GradeType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Grade = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Count = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IGStudentGradeCounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IGStudentGradeCounts_Students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "dbo",
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IGStudentGrades",
                schema: "dbo",
                columns: table => new
                {
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    IgProgram = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Factor = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SportsBonus = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ScorePercentage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    GovernmentScore = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IGStudentGrades", x => x.StudentId);
                    table.ForeignKey(
                        name: "FK_IGStudentGrades_Students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "dbo",
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SaudiStudentGrades",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    YearLabel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SubjectName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Coefficient = table.Column<int>(type: "int", nullable: false),
                    Achieved = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Weighted = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaudiStudentGrades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SaudiStudentGrades_Students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "dbo",
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SaudiStudentTotals",
                schema: "dbo",
                columns: table => new
                {
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    YearsCount = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TotalAchieved = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalWeighted = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalCoefficients = table.Column<int>(type: "int", nullable: false),
                    FinalPercentage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SaudiStudentTotals", x => x.StudentId);
                    table.ForeignKey(
                        name: "FK_SaudiStudentTotals_Students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "dbo",
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StandardStudentGrades",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    YearOfStudy = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SubjectName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Grade = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    WeightedPercentage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Achieved = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StandardStudentGrades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StandardStudentGrades_Students_StudentId",
                        column: x => x.StudentId,
                        principalSchema: "dbo",
                        principalTable: "Students",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IGStudentGradeCounts_StudentId",
                schema: "dbo",
                table: "IGStudentGradeCounts",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_SaudiStudentGrades_StudentId_YearLabel",
                schema: "dbo",
                table: "SaudiStudentGrades",
                columns: new[] { "StudentId", "YearLabel" });

            migrationBuilder.CreateIndex(
                name: "IX_StandardStudentGrades_StudentId_YearOfStudy",
                schema: "dbo",
                table: "StandardStudentGrades",
                columns: new[] { "StudentId", "YearOfStudy" });

            migrationBuilder.CreateIndex(
                name: "IX_Students_NationalId",
                schema: "dbo",
                table: "Students",
                column: "NationalId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IGStudentGradeCounts",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "IGStudentGrades",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "SaudiStudentGrades",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "SaudiStudentTotals",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "StandardStudentGrades",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "Students",
                schema: "dbo");
        }
    }
}
