// Fallback data structure for offline or local file:// environment
const subjectsFallback = {
  "certifications": {
    "ig": {
      "name": "شهادات الـ IG (IGCSE/O-Level/A-Level)",
      "tracks": [
        "IGCSE (Early Years) - مواد عامة",
        "A-Levels (Advanced Years) - تخصص علمي أو أدبي",
        "AS-Levels (Intermediate Year) - انتقالى"
      ]
    },
    "saudi": {
      "name": "شهادة سعودية",
      "tracks": [
        "المسار العام",
        "مسار العلوم",
        "مسار الإدارة والأعمال",
        "مسار الهندسة والتكنولوجيا",
        "مسار العلوم الإنسانية"
      ]
    },
    "qatari": {
      "name": "شهادة قطرية",
      "tracks": [
        "المسار العلمي",
        "المسار الأدبي والإنسانيات",
        "مسار التكنولوجيا"
      ]
    },
    "bahraini": {
      "name": "شهادة بحرينية",
      "tracks": [
        "مسار العلوم والرياضيات",
        "مسار اللغات والعلوم الإنسانية",
        "مسار العلوم التجارية"
      ]
    },
    "kuwaiti": {
      "name": "شهادة كويتية",
      "tracks": [
        "القسم العلمي",
        "القسم الأدبي"
      ]
    }
  },
  "subjects": {
    "year_1": [
      "اللغة العربية",
      "اللغة الإنجليزية",
      "الرياضيات",
      "الكيمياء",
      "الفيزياء",
      "الأحياء",
      "الدراسات الإسلامية",
      "الدراسات الاجتماعية"
    ],
    "year_2": [
      "اللغة العربية",
      "اللغة الإنجليزية",
      "الرياضيات (2)",
      "الكيمياء",
      "الفيزياء",
      "الأحياء",
      "الحاسب الآلي",
      "الدراسات الإسلامية"
    ],
    "year_3": [
      "اللغة العربية",
      "اللغة الإنجليزية",
      "الرياضيات (3)",
      "الكيمياء",
      "الفيزياء",
      "الجيولوجيا والعلوم البيئية",
      "الدراسات الإسلامية",
      "التربية الوطنية"
    ]
  }
};

const saudiSubjectsFallback = {
  "block_1": [
    { "name": "مصادر المعلومات والبحث", "coefficient": 3 },
    { "name": "الفيزياء", "coefficient": 5 },
    { "name": "الرياضيات", "coefficient": 4 },
    { "name": "الجغرافيا", "coefficient": 3 },
    { "name": "الكيمياء", "coefficient": 5 },
    { "name": "اللغة الإنجليزية", "coefficient": 4 },
    { "name": "التقنية الرقمية", "coefficient": 3 },
    { "name": "التنمية المستدامة", "coefficient": 3 },
    { "name": "الفيزياء", "coefficient": 5 },
    { "name": "المهارات الحياتية", "coefficient": 3 },
    { "name": "الرياضيات", "coefficient": 4 },
    { "name": "المواطنة الرقمية", "coefficient": 3 },
    { "name": "اللغة الإنجليزية", "coefficient": 4 },
    { "name": "علم الأرض والفضاء", "coefficient": 4 },
    { "name": "التنمية المستدامة", "coefficient": 4 },
    { "name": "الفقه", "coefficient": 3 },
    { "name": "الفيزياء", "coefficient": 5 },
    { "name": "الرياضيات", "coefficient": 4 },
    { "name": "التربية الصحية والبدنية", "coefficient": 4 },
    { "name": "الدراسات النفسية والاجتماعية", "coefficient": 3 },
    { "name": "اللغة الإنجليزية", "coefficient": 5 },
    { "name": "علم الأرض والفضاء", "coefficient": 4 },
    { "name": "الدراسات الأدبية", "coefficient": 3 },
    { "name": "التنمية المستدامة", "coefficient": 3 }
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
    { "name": "علم الأحياء", "coefficient": 4 },
    { "name": "التربية البدنية والدفاع عن النفس", "coefficient": 5 },
    { "name": "الكيمياء", "coefficient": 5 },
    { "name": "اللغة الإنجليزية", "coefficient": 5 },
    { "name": "التقنية الرقمية", "coefficient": 3 },
    { "name": "الفيزياء", "coefficient": 5 },
    { "name": "الكفايات اللغوية", "coefficient": 3 },
    { "name": "علم الأحياء", "coefficient": 4 },
    { "name": "التربية البدنية والدفاع عن النفس", "coefficient": 5 },
    { "name": "الكيمياء", "coefficient": 5 },
    { "name": "اللغة الإنجليزية", "coefficient": 5 },
    { "name": "التقنية الرقمية", "coefficient": 3 }
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
    { "name": "الكفايات اللغوية", "coefficient": 5 },
    { "name": "الرياضيات", "coefficient": 5 },
    { "name": "التربية الصحية والبدنية", "coefficient": 3 },
    { "name": "اللغة الإنجليزية", "coefficient": 5 },
    { "name": "التقنية الرقمية", "coefficient": 3 },
    { "name": "التربية المهنية", "coefficient": 3 },
    { "name": "علم البيئة", "coefficient": 3 },
    { "name": "الرياضيات", "coefficient": 5 },
    { "name": "الدراسات الاجتماعية", "coefficient": 5 },
    { "name": "التربية الصحية والبدنية", "coefficient": 3 },
    { "name": "الكيمياء", "coefficient": 5 },
    { "name": "اللغة الإنجليزية", "coefficient": 5 },
    { "name": "التقنية الرقمية", "coefficient": 3 },
    { "name": "الحديث والثقافة الإسلامية", "coefficient": 3 }
  ]
};

let appConfig = subjectsFallback;
let saudiConfig = saudiSubjectsFallback;

// Fetch config from data/subjects.json and data/subjects_saudi.json
async function loadSubjectsConfig() {
  try {
    const response = await fetch('data/subjects.json');
    if (response.ok) {
      appConfig = await response.json();
      console.log('Successfully loaded subjects configuration from JSON.');
    }
  } catch (error) {
    console.warn('Failed to load JSON data. Using fallback local configuration objects.', error);
  }

  try {
    const response = await fetch('data/subjects_saudi.json');
    if (response.ok) {
      saudiConfig = await response.json();
      console.log('Successfully loaded Saudi subjects configuration from JSON.');
    }
  } catch (error) {
    console.warn('Failed to load Saudi JSON data. Using fallback local configuration objects.', error);
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
function getSaudiBlocks(yearVal) {
  const b1 = saudiConfig.block_1 || [];
  const b2 = saudiConfig.block_2 || [];
  const b3 = saudiConfig.block_3 || [];
  
  const blocks = [];
  if (yearVal === 'One Year') {
    blocks.push({
      label: 'الصف الثالث الثانوي (Third Secondary Grade)',
      key: 'Year 1',
      subjects: JSON.parse(JSON.stringify(b1))
    });
  } else if (yearVal === 'Two Years') {
    blocks.push({
      label: 'الصف الثاني الثانوي (Second Secondary Grade)',
      key: 'Year 1',
      subjects: JSON.parse(JSON.stringify(b1))
    });
    blocks.push({
      label: 'الصف الثالث الثانوي (Third Secondary Grade)',
      key: 'Year 2',
      subjects: JSON.parse(JSON.stringify(b2))
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
    populateCertifications();
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
