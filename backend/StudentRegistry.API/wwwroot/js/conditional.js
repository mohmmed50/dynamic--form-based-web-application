let appConfig = null;
let saudiConfig = null;

// Fetch config from the ConfigController API (single source of truth)
async function loadSubjectsConfig() {
  try {
    const response = await fetch('/api/config/subjects');
    if (response.ok) {
      appConfig = await response.json();
    } else {
      throw new Error('Failed to load /api/config/subjects: ' + response.status);
    }
  } catch (error) {
    console.error('Could not load certifications/subjects configuration.', error);
    showAlert('form-alert', 'تعذر تحميل بيانات الشهادات والمواد من الخادم. الرجاء تحديث الصفحة.', 'danger');
  }

  try {
    const response = await fetch('/api/config/subjects-saudi');
    if (response.ok) {
      saudiConfig = await response.json();
    } else {
      throw new Error('Failed to load /api/config/subjects-saudi: ' + response.status);
    }
  } catch (error) {
    console.error('Could not load Saudi subjects configuration.', error);
    showAlert('form-alert', 'تعذر تحميل بيانات مواد الشهادة السعودية من الخادم. الرجاء تحديث الصفحة.', 'danger');
  }
}

// Adjust Section E (Year Selection) options and labels based on certKey
function adjustYearSelect(certKey) {
  const yearSelect = document.getElementById('year-select');
  const titleEl = document.querySelector('#section-year .section-title');
  const descEl = document.querySelector('#section-year .section-desc');

  if (certKey === 'saudi') {
    yearSelect.innerHTML = `
      <option value="">-- اختر --</option>
      <option value="One Year">سنة واحدة (24 مادة)</option>
      <option value="Two Years">سنتان (45 مادة)</option>
      <option value="Three Years">ثلاث سنوات (68 مادة)</option>
    `;
    if (titleEl) titleEl.textContent = 'عدد سنوات الدراسة التراكمية';
    if (descEl) descEl.textContent = 'الرجاء اختيار عدد سنوات الدراسة التراكمية التي تريد احتسابها للمعدل.';
  } else {
    yearSelect.innerHTML = `
      <option value="">-- اختر --</option>
      <option value="أولى ثانوي">أولى ثانوي</option>
      <option value="تانية ثانوي">تانية ثانوي</option>
      <option value="تالتة ثانوي">تالتة ثانوي</option>
    `;
    if (titleEl) titleEl.textContent = 'ما هي السنة الدراسية؟';
    if (descEl) descEl.textContent = 'الرجاء اختيار السنة الدراسية الحالية للطالب.';
  }
}

// Get compiled Saudi blocks based on selected year (returns array of year-by-year blocks)
// Each block's subjects are plain subject-name strings (no fixed coefficient anymore —
// the coefficient is derived per submission from the student's own Achieved/Weighted entries).
function getSaudiBlocks(yearVal) {
  const toSubjectList = (names) => (names || []).map(name => ({ name }));
  const b1 = toSubjectList(saudiConfig.block_1);
  const b2 = toSubjectList(saudiConfig.block_2);
  const b3 = toSubjectList(saudiConfig.block_3);

  // block_1/2/3 are fixed to real grade levels (الأول/الثاني/الثالث الثانوي) — they are NOT
  // interchangeable placeholders. "One Year" always means the student's single year was Third
  // Secondary, so it must use block_3 (not block_1); "Two Years" means Second + Third Secondary,
  // so it uses block_2 + block_3 (not block_1 + block_2). Matches the official spreadsheet exactly.
  const blocks = [];
  if (yearVal === 'One Year') {
    blocks.push({
      label: 'الصف الثالث الثانوي (Third Secondary Grade)',
      key: 'Year 1',
      subjects: JSON.parse(JSON.stringify(b3))
    });
  } else if (yearVal === 'Two Years') {
    blocks.push({
      label: 'الصف الثاني الثانوي (Second Secondary Grade)',
      key: 'Year 1',
      subjects: JSON.parse(JSON.stringify(b2))
    });
    blocks.push({
      label: 'الصف الثالث الثانوي (Third Secondary Grade)',
      key: 'Year 2',
      subjects: JSON.parse(JSON.stringify(b3))
    });
  } else if (yearVal === 'Three Years') {
    blocks.push({
      label: 'الصف الأول الثانوي (First Secondary Grade)',
      key: 'Year 1',
      subjects: JSON.parse(JSON.stringify(b1))
    });
    blocks.push({
      label: 'الصف الثاني الثانوي (Second Secondary Grade)',
      key: 'Year 2',
      subjects: JSON.parse(JSON.stringify(b2))
    });
    blocks.push({
      label: 'الصف الثالث الثانوي (Third Secondary Grade)',
      key: 'Year 3',
      subjects: JSON.parse(JSON.stringify(b3))
    });
  }
  return blocks;
}

// Official Saudi year-weight table (mirrors StudentService.GetSaudiYearWeights on the backend).
// Keyed by the block's position ("Year 1"/"Year 2"/"Year 3"), not by real grade level.
function getSaudiYearWeights(yearsCount) {
  if (yearsCount === 'One Year') return { 'Year 1': 100 };
  if (yearsCount === 'Two Years') return { 'Year 1': 50, 'Year 2': 50 };
  return { 'Year 1': 20, 'Year 2': 40, 'Year 3': 40 };
}

