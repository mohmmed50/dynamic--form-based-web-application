import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ConfigService } from './services/config.service';
import { StudentService } from './services/student.service';

describe('AppComponent Calculation Regression Tests', () => {
  let component: AppComponent;

  // Legacy Points Mapping (verbatim from legacy js/form-handler.js)
  const legacyIgPointsMapping: { [key: string]: { [key: string]: number } } = {
    "igcse-legacy": { "A_STAR": 8, "A": 7, "B": 6, "C": 5 },
    "igcse-numeric": { "9": 8, "8": 7, "7": 6, "6": 5, "5": 4, "4": 3 },
    "as-level": { "A": 5, "B": 4, "C": 3, "D": 2 },
    "a-level": { "A_STAR": 6, "A": 5, "B": 4, "C": 3, "D": 2 }
  };

  // Legacy IG score calculator ported verbatim from legacy js/form-handler.js
  function calculateLegacyIGScore(
    trackVal: string,
    gradesList: { type: string; grade: string; count: number }[],
    factorEnabled: boolean,
    factorValue: number,
    sportsBonus: number
  ) {
    let subsystemKey = '';
    let maxPointVal = 8;

    if (trackVal.includes('IGCSE')) {
      subsystemKey = 'igcse';
      maxPointVal = 8;
    } else if (trackVal.includes('AS-Levels')) {
      subsystemKey = 'as-level';
      maxPointVal = 5;
    } else if (trackVal.includes('A-Levels')) {
      subsystemKey = 'a-level';
      maxPointVal = 6;
    } else {
      return { scorePercentage: 0, governmentScore: 0 };
    }

    let totalPoints = 0;
    let totalSubjects = 0;

    gradesList.forEach(g => {
      if (g.type === 'igcse-legacy' && subsystemKey === 'igcse') {
        const points = legacyIgPointsMapping['igcse-legacy'][g.grade] || 0;
        totalPoints += g.count * points;
        totalSubjects += g.count;
      } else if (g.type === 'igcse-numeric' && subsystemKey === 'igcse') {
        const points = legacyIgPointsMapping['igcse-numeric'][g.grade] || 0;
        totalPoints += g.count * points;
        totalSubjects += g.count;
      } else if (g.type === 'as-level' && subsystemKey === 'as-level') {
        const points = legacyIgPointsMapping['as-level'][g.grade] || 0;
        totalPoints += g.count * points;
        totalSubjects += g.count;
      } else if (g.type === 'a-level' && subsystemKey === 'a-level') {
        const points = legacyIgPointsMapping['a-level'][g.grade] || 0;
        totalPoints += g.count * points;
        totalSubjects += g.count;
      }
    });

    const maxPoints = totalSubjects * maxPointVal;
    let scorePercentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    if (factorEnabled) {
      scorePercentage *= factorValue;
    }

    scorePercentage += sportsBonus;
    const governmentScore = (scorePercentage / 100) * 410;

    return {
      scorePercentage: parseFloat(scorePercentage.toFixed(2)),
      governmentScore: parseFloat(governmentScore.toFixed(2))
    };
  }

  // Legacy Saudi GPA calculator ported verbatim from legacy js/form-handler.js
  function calculateLegacySaudiGPA(
    gradesList: { achieved: number; coefficient: number }[]
  ) {
    let overallAchieved = 0;
    let overallWeighted = 0;
    let overallCoefficients = 0;

    gradesList.forEach(g => {
      overallAchieved += g.achieved;
      overallWeighted += g.achieved * g.coefficient;
      overallCoefficients += g.coefficient;
    });

    const finalGPA = overallCoefficients > 0 ? (overallWeighted / (100 * overallCoefficients)) * 100 : 0;

    return {
      totalAchieved: parseFloat(overallAchieved.toFixed(2)),
      totalWeighted: parseFloat(overallWeighted.toFixed(2)),
      totalCoefficients: overallCoefficients,
      finalPercentage: parseFloat(finalGPA.toFixed(2))
    };
  }

  // Legacy Standard GPA Calculator
  function calculateLegacyStandardGPA(
    gradesList: { grade: number; weight: number }[]
  ) {
    let totalWeighted = 0;
    let totalAchieved = 0;

    gradesList.forEach(g => {
      const achieved = (g.grade * g.weight) / 100;
      totalWeighted += g.weight;
      totalAchieved += achieved;
    });

    const finalGPA = totalWeighted > 0 ? (totalAchieved / totalWeighted) * 100 : 0;
    return parseFloat(finalGPA.toFixed(2));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, AppComponent],
      providers: [ConfigService, StudentService]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should compile and load successfully', () => {
    expect(component).toBeTruthy();
  });

  // 1. Regression tests for Saudi Cumulative GPA
  describe('Saudi Cumulative GPA Regression Tests', () => {
    const representativeSaudiDatasets = [
      {
        description: 'Single Year Saudi science track with realistic grades',
        grades: [
          { achieved: 95.5, coefficient: 4 },
          { achieved: 88, coefficient: 5 },
          { achieved: 92, coefficient: 3 },
          { achieved: 100, coefficient: 5 },
          { achieved: 78.5, coefficient: 4 }
        ]
      },
      {
        description: 'Two Years Cumulative Saudi track with high scores',
        grades: [
          { achieved: 98, coefficient: 5 },
          { achieved: 96.5, coefficient: 4 },
          { achieved: 99, coefficient: 3 },
          { achieved: 95.25, coefficient: 5 },
          { achieved: 100, coefficient: 3 },
          { achieved: 92, coefficient: 5 }
        ]
      },
      {
        description: 'Three Years full Cumulative Saudi curriculum with mixed performance',
        grades: [
          { achieved: 85, coefficient: 3 },
          { achieved: 70, coefficient: 4 },
          { achieved: 62.5, coefficient: 5 },
          { achieved: 90, coefficient: 3 },
          { achieved: 82, coefficient: 5 },
          { achieved: 95, coefficient: 5 },
          { achieved: 100, coefficient: 4 },
          { achieved: 88.75, coefficient: 3 }
        ]
      }
    ];

    representativeSaudiDatasets.forEach((dataset, idx) => {
      it(`should yield identical Saudi GPA totals for dataset #${idx + 1}: ${dataset.description}`, () => {
        // Run legacy calculator
        const legacyResult = calculateLegacySaudiGPA(dataset.grades);

        // Populate component state
        component.saudiBlocks = [
          {
            label: 'Year Block Test',
            key: 'Year 1',
            subjects: dataset.grades.map((g, i) => ({
              name: `Subject ${i}`,
              displayName: `Subject ${i}`,
              coefficient: g.coefficient,
              achieved: g.achieved
            }))
          }
        ];

        // Run migrated calculator
        component.calculateSaudiGPA();

        // Asserts
        expect(component.saudiTotals.totalAchieved).toBeCloseTo(legacyResult.totalAchieved, 2);
        expect(component.saudiTotals.totalWeighted).toBeCloseTo(legacyResult.totalWeighted, 2);
        expect(component.saudiTotals.totalCoefficients).toBe(legacyResult.totalCoefficients);
        expect(component.saudiTotals.finalPercentage).toBeCloseTo(legacyResult.finalPercentage, 2);
      });
    });
  });

  // 2. Regression tests for IG Score Calculation
  describe('IGCSE / AS-Levels / A-Levels Score Regression Tests', () => {
    const representativeIgDatasets = [
      {
        description: 'IGCSE Legacy with 5 subjects, Factor 1.2, Sports Bonus 5%',
        track: 'IGCSE (Early Years)',
        programType: 'IGCSE' as const,
        factorEnabled: true,
        factorValue: 1.2,
        sportsBonus: 5,
        grades: [
          { type: 'igcse-legacy', grade: 'A_STAR', count: 3 },
          { type: 'igcse-legacy', grade: 'A', count: 2 }
        ]
      },
      {
        description: 'IGCSE Mixed Legacy and Numeric with no Factor, Sports Bonus 2%',
        track: 'IGCSE (Early Years)',
        programType: 'IGCSE' as const,
        factorEnabled: false,
        factorValue: 1.0,
        sportsBonus: 2,
        grades: [
          { type: 'igcse-legacy', grade: 'B', count: 4 },
          { type: 'igcse-numeric', grade: '9', count: 2 },
          { type: 'igcse-numeric', grade: '8', count: 2 }
        ]
      },
      {
        description: 'AS-Levels with Sports Bonus 0%, no Factor',
        track: 'AS-Levels (Intermediate Year)',
        programType: 'AS-Levels' as const,
        factorEnabled: false,
        factorValue: 1.0,
        sportsBonus: 0,
        grades: [
          { type: 'as-level', grade: 'A', count: 3 },
          { type: 'as-level', grade: 'B', count: 2 },
          { type: 'as-level', grade: 'C', count: 1 }
        ]
      },
      {
        description: 'A-Levels with Factor 1.15, Sports Bonus 1.5%',
        track: 'A-Levels (Advanced Years)',
        programType: 'A-Levels' as const,
        factorEnabled: true,
        factorValue: 1.15,
        sportsBonus: 1.5,
        grades: [
          { type: 'a-level', grade: 'A_STAR', count: 2 },
          { type: 'a-level', grade: 'A', count: 3 },
          { type: 'a-level', grade: 'B', count: 1 }
        ]
      }
    ];

    representativeIgDatasets.forEach((dataset, idx) => {
      it(`should yield identical IG GPA and Government scores for dataset #${idx + 1}: ${dataset.description}`, () => {
        // Run legacy calculator
        const legacyResult = calculateLegacyIGScore(
          dataset.track,
          dataset.grades,
          dataset.factorEnabled,
          dataset.factorValue,
          dataset.sportsBonus
        );

        // Populate component state
        component.selectedTrack = dataset.track;
        component.igProgramType = dataset.programType;
        component.igFactorEnabled = dataset.factorEnabled;
        component.igFactorValue = dataset.factorValue;
        component.igSportsBonus = dataset.sportsBonus;

        // Reset counts
        component.igLegacyGrades.forEach(g => g.count = 0);
        component.igNumericGrades.forEach(g => g.count = 0);
        component.igAsGrades.forEach(g => g.count = 0);
        component.igALevelGrades.forEach(g => g.count = 0);

        // Load grade counts
        dataset.grades.forEach(g => {
          if (g.type === 'igcse-legacy') {
            const target = component.igLegacyGrades.find(lg => lg.key === g.grade);
            if (target) target.count = g.count;
          } else if (g.type === 'igcse-numeric') {
            const target = component.igNumericGrades.find(lg => lg.key === g.grade);
            if (target) target.count = g.count;
          } else if (g.type === 'as-level') {
            const target = component.igAsGrades.find(lg => lg.key === g.grade);
            if (target) target.count = g.count;
          } else if (g.type === 'a-level') {
            const target = component.igALevelGrades.find(lg => lg.key === g.grade);
            if (target) target.count = g.count;
          }
        });

        // Run migrated calculator
        component.calculateIGGPA();

        // Asserts
        expect(component.igTotals.scorePercentage).toBeCloseTo(legacyResult.scorePercentage, 2);
        expect(component.igTotals.governmentScore).toBeCloseTo(legacyResult.governmentScore, 2);
      });
    });
  });

  // 3. Regression tests for Standard GPA
  describe('Standard GPA Calculation Regression Tests', () => {
    const representativeStandardDatasets = [
      {
        description: 'Kuwaiti curriculum standard grades',
        grades: [
          { grade: 85, weight: 10 },
          { grade: 92, weight: 15 },
          { grade: 88, weight: 20 },
          { grade: 94, weight: 25 },
          { grade: 90, weight: 30 }
        ]
      },
      {
        description: 'Qatari science track standard grades',
        grades: [
          { grade: 95, weight: 20 },
          { grade: 98, weight: 20 },
          { grade: 92.5, weight: 10 },
          { grade: 89, weight: 30 },
          { grade: 100, weight: 20 }
        ]
      }
    ];

    representativeStandardDatasets.forEach((dataset, idx) => {
      it(`should yield identical standard GPA calculations for dataset #${idx + 1}: ${dataset.description}`, () => {
        // Run legacy calculator
        const legacyResult = calculateLegacyStandardGPA(dataset.grades);

        // Populate component state
        component.submittedStudent = {
          id: 1,
          studentName: 'Test Student',
          nationalId: '12345678',
          certification: 'Qatar',
          track: 'Scientific',
          photoPath: 'uploads/photo.jpg',
          submittedAt: '2026-07-18',
          standardGrades: dataset.grades.map((g, i) => ({
            id: i,
            yearOfStudy: 'Year 12',
            subjectName: `Subject ${i}`,
            achieved: (g.grade * g.weight) / 100, // standard achieved grades
            weightedPercentage: g.weight
          }))
        };

        // Run migrated calculator
        const migratedResult = component.calculateSubmittedStandardGPA();

        // Assert
        expect(migratedResult).toBeCloseTo(legacyResult, 2);
      });
    });
  });
});
