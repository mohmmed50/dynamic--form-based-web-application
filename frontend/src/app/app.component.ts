import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from './services/config.service';
import { StudentService } from './services/student.service';
import { StudentCreateDto, StudentResponseDto, SaudiGradeCreateDto, IgGradeCountCreateDto, StandardGradeCreateDto } from './models/student.model';

interface SubjectEntry {
  name: string;
  displayName: string;
  coefficient: number;
  achieved?: number;
  weight?: number;
}

interface SaudiBlock {
  label: string;
  key: string;
  subjects: SubjectEntry[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Page / Stepper State
  currentStep = 1;
  isSubmitted = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Core Configurations (Loaded from API or fallbacks)
  certificationsConfig: any = {};
  subjectsConfig: any = {};
  saudiSubjectsConfig: any = {};
  certList: { key: string; name: string }[] = [];
  trackList: string[] = [];

  // Form Fields
  photoBase64 = '';
  photoMetaText = '';
  photoFeedbackText = '';
  photoFeedbackClass = '';
  
  studentName = '';
  nationalId = '';
  selectedCert = '';
  selectedTrack = '';
  trackLocked = false;
  selectedYear = '';

  // Non-IG, Non-Saudi Grades (Standard)
  standardSubjects: { name: string; grade?: number; weight?: number }[] = [];

  // Saudi Year-by-Year Blocks
  saudiBlocks: SaudiBlock[] = [];
  saudiTotals = {
    totalAchieved: 0,
    totalWeighted: 0,
    totalCoefficients: 0,
    finalPercentage: 0
  };

  // IG Program Type and Grades Calculator
  igProgramType: 'IGCSE' | 'AS-Levels' | 'A-Levels' = 'IGCSE';
  igLegacyGrades = [
    { label: 'A* (A Star)', key: 'A_STAR', count: 0 },
    { label: 'A', key: 'A', count: 0 },
    { label: 'B', key: 'B', count: 0 },
    { label: 'C', key: 'C', count: 0 }
  ];
  igNumericGrades = [
    { label: '9', key: '9', count: 0 },
    { label: '8', key: '8', count: 0 },
    { label: '7', key: '7', count: 0 },
    { label: '6', key: '6', count: 0 },
    { label: '5', key: '5', count: 0 },
    { label: '4', key: '4', count: 0 }
  ];
  igAsGrades = [
    { label: 'A', key: 'A', count: 0 },
    { label: 'B', key: 'B', count: 0 },
    { label: 'C', key: 'C', count: 0 },
    { label: 'D', key: 'D', count: 0 }
  ];
  igALevelGrades = [
    { label: 'A*', key: 'A_STAR', count: 0 },
    { label: 'A', key: 'A', count: 0 },
    { label: 'B', key: 'B', count: 0 },
    { label: 'C', key: 'C', count: 0 },
    { label: 'D', key: 'D', count: 0 }
  ];

  igFactorEnabled = false;
  igFactorValue = 1.2;
  igSportsBonus = 0;
  igTotals = {
    scorePercentage: 0,
    governmentScore: 0
  };

  // Select dropdown range (0 to 8 subjects)
  selectRange = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  // Submission Results
  submittedStudent?: StudentResponseDto;

  // Fallbacks local config
  private readonly subjectsFallback = {
    "certifications": {
      "ig": { "name": "شهادات الـ IG (IGCSE/O-Level/A-Level)", "tracks": ["IGCSE (Early Years) - مواد عامة", "A-Levels (Advanced Years) - تخصص علمي أو أدبي", "AS-Levels (Intermediate Year) - انتقالى"] },
      "saudi": { "name": "شهادة سعودية", "tracks": ["المسار العام", "مسار العلوم", "مسار الإدارة والأعمال", "مسار الهندسة والتكنولوجيا", "مسار العلوم الإنسانية"] },
      "qatari": { "name": "شهادة قطرية", "tracks": ["المسار العلمي", "المسار الأدبي والإنسانيات", "مسار التكنولوجيا"] },
      "bahraini": { "name": "شهادة بحرينية", "tracks": ["مسار العلوم والرياضيات", "مسار اللغات والعلوم الإنسانية", "مسار العلوم التجارية"] },
      "kuwaiti": { "name": "شهادة كويتية", "tracks": ["القسم العلمي", "القسم الأدبي"] }
    },
    "subjects": {
      "year_1": ["اللغة العربية", "اللغة الإنجليزية", "الرياضيات", "الكيمياء", "الفيزياء", "الأحياء", "الدراسات الإسلامية", "الدراسات الاجتماعية"],
      "year_2": ["اللغة العربية", "اللغة الإنجليزية", "الرياضيات (2)", "الكيمياء", "الفيزياء", "الأحياء", "الحاسب الآلي", "الدراسات الإسلامية"],
      "year_3": ["اللغة العربية", "اللغة الإنجليزية", "الرياضيات (3)", "الكيمياء", "الفيزياء", "الجيولوجيا والعلوم البيئية", "الدراسات الإسلامية", "التربية الوطنية"]
    }
  };

  private readonly saudiSubjectsFallback = {
    "block_1": [
      { "name": "مصادر المعلومات والبحث", "coefficient": 3 },
      { "name": "الفيزياء", "coefficient": 5 },
      { "name": "الرياضيات", "coefficient": 4 },
      { "name": "الجغرافيا", "coefficient": 3 },
      { "name": "الكيمياء", "coefficient": 5 },
      { "name": "اللغة الإنجليزية", "coefficient": 4 },
      { "name": "التقنية الرقمية", "coefficient": 3 },
      { "name": "التنمية المستدامة", "coefficient": 3 },
      { "name": "المهارات الحياتية", "coefficient": 3 },
      { "name": "المواطنة الرقمية", "coefficient": 3 },
      { "name": "علم الأرض والفضاء", "coefficient": 4 },
      { "name": "الفقه", "coefficient": 3 },
      { "name": "التربية الصحية والبدنية", "coefficient": 4 },
      { "name": "الدراسات النفسية والاجتماعية", "coefficient": 3 },
      { "name": "الدراسات الأدبية", "coefficient": 3 }
    ],
    "block_2": [
      { "name": "علم الأحياء", "coefficient": 4 },
      { "name": "التربية البدنية والدفاع عن النفس", "coefficient": 5 },
      { "name": "اللياقة والثقافة الصحية", "coefficient": 5 },
      { "name": "الفنون", "coefficient": 3 },
      { "name": "الكيمياء", "coefficient": 5 },
      { "name": "اللغة الإنجليزية", "coefficient": 5 },
      { "name": "التوحيد", "coefficient": 5 },
      { "name": "الكفايات اللغوية", "coefficient": 3 },
      { "name": "التاريخ", "coefficient": 5 },
      { "name": "التقنية الرقمية", "coefficient": 3 },
      { "name": "الفيزياء", "coefficient": 5 }
    ],
    "block_3": [
      { "name": "القرآن الكريم والتفسير", "coefficient": 4 },
      { "name": "الكفايات اللغوية", "coefficient": 5 },
      { "name": "علم الأحياء", "coefficient": 5 },
      { "name": "التربية البدنية والدفاع عن النفس", "coefficient": 5 },
      { "name": "اللغة الإنجليزية", "coefficient": 5 },
      { "name": "التقنية الرقمية", "coefficient": 3 },
      { "name": "التفكير الناقد", "coefficient": 4 },
      { "name": "الفيزياء", "coefficient": 5 },
      { "name": "علم البيئة", "coefficient": 3 },
      { "name": "الرياضيات", "coefficient": 5 },
      { "name": "التربية الصحية والبدنية", "coefficient": 3 },
      { "name": "التربية المهنية", "coefficient": 3 },
      { "name": "الدراسات الاجتماعية", "coefficient": 5 },
      { "name": "الكيمياء", "coefficient": 5 },
      { "name": "الحديث والثقافة الإسلامية", "coefficient": 3 }
    ]
  };

  private readonly igPointsMapping: { [key: string]: { [key: string]: number } } = {
    "igcse-legacy": { "A_STAR": 8, "A": 7, "B": 6, "C": 5 },
    "igcse-numeric": { "9": 8, "8": 7, "7": 6, "6": 5, "5": 4, "4": 3 },
    "as-level": { "A": 5, "B": 4, "C": 3, "D": 2 },
    "a-level": { "A_STAR": 6, "A": 5, "B": 4, "C": 3, "D": 2 }
  };

  constructor(
    private configService: ConfigService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadConfiguration();
  }

  // Load subject/certification configs from API, fallback to local variables if offline
  loadConfiguration(): void {
    this.configService.getSubjectsConfig().subscribe({
      next: (config) => {
        this.certificationsConfig = config.certifications;
        this.subjectsConfig = config.subjects;
        this.parseCertifications();
      },
      error: () => {
        console.warn('API config unavailable. Using offline fallbacks.');
        this.certificationsConfig = this.subjectsFallback.certifications;
        this.subjectsConfig = this.subjectsFallback.subjects;
        this.parseCertifications();
      }
    });

    this.configService.getSaudiSubjectsConfig().subscribe({
      next: (saudiConfig) => {
        this.saudiSubjectsConfig = saudiConfig;
      },
      error: () => {
        this.saudiSubjectsConfig = this.saudiSubjectsFallback;
      }
    });
  }

  parseCertifications(): void {
    this.certList = Object.keys(this.certificationsConfig).map(key => ({
      key: key,
      name: this.certificationsConfig[key].name
    }));
  }

  // Dynamic Step Percent Calculator
  getProgressPercent(): number {
    let completedCount = 0;
    const totalSteps = this.selectedCert === 'ig' ? 4 : 5;

    // Step 1: Photo
    if (this.photoBase64) completedCount++;
    // Step 2: Personal Details
    if (this.studentName.trim() && this.nationalId.trim().length >= 8) completedCount++;
    // Step 3: Cert & Track
    if (this.selectedCert && this.selectedTrack) completedCount++;
    
    if (this.selectedCert !== 'ig') {
      // Step 4: Year of Study
      if (this.selectedYear) completedCount++;
      // Step 5: Grades
      if (this.isGradesStepValid()) completedCount++;
    } else {
      // Step 4: IG Grades
      if (this.isGradesStepValid()) completedCount++;
    }

    return (completedCount / totalSteps) * 100;
  }

  getMaxSteps(): number {
    return this.selectedCert === 'ig' ? 4 : 5;
  }

  isStepValid(): boolean {
    if (this.currentStep === 1) {
      return !!this.photoBase64;
    }
    if (this.currentStep === 2) {
      return !!this.studentName.trim() && this.nationalId.trim().length >= 8 && this.nationalId.trim().length <= 20;
    }
    if (this.currentStep === 3) {
      return !!this.selectedCert && !!this.selectedTrack;
    }
    if (this.currentStep === 4) {
      if (this.selectedCert === 'ig') {
        return this.isGradesStepValid();
      }
      return !!this.selectedYear;
    }
    if (this.currentStep === 5) {
      return this.isGradesStepValid();
    }
    return false;
  }

  isGradesStepAvailable(): boolean {
    if (this.selectedCert === 'ig') {
      return this.currentStep === 4;
    }
    return this.currentStep === 5 && !!this.selectedYear;
  }

  private isGradesStepValid(): boolean {
    if (this.selectedCert === 'ig') {
      let totalIGSubjects = 0;
      if (this.igProgramType === 'IGCSE') {
        totalIGSubjects += this.igLegacyGrades.reduce((sum, g) => sum + g.count, 0);
        totalIGSubjects += this.igNumericGrades.reduce((sum, g) => sum + g.count, 0);
      } else if (this.igProgramType === 'AS-Levels') {
        totalIGSubjects += this.igAsGrades.reduce((sum, g) => sum + g.count, 0);
      } else if (this.igProgramType === 'A-Levels') {
        totalIGSubjects += this.igALevelGrades.reduce((sum, g) => sum + g.count, 0);
      }
      return totalIGSubjects > 0 && this.igSportsBonus >= 0 && this.igSportsBonus <= 30;
    }

    if (this.selectedCert === 'saudi') {
      if (!this.saudiBlocks.length) return false;
      return this.saudiBlocks.every(block =>
        block.subjects.every(sub => sub.achieved !== undefined && sub.achieved >= 0 && sub.achieved <= 100)
      );
    }

    if (!this.standardSubjects.length) return false;
    return this.standardSubjects.every(sub =>
      sub.grade !== undefined && sub.grade >= 0 && sub.grade <= 100 &&
      sub.weight !== undefined && sub.weight >= 0 && sub.weight <= 100
    );
  }

  onNextStep(): void {
    if (this.currentStep < this.getMaxSteps() && this.isStepValid()) {
      this.errorMessage = '';
      this.currentStep++;
    }
  }

  onPrevStep(): void {
    if (this.currentStep > 1) {
      this.errorMessage = '';
      this.currentStep--;
    }
  }

  // Dropdowns triggers
  onCertChange(): void {
    this.selectedTrack = '';
    this.selectedYear = '';
    this.trackLocked = false;
    this.standardSubjects = [];
    this.saudiBlocks = [];
    
    if (this.selectedCert) {
      this.trackList = this.certificationsConfig[this.selectedCert].tracks;
    } else {
      this.trackList = [];
    }
  }

  onTrackChange(): void {
    if (this.selectedTrack) {
      this.trackLocked = true;
      if (this.selectedCert === 'ig') {
        if (this.selectedTrack.includes('IGCSE')) {
          this.igProgramType = 'IGCSE';
        } else if (this.selectedTrack.includes('AS-Levels')) {
          this.igProgramType = 'AS-Levels';
        } else if (this.selectedTrack.includes('A-Levels')) {
          this.igProgramType = 'A-Levels';
        }
        this.calculateIGGPA();
      }
    }
  }

  onYearChange(): void {
    if (!this.selectedYear) {
      this.standardSubjects = [];
      this.saudiBlocks = [];
      return;
    }

    if (this.selectedCert === 'saudi') {
      this.saudiBlocks = [];
      const b1 = this.saudiSubjectsConfig.block_1 || [];
      const b2 = this.saudiSubjectsConfig.block_2 || [];
      const b3 = this.saudiSubjectsConfig.block_3 || [];

      // Deduplicate year blocks
      const occurrenceCounts: { [key: string]: number } = {};
      const addBlock = (label: string, key: string, rawList: any[]) => {
        const subjects: SubjectEntry[] = rawList.map(s => {
          occurrenceCounts[s.name] = (occurrenceCounts[s.name] || 0) + 1;
          return {
            name: s.name,
            displayName: s.name,
            coefficient: s.coefficient,
            achieved: undefined
          };
        });
        this.saudiBlocks.push({ label, key, subjects });
      };

      if (this.selectedYear === 'One Year') {
        addBlock('الصف الثالث الثانوي (Third Secondary Grade)', 'Year 1', JSON.parse(JSON.stringify(b1)));
      } else if (this.selectedYear === 'Two Years') {
        addBlock('الصف الثاني الثانوي (Second Secondary Grade)', 'Year 1', JSON.parse(JSON.stringify(b1)));
        addBlock('الصف الثالث الثانوي (Third Secondary Grade)', 'Year 2', JSON.parse(JSON.stringify(b2)));
      } else if (this.selectedYear === 'Three Years') {
        addBlock('الصف الأول الثانوي (First Secondary Grade)', 'Year 1', JSON.parse(JSON.stringify(b1)));
        addBlock('الصف الثاني الثانوي (Second Secondary Grade)', 'Year 2', JSON.parse(JSON.stringify(b2)));
        addBlock('الصف الثالث الثانوي (Third Secondary Grade)', 'Year 3', JSON.parse(JSON.stringify(b3)));
      }

      // Add occurrence suffix for duplicate names
      const curOccurrence: { [key: string]: number } = {};
      this.saudiBlocks.forEach(block => {
        block.subjects.forEach(sub => {
          if (occurrenceCounts[sub.name] > 1) {
            curOccurrence[sub.name] = (curOccurrence[sub.name] || 0) + 1;
            sub.displayName = `${sub.name} (${curOccurrence[sub.name]})`;
          }
        });
      });
      this.calculateSaudiGPA();

    } else {
      let subNames: string[] = [];
      if (this.selectedYear === 'أولى ثانوي') {
        subNames = this.subjectsConfig.year_1 || [];
      } else if (this.selectedYear === 'تانية ثانوي') {
        subNames = this.subjectsConfig.year_2 || [];
      } else if (this.selectedYear === 'تالتة ثانوي') {
        subNames = this.subjectsConfig.year_3 || [];
      }

      this.standardSubjects = subNames.map(name => ({
        name: name,
        grade: undefined,
        weight: undefined
      }));
    }
  }

  // Mathematical GPA Calculations
  calculateStandardGPA(): void {
    this.errorMessage = '';
    // Simply forces UI refresh. Achieved weights are handled in HTML pipes/templates.
  }

  calculateSaudiGPA(): void {
    this.errorMessage = '';
    let overallAchieved = 0;
    let overallWeighted = 0;
    let overallCoefficients = 0;

    this.saudiBlocks.forEach(block => {
      block.subjects.forEach(sub => {
        const ach = sub.achieved || 0;
        overallAchieved += ach;
        overallWeighted += ach * sub.coefficient;
        overallCoefficients += sub.coefficient;
      });
    });

    const finalPercentage = overallCoefficients > 0 
      ? (overallWeighted / (100 * overallCoefficients)) * 100 
      : 0;

    this.saudiTotals = {
      totalAchieved: parseFloat(overallAchieved.toFixed(2)),
      totalWeighted: parseFloat(overallWeighted.toFixed(2)),
      totalCoefficients: overallCoefficients,
      finalPercentage: parseFloat(finalPercentage.toFixed(2))
    };
  }

  calculateIGGPA(): void {
    this.errorMessage = '';
    let subsystemKey = '';
    let maxPointVal = 8;

    if (this.igProgramType === 'IGCSE') {
      subsystemKey = 'igcse';
      maxPointVal = 8;
    } else if (this.igProgramType === 'AS-Levels') {
      subsystemKey = 'as-level';
      maxPointVal = 5;
    } else if (this.igProgramType === 'A-Levels') {
      subsystemKey = 'a-level';
      maxPointVal = 6;
    }

    let totalPoints = 0;
    let totalSubjects = 0;

    if (subsystemKey === 'igcse') {
      this.igLegacyGrades.forEach(g => {
        const pts = this.igPointsMapping['igcse-legacy'][g.key] || 0;
        totalPoints += g.count * pts;
        totalSubjects += g.count;
      });
      this.igNumericGrades.forEach(g => {
        const pts = this.igPointsMapping['igcse-numeric'][g.key] || 0;
        totalPoints += g.count * pts;
        totalSubjects += g.count;
      });
    } else if (subsystemKey === 'as-level') {
      this.igAsGrades.forEach(g => {
        const pts = this.igPointsMapping['as-level'][g.key] || 0;
        totalPoints += g.count * pts;
        totalSubjects += g.count;
      });
    } else if (subsystemKey === 'a-level') {
      this.igALevelGrades.forEach(g => {
        const pts = this.igPointsMapping['a-level'][g.key] || 0;
        totalPoints += g.count * pts;
        totalSubjects += g.count;
      });
    }

    const maxPoints = totalSubjects * maxPointVal;
    let scorePercentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    if (this.igFactorEnabled) {
      scorePercentage *= this.igFactorValue;
    }

    scorePercentage += this.igSportsBonus;
    const governmentScore = (scorePercentage / 100) * 410;

    this.igTotals = {
      scorePercentage: parseFloat(scorePercentage.toFixed(2)),
      governmentScore: parseFloat(governmentScore.toFixed(2))
    };
  }

  // Saudi subtotal helper accessors
  getBlockAchievedSum(block: SaudiBlock): number {
    return block.subjects.reduce((sum, s) => sum + (s.achieved || 0), 0);
  }

  getBlockCoefficientsSum(block: SaudiBlock): number {
    return block.subjects.reduce((sum, s) => sum + s.coefficient, 0);
  }

  getBlockWeightedSum(block: SaudiBlock): number {
    return block.subjects.reduce((sum, s) => sum + ((s.achieved || 0) * s.coefficient), 0);
  }

  // Photo Handling & Base64 conversions
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processPhoto(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processPhoto(files[0]);
    }
  }

