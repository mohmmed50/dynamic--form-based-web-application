// Main application setup
document.addEventListener('DOMContentLoaded', () => {
  // Initialize sub-modules
  initConditionals();
  initFormHandlers();

  // Set the first section as active
  activateSection('section-photo');
  activateSection('section-details');
  
  // Set up listeners for progress updates
  setupProgressListeners();
  
  // Initial update
  updateProgressIndicator();
});

// Watch inputs to update step indicators in real-time
function setupProgressListeners() {
  const inputsToWatch = [
    'student-name-ar',
    'national-id',
    'cert-select',
    'track-select',
    'year-select'
  ];

  inputsToWatch.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateProgressIndicator);
      el.addEventListener('change', updateProgressIndicator);
    }
  });
}

// Calculate form completion progress and update DOM
function updateProgressIndicator() {
  const steps = [false, false, false, false, false];
  const certVal = document.getElementById('cert-select').value;
  const isIG = (certVal === 'ig');

  // Show/Hide Step 4 bubble based on IG cert
  const step4El = document.getElementById('step-item-4');
  if (step4El) {
    step4El.style.display = isIG ? 'none' : 'flex';
  }

  // Step 1: Photo uploaded
  if (uploadedPhotoBase64) {
    steps[0] = true;
  }

  // Step 2: Personal Details
  const nameEl = document.getElementById('student-name-ar');
  const nameVal = nameEl ? nameEl.value.trim() : '';
  const idEl = document.getElementById('national-id');
  const idVal = idEl ? idEl.value.trim() : '';
  if (nameVal && idVal.length >= 8) {
    steps[1] = true;
  }

  // Step 3: Certification & Track Selection
  const trackVal = document.getElementById('track-select').value;
  if (certVal && trackVal) {
    steps[2] = true;
  }

  // Step 4: Year of study
  if (isIG) {
    steps[3] = true; // Automatically true for IG (hidden)
  } else {
    const yearVal = document.getElementById('year-select').value;
    if (yearVal) {
      steps[3] = true;
    }
  }

  // Step 5: Grades Table / IG Calculator
  if (isIG) {
    let totalIGSubjects = 0;
    let targetSelectors = '';
    if (trackVal.includes('IGCSE')) {
      targetSelectors = '.ig-grade-input[data-grade-type="igcse-legacy"], .ig-grade-input[data-grade-type="igcse-numeric"]';
    } else if (trackVal.includes('AS-Levels')) {
      targetSelectors = '.ig-grade-input[data-grade-type="as-level"]';
    } else if (trackVal.includes('A-Levels')) {
      targetSelectors = '.ig-grade-input[data-grade-type="a-level"]';
    }
    if (targetSelectors) {
      document.querySelectorAll(targetSelectors).forEach(el => {
        totalIGSubjects += parseInt(el.value) || 0;
      });
    }
    steps[4] = totalIGSubjects > 0;
  } else if (certVal === 'saudi') {
    const saudiInputs = document.querySelectorAll('.saudi-achieved-input');
    if (saudiInputs.length > 0) {
      let allSaudiValid = true;
      for (let i = 0; i < saudiInputs.length; i++) {
        const val = parseFloat(saudiInputs[i].value);
        if (saudiInputs[i].value === '' || isNaN(val) || val < 0 || val > 100) {
          allSaudiValid = false;
          break;
        }
      }
      steps[4] = allSaudiValid;
    } else {
      steps[4] = false;
    }
  } else {
    const gradeInputs = document.querySelectorAll('.grade-input');
    const weightInputs = document.querySelectorAll('.weight-input');
    if (gradeInputs.length > 0) {
      let allGradesValid = true;
      for (let i = 0; i < gradeInputs.length; i++) {
        const g = parseFloat(gradeInputs[i].value);
        const w = parseFloat(weightInputs[i].value);
        if (isNaN(g) || g < 0 || g > 100 || isNaN(w) || w < 0 || w > 100) {
          allGradesValid = false;
          break;
        }
      }
      steps[4] = allGradesValid;
    }
  }

  // Update UI bubbles
  let completedCount = 0;
  let totalStepsCount = isIG ? 4 : 5;
  
  for (let i = 0; i < steps.length; i++) {
    const stepEl = document.getElementById(`step-item-${i + 1}`);
    if (stepEl) {
      if (steps[i]) {
        stepEl.classList.add('completed');
        stepEl.classList.remove('active');
      } else {
        stepEl.classList.remove('completed');
        
        // Active if it is the first uncompleted step, or if previous is completed
        if (i === 0 || steps[i - 1]) {
          stepEl.classList.add('active');
        } else {
          stepEl.classList.remove('active');
        }
      }
    }
    
    // Count completed steps excluding step 4 if IG
    if (isIG && i === 3) continue;
    if (steps[i]) {
      completedCount++;
    }
  }

  // Update progress bar line width
  const progressBar = document.getElementById('step-progress-bar');
  if (progressBar) {
    const percent = (completedCount / totalStepsCount) * 100;
    progressBar.style.width = `${percent}%`;
  }
}
