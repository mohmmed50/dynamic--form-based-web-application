// Global state to store form inputs and base64 photo
let uploadedPhotoBase64 = '';

// Initialize Form Handlers
function initFormHandlers() {
  initImageUpload();
  setupTableCalculationListeners();
  setupIGCalculatorListeners();
  setupSubmissionHandler();
}

// 1. Photo Upload Handler & Validation
function initImageUpload() {
  const photoInput = document.getElementById('photo-input');
  const uploadWrapper = document.getElementById('upload-wrapper');
  const previewContainer = document.getElementById('photo-preview-container');
  const previewImg = document.getElementById('photo-preview');
  const photoMeta = document.getElementById('photo-meta');
  const photoFeedback = document.getElementById('photo-feedback');

  // Drag and drop events
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadWrapper.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadWrapper.style.borderColor = 'var(--primary-color)';
      uploadWrapper.style.backgroundColor = 'var(--primary-light)';
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadWrapper.addEventListener(eventName, (e) => {
      e.preventDefault();
      uploadWrapper.style.borderColor = 'var(--border-color)';
      uploadWrapper.style.backgroundColor = 'var(--bg-main)';
    }, false);
  });

  uploadWrapper.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      photoInput.files = files;
      handlePhotoSelected(files[0]);
    }
  });

  photoInput.addEventListener('change', function() {
    if (this.files.length) {
      handlePhotoSelected(this.files[0]);
    }
  });

  function handlePhotoSelected(file) {
    // Check file format
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      showPhotoError('عذراً، يجب أن تكون الصورة بصيغة JPG أو PNG أو WebP.');
      return;
    }

    // Check size (Max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showPhotoError('حجم الصورة كبير جداً. الحد الأقصى هو 5 ميجابايت.');
      return;
    }

    // Read file as Base64
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64Data = e.target.result;

      // Check Aspect Ratio
      const img = new Image();
      img.onload = function() {
        const width = img.width;
        const height = img.height;
        const ratio = height / width;

        // Target: 2:3 ratio -> height/width is ~1.5
        // Acceptable normal ratio range is 1.35 to 1.65
        let feedbackText = '';
        let feedbackClass = '';

        if (ratio >= 1.35 && ratio <= 1.65) {
          feedbackText = 'أبعاد الصورة مناسبة (نسبة 2:3)';
          feedbackClass = 'success';
        } else {
          feedbackText = 'تنبيه: أبعاد الصورة ليست قريبة من نسبة 2:3 (4×6). يمكنك المتابعة ولكن يُفضل تعديلها.';
          feedbackClass = 'warning';
        }

        // Show image and meta info
        previewImg.src = base64Data;
        photoMeta.textContent = `حجم الصورة: ${(file.size / (1024 * 1024)).toFixed(2)} MB | الأبعاد: ${width} × ${height}px`;
        photoFeedback.textContent = feedbackText;
        photoFeedback.className = 'photo-feedback ' + feedbackClass;
        previewContainer.style.display = 'flex';

        uploadedPhotoBase64 = base64Data;
        hideAlert('form-alert');
        updateProgressIndicator();
      };
      img.src = base64Data;
    };
    reader.readAsDataURL(file);
  }

  function showPhotoError(message) {
    uploadedPhotoBase64 = '';
    previewContainer.style.display = 'none';
    showAlert('form-alert', message, 'danger');
  }
}

