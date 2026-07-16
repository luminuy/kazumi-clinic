// Public professional profile supplied by the clinic. Keep private CV details such as
// date of birth, personal phone number, and email out of the website.
export const doctor = {
  name: 'Dr. Pratch Achawanitkun',
  nameTh: 'นายแพทย์ปราชญ์ อาชวนิจกุล',
  licenseNo: 'ว.75302',
  givenName: 'Pratch',
  familyName: 'Achawanitkun',
  role: 'แพทย์ด้านเวชศาสตร์ความงาม',
  image: '/images/doctor/dr-pratch-achawanitkun.jpg',
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
  expertise: [
    'Botulinum Toxin',
    'Dermal Filler',
    'Biostimulator',
    'Energy-based Devices',
    'IV Therapy Consultation',
  ],
  languages: ['ไทย', 'English', '中文'],
} as const;
