// Public professional profile supplied by the clinic. Keep private CV details such as
// date of birth, personal phone number, and email out of the website.
export const doctor = {
  name: 'Dr. Pratch Achawanitkun',
  nameTh: 'นายแพทย์ปราชญ์ อาชวนิจกุล',
  licenseNo: 'ว.75302',
  givenName: 'Pratch',
  familyName: 'Achawanitkun',
  role: 'แพทย์ด้านเวชศาสตร์ความงาม',
  summary:
    'ให้คำปรึกษา วางแผนการดูแลเฉพาะบุคคล และให้คำแนะนำก่อน–หลังหัตถการ โดยคำนึงถึงประวัติสุขภาพและเป้าหมายของผู้รับบริการ',
  education: [
    {
      degree: 'MSc in Aesthetic Medicine',
      institution: 'Queen Mary University of London, United Kingdom',
    },
    {
      degree: 'Doctor of Medicine',
      institution: 'Gullas College of Medicine, Philippines',
    },
    {
      degree: 'MSc in Advanced Chemical Engineering',
      institution: 'University of Manchester, United Kingdom',
    },
    {
      degree: 'Bachelor of Engineering',
      institution: 'Chulalongkorn University, Thailand',
    },
  ],
  experience: [
    'มีประสบการณ์ให้คำปรึกษาและดูแลหัตถการด้านเวชศาสตร์ความงาม',
    'ประเมินผู้รับบริการและวางแผนการดูแลเฉพาะบุคคล',
    'ให้คำแนะนำการเตรียมตัวและการดูแลหลังหัตถการ',
  ],
  // Continuing-education workshops & certificates, transcribed from the clinic's supplied
  // "Training Certificate" document. `title` is the course, `provider` the organiser · location.
  training: [
    {
      title: 'Hands-on Workshop — Ultrasound Imaging for Facial Aesthetic Injection Course, Episode III',
      provider: 'IDS Medical System · Bangkok, Thailand',
    },
    {
      title: 'Certificate of Attendance — Aesthetic Medicine Online Symposium 2024',
      provider: 'Queen Mary University of London · London, UK',
    },
    {
      title: 'Certificate of Attendance — APEM Thailand 2024',
      provider: 'APEM · Bangkok, Thailand',
    },
    {
      title: 'Masterclass Hands-on Workshop — Hydrobooster Revolution: Redefining Skin Hydration and Skin Quality',
      provider: 'Menarini Academy · Bangkok, Thailand',
    },
    {
      title: 'Sculptra Exclusive Hands-on Workshop',
      provider: 'Galderma Thailand · Bangkok, Thailand',
    },
    {
      title: 'Collagen Stimulator HArmonyCa™ Workshop',
      provider: 'Allergan Medical Institute · Bangkok, Thailand',
    },
    {
      title: 'Hands-on Workshop — GLOW ON HIT: Firm & Refreshed',
      provider: 'Galderma Thailand · Bangkok, Thailand',
    },
    {
      title: 'Hands-on Workshop — Launch of the New Indication of HCC: Acne Scar Treatment',
      provider: 'Alma Lasers (Thailand) Ltd. · Bangkok, Thailand',
    },
  ],
  expertise: [
    'Botulinum Toxin',
    'Dermal Filler',
    'Biostimulator',
    'Energy-based Devices',
    'IV Therapy Consultation',
  ],
  languages: ['ไทย', 'English', '中文'],
} as const;

// Second physician — transcribed from the clinic's supplied profile posters. English name kept
// as-is (the posters carry no Thai spelling); a Thai name/title can be added once the clinic
// confirms it. `licenseNo` is printed exactly as the poster states — it lacks the Thai ว. prefix
// Dr. Pratch's carries, so confirm the correct ใบประกอบวิชาชีพ number before relying on it.
export const doctorEesha = {
  name: 'Dr. Eesha Patel',
  // Phonetic Thai transliteration (the posters carry no Thai spelling). No นพ./พญ. title — the
  // clinic can swap in her registered Thai name/title if the spelling differs.
  nameTh: 'อีชา พาเทล',
  licenseNo: '69180',
  givenName: 'Eesha',
  familyName: 'Patel',
  role: 'แพทย์ผิวหนังและเวชศาสตร์ความงาม',
  credentials: 'MBBS · MSc Internal Medicine (Dermatology) · Anti-Aging Medicine',
  summary:
    'ดูแลด้านสุขภาพผิวและเวชศาสตร์ความงาม ให้คำปรึกษาและประเมินก่อนหัตถการ ครอบคลุมหัตถการเลเซอร์ อัลตราซาวด์ แสงบำบัด หัตถการฉีด และการฟื้นฟูผิว',
  education: [
    {
      degree: 'Board Certification in Anti-Aging Medicine',
      institution: 'American Academy of Anti-Aging / Regenerative Medicine · 2024',
    },
    {
      degree: 'MSc Internal Medicine (Dermatology)',
      institution: 'Ramathibodi Hospital, Mahidol University · 2016–2018',
    },
    {
      degree: 'Bachelor of Medicine, Bachelor of Surgery (MBBS)',
      institution: 'Kasturba Medical College, Manipal, India · 2010–2016',
    },
  ],
  experience: [
    'Aesthetic & Skin Physician — Bangkok, Thailand (2022–ปัจจุบัน)',
    'Fellowship Training — Cutaneous & Laser Surgery, Institute of Dermatology, Ministry of Public Health (2019)',
    'Senior Manager, Health Ideation & Innovation — Prudential Thailand (2020–2021)',
  ],
  training: [
    'Integrative Toxin & Filler Training (2022)',
    'Current Issues in Dermatology — Chulalongkorn University (2021)',
    'International Thaicosderm Congress on Aesthetic Medicine (2018)',
  ],
  memberships: [
    'Member, Dermatological Society of Thailand (2016–ปัจจุบัน)',
    'Review of melasma treatment options (2017–2018)',
  ],
  expertise: [
    'Skin health & aesthetic consultation',
    'Laser, ultrasound & light-based procedures',
    'Injectable treatments & skin rejuvenation',
    'IV therapy consultation',
    'PRP & collagen-stimulating treatments',
    'Patient assessment & aftercare',
  ],
  technologies: [
    'Diode',
    'Ultherapy',
    'Ultraformer',
    'DPL',
    'Fractional CO₂',
    'RF',
    'Erbium',
    'IPL',
    'V-Beam',
    'Nd:YAG',
    'Pico',
  ],
  languages: ['ไทย', 'English', 'Hindi', 'Gujarati'],
} as const;

// Dr. Pratch is the clinic director (featured across the site); Dr. Eesha is a clinic physician
// shown on /about. Both appear as licensed employees in the MedicalBusiness JSON-LD.
export const doctors = [doctor, doctorEesha] as const;