// 2. Grades Table Generator
function generateGradesTable(yearVal) {
  const standardWrapper = document.getElementById('standard-table-wrapper');
  const saudiMultiContainer = document.getElementById('saudi-multi-tables-container');
  const tableBody = document.getElementById('grades-table-body');
  tableBody.innerHTML = '';
  saudiMultiContainer.innerHTML = '';

  const certKey = document.getElementById('cert-select').value;
  const isSaudi = (certKey === 'saudi');

  // Toggle Saudi Summary Box visibility
  const saudiSummaryBox = document.getElementById('saudi-summary-box');
  if (saudiSummaryBox) {
    saudiSummaryBox.style.display = isSaudi ? 'block' : 'none';
  }

  if (isSaudi) {
    standardWrapper.style.display = 'none';
    saudiMultiContainer.style.display = 'block';

    const blocks = typeof getSaudiBlocks === 'function' ? getSaudiBlocks(yearVal) : [];

    // Auto-number duplicate subjects across all blocks combined to avoid user confusion
    const occurrenceCounts = {};
    blocks.forEach(block => {
      block.subjects.forEach(s => {
        occurrenceCounts[s.name] = (occurrenceCounts[s.name] || 0) + 1;
      });
    });

    const currentOccurrence = {};

    blocks.forEach((block, blockIndex) => {
      const card = document.createElement('div');
      card.className = 'saudi-year-card';
      card.style.cssText = 'background: var(--card-bg, #fff); border: 1px solid var(--border-color, #e2e8f0); border-radius: var(--radius-md, 8px); padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05));';

      let tableRowsHtml = '';
      block.subjects.forEach((subjectObj, subjectIndex) => {
        const subjectName = subjectObj.name;
        const coefficient = subjectObj.coefficient;

        let displaySubjectName = subjectName;
        if (occurrenceCounts[subjectName] > 1) {
          currentOccurrence[subjectName] = (currentOccurrence[subjectName] || 0) + 1;
          displaySubjectName = `${subjectName} (${currentOccurrence[subjectName]})`;
        }

        tableRowsHtml += `
          <tr>
            <td class="col-num">${subjectIndex + 1}</td>
            <td class="col-subject">${displaySubjectName}</td>
            <td class="col-grade">
              <input type="number" min="0" step="any" required
                     placeholder="المتحصلة" class="table-input saudi-achieved-input"
                     data-subject="${subjectName}">
            </td>
            <td class="col-weight">
              <input type="number" min="0" step="any" required
                     placeholder="الموزونة" class="table-input saudi-weighted-input"
                     data-subject="${subjectName}">
            </td>
            <td class="col-achieved saudi-coefficient-cell">-</td>
          </tr>
        `;
      });

      card.setAttribute('data-year-key', block.key);
      card.innerHTML = `
        <h3 class="saudi-year-title" style="margin-top: 0; margin-bottom: 1rem; color: var(--primary-color); font-size: 1.15rem; font-weight: 600; border-bottom: 2px solid var(--primary-light); padding-bottom: 0.5rem;">
          📚 ${block.label}
        </h3>
        <div class="table-responsive">
          <table class="grades-table">
            <thead>
              <tr>
                <th class="col-num">#</th>
                <th class="col-subject">اسم المادة</th>
                <th class="col-grade">الدرجة المتحصلة</th>
                <th class="col-weight">الدرجة الموزونة</th>
                <th class="col-achieved">المعامل</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Year Subtotal Bar -->
        <div class="saudi-subtotal-bar" id="subtotal-${block.key.replace(' ', '-')}" style="margin-top: 1rem; background: var(--light-bg, #f8fafc); border: 1px solid var(--border-color); padding: 0.75rem 1rem; border-radius: var(--radius-sm, 6px); display: flex; flex-wrap: wrap; justify-content: space-between; font-size: 0.9rem; font-weight: 600;">
          <div>مجموع الدرجات المحرزة: <span class="sub-achieved" style="color: var(--primary-color);">0.00</span></div>
          <div>مجموع المعاملات: <span class="sub-coefficients" style="color: var(--primary-color);">0</span></div>
          <div>المجموع الموزون: <span class="sub-weighted" style="color: var(--primary-color);">0.00</span></div>
          <div>نسبة السنة: <span class="sub-year-percent" style="color: var(--primary-color);">0.00%</span></div>
          <div>المساهمة الموزونة: <span class="sub-contribution" style="color: var(--primary-color);">0.00%</span></div>
        </div>
      `;
      saudiMultiContainer.appendChild(card);
    });

  } else {
    standardWrapper.style.display = 'block';
    saudiMultiContainer.style.display = 'none';

    // Set table headers dynamically
    const thGrade = document.getElementById('th-grade');
    const thWeight = document.getElementById('th-weight');
    const thAchieved = document.getElementById('th-achieved');

    if (thGrade) thGrade.textContent = 'الدرجة';
    if (thWeight) thWeight.textContent = 'النسبة الموزونة (%)';
    if (thAchieved) thAchieved.textContent = 'الدرجة المتحصلة';

    const subjects = typeof getActiveSubjects === 'function' ? getActiveSubjects(certKey, yearVal) : [];

    subjects.forEach((subjectObj, index) => {
      const subjectName = subjectObj.name;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="col-num">${index + 1}</td>
        <td class="col-subject">${subjectName}</td>
        <td class="col-grade">
          <input type="number" min="0" max="100" step="any" required
                 placeholder="0-100" class="table-input grade-input"
                 data-subject="${subjectName}">
        </td>
        <td class="col-weight">
          <input type="number" min="0" max="100" step="any" required
                 placeholder="0-100" class="table-input weight-input">
        </td>
        <td class="col-achieved">0.00</td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Re-bind listeners for table calculation
  setupTableCalculationListeners();
}

// 3. Real-time Calculation Handler
function setupTableCalculationListeners() {
  const tableBody = document.getElementById('grades-table-body');
  if (!tableBody) return;

  const isSaudi = (document.getElementById('cert-select').value === 'saudi');

  if (isSaudi) {
    const saudiMultiContainer = document.getElementById('saudi-multi-tables-container');
    const cards = saudiMultiContainer.querySelectorAll('.saudi-year-card');

    // Official Saudi formula: per row, Coefficient = Weighted / Achieved (must be a whole
    // number — otherwise the row is flagged as an error and the final grade is blocked).
    // Per block: yearPercentage = (Σ Weighted) / (Σ Coefficient), weighted by the block's
    // position via getSaudiYearWeights(yearsCount). School total = Σ weighted year percentages.
    // Final = (schoolTotal + درجة القدرات) / 2. Mirrors StudentService.ProcessSaudiCertificate.
    const recalculateSaudi = () => {
      const yearsCountVal = document.getElementById('year-select').value;
      const yearWeights = typeof getSaudiYearWeights === 'function' ? getSaudiYearWeights(yearsCountVal) : {};

      let overallAchieved = 0;
      let overallWeighted = 0;
      let overallCoefficients = 0;
      let schoolPercentage = 0;
      let hasError = false;

      cards.forEach(card => {
        let cardAchieved = 0;
        let cardWeighted = 0;
        let cardCoefficients = 0;
        let cardHasError = false;

        const rows = card.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const achievedInput = row.querySelector('.saudi-achieved-input');
          const weightedInput = row.querySelector('.saudi-weighted-input');
          const coefficientCell = row.querySelector('.saudi-coefficient-cell');

          const achievedRaw = achievedInput.value;
          const weightedRaw = weightedInput.value;
          const achieved = parseFloat(achievedRaw) || 0;
          const weighted = parseFloat(weightedRaw) || 0;

          achievedInput.style.borderColor = '';
          weightedInput.style.borderColor = '';
          coefficientCell.style.color = '';

          let coefficient = 0;

          if (achievedRaw === '' || weightedRaw === '') {
            coefficientCell.textContent = '-';
            cardHasError = true;
          } else if (achieved <= 0) {
            coefficientCell.textContent = '⚠️';
            coefficientCell.style.color = 'var(--danger-color)';
            achievedInput.style.borderColor = 'var(--danger-color)';
            cardHasError = true;
          } else {
            const rawCoefficient = weighted / achieved;
            const rounded = Math.round(rawCoefficient);
            if (Math.abs(rawCoefficient - rounded) < 0.01) {
              coefficient = rounded;
              coefficientCell.textContent = String(coefficient);
            } else {
              coefficientCell.textContent = `⚠️ ${rawCoefficient.toFixed(2)}`;
              coefficientCell.style.color = 'var(--danger-color)';
              achievedInput.style.borderColor = 'var(--danger-color)';
              weightedInput.style.borderColor = 'var(--danger-color)';
              cardHasError = true;
            }
          }

          cardAchieved += achieved;
          cardWeighted += weighted;
          cardCoefficients += coefficient;
        });

        const yearKey = card.getAttribute('data-year-key');
        const weightPercent = yearWeights[yearKey] || 0;
        const yearPercentage = cardCoefficients > 0 ? (cardWeighted / cardCoefficients) : 0;
        const contribution = yearPercentage * (weightPercent / 100);

        const subAchievedEl = card.querySelector('.sub-achieved');
        const subCoefficientsEl = card.querySelector('.sub-coefficients');
        const subWeightedEl = card.querySelector('.sub-weighted');
        const subYearPercentEl = card.querySelector('.sub-year-percent');
        const subContributionEl = card.querySelector('.sub-contribution');

        if (subAchievedEl) subAchievedEl.textContent = cardAchieved.toFixed(2);
        if (subCoefficientsEl) subCoefficientsEl.textContent = cardCoefficients;
        if (subWeightedEl) subWeightedEl.textContent = cardWeighted.toFixed(2);
        if (subYearPercentEl) subYearPercentEl.textContent = yearPercentage.toFixed(2) + '%';
        if (subContributionEl) subContributionEl.textContent = contribution.toFixed(2) + `% (وزن ${weightPercent}%)`;

        overallAchieved += cardAchieved;
        overallWeighted += cardWeighted;
        overallCoefficients += cardCoefficients;
        if (!cardHasError) {
          schoolPercentage += contribution;
        } else {
          hasError = true;
        }
      });

      const elTotalAchieved = document.getElementById('saudi-total-achieved');
      const elTotalCoefficients = document.getElementById('saudi-total-coefficients');
      const elTotalWeighted = document.getElementById('saudi-total-weighted');
      const elSchoolPercentage = document.getElementById('saudi-school-percentage');
      const elFinalGPA = document.getElementById('saudi-final-gpa');

      if (elTotalAchieved) elTotalAchieved.textContent = overallAchieved.toFixed(2);
      if (elTotalCoefficients) elTotalCoefficients.textContent = overallCoefficients;
      if (elTotalWeighted) elTotalWeighted.textContent = overallWeighted.toFixed(2);
      if (elSchoolPercentage) elSchoolPercentage.textContent = schoolPercentage.toFixed(2) + '%';

      const aptitudeInput = document.getElementById('saudi-aptitude-score');
      const aptitudeRaw = aptitudeInput ? aptitudeInput.value : '';
      const aptitudeVal = parseFloat(aptitudeRaw);
      const hasValidAptitude = aptitudeRaw !== '' && !isNaN(aptitudeVal) && aptitudeVal >= 0 && aptitudeVal <= 100;

      if (aptitudeInput) {
        aptitudeInput.style.borderColor = (aptitudeRaw !== '' && !hasValidAptitude) ? 'var(--danger-color)' : '';
      }

      if (elFinalGPA) {
        if (hasError) {
          elFinalGPA.textContent = '⚠️ يوجد أخطاء في الدرجات المدخلة (تأكد أن المعامل رقم صحيح لكل مادة)';
          elFinalGPA.style.color = 'var(--danger-color)';
        } else if (!hasValidAptitude) {
          elFinalGPA.textContent = '— (أدخل درجة القدرات)';
          elFinalGPA.style.color = '';
        } else {
          const finalGrade = (schoolPercentage + aptitudeVal) / 2;
          elFinalGPA.textContent = finalGrade.toFixed(2) + '%';
          elFinalGPA.style.color = 'var(--success-color)';
        }
      }

      updateProgressIndicator();
    };

    cards.forEach(card => {
      const inputs = card.querySelectorAll('.saudi-achieved-input, .saudi-weighted-input');
      inputs.forEach(input => {
        input.addEventListener('input', recalculateSaudi);
        input.addEventListener('change', recalculateSaudi);
      });
    });

    const aptitudeInput = document.getElementById('saudi-aptitude-score');
    if (aptitudeInput) {
      aptitudeInput.addEventListener('input', recalculateSaudi);
      aptitudeInput.addEventListener('change', recalculateSaudi);
    }

    recalculateSaudi();
  } else {
    const rows = tableBody.querySelectorAll('tr');

    const recalculateStandard = () => {
      rows.forEach(row => {
        const gradeInput = row.querySelector('.grade-input');
        const weightInput = row.querySelector('.weight-input');
        const achievedDisplay = row.querySelector('.col-achieved');

        if (gradeInput && weightInput && achievedDisplay) {
          const grade = parseFloat(gradeInput.value) || 0;
          const weight = parseFloat(weightInput.value) || 0;

          if (gradeInput.value !== '' && (grade < 0 || grade > 100)) {
            gradeInput.style.borderColor = 'var(--danger-color)';
          } else {
            gradeInput.style.borderColor = '';
          }

          if (weightInput.value !== '' && (weight < 0 || weight > 100)) {
            weightInput.style.borderColor = 'var(--danger-color)';
          } else {
            weightInput.style.borderColor = '';
          }

          const achieved = (grade * weight) / 100;
          achievedDisplay.textContent = achieved.toFixed(2);
        }
      });

      updateProgressIndicator();
    };

    rows.forEach(row => {
      const gradeInput = row.querySelector('.grade-input');
      const weightInput = row.querySelector('.weight-input');
      if (gradeInput && weightInput) {
        gradeInput.addEventListener('input', recalculateStandard);
        gradeInput.addEventListener('blur', recalculateStandard);
        weightInput.addEventListener('input', recalculateStandard);
        weightInput.addEventListener('blur', recalculateStandard);
      }
    });

    recalculateStandard();
  }
}

// 3b. IG Calculator Calculation and Helpers
const igPointsMapping = {
  "igcse-legacy": {
    "A_STAR": 8,
    "A": 7,
    "B": 6,
    "C": 5
  },
  "igcse-numeric": {
    "9": 8,
    "8": 7,
    "7": 6,
    "6": 5,
    "5": 4,
    "4": 3
  },
  "as-level": {
    "A": 5,
    "B": 4,
    "C": 3,
    "D": 2
  },
  "a-level": {
    "A_STAR": 6,
    "A": 5,
    "B": 4,
    "C": 3,
    "D": 2
  }
};

function setupIGCalculatorListeners() {
  const inputs = document.querySelectorAll('.ig-grade-input, #ig-factor-check, #ig-factor-val, #ig-sports-bonus');
  inputs.forEach(el => {
    el.addEventListener('change', calculateIGScore);
    el.addEventListener('input', calculateIGScore);
  });

  const factorCheck = document.getElementById('ig-factor-check');
  const factorContainer = document.getElementById('ig-factor-input-container');
  if (factorCheck && factorContainer) {
    factorCheck.addEventListener('change', function() {
      factorContainer.style.display = this.checked ? 'block' : 'none';
      calculateIGScore();
    });
  }
}

function resetIGCalculator() {
  document.querySelectorAll('.ig-grade-input').forEach(el => {
    el.value = '0';
  });
  const factorCheck = document.getElementById('ig-factor-check');
  if (factorCheck) factorCheck.checked = false;
  const factorVal = document.getElementById('ig-factor-val');
  if (factorVal) factorVal.value = '1.2';
  const factorContainer = document.getElementById('ig-factor-input-container');
  if (factorContainer) factorContainer.style.display = 'none';
  const sportsBonus = document.getElementById('ig-sports-bonus');
  if (sportsBonus) sportsBonus.value = '0';

  calculateIGScore();
}

function calculateIGScore() {
  const trackSelect = document.getElementById('track-select');
  if (!trackSelect) return;
  const trackVal = trackSelect.value;

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
    return;
  }

  let totalPoints = 0;
  let totalSubjects = 0;

  if (subsystemKey === 'igcse') {
    // Legacy
    document.querySelectorAll('.ig-grade-input[data-grade-type="igcse-legacy"]').forEach(el => {
      const count = parseInt(el.value) || 0;
      const grade = el.getAttribute('data-grade');
      const points = igPointsMapping['igcse-legacy'][grade] || 0;
      totalPoints += count * points;
      totalSubjects += count;
    });
    // Numeric
    document.querySelectorAll('.ig-grade-input[data-grade-type="igcse-numeric"]').forEach(el => {
      const count = parseInt(el.value) || 0;
      const grade = el.getAttribute('data-grade');
      const points = igPointsMapping['igcse-numeric'][grade] || 0;
      totalPoints += count * points;
      totalSubjects += count;
    });
  } else if (subsystemKey === 'as-level') {
    document.querySelectorAll('.ig-grade-input[data-grade-type="as-level"]').forEach(el => {
      const count = parseInt(el.value) || 0;
      const grade = el.getAttribute('data-grade');
      const points = igPointsMapping['as-level'][grade] || 0;
      totalPoints += count * points;
      totalSubjects += count;
    });
  } else if (subsystemKey === 'a-level') {
    document.querySelectorAll('.ig-grade-input[data-grade-type="a-level"]').forEach(el => {
      const count = parseInt(el.value) || 0;
      const grade = el.getAttribute('data-grade');
      const points = igPointsMapping['a-level'][grade] || 0;
      totalPoints += count * points;
      totalSubjects += count;
    });
  }

  const maxPoints = totalSubjects * maxPointVal;
  let scorePercentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

  // Factor
  const factorCheck = document.getElementById('ig-factor-check');
  if (factorCheck && factorCheck.checked) {
    const factor = parseFloat(document.getElementById('ig-factor-val').value) || 1.2;
    scorePercentage *= factor;
  }

  // Sports Bonus
  const sportsBonus = parseFloat(document.getElementById('ig-sports-bonus').value) || 0;
  scorePercentage += sportsBonus;

  // Government Score
  const governmentScore = (scorePercentage / 100) * 410;

  // Display Results
  document.getElementById('ig-percentage-val').textContent = scorePercentage.toFixed(2) + '%';
  document.getElementById('ig-gov-val').textContent = governmentScore.toFixed(2) + ' / 410';
}