// Get compiled subjects based on certKey and selected year
function getActiveSubjects(certKey, yearVal) {
  if (certKey === 'saudi') {
    const blocks = getSaudiBlocks(yearVal);
    let allSubjects = [];
    blocks.forEach(b => {
      allSubjects = allSubjects.concat(b.subjects);
    });
    return allSubjects;
  } else {
    let subjectsList = [];
    if (yearVal === 'أولى ثانوي') {
      subjectsList = appConfig.subjects.year_1 || [];
    } else if (yearVal === 'تانية ثانوي') {
      subjectsList = appConfig.subjects.year_2 || [];
    } else if (yearVal === 'تالتة ثانوي') {
      subjectsList = appConfig.subjects.year_3 || [];
    }
    return subjectsList.map(name => ({ name: name, coefficient: null }));
  }
}

// Initialise Conditional Handlers
function initConditionals() {
  const certSelect = document.getElementById('cert-select');
  const trackSelect = document.getElementById('track-select');
  const yearSelect = document.getElementById('year-select');
  const trackLockedIndicator = document.getElementById('track-locked-msg');

  // Load configuration
  loadSubjectsConfig().then(() => {
    if (appConfig) {
      populateCertifications();
    }
  });

  function populateCertifications() {
    certSelect.innerHTML = '<option value="">-- اختر --</option>';
    Object.keys(appConfig.certifications).forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = appConfig.certifications[key].name;
      certSelect.appendChild(option);
    });
  }

  // Master Trigger (Certifications Select)
  certSelect.addEventListener('change', function () {
    const certKey = this.value;

    // Reset subsequent fields
    trackSelect.innerHTML = '<option value="">-- اختر --</option>';
    trackSelect.disabled = !certKey;
    trackSelect.value = '';
    trackLockedIndicator.style.display = 'none';

    adjustYearSelect(certKey);
    yearSelect.value = '';

    // Hide following sections
    deactivateSection('section-track');
    deactivateSection('section-year');
    deactivateSection('section-grades');

    // Reset IG UI & standard table UI
    document.getElementById('non-ig-grades-container').style.display = 'block';
    document.getElementById('ig-grades-container').style.display = 'none';
    document.getElementById('section-year').style.display = 'block';
    document.getElementById('section-grades-title').textContent = 'جدول إدخال الدرجات';
    document.getElementById('section-grades-desc').textContent = 'أدخل الدرجة والنسبة الموزونة لكل مادة أدناه. سيتم احتساب الدرجة المتحصلة تلقائياً.';

    if (certKey) {
      // Check if IG Cert is selected
      if (certKey === 'ig') {
        document.getElementById('section-year').style.display = 'none';
        document.getElementById('non-ig-grades-container').style.display = 'none';
        document.getElementById('ig-grades-container').style.display = 'block';
        document.getElementById('section-grades-title').textContent = '🧮 حاسبة درجات الـ IG';
        document.getElementById('section-grades-desc').textContent = 'الرجاء اختيار عدد المواد لكل تقدير للبرنامج المختار لحساب النسبة المئوية والمجموع الحكومي تلقائياً.';
        if (typeof resetIGCalculator === 'function') {
          resetIGCalculator();
        }
      }

      // Populate track options
      const tracks = appConfig.certifications[certKey].tracks;
      tracks.forEach(track => {
        const option = document.createElement('option');
        option.value = track;
        option.textContent = track;
        trackSelect.appendChild(option);
      });
      activateSection('section-track');
    }

    updateProgressIndicator();
  });

  // Track Select Trigger
  trackSelect.addEventListener('change', function () {
    const trackVal = this.value;
    const certKey = certSelect.value;

    if (trackVal) {
      trackSelect.disabled = true;
      trackLockedIndicator.style.display = 'flex';

      if (certKey === 'ig') {
        activateSection('section-grades');

        document.getElementById('ig-sub-igcse').style.display = 'none';
        document.getElementById('ig-sub-as').style.display = 'none';
        document.getElementById('ig-sub-a').style.display = 'none';

        if (trackVal.includes('IGCSE')) {
          document.getElementById('ig-sub-igcse').style.display = 'block';
        } else if (trackVal.includes('AS-Levels')) {
          document.getElementById('ig-sub-as').style.display = 'block';
        } else if (trackVal.includes('A-Levels')) {
          document.getElementById('ig-sub-a').style.display = 'block';
        }

        if (typeof calculateIGScore === 'function') {
          calculateIGScore();
        }
      } else {
        yearSelect.value = '';
        activateSection('section-year');
      }
    } else {
      deactivateSection('section-year');
      deactivateSection('section-grades');
    }

    updateProgressIndicator();
  });

  // Year Select Trigger
  yearSelect.addEventListener('change', function () {
    const yearVal = this.value;

    if (yearVal) {
      generateGradesTable(yearVal);
      activateSection('section-grades');
    } else {
      deactivateSection('section-grades');
    }

    updateProgressIndicator();
  });
}

// Helper to activate a form section
function activateSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
  }
}

// Helper to deactivate a form section
function deactivateSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.remove('active');
  }
}
