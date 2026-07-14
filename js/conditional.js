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

let appConfig = subjectsFallback;

// Fetch config from data/subjects.json
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
    // Clear and populate certs
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
      // Lock track select (as per brief requirement)
      trackSelect.disabled = true;
      trackLockedIndicator.style.display = 'flex';
      
      if (certKey === 'ig') {
        // Direct transition for IG (skip Years of Study)
        activateSection('section-grades');
        
        // Show correct IG Subsystem based on selected track
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
        // Regular flow (show year selection section)
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
      // Generate the grades entry table based on selection
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