// 4. Form Submission and Validation
function setupSubmissionHandler() {
  const mainForm = document.getElementById('student-reg-form');
  const submitBtn = document.getElementById('btn-submit');

  mainForm.addEventListener('submit', function(e) {
    e.preventDefault();
    hideAlert('form-alert');

    // Perform validation
    const validationResult = validateForm();
    if (!validationResult.valid) {
      showAlert('form-alert', validationResult.message, 'danger');
      if (validationResult.element) {
        validationResult.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        validationResult.element.focus();
      }
      return;
    }

    // Prepare payload
    const payload = compilePayload();

    // Show loading state
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'جاري الحفظ وإرسال البيانات...';

    // Submit payload
    sendData(payload, submitBtn, originalText);
  });
}

// Full Form Fields Validation
function validateForm() {
  // 1. Photo Upload
  if (!uploadedPhotoBase64) {
    return {
      valid: false,
      message: 'الرجاء إضافة الصورة الشخصية للطالب قبل الإرسال.',
      element: document.getElementById('photo-input')
    };
  }

  // 2. Full Name
  const studentNameArInput = document.getElementById('student-name-ar');
  if (!studentNameArInput.value.trim()) {
    return {
      valid: false,
      message: 'الرجاء إدخال الاسم بالكامل باللغة العربية.',
      element: studentNameArInput
    };
  }
  if (studentNameArInput.value.length > 100) {
    return {
      valid: false,
      message: 'يجب ألا يزيد اسم الطالب عن 100 حرف.',
      element: studentNameArInput
    };
  }

  const studentNameEnInput = document.getElementById('student-name-en');
  if (!studentNameEnInput.value.trim()) {
    return {
      valid: false,
      message: 'الرجاء إدخال الاسم بالكامل باللغة الانجليزية.',
      element: studentNameEnInput
    };
  }

  // Personal Info & Address Validation
  const requiredFields = [
    { id: 'student-phone', name: 'رقم هاتف الطالب' },
    { id: 'student-email', name: 'ايميل الشخصي للطالب' },
    { id: 'guardian-name', name: 'اسم ولي الامر' },
    { id: 'guardian-phone', name: 'رقم هاتف ولي الامر' },
    { id: 'guardian-relation', name: 'صلة قرابة ولي الامر' },
    { id: 'address-gov', name: 'المحافظه' },
    { id: 'address-center', name: 'المركز' },
    { id: 'address-street', name: 'شارع' },
    { id: 'address-building', name: 'رقم العماره' }
  ];

  for (let field of requiredFields) {
    const el = document.getElementById(field.id);
    if (!el.value.trim()) {
      return {
        valid: false,
        message: 'الرجاء إدخال ' + field.name + '.',
        element: el
      };
    }
  }

  // Email format check
  const studentEmailInput = document.getElementById('student-email');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(studentEmailInput.value.trim())) {
    return {
      valid: false,
      message: 'الرجاء إدخال بريد إلكتروني صحيح.',
      element: studentEmailInput
    };
  }

  // 3. National ID
  const nationalIdInput = document.getElementById('national-id');
  if (!nationalIdInput.value.trim()) {
    return {
      valid: false,
      message: 'الرجاء إدخال الرقم القومي.',
      element: nationalIdInput
    };
  }
  // Standard digits & letters length validation (e.g. between 8 and 20)
  if (nationalIdInput.value.length < 8 || nationalIdInput.value.length > 20) {
    return {
      valid: false,
      message: 'الرجاء إدخال رقم قومي صحيح (بين 8 و 20 خانة).',
      element: nationalIdInput
    };
  }

  // 4. Certification
  const certSelect = document.getElementById('cert-select');
  if (!certSelect.value) {
    return {
      valid: false,
      message: 'الرجاء اختيار نوع الشهادة المعادلة.',
      element: certSelect
    };
  }

  // 5. Track
  const trackSelect = document.getElementById('track-select');
  if (!trackSelect.value) {
    return {
      valid: false,
      message: 'الرجاء اختيار المسار الأكاديمي.',
      element: trackSelect
    };
  }

  // Check if IG Cert is active
  if (certSelect.value === 'ig') {
    const trackVal = trackSelect.value;
    let targetSelectors = '';
    if (trackVal.includes('IGCSE')) {
      targetSelectors = '.ig-grade-input[data-grade-type="igcse-legacy"], .ig-grade-input[data-grade-type="igcse-numeric"]';
    } else if (trackVal.includes('AS-Levels')) {
      targetSelectors = '.ig-grade-input[data-grade-type="as-level"]';
    } else if (trackVal.includes('A-Levels')) {
      targetSelectors = '.ig-grade-input[data-grade-type="a-level"]';
    }

    let totalIGSubjects = 0;
    if (targetSelectors) {
      document.querySelectorAll(targetSelectors).forEach(el => {
        totalIGSubjects += parseInt(el.value) || 0;
      });
    }

    if (totalIGSubjects === 0) {
      return {
        valid: false,
        message: 'الرجاء تحديد عدد المواد وتوزيع الدرجات الأكاديمية لحساب المجموع.',
        element: document.querySelector(targetSelectors) || trackSelect
      };
    }

    // Validate Factor input if checked
    const factorCheck = document.getElementById('ig-factor-check');
    if (factorCheck && factorCheck.checked) {
      const factorVal = parseFloat(document.getElementById('ig-factor-val').value);
      if (isNaN(factorVal) || factorVal <= 0) {
        return {
          valid: false,
          message: 'الرجاء إدخال قيمة معامل صحيحة أكبر من الصفر.',
          element: document.getElementById('ig-factor-val')
        };
      }
    }

    // Validate Sports Bonus input
    const sportsBonusVal = parseFloat(document.getElementById('ig-sports-bonus').value);
    if (isNaN(sportsBonusVal) || sportsBonusVal < 0 || sportsBonusVal > 30) {
      return {
        valid: false,
        message: 'الرجاء إدخال نسبة حافز رياضي صحيحة بين 0 و 30%.',
        element: document.getElementById('ig-sports-bonus')
      };
    }

    return { valid: true };
  }

  // Check if Saudi Cert is active
  if (certSelect.value === 'saudi') {
    const yearSelect = document.getElementById('year-select');
    if (!yearSelect.value) {
      return {
        valid: false,
        message: 'الرجاء اختيار عدد سنوات الدراسة التراكمية.',
        element: yearSelect
      };
    }

    const achievedInputs = document.querySelectorAll('.saudi-achieved-input');
    const weightedInputs = document.querySelectorAll('.saudi-weighted-input');
    if (achievedInputs.length === 0) {
      return {
        valid: false,
        message: 'الرجاء توليد جدول المواد أولاً.',
        element: yearSelect
      };
    }

    for (let i = 0; i < achievedInputs.length; i++) {
      const subjectName = achievedInputs[i].getAttribute('data-subject');
      const achievedVal = parseFloat(achievedInputs[i].value);
      const weightedVal = parseFloat(weightedInputs[i].value);

      if (achievedInputs[i].value === '' || isNaN(achievedVal) || achievedVal <= 0) {
        return {
          valid: false,
          message: `الرجاء إدخال الدرجة المتحصلة لمادة "${subjectName}".`,
          element: achievedInputs[i]
        };
      }
      if (weightedInputs[i].value === '' || isNaN(weightedVal) || weightedVal <= 0) {
        return {
          valid: false,
          message: `الرجاء إدخال الدرجة الموزونة لمادة "${subjectName}".`,
          element: weightedInputs[i]
        };
      }

      const rawCoefficient = weightedVal / achievedVal;
      const rounded = Math.round(rawCoefficient);
      if (Math.abs(rawCoefficient - rounded) > 0.01) {
        return {
          valid: false,
          message: `درجات مادة "${subjectName}" غير صحيحة: المعامل الناتج (${rawCoefficient.toFixed(2)}) ليس رقماً صحيحاً. تأكد أن الدرجة الموزونة من مضاعفات الدرجة المتحصلة.`,
          element: weightedInputs[i]
        };
      }
    }

    const aptitudeInput = document.getElementById('saudi-aptitude-score');
    const aptitudeVal = parseFloat(aptitudeInput.value);
    if (aptitudeInput.value === '' || isNaN(aptitudeVal) || aptitudeVal < 0 || aptitudeVal > 100) {
      return {
        valid: false,
        message: 'الرجاء إدخال درجة القدرات الكلية بشكل صحيح (بين 0 و 100).',
        element: aptitudeInput
      };
    }

    return { valid: true };
  }

  // 6. Year of Study (Non-IG, Non-Saudi)
  const yearSelect = document.getElementById('year-select');
  if (!yearSelect.value) {
    return {
      valid: false,
      message: 'الرجاء اختيار السنة الدراسية.',
      element: yearSelect
    };
  }

  // 7. Table Inputs (Non-IG, Non-Saudi)
  const gradeInputs = document.querySelectorAll('.grade-input');
  const weightInputs = document.querySelectorAll('.weight-input');

  for (let i = 0; i < gradeInputs.length; i++) {
    const gradeVal = parseFloat(gradeInputs[i].value);
    const weightVal = parseFloat(weightInputs[i].value);

    if (isNaN(gradeVal) || gradeVal < 0 || gradeVal > 100) {
      return {
        valid: false,
        message: 'الرجاء إدخال درجة صحيحة بين 0 و 100 لجميع المواد.',
        element: gradeInputs[i]
      };
    }

    if (isNaN(weightVal) || weightVal < 0 || weightVal > 100) {
      return {
        valid: false,
        message: 'الرجاء إدخال نسبة موزونة صحيحة بين 0 و 100 لجميع المواد.',
        element: weightInputs[i]
      };
    }
  }

  return { valid: true };
}

