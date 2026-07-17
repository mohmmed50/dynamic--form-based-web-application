export interface StudentCreateDto {
  studentName: string;
  nationalId: string;
  certification: string;
  track: string;
  photo: string; // base64 string
  
  // Saudi specific
  yearsCount?: string;
  saudiGrades?: SaudiGradeCreateDto[];

  // IG specific
  igProgram?: string;
  factor?: number;
  sportsBonus?: number;
  igGradeCounts?: IgGradeCountCreateDto[];

  // Standard specific
  yearOfStudy?: string;
  standardGrades?: StandardGradeCreateDto[];
}

export interface SaudiGradeCreateDto {
  yearLabel: string;
  subjectName: string;
  coefficient: number;
  achieved: number;
}

export interface IgGradeCountCreateDto {
  gradeType: string;
  grade: string;
  count: number;
}

export interface StandardGradeCreateDto {
  yearOfStudy: string;
  subjectName: string;
  grade: number;
  weightedPercentage: number;
}

export interface StudentResponseDto {
  id: number;
  studentName: string;
  nationalId: string;
  certification: string;
  track: string;
  photoPath: string;
  submittedAt: string;
  saudiTotals?: SaudiTotalsResponseDto;
  saudiGrades?: SaudiGradeResponseDto[];
  igGrades?: IgGradesResponseDto;
  standardGrades?: StandardGradeResponseDto[];
}

export interface SaudiTotalsResponseDto {
  yearsCount: string;
  totalAchieved: number;
  totalWeighted: number;
  totalCoefficients: number;
  finalPercentage: number;
}

export interface SaudiGradeResponseDto {
  yearLabel: string;
  subjectName: string;
  coefficient: number;
  achieved: number;
  weighted: number;
}

export interface IgGradesResponseDto {
  igProgram: string;
  factor: number;
  sportsBonus: number;
  scorePercentage: number;
  governmentScore: number;
  gradeCounts: IgGradeCountResponseDto[];
}

export interface IgGradeCountResponseDto {
  gradeType: string;
  grade: string;
  count: number;
}

export interface StandardGradeResponseDto {
  yearOfStudy: string;
  subjectName: string;
  grade: number;
  weightedPercentage: number;
  achieved: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  file_path?: string;
}