  private processPhoto(file: File): void {
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      this.errorMessage = 'عذراً، يجب أن تكون الصورة بصيغة JPG أو PNG أو WebP.';
      this.photoBase64 = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'حجم الصورة كبير جداً. الحد الأقصى هو 5 ميجابايت.';
      this.photoBase64 = '';
      return;
    }

    this.errorMessage = '';
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64Data = e.target.result;
      const img = new Image();
      img.onload = () => {
        const ratio = img.height / img.width;
        if (ratio >= 1.35 && ratio <= 1.65) {
          this.photoFeedbackText = 'أبعاد الصورة مناسبة (نسبة 2:3)';
          this.photoFeedbackClass = 'success';
        } else {
          this.photoFeedbackText = 'تنبيه: أبعاد الصورة ليست قريبة من نسبة 2:3 (4×6). يمكنك المتابعة ولكن يُفضل تعديلها.';
          this.photoFeedbackClass = 'warning';
        }

        this.photoBase64 = base64Data;
        this.photoMetaText = `حجم الصورة: ${(file.size / (1024 * 1024)).toFixed(2)} MB | الأبعاد: ${img.width} × ${img.height}px`;
      };
      img.src = base64Data;
    };
    reader.readAsDataURL(file);
  }

  // Receipt formatting
  calculateSubmittedStandardGPA(): number {
    if (!this.submittedStudent?.standardGrades?.length) return 0;
    const grades = this.submittedStudent.standardGrades;
    const totalAchieved = grades.reduce((sum, g) => sum + g.achieved, 0);
    const totalWeighted = grades.reduce((sum, g) => sum + g.weightedPercentage, 0);
    return totalWeighted > 0 ? (totalAchieved / totalWeighted) * 100 : 0;
  }

  // Form submission handler
  onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isStepValid()) {
      this.errorMessage = 'الرجاء التحقق من صحة جميع الدرجات المدخلة.';
      return;
    }

    // Map bindings to clean DTO payload
    const payload: StudentCreateDto = {
      studentName: this.studentName.trim(),
      nationalId: this.nationalId.trim(),
      certification: this.selectedCert === 'saudi' ? 'Saudi Certificate' : (this.selectedCert === 'ig' ? 'IG' : this.selectedCert),
      track: this.selectedTrack,
      photo: this.photoBase64
    };

    if (this.selectedCert === 'saudi') {
      payload.yearsCount = this.selectedYear;
      payload.saudiGrades = [];
      this.saudiBlocks.forEach(block => {
        block.subjects.forEach(sub => {
          payload.saudiGrades?.push({
            yearLabel: block.key,
            subjectName: sub.name,
            coefficient: sub.coefficient,
            achieved: sub.achieved || 0
          });
        });
      });
    } else if (this.selectedCert === 'ig') {
      payload.igProgram = this.igProgramType;
      payload.factor = this.igFactorEnabled ? this.igFactorValue : 1.0;
      payload.sportsBonus = this.igSportsBonus;
      payload.igGradeCounts = [];

      const addGradeCounts = (list: any[], type: string) => {
        list.forEach(g => {
          if (g.count > 0) {
            payload.igGradeCounts?.push({
              gradeType: type,
              grade: g.key,
              count: g.count
            });
          }
        });
      };

      if (this.igProgramType === 'IGCSE') {
        addGradeCounts(this.igLegacyGrades, 'igcse-legacy');
        addGradeCounts(this.igNumericGrades, 'igcse-numeric');
      } else if (this.igProgramType === 'AS-Levels') {
        addGradeCounts(this.igAsGrades, 'as-level');
      } else if (this.igProgramType === 'A-Levels') {
        addGradeCounts(this.igALevelGrades, 'a-level');
      }
    } else {
      payload.yearOfStudy = this.selectedYear;
      payload.standardGrades = this.standardSubjects.map(sub => ({
        yearOfStudy: this.selectedYear,
        subjectName: sub.name,
        grade: sub.grade || 0,
        weightedPercentage: sub.weight || 0
      }));
    }

    this.isSubmitting = true;

    this.studentService.registerStudent(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.status === 'success' && response.data) {
          this.submittedStudent = response.data;
          this.isSubmitted = true;
          this.successMessage = 'تم الحفظ والتسجيل بنجاح في قاعدة البيانات.';
        } else {
          this.errorMessage = response.message || 'حدث خطأ أثناء حفظ البيانات.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message || 'فشل الاتصال بالخادم. يرجى التحقق من تشغيل API الخلفية.';
      }
    });
  }

  // Receipt Download - JSON
  downloadReceiptJSON(): void {
    if (!this.submittedStudent) return;
    const blob = new Blob([JSON.stringify(this.submittedStudent, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_receipt_${this.submittedStudent.nationalId}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Receipt Download - CSV
  downloadReceiptCSV(): void {
    if (!this.submittedStudent) return;
    const s = this.submittedStudent;
    
    let csvContent = '\uFEFF'; // Add UTF-8 BOM for Arabic text support in Excel
    csvContent += 'البيان,القيمة\n';
    csvContent += `رقم القيد (ID),${s.id}\n`;
    csvContent += `اسم الطالب,${s.studentName}\n`;
    csvContent += `الرقم القومي,${s.nationalId}\n`;
    csvContent += `نوع الشهادة,${s.certification}\n`;
    csvContent += `المسار الأكاديمي,${s.track}\n`;

    if (s.saudiTotals) {
      csvContent += `سنوات التراكمي,${s.saudiTotals.yearsCount}\n`;
      csvContent += `المجموع الموزون الكلي,${s.saudiTotals.totalWeighted}\n`;
      csvContent += `النسبة المئوية النهائية,${s.saudiTotals.finalPercentage}%\n`;
    } else if (s.igGrades) {
      csvContent += `البرنامج المختار,${s.igGrades.igProgram}\n`;
      csvContent += `النسبة المئوية النهائية,${s.igGrades.scorePercentage}%\n`;
      csvContent += `المجموع الحكومي الموازي,${s.igGrades.governmentScore} / 410\n`;
    } else if (s.standardGrades?.length) {
      csvContent += `المعدل العام (GPA),${this.calculateSubmittedStandardGPA().toFixed(2)}%\n`;
    }
    
    csvContent += `تاريخ التقديم,${s.submittedAt}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_receipt_${s.nationalId}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  resetForm(): void {
    this.currentStep = 1;
    this.isSubmitted = false;
    this.isSubmitting = false;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.studentName = '';
    this.nationalId = '';
    this.selectedCert = '';
    this.selectedTrack = '';
    this.trackLocked = false;
    this.selectedYear = '';
    this.photoBase64 = '';
    this.photoMetaText = '';
    this.photoFeedbackText = '';
    this.photoFeedbackClass = '';
    this.standardSubjects = [];
    this.saudiBlocks = [];
    this.submittedStudent = undefined;

    // Reset IG Counts
    this.igLegacyGrades.forEach(g => g.count = 0);
    this.igNumericGrades.forEach(g => g.count = 0);
    this.igAsGrades.forEach(g => g.count = 0);
    this.igALevelGrades.forEach(g => g.count = 0);
    this.igFactorEnabled = false;
    this.igFactorValue = 1.2;
    this.igSportsBonus = 0;
  }
}