// Compile Form Inputs into JSON Object
function compilePayload() {
  const certSelect = document.getElementById('cert-select');
  const trackSelect = document.getElementById('track-select');
  const trackVal = trackSelect.value;

  const personalInfo = {
    studentName: document.getElementById('student-name-ar').value.trim(),
    studentNameAr: document.getElementById('student-name-ar').value.trim(),
    studentNameEn: document.getElementById('student-name-en').value.trim(),
    studentPhone: document.getElementById('student-phone').value.trim(),
    studentEmail: document.getElementById('student-email').value.trim(),
    guardianName: document.getElementById('guardian-name').value.trim(),
    guardianPhone: document.getElementById('guardian-phone').value.trim(),
    guardianRelation: document.getElementById('guardian-relation').value.trim(),
    addressGov: document.getElementById('address-gov').value.trim(),
    addressCenter: document.getElementById('address-center').value.trim(),
    addressVillage: document.getElementById('address-village').value.trim(),
    addressStreet: document.getElementById('address-street').value.trim(),
    addressBuilding: document.getElementById('address-building').value.trim(),
    addressFloor: document.getElementById('address-floor').value.trim()
  };

  if (certSelect.value === 'ig') {
    let igProgram = 'IGCSE';
    let gradesData = {};
    let totalSubjects = 0;

    if (trackVal.includes('IGCSE')) {
      igProgram = 'IGCSE';
      const igcseGrades = {};
      document.querySelectorAll('.ig-grade-input[data-grade-type="igcse-legacy"], .ig-grade-input[data-grade-type="igcse-numeric"]').forEach(el => {
        const count = parseInt(el.value) || 0;
        if (count > 0) {
          igcseGrades[el.getAttribute('data-grade')] = count;
          totalSubjects += count;
        }
      });
      igcseGrades.totalSubjects = totalSubjects;
      gradesData = { igcse: igcseGrades };
    } else if (trackVal.includes('AS-Levels')) {
      igProgram = 'AS-Levels';
      const asGrades = {};
      document.querySelectorAll('.ig-grade-input[data-grade-type="as-level"]').forEach(el => {
        const count = parseInt(el.value) || 0;
        if (count > 0) {
          asGrades[el.getAttribute('data-grade')] = count;
          totalSubjects += count;
        }
      });
      asGrades.totalSubjects = totalSubjects;
      gradesData = { as_level: asGrades };
    } else if (trackVal.includes('A-Levels')) {
      igProgram = 'A-Levels';
      const aGrades = {};
      document.querySelectorAll('.ig-grade-input[data-grade-type="a-level"]').forEach(el => {
        const count = parseInt(el.value) || 0;
        if (count > 0) {
          aGrades[el.getAttribute('data-grade')] = count;
          totalSubjects += count;
        }
      });
      aGrades.totalSubjects = totalSubjects;
      gradesData = { a_level: aGrades };
    }

    const factorCheck = document.getElementById('ig-factor-check');
    const factor = factorCheck && factorCheck.checked ? parseFloat(document.getElementById('ig-factor-val').value) || 1.2 : 1.0;
    const sportsBonus = parseFloat(document.getElementById('ig-sports-bonus').value) || 0.0;

    const scorePercentage = parseFloat(document.getElementById('ig-percentage-val').textContent) || 0.0;
    const governmentScore = parseFloat(document.getElementById('ig-gov-val').textContent) || 0.0;

    return {
      ...personalInfo,
      nationalId: document.getElementById('national-id').value.trim(),
      certification: certSelect.options[certSelect.selectedIndex].text,
      track: trackVal,
      yearOfStudy: '',
      igProgram: igProgram,
      photo: uploadedPhotoBase64,
      grades: gradesData,
      factor: factor,
      sportsBonus: sportsBonus,
      scorePercentage: scorePercentage,
      governmentScore: governmentScore,
      submittedAt: new Date().toISOString()
    };
  }

  if (certSelect.value === 'saudi') {
    const yearsCountVal = document.getElementById('year-select').value;
    const yearWeights = typeof getSaudiYearWeights === 'function' ? getSaudiYearWeights(yearsCountVal) : {};
    const yearsData = [];
    const cards = document.querySelectorAll('#saudi-multi-tables-container .saudi-year-card');
    let overallAchieved = 0;
    let overallWeighted = 0;
    let overallCoefficients = 0;
    let schoolPercentage = 0;

    cards.forEach(card => {
      const yearLabelEl = card.querySelector('.saudi-year-title');
      const labelText = yearLabelEl ? yearLabelEl.textContent.trim().replace('📚 ', '') : 'السنة الدراسية';
      const yearKey = card.getAttribute('data-year-key') || 'Year 1';

      const gradesData = [];
      const rows = card.querySelectorAll('tbody tr');
      let cardAchieved = 0;
      let cardWeighted = 0;
      let cardCoefficients = 0;

      rows.forEach(row => {
        const achievedInput = row.querySelector('.saudi-achieved-input');
        const weightedInput = row.querySelector('.saudi-weighted-input');
        const subjectName = achievedInput.getAttribute('data-subject');
        const achieved = parseFloat(achievedInput.value) || 0;
        const weighted = parseFloat(weightedInput.value) || 0;
        const coefficient = achieved > 0 ? Math.round(weighted / achieved) : 0;

        gradesData.push({
          subjectName,
          coefficient,
          achieved,
          weighted
        });

        cardAchieved += achieved;
        cardWeighted += weighted;
        cardCoefficients += coefficient;
      });

      const weightPercent = yearWeights[yearKey] || 0;
      const yearPercentage = cardCoefficients > 0 ? (cardWeighted / cardCoefficients) : 0;
      const contribution = yearPercentage * (weightPercent / 100);

      yearsData.push({
        yearLabel: yearKey,
        yearLabelAr: labelText,
        grades: gradesData,
        subtotal: {
          totalAchieved: parseFloat(cardAchieved.toFixed(2)),
          totalWeighted: parseFloat(cardWeighted.toFixed(2)),
          totalCoefficients: cardCoefficients,
          yearPercentage: parseFloat(yearPercentage.toFixed(2)),
          weightPercent,
          contribution: parseFloat(contribution.toFixed(2))
        }
      });

      overallAchieved += cardAchieved;
      overallWeighted += cardWeighted;
      overallCoefficients += cardCoefficients;
      schoolPercentage += contribution;
    });

    const aptitudeScore = parseFloat(document.getElementById('saudi-aptitude-score').value) || 0;
    const finalPercentage = (schoolPercentage + aptitudeScore) / 2;

    return {
      ...personalInfo,
      nationalId: document.getElementById('national-id').value.trim(),
      certification: certSelect.options[certSelect.selectedIndex].text,
      track: trackSelect.value,
      yearsCount: yearsCountVal,
      photo: uploadedPhotoBase64,
      years: yearsData,
      aptitudeScore: aptitudeScore,
      overallTotals: {
        totalAchieved: parseFloat(overallAchieved.toFixed(2)),
        totalWeighted: parseFloat(overallWeighted.toFixed(2)),
        totalCoefficients: overallCoefficients,
        schoolPercentage: parseFloat(schoolPercentage.toFixed(2)),
        aptitudeScore: aptitudeScore,
        finalPercentage: parseFloat(finalPercentage.toFixed(2))
      },
      submittedAt: new Date().toISOString()
    };
  }

  const grades = [];
  const rows = document.querySelectorAll('#grades-table-body tr');

  rows.forEach(row => {
    const subjectName = row.querySelector('.col-subject').textContent;
    const grade = parseFloat(row.querySelector('.grade-input').value);
    const weighted = parseFloat(row.querySelector('.weight-input').value);
    const achieved = parseFloat(row.querySelector('.col-achieved').textContent);

    grades.push({
      subjectName,
      grade,
      weighted,
      achieved
    });
  });

  return {
    ...personalInfo,
    nationalId: document.getElementById('national-id').value.trim(),
    certification: certSelect.options[certSelect.selectedIndex].text,
    track: trackSelect.value,
    yearOfStudy: document.getElementById('year-select').value,
    photo: uploadedPhotoBase64,
    grades: grades,
    submittedAt: new Date().toISOString()
  };
}

