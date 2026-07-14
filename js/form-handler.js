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
  const tableBody = document.getElementById('grades-table-body');
  tableBody.innerHTML = '';

  let yearKey = 'year_1';
  if (yearVal === 'تانية ثانوي') {
    yearKey = 'year_2';
  } else if (yearVal === 'تالتة ثانوي') {
    yearKey = 'year_3';
  }

  // Get subjects list
  const subjects = appConfig.subjects[yearKey] || appConfig.subjects.year_1;

  subjects.forEach((subjectName, index) => {
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
      <td class="col-achieved" id="achieved-val-${index}">0.00</td>
    `;
    tableBody.appendChild(row);
  });

  // Re-bind listeners for table calculation
  setupTableCalculationListeners();
}

// 3. Real-time Calculation Handler
function setupTableCalculationListeners() {
  const tableBody = document.getElementById('grades-table-body');
  if (!tableBody) return;

  const rows = tableBody.querySelectorAll('tr');

  rows.forEach((row, index) => {
    const gradeInput = row.querySelector('.grade-input');
    const weightInput = row.querySelector('.weight-input');
    const achievedDisplay = row.querySelector('.col-achieved');

    const recalculate = () => {
      const grade = parseFloat(gradeInput.value) || 0;
      const weight = parseFloat(weightInput.value) || 0;

      // Validate range [0 - 100]
      if (grade < 0 || grade > 100) {
        gradeInput.style.borderColor = 'var(--danger-color)';
      } else {
        gradeInput.style.borderColor = '';
      }

      if (weight < 0 || weight > 100) {
        weightInput.style.borderColor = 'var(--danger-color)';
      } else {
        weightInput.style.borderColor = '';
      }

      // Calculate Achieved Grade: (Grade * Weight) / 100
      const achieved = (grade * weight) / 100;
      achievedDisplay.textContent = achieved.toFixed(2);
    };

    gradeInput.addEventListener('input', recalculate);
    weightInput.addEventListener('input', recalculate);
    gradeInput.addEventListener('blur', recalculate);
    weightInput.addEventListener('blur', recalculate);
  });
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
  const studentNameInput = document.getElementById('student-name');
  if (!studentNameInput.value.trim()) {
    return {
      valid: false,
      message: 'الرجاء إدخال اسم الطالب كاملاً.',
      element: studentNameInput
    };
  }
  if (studentNameInput.value.length > 100) {
    return {
      valid: false,
      message: 'يجب ألا يزيد اسم الطالب عن 100 حرف.',
      element: studentNameInput
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

  // 6. Year of Study (Non-IG)
  const yearSelect = document.getElementById('year-select');
  if (!yearSelect.value) {
    return {
      valid: false,
      message: 'الرجاء اختيار السنة الدراسية.',
      element: yearSelect
    };
  }

  // 7. Table Inputs (Non-IG)
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
      studentName: document.getElementById('student-name').value.trim(),
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
    studentName: document.getElementById('student-name').value.trim(),
    nationalId: document.getElementById('national-id').value.trim(),
    certification: certSelect.options[certSelect.selectedIndex].text,
    track: trackSelect.value,
    yearOfStudy: document.getElementById('year-select').value,
    photo: uploadedPhotoBase64,
    grades: grades,
    submittedAt: new Date().toISOString()
  };
}

// Send Data to PHP Endpoint with local backup fallback
function sendData(payload, submitBtn, originalText) {
  fetch('php/submit-form.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
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
  
  if (payload.igProgram) {
    document.getElementById('receipt-program-row').style.display = 'flex';
    document.getElementById('receipt-year-row').style.display = 'none';
    document.getElementById('receipt-program').textContent = payload.track;
  } else {
    document.getElementById('receipt-program-row').style.display = 'none';
    document.getElementById('receipt-year-row').style.display = 'flex';
    document.getElementById('receipt-year').textContent = payload.yearOfStudy;
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
    csvRows.push(`اسم الطالب,"${payload.studentName}"`);
    csvRows.push(`الرقم القومي,${payload.nationalId}`);
    csvRows.push(`نوع الشهادة,"${payload.certification}"`);
    
    if (payload.igProgram) {
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
