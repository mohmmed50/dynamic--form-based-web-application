using AutoMapper;
using StudentRegistry.Application.DTOs;
using StudentRegistry.Application.Interfaces;
using StudentRegistry.Domain.Entities;
using StudentRegistry.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudentRegistry.Application.Services
{
    public class StudentService : IStudentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;

        public StudentService(IUnitOfWork unitOfWork, IMapper mapper, IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
        }

        public async Task<StudentResponseDto?> GetStudentByIdAsync(int id)
        {
            var student = await _unitOfWork.Students.GetByIdAsync(id);
            return _mapper.Map<StudentResponseDto>(student);
        }

        public async Task<StudentResponseDto?> GetStudentByNationalIdAsync(string nationalId)
        {
            var student = await _unitOfWork.Students.GetByNationalIdAsync(nationalId);
            return _mapper.Map<StudentResponseDto>(student);
        }

        public async Task<IEnumerable<StudentResponseDto>> GetAllStudentsAsync()
        {
            var students = await _unitOfWork.Students.GetAllAsync();
            return _mapper.Map<IEnumerable<StudentResponseDto>>(students);
        }

        public async Task<StudentResponseDto> RegisterStudentAsync(StudentCreateDto createDto)
        {
            // 1. Verify uniqueness of NationalId
            var existingStudent = await _unitOfWork.Students.GetByNationalIdAsync(createDto.NationalId);
            if (existingStudent != null)
            {
                throw new InvalidOperationException("رقم قومي مسجل مسبقاً. لا يمكن إدخال نفس الرقم القومي مرتين.");
            }

            // 2. Save image to local wwwroot disk directory
            string relativePhotoPath = await _fileStorageService.SaveBase64ImageAsync(createDto.Photo, createDto.NationalId);

            // 3. Map base Student info
            var student = _mapper.Map<Student>(createDto);
            student.PhotoPath = relativePhotoPath;
            student.SubmittedAt = DateTime.UtcNow;

            // 4. Handle Sub-calculations and structures based on Cert Type
            string cert = createDto.Certification;
            if (cert.Contains("سعودية") || cert.Equals("Saudi Certificate", StringComparison.OrdinalIgnoreCase))
            {
                ProcessSaudiCertificate(createDto, student);
            }
            else if (cert.Contains("IG") || cert.Equals("ig", StringComparison.OrdinalIgnoreCase))
            {
                ProcessIgCertificate(createDto, student);
            }
            else
            {
                ProcessStandardCertificate(createDto, student);
            }

            // 5. Commit unit of work
            await _unitOfWork.Students.AddAsync(student);
            await _unitOfWork.CompleteAsync();

            // 6. Return mapped response
            return _mapper.Map<StudentResponseDto>(student);
        }

        // Official Saudi weighted-grade formula (source: the registrar's spreadsheet).
        // Per subject the student enters BOTH Achieved and Weighted; the coefficient is derived
        // (Weighted / Achieved) and must be a whole number — re-validated here server-side even
        // though StudentCreateDtoValidator already checked it, since the server is authoritative.
        // Per year block: yearPercentage = (Σ Weighted) / (Σ Coefficient), then multiplied by a
        // year-weight that depends on YearsCount (see GetSaudiYearWeights). The sum of the
        // weighted year percentages is the "school percentage", which is then averaged with the
        // student's AptitudeScore (درجة القدرات) for the final grade.
        private void ProcessSaudiCertificate(StudentCreateDto dto, Student student)
        {
            if (dto.SaudiGrades == null || !dto.SaudiGrades.Any())
                throw new ArgumentException("بيانات المواد والدرجات للشهادة السعودية مفقودة.");
            if (!dto.AptitudeScore.HasValue)
                throw new ArgumentException("درجة القدرات مفقودة.");

            string yearsCount = dto.YearsCount ?? "Three Years";
            var yearWeights = GetSaudiYearWeights(yearsCount);

            decimal overallAchieved = 0;
            decimal overallWeighted = 0;
            int overallCoefficients = 0;
            decimal schoolPercentage = 0;

            foreach (var yearGroup in dto.SaudiGrades.GroupBy(g => g.YearLabel))
            {
                decimal yearWeightedSum = 0;
                int yearCoefficientSum = 0;

                foreach (var gradeDto in yearGroup)
                {
                    if (gradeDto.Achieved <= 0)
                        throw new ArgumentException($"الدرجة المتحصلة لمادة \"{gradeDto.SubjectName}\" يجب أن تكون أكبر من الصفر.");

                    decimal rawCoefficient = gradeDto.Weighted / gradeDto.Achieved;
                    int coefficient = (int)Math.Round(rawCoefficient, MidpointRounding.AwayFromZero);
                    if (Math.Abs(rawCoefficient - coefficient) > 0.001m)
                        throw new ArgumentException($"درجات مادة \"{gradeDto.SubjectName}\" غير صحيحة: المعامل الناتج (الموزونة ÷ المتحصلة) ليس رقماً صحيحاً.");

                    student.SaudiGrades.Add(new SaudiStudentGrades
                    {
                        Student = student,
                        YearLabel = gradeDto.YearLabel,
                        SubjectName = gradeDto.SubjectName,
                        Achieved = gradeDto.Achieved,
                        Weighted = gradeDto.Weighted,
                        Coefficient = coefficient
                    });

                    overallAchieved += gradeDto.Achieved;
                    overallWeighted += gradeDto.Weighted;
                    overallCoefficients += coefficient;
                    yearWeightedSum += gradeDto.Weighted;
                    yearCoefficientSum += coefficient;
                }

                if (yearCoefficientSum <= 0)
                    throw new ArgumentException($"لا يمكن حساب نسبة السنة \"{yearGroup.Key}\" — مجموع المعاملات صفر.");

                if (!yearWeights.TryGetValue(yearGroup.Key, out decimal weightPercent))
                    throw new ArgumentException($"لا يوجد وزن معرف للسنة \"{yearGroup.Key}\" مع عدد سنوات الدراسة \"{yearsCount}\".");

                decimal yearPercentage = yearWeightedSum / yearCoefficientSum;
                schoolPercentage += yearPercentage * (weightPercent / 100m);
            }

            decimal finalPercentage = (schoolPercentage + dto.AptitudeScore.Value) / 2;

            student.SaudiTotals = new SaudiStudentTotals
            {
                Student = student,
                YearsCount = yearsCount,
                TotalAchieved = Math.Round(overallAchieved, 2),
                TotalWeighted = Math.Round(overallWeighted, 2),
                TotalCoefficients = overallCoefficients,
                SchoolPercentage = Math.Round(schoolPercentage, 2),
                AptitudeScore = dto.AptitudeScore.Value,
                FinalPercentage = Math.Round(finalPercentage, 2)
            };
        }

        private static Dictionary<string, decimal> GetSaudiYearWeights(string yearsCount) => yearsCount switch
        {
            "One Year" => new Dictionary<string, decimal> { ["Year 1"] = 100m },
            "Two Years" => new Dictionary<string, decimal> { ["Year 1"] = 50m, ["Year 2"] = 50m },
            _ => new Dictionary<string, decimal> { ["Year 1"] = 20m, ["Year 2"] = 40m, ["Year 3"] = 40m }
        };

        private void ProcessIgCertificate(StudentCreateDto dto, Student student)
        {
            if (dto.IgGradeCounts == null || !dto.IgGradeCounts.Any())
                throw new ArgumentException("توزيع درجات الـ IG مفقود.");

            string program = dto.IgProgram ?? "IGCSE";
            decimal factor = dto.Factor ?? 1.2m;
            decimal sportsBonus = dto.SportsBonus ?? 0m;
            
            int maxPointVal = program switch
            {
                "IGCSE" => 8,
                "AS-Levels" => 5,
                "A-Levels" => 6,
                _ => 8
            };

            int totalPoints = 0;
            int totalSubjects = 0;

            foreach (var countDto in dto.IgGradeCounts)
            {
                var countEntity = _mapper.Map<IgStudentGradeCounts>(countDto);
                countEntity.Student = student;
                student.IgGradeCounts.Add(countEntity);

                // Point aggregation based on IG standards
                int pointsPerSubject = GetIgPoints(countDto.GradeType, countDto.Grade);
                totalPoints += countDto.Count * pointsPerSubject;
                totalSubjects += countDto.Count;
            }

            int maxPoints = totalSubjects * maxPointVal;
            decimal scorePercentage = maxPoints > 0 
                ? ((decimal)totalPoints / maxPoints) * 100 
                : 0m;

            // Apply Coefficient Factor
            if (dto.Factor.HasValue && dto.Factor.Value > 0)
            {
                scorePercentage *= factor;
            }

            // Apply Sports Bonus
            scorePercentage += sportsBonus;

            // Calculate Egyptian Government score out of 410
            decimal governmentScore = (scorePercentage / 100) * 410;

            student.IgGrades = new IgStudentGrades
            {
                Student = student,
                IgProgram = program,
                Factor = factor,
                SportsBonus = sportsBonus,
                ScorePercentage = Math.Round(scorePercentage, 2),
                GovernmentScore = Math.Round(governmentScore, 2)
            };
        }

        private void ProcessStandardCertificate(StudentCreateDto dto, Student student)
        {
            if (dto.StandardGrades == null || !dto.StandardGrades.Any())
                throw new ArgumentException("بيانات المواد والدرجات للشهادة المعادلة مفقودة.");

            foreach (var gradeDto in dto.StandardGrades)
            {
                var grade = _mapper.Map<StandardStudentGrades>(gradeDto);
                grade.Student = student;
                student.StandardGrades.Add(grade);
            }
        }

        private int GetIgPoints(string gradeType, string grade)
        {
            // Point system translation matching frontend logic
            return gradeType switch
            {
                "igcse-legacy" => grade switch
                {
                    "A_STAR" => 8,
                    "A" => 7,
                    "B" => 6,
                    "C" => 5,
                    _ => 0
                },
                "igcse-numeric" => grade switch
                {
                    "9" => 8,
                    "8" => 7,
                    "7" => 6,
                    "6" => 5,
                    "5" => 4,
                    "4" => 3,
                    _ => 0
                },
                "as-level" => grade switch
                {
                    "A" => 5,
                    "B" => 4,
                    "C" => 3,
                    "D" => 2,
                    _ => 0
                },
                "a-level" => grade switch
                {
                    "A_STAR" => 6,
                    "A" => 5,
                    "B" => 4,
                    "C" => 3,
                    "D" => 2,
                    _ => 0
                },
                _ => 0
            };
        }
    }
}