// Send Data to the ASP.NET Core API (same-origin, served by this app) with local backup fallback
function sendData(payload, submitBtn, originalText) {
  // Convert payload to ASP.NET Core DTO structure
  const apiPayload = {
    studentName: payload.studentName,
    studentNameEn: payload.studentNameEn,
    nationalId: payload.nationalId,
    phone: payload.studentPhone,
    email: payload.studentEmail,
    guardianName: payload.guardianName,
    guardianPhone: payload.guardianPhone,
    guardianRelation: payload.guardianRelation,
    addressGov: payload.addressGov,
    addressCenter: payload.addressCenter,
    addressVillage: payload.addressVillage,
    addressStreet: payload.addressStreet,
    addressBuilding: payload.addressBuilding,
    addressFloor: payload.addressFloor,
    certification: payload.certification === 'شهادة سعودية' ? 'Saudi Certificate' : (payload.certification.includes('IG') ? 'IG' : payload.certification),
    track: payload.track,
    photo: payload.photo
  };

  if (payload.yearsCount) {
    apiPayload.yearsCount = payload.yearsCount;
    apiPayload.aptitudeScore = payload.aptitudeScore;
    apiPayload.saudiGrades = [];
    payload.years.forEach(yr => {
      yr.grades.forEach(g => {
        apiPayload.saudiGrades.push({
          yearLabel: yr.yearLabel,
          subjectName: g.subjectName,
          achieved: g.achieved,
          weighted: g.weighted
        });
      });
    });
  } else if (payload.igProgram) {
    apiPayload.igProgram = payload.igProgram;
    apiPayload.factor = payload.factor;
    apiPayload.sportsBonus = payload.sportsBonus;
    apiPayload.igGradeCounts = [];

    const activeSubkey = payload.igProgram === 'IGCSE' ? 'igcse' : (payload.igProgram === 'AS-Levels' ? 'as_level' : 'a_level');
    const gradesObj = payload.grades[activeSubkey] || {};

    Object.keys(gradesObj).forEach(gradeKey => {
      let gradeType = 'igcse-legacy';
      if (payload.igProgram === 'IGCSE') {
        const isNumeric = ['9', '8', '7', '6', '5', '4'].includes(gradeKey);
        gradeType = isNumeric ? 'igcse-numeric' : 'igcse-legacy';
      } else if (payload.igProgram === 'AS-Levels') {
        gradeType = 'as-level';
      } else if (payload.igProgram === 'A-Levels') {
        gradeType = 'a-level';
      }

      apiPayload.igGradeCounts.push({
        gradeType: gradeType,
        grade: gradeKey,
        count: gradesObj[gradeKey]
      });
    });
  } else {
    apiPayload.yearOfStudy = payload.yearOfStudy;
    apiPayload.standardGrades = payload.grades.map(g => ({
      yearOfStudy: payload.yearOfStudy,
      subjectName: g.subjectName,
      grade: g.grade,
      weightedPercentage: g.weighted
    }));
  }

  fetch('/api/students/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(apiPayload)
  })
  .then(async response => {
    let result = {};
    try {
      result = await response.json();
    } catch(e) {}

    if (response.ok && result.status === 'success') {
      showSuccessScreen(payload, 'server', result.file_path || '');
    } else {
      throw new Error(result.message || 'Server error occurred');
    }
  })
  .catch(error => {
    console.warn('Backend submission failed. Storing in localStorage instead.', error);

    // Save to localStorage as secondary backup
    try {
      const existingSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]');
      existingSubmissions.push(payload);
      localStorage.setItem('student_submissions', JSON.stringify(existingSubmissions));

      showSuccessScreen(payload, 'local');
    } catch(storageError) {
      console.error('Failed to store in localStorage', storageError);
      showAlert('form-alert', 'حدث خطأ أثناء الاتصال بالخادم ولم نتمكن من الحفظ محلياً. يرجى تنزيل الملف لحفظ بياناتك.', 'danger');
      showSuccessScreen(payload, 'local_failed');
    }
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  });
}

