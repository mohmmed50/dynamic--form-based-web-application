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

        private void ProcessSaudiCertificate(StudentCreateDto dto, Student student)
        {
            if (dto.SaudiGrades == null || !dto.SaudiGrades.Any())
                throw new ArgumentException("بيانات المواد والدرجات للشهادة السعودية مفقودة.");

            decimal overallAchieved = 0;
            decimal overallWeighted = 0;
            int overallCoefficients = 0;

            foreach (var gradeDto in dto.SaudiGrades)
            {
                var grade = _mapper.Map<SaudiStudentGrades>(gradeDto);
                grade.Student = student;
                
                overallAchieved += grade.Achieved;
                overallWeighted += grade.Weighted;
                overallCoefficients += grade.Coefficient;

                student.SaudiGrades.Add(grade);
            }

            decimal finalPercentage = overallCoefficients > 0 
                ? (overallWeighted / (100 * overallCoefficients)) * 100 
                : 0;

            student.SaudiTotals = new SaudiStudentTotals
            {
                Student = student,
                YearsCount = dto.YearsCount ?? "Three Years",
                TotalAchieved = Math.Round(overallAchieved, 2),
                TotalWeighted = Math.Round(overallWeighted, 2),
                TotalCoefficients = overallCoefficients,
                FinalPercentage = Math.Round(finalPercentage, 2)
            };
        }

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