// Show Success Receipt Screen
function showSuccessScreen(payload, mode, serverPath = '') {
  document.getElementById('student-reg-form').style.display = 'none';
  document.getElementById('step-bar-container').style.display = 'none';

  const successScreen = document.getElementById('success-screen');
  successScreen.style.display = 'block';

  // Fill receipt data
  document.getElementById('receipt-name').textContent = payload.studentName;
  document.getElementById('receipt-id').textContent = payload.nationalId;
  document.getElementById('receipt-cert').textContent = payload.certification;

  const programRow = document.getElementById('receipt-program-row');
  const yearRow = document.getElementById('receipt-year-row');
  const yearLabel = document.getElementById('receipt-year-label');
  const saudiGpaRow = document.getElementById('receipt-saudi-gpa-row');
  const saudiGpaVal = document.getElementById('receipt-saudi-gpa');

  if (payload.yearsCount) {
    if (programRow) programRow.style.display = 'none';
    if (yearRow) yearRow.style.display = 'flex';
    if (yearLabel) yearLabel.textContent = 'عدد سنوات الدراسة:';

    let yearsText = payload.yearsCount;
    if (payload.yearsCount === 'One Year') yearsText = 'سنة واحدة';
    else if (payload.yearsCount === 'Two Years') yearsText = 'سنتان';
    else if (payload.yearsCount === 'Three Years') yearsText = 'ثلاث سنوات';
    document.getElementById('receipt-year').textContent = yearsText;

    if (saudiGpaRow && saudiGpaVal) {
      saudiGpaRow.style.display = 'flex';
      saudiGpaVal.textContent = payload.overallTotals.finalPercentage.toFixed(2) + '%';
    }
  } else if (payload.igProgram) {
    if (programRow) {
      programRow.style.display = 'flex';
      document.getElementById('receipt-program').textContent = payload.track;
    }
    if (yearRow) yearRow.style.display = 'none';
    if (saudiGpaRow) saudiGpaRow.style.display = 'none';
  } else {
    if (programRow) programRow.style.display = 'none';
    if (yearRow) {
      yearRow.style.display = 'flex';
      if (yearLabel) yearLabel.textContent = 'السنة الدراسية:';
      document.getElementById('receipt-year').textContent = payload.yearOfStudy;
    }
    if (saudiGpaRow) saudiGpaRow.style.display = 'none';
  }

  const modeBadge = document.getElementById('receipt-mode');
  if (mode === 'server') {
    modeBadge.textContent = 'تم الحفظ على الخادم بنجاح';
    modeBadge.style.color = 'var(--success-color)';
  } else {
    modeBadge.textContent = 'تم الحفظ محلياً في المتصفح (الخادم غير متصل)';
    modeBadge.style.color = 'var(--accent-color)';
  }

  // Setup Actions
  const btnDownloadJson = document.getElementById('btn-download-json');
  btnDownloadJson.onclick = () => {
    downloadReceiptFile(payload, 'json');
  };

  const btnDownloadCsv = document.getElementById('btn-download-csv');
  btnDownloadCsv.onclick = () => {
    downloadReceiptFile(payload, 'csv');
  };

  const btnNewForm = document.getElementById('btn-new-form');
  btnNewForm.onclick = () => {
    location.reload();
  };
}

// Download local JSON / CSV receipts
function downloadReceiptFile(payload, format) {
  let fileContent = '';
  let fileName = `receipt_${payload.nationalId}`;
  let mimeType = '';

  if (format === 'json') {
    fileContent = JSON.stringify(payload, null, 2);
    fileName += '.json';
    mimeType = 'application/json';
  } else {
    // Generate CSV
    const csvRows = [];
    csvRows.push('\uFEFF'); // UTF-8 BOM for Excel Arabic layout
    csvRows.push('حقل,القيمة');
    csvRows.push(`اسم الطالب (عربي),"${payload.studentNameAr || payload.studentName}"`);
    csvRows.push(`اسم الطالب (انجليزي),"${payload.studentNameEn || ''}"`);
    csvRows.push(`الرقم القومي,${payload.nationalId}`);
    csvRows.push(`رقم هاتف الطالب,${payload.studentPhone || ''}`);
    csvRows.push(`ايميل الشخصي للطالب,${payload.studentEmail || ''}`);
    csvRows.push(`اسم ولي الامر,"${payload.guardianName || ''}"`);
    csvRows.push(`رقم هاتف ولي الامر,${payload.guardianPhone || ''}`);
    csvRows.push(`صلة قرابة ولي الامر,"${payload.guardianRelation || ''}"`);
    csvRows.push(`المحافظه,"${payload.addressGov || ''}"`);
    csvRows.push(`المركز,"${payload.addressCenter || ''}"`);
    csvRows.push(`قرية/حي,"${payload.addressVillage || ''}"`);
    csvRows.push(`شارع,"${payload.addressStreet || ''}"`);
    csvRows.push(`رقم العماره,"${payload.addressBuilding || ''}"`);
    csvRows.push(`رقم الدور,"${payload.addressFloor || ''}"`);
    csvRows.push(`نوع الشهادة,"${payload.certification}"`);

    if (payload.yearsCount) {
      csvRows.push(`مسار الدراسة,"${payload.track}"`);
      csvRows.push(`عدد سنوات الدراسة,"${payload.yearsCount}"`);
      csvRows.push(`مجموع الدرجات المحرزة الكلي,${payload.overallTotals.totalAchieved}`);
      csvRows.push(`مجموع المعاملات الكلي,${payload.overallTotals.totalCoefficients}`);
      csvRows.push(`المجموع الموزون الكلي,${payload.overallTotals.totalWeighted}`);
      csvRows.push(`النسبة المئوية النهائية (GPA),${payload.overallTotals.finalPercentage}%`);
      csvRows.push(`تاريخ الإرسال,${payload.submittedAt}`);
      csvRows.push('');

      payload.years.forEach(yr => {
        csvRows.push(`-- ${yr.yearLabelAr} --`);
        csvRows.push('المادة,المعامل,الدرجة المحرزة,الدرجة الموزونة');
        yr.grades.forEach(g => {
          csvRows.push(`"${g.subjectName}",${g.coefficient},${g.achieved},${g.weighted}`);
        });
        csvRows.push(`مجموع درجات السنة,${yr.subtotal.totalAchieved}`);
        csvRows.push(`مجموع معاملات السنة,${yr.subtotal.totalCoefficients}`);
        csvRows.push(`مجموع موزون السنة,${yr.subtotal.totalWeighted}`);
        csvRows.push('');
      });
    } else if (payload.igProgram) {
      csvRows.push(`برنامج الـ IG,"${payload.track}"`);
      csvRows.push(`نوع البرنامج,"${payload.igProgram}"`);
      csvRows.push(`تطبيق المعامل النسبي,${payload.factor}`);
      csvRows.push(`الحافز الرياضي,${payload.sportsBonus}%`);
      csvRows.push(`النسبة المئوية المحسوبة,${payload.scorePercentage}%`);
      csvRows.push(`المجموع الحكومي المعادل,${payload.governmentScore}/410`);
      csvRows.push('');
      csvRows.push('التقدير,العدد');

      const activeSubkey = payload.igProgram === 'IGCSE' ? 'igcse' : (payload.igProgram === 'AS-Levels' ? 'as_level' : 'a_level');
      const gradesObj = payload.grades[activeSubkey] || {};
      Object.keys(gradesObj).forEach(gradeKey => {
        csvRows.push(`"${gradeKey}",${gradesObj[gradeKey]}`);
      });
    } else {
      csvRows.push(`المسار الأكاديمي,"${payload.track}"`);
      csvRows.push(`السنة الدراسية,"${payload.yearOfStudy}"`);
      csvRows.push(`تاريخ الإرسال,${payload.submittedAt}`);
      csvRows.push('');
      csvRows.push('المادة,الدرجة,النسبة الموزونة,الدرجة المتحصلة');

      payload.grades.forEach(g => {
        csvRows.push(`"${g.subjectName}",${g.grade},${g.weighted},${g.achieved}`);
      });
    }

    fileContent = csvRows.join('\n');
    fileName += '.csv';
    mimeType = 'text/csv;charset=utf-8;';
  }

  const blob = new Blob([fileContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Common Alerts
function showAlert(id, message, type) {
  const alertEl = document.getElementById(id);
  alertEl.textContent = message;
  alertEl.style.display = 'flex';
  if (type === 'danger') {
    alertEl.className = 'alert alert-danger';
  } else {
    alertEl.className = 'alert alert-success';
  }
}

function hideAlert(id) {
  const alertEl = document.getElementById(id);
  alertEl.style.display = 'none';
}
