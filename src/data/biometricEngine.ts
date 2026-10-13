import {
  AthleteClinicalProfile,
  DailyBiometricRecord,
  InjuryPreventionAlert,
  RecoveryStatus,
  WearableDevice,
} from '../types/biometrics';

export const ATHLETE_PROFILE: AthleteClinicalProfile = {
  fullName: 'طلال بن عبد العزيز المنصور',
  athleteId: 'KSA-ATH-88421',
  medicalRecordNumber: 'MRN-2026-094812',
  nationalHealthAuthority: 'المركز السعودي لاعتماد المنشآت الصحية (سباهي CBAHI) · منصة نفيس (NPHIES)',
  sportDiscipline: 'سباقات التحمل والجري لمسافات طويلة (ماراثون 42.2 كم)',
  age: 27,
  weightKg: 66.4,
  heightCm: 178,
  vo2Max: 71.8,
  maxHeartRate: 194,
  restingHrBaseline: 46,
  hrvBaselineRmssd: 86,
  supervisingPhysician: 'د. فيصل بن عبد الرحمن الحربي — استشاري الطب الرياضي وفسيولوجيا الجهد',
  medicalCenter: 'المختبر الوطني للطب الرياضي والأداء الفسيولوجي — الرياض',
  bloodGroup: 'O+',
};

export const INITIAL_WEARABLE_DEVICES: WearableDevice[] = [
  {
    id: 'whoop-4',
    name: 'سوار WHOOP 4.0 الفسيولوجي',
    manufacturer: 'WHOOP Inc.',
    modelCode: 'WS40-OPT-5LED',
    sensorType: 'حساس ضوئي PPG بخمسة أطوال موجية + مقياس حرارة جلدي',
    samplingFrequencyHz: 100,
    connected: true,
    batteryPercent: 84,
    lastSyncTime: 'اليوم · 06:22 ص',
    firmwareVersion: '41.15.2.0',
    supportedMetrics: ['HRV rMSSD', 'مراحل النوم SWS/REM', 'معدل التنفس الليلي', 'حرارة الجلد'],
    sfdaRegistrationCode: 'SFDA-MD-2025-8841',
  },
  {
    id: 'garmin-fr965',
    name: 'ساعة Garmin Forerunner 965',
    manufacturer: 'Garmin Ltd.',
    modelCode: 'FR965-ELEVATE-V4',
    sensorType: 'حساس Elevate Gen 4 + GNSS متعدد النطاقات + مقياس تأكسج نبضي',
    samplingFrequencyHz: 25,
    connected: true,
    batteryPercent: 91,
    lastSyncTime: 'اليوم · 06:20 ص',
    firmwareVersion: '20.26-AR',
    supportedMetrics: ['الحمل التدريبي الحاد/المزمن', 'VO2 Max', 'تشبع الأكسجين SpO2', 'عتبة اللاكتات'],
    sfdaRegistrationCode: 'SFDA-MD-2024-3910',
  },
  {
    id: 'polar-h10',
    name: 'حزام الصدر الطبي Polar H10 ECG',
    manufacturer: 'Polar Electro',
    modelCode: 'H10-ECG-1000HZ',
    sensorType: 'تخطيط قلب كهربائي أحادي القناة (فترات R-R بدقة 1 مللي ثانية)',
    samplingFrequencyHz: 1000,
    connected: false,
    batteryPercent: 76,
    lastSyncTime: 'أمس · 07:10 ص',
    firmwareVersion: '3.2.0',
    supportedMetrics: ['فترات R-R الخام (مللي ثانية)', 'مخطط بوانكاريه SD1/SD2', 'الاختبار الانتصابي الصباحي'],
    sfdaRegistrationCode: 'SFDA-MD-2023-1129',
  },
  {
    id: 'oura-gen4',
    name: 'خاتم Oura Ring الجيل الرابع',
    manufacturer: 'Oura Health Oy',
    modelCode: 'OR4-TITAN-IR',
    sensorType: 'أشعة تحت حمراء مزدوجة المسار + حساس حرارة NTC عالي الدقة',
    samplingFrequencyHz: 50,
    connected: false,
    batteryPercent: 68,
    lastSyncTime: 'قبل يومين · 08:00 ص',
    firmwareVersion: '2.11.4',
    supportedMetrics: ['كفاءة النوم العميق', 'انحراف الحرارة الليلية', 'معدل النبض أثناء الراحة'],
    sfdaRegistrationCode: 'SFDA-MD-2025-5092',
  },
];

export const INITIAL_BIOMETRIC_RECORDS: DailyBiometricRecord[] = [
  {
    id: 'rec-2026-10-01',
    date: '2026-10-01',
    hijriDate: '19 ربيع الآخر 1448',
    dayLabel: 'الخميس',
    recoveryScore: 84,
    recoveryStatus: 'optimal',
    hrv: {
      rmssd: 88,
      sdnn: 114,
      lnRmssd: 4.48,
      lfHfRatio: 0.92,
      baseline7DayRmssd: 85,
      deviationPercent: 3.5,
      morningPoincareSD1: 62.2,
      morningPoincareSD2: 148.5,
    },
    restingHeartRate: 45,
    respiratoryRate: 13.6,
    spo2Percent: 98,
    skinTempDelta: -0.1,
    sleep: {
      totalMinutes: 495,
      deepMinutes: 112,
      remMinutes: 118,
      lightMinutes: 245,
      awakeMinutes: 20,
      efficiencyPercent: 96,
      latencyMinutes: 11,
      bedtime: '22:15',
      wakeTime: '06:30',
    },
    acuteLoad: 640,
    chronicLoad: 625,
    acwr: 1.02,
    sessionStrain: 14.8,
    trainingSessionTitle: 'جري إيقاعي عند عتبة اللاكتات (16 كم)',
    trainingPrescription: {
      zoneRecommendation: 'المنطقة الهوائية 3–4 (عتبة اللاكتات)',
      targetHeartRateRange: '162–174 نبضة/دقيقة',
      recommendedDurationMinutes: 75,
      physiologicalRationale: 'نشاط العصب الحائر (اللاودي) مرتفع مع استشفاء عصبي عضلي مكتمل بنسبة 84%.',
      modality: 'جري طريق + تمارين إطالة حركية',
      hydrationElectrolyteNote: '750 مل محلول إلكتروليتات متوازن (صوديوم 600 ملغ/لتر).',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Garmin FR965',
  },
  {
    id: 'rec-2026-10-02',
    date: '2026-10-02',
    hijriDate: '20 ربيع الآخر 1448',
    dayLabel: 'الجمعة',
    recoveryScore: 76,
    recoveryStatus: 'optimal',
    hrv: {
      rmssd: 82,
      sdnn: 108,
      lnRmssd: 4.41,
      lfHfRatio: 1.12,
      baseline7DayRmssd: 85,
      deviationPercent: -3.5,
      morningPoincareSD1: 58.0,
      morningPoincareSD2: 140.2,
    },
    restingHeartRate: 47,
    respiratoryRate: 13.9,
    spo2Percent: 98,
    skinTempDelta: 0.0,
    sleep: {
      totalMinutes: 468,
      deepMinutes: 98,
      remMinutes: 106,
      lightMinutes: 242,
      awakeMinutes: 22,
      efficiencyPercent: 95,
      latencyMinutes: 14,
      bedtime: '22:30',
      wakeTime: '06:18',
    },
    acuteLoad: 675,
    chronicLoad: 630,
    acwr: 1.07,
    sessionStrain: 16.4,
    trainingSessionTitle: 'جري طويل متدرج السرعة (28 كم)',
    trainingPrescription: {
      zoneRecommendation: 'المنطقة الهوائية 2–3 (تحمل أساسي)',
      targetHeartRateRange: '142–158 نبضة/دقيقة',
      recommendedDurationMinutes: 120,
      physiologicalRationale: 'استقرار في تقلب النبض بعد حصة العتبة؛ الجاهزية مناسبة للحجم الهوائي الطويل.',
      modality: 'جري طويل مستمر',
      hydrationElectrolyteNote: '900 مل/ساعة مع 60 غرام كربوهيدرات لكل ساعة جري.',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Garmin FR965',
  },
  {
    id: 'rec-2026-10-03',
    date: '2026-10-03',
    hijriDate: '21 ربيع الآخر 1448',
    dayLabel: 'السبت',
    recoveryScore: 58,
    recoveryStatus: 'moderate',
    hrv: {
      rmssd: 71,
      sdnn: 94,
      lnRmssd: 4.26,
      lfHfRatio: 1.64,
      baseline7DayRmssd: 84,
      deviationPercent: -15.5,
      morningPoincareSD1: 50.2,
      morningPoincareSD2: 121.8,
    },
    restingHeartRate: 50,
    respiratoryRate: 14.4,
    spo2Percent: 97,
    skinTempDelta: 0.2,
    sleep: {
      totalMinutes: 440,
      deepMinutes: 84,
      remMinutes: 92,
      lightMinutes: 236,
      awakeMinutes: 28,
      efficiencyPercent: 91,
      latencyMinutes: 19,
      bedtime: '23:00',
      wakeTime: '06:20',
    },
    acuteLoad: 740,
    chronicLoad: 640,
    acwr: 1.16,
    sessionStrain: 10.2,
    trainingSessionTitle: 'استشفاء نشط + دراجة ثابتة منخفضة المقاومة',
    trainingPrescription: {
      zoneRecommendation: 'المنطقة 1 (استشفاء نشط وتروية دموية)',
      targetHeartRateRange: '115–130 نبضة/دقيقة',
      recommendedDurationMinutes: 45,
      physiologicalRationale: 'انخفاض متوقع في HRV عقب الجري الطويل (28 كم). يوصى بتخفيف الحمل الميكانيكي.',
      modality: 'دراجة هوائية ثابتة + جلسة تحرير لفافي',
      hydrationElectrolyteNote: 'تعويض السوائل بـ 1.5 لتر ماء مدعم بالمغنيسيوم (350 ملغ مساءً).',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Garmin FR965',
  },
  {
    id: 'rec-2026-10-04',
    date: '2026-10-04',
    hijriDate: '22 ربيع الآخر 1448',
    dayLabel: 'الأحد',
    recoveryScore: 81,
    recoveryStatus: 'optimal',
    hrv: {
      rmssd: 86,
      sdnn: 112,
      lnRmssd: 4.45,
      lfHfRatio: 0.98,
      baseline7DayRmssd: 84,
      deviationPercent: 2.4,
      morningPoincareSD1: 60.8,
      morningPoincareSD2: 145.0,
    },
    restingHeartRate: 46,
    respiratoryRate: 13.7,
    spo2Percent: 98,
    skinTempDelta: -0.1,
    sleep: {
      totalMinutes: 488,
      deepMinutes: 108,
      remMinutes: 114,
      lightMinutes: 248,
      awakeMinutes: 18,
      efficiencyPercent: 96,
      latencyMinutes: 10,
      bedtime: '22:10',
      wakeTime: '06:18',
    },
    acuteLoad: 710,
    chronicLoad: 642,
    acwr: 1.11,
    sessionStrain: 15.1,
    trainingSessionTitle: 'تكرارات السرعة القصوى (8 × 1000 متر)',
    trainingPrescription: {
      zoneRecommendation: 'المنطقة 4–5 (الحد الأقصى لاستهلاك الأكسجين VO2 Max)',
      targetHeartRateRange: '176–188 نبضة/دقيقة',
      recommendedDurationMinutes: 65,
      physiologicalRationale: 'ارتداد إيجابي سريع في مؤشر rMSSD وكفاءة نوم عميق ممتازة (108 دقائق).',
      modality: 'مضمار ألعاب القوى + تمارين تقوية أوتار العرقوب',
      hydrationElectrolyteNote: 'محلول إلكتروليتات قبل التمرين بـ 45 دقيقة + استشفاء بروتيني (30 غرام).',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Polar H10 ECG',
  },
  {
    id: 'rec-2026-10-05',
    date: '2026-10-05',
    hijriDate: '23 ربيع الآخر 1448',
    dayLabel: 'الإثنين',
    recoveryScore: 69,
    recoveryStatus: 'moderate',
    hrv: {
      rmssd: 78,
      sdnn: 103,
      lnRmssd: 4.36,
      lfHfRatio: 1.28,
      baseline7DayRmssd: 84,
      deviationPercent: -7.1,
      morningPoincareSD1: 55.1,
      morningPoincareSD2: 133.4,
    },
    restingHeartRate: 48,
    respiratoryRate: 14.1,
    spo2Percent: 98,
    skinTempDelta: 0.1,
    sleep: {
      totalMinutes: 455,
      deepMinutes: 94,
      remMinutes: 101,
      lightMinutes: 240,
      awakeMinutes: 20,
      efficiencyPercent: 94,
      latencyMinutes: 13,
      bedtime: '22:35',
      wakeTime: '06:10',
    },
    acuteLoad: 735,
    chronicLoad: 648,
    acwr: 1.13,
    sessionStrain: 13.4,
    trainingSessionTitle: 'جري هوائي مريح + تقوية عضلات الجذع والحوض',
    trainingPrescription: {
      zoneRecommendation: 'المنطقة الهوائية 2 (حفظ الكفاءة الهوائية)',
      targetHeartRateRange: '136–148 نبضة/دقيقة',
      recommendedDurationMinutes: 60,
      physiologicalRationale: 'إجهاد عصبي طفيف عقب حصة المضمار؛ يفضل تجنب الشدة اللاهوائية اليوم.',
      modality: 'جري عشبي ناعم + تمارين ثبات الحوض',
      hydrationElectrolyteNote: '600 مل سوائل متوازنة الأملاح خلال الحصة.',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Garmin FR965',
  },
  {
    id: 'rec-2026-10-06',
    date: '2026-10-06',
    hijriDate: '24 ربيع الآخر 1448',
    dayLabel: 'الثلاثاء',
    recoveryScore: 89,
    recoveryStatus: 'optimal',
    hrv: {
      rmssd: 94,
      sdnn: 122,
      lnRmssd: 4.54,
      lfHfRatio: 0.84,
      baseline7DayRmssd: 85,
      deviationPercent: 10.6,
      morningPoincareSD1: 66.5,
      morningPoincareSD2: 158.1,
    },
    restingHeartRate: 44,
    respiratoryRate: 13.4,
    spo2Percent: 99,
    skinTempDelta: -0.2,
    sleep: {
      totalMinutes: 510,
      deepMinutes: 124,
      remMinutes: 122,
      lightMinutes: 248,
      awakeMinutes: 16,
      efficiencyPercent: 97,
      latencyMinutes: 9,
      bedtime: '22:00',
      wakeTime: '06:30',
    },
    acuteLoad: 720,
    chronicLoad: 650,
    acwr: 1.11,
    sessionStrain: 16.9,
    trainingSessionTitle: 'حصة مزدوجة: فارتلك هضاب صباحاً + جري مسائي',
    trainingPrescription: {
      zoneRecommendation: 'المنطقة 3–4 (قوة هوائية وتحمل عضلي)',
      targetHeartRateRange: '158–175 نبضة/دقيقة',
      recommendedDurationMinutes: 85,
      physiologicalRationale: 'ذروة الجاهزية الفسيولوجية هذا الأسبوع؛ ارتفاع rMSSD إلى 94 مللي ثانية.',
      modality: 'جري مرتفعات (ميل 4%) + إيقاع ماراثون',
      hydrationElectrolyteNote: 'تعويض فوري للكربوهيدرات (1.2 غرام/كغ) بعد الحصة الصباحية.',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Polar H10 ECG',
  },
  {
    id: 'rec-2026-10-07',
    date: '2026-10-07',
    hijriDate: '25 ربيع الآخر 1448',
    dayLabel: 'الأربعاء',
    recoveryScore: 64,
    recoveryStatus: 'moderate',
    hrv: {
      rmssd: 75,
      sdnn: 99,
      lnRmssd: 4.32,
      lfHfRatio: 1.42,
      baseline7DayRmssd: 85,
      deviationPercent: -11.8,
      morningPoincareSD1: 53.0,
      morningPoincareSD2: 129.0,
    },
    restingHeartRate: 49,
    respiratoryRate: 14.2,
    spo2Percent: 97,
    skinTempDelta: 0.1,
    sleep: {
      totalMinutes: 448,
      deepMinutes: 89,
      remMinutes: 96,
      lightMinutes: 239,
      awakeMinutes: 24,
      efficiencyPercent: 93,
      latencyMinutes: 15,
      bedtime: '22:45',
      wakeTime: '06:13',
    },
    acuteLoad: 780,
    chronicLoad: 655,
    acwr: 1.19,
    sessionStrain: 12.6,
    trainingSessionTitle: 'جري استشفائي متوسط (12 كم)',
    trainingPrescription: {
      zoneRecommendation: 'المنطقة الهوائية 2 (إيقاع مريح)',
      targetHeartRateRange: '134–146 نبضة/دقيقة',
      recommendedDurationMinutes: 55,
      physiologicalRationale: 'تأثير الحصة المزدوجة ليوم أمس واضح على الجهاز العصبي المستقل.',
      modality: 'جري مسطح منخفض الصدمات',
      hydrationElectrolyteNote: 'شرب 500 مل ماء مع أملاح الصوديوم والبوتاسيوم.',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Garmin FR965',
  },
  {
    id: 'rec-2026-10-08',
    date: '2026-10-08',
    hijriDate: '26 ربيع الآخر 1448',
    dayLabel: 'الخميس',
    recoveryScore: 78,
    recoveryStatus: 'optimal',
    hrv: {
      rmssd: 84,
      sdnn: 110,
      lnRmssd: 4.43,
      lfHfRatio: 1.05,
      baseline7DayRmssd: 85,
      deviationPercent: -1.2,
      morningPoincareSD1: 59.4,
      morningPoincareSD2: 142.8,
    },
    restingHeartRate: 46,
    respiratoryRate: 13.8,
    spo2Percent: 98,
    skinTempDelta: 0.0,
    sleep: {
      totalMinutes: 476,
      deepMinutes: 104,
      remMinutes: 110,
      lightMinutes: 244,
      awakeMinutes: 18,
      efficiencyPercent: 95,
      latencyMinutes: 12,
      bedtime: '22:20',
      wakeTime: '06:16',
    },
    acuteLoad: 790,
    chronicLoad: 660,
    acwr: 1.20,
    sessionStrain: 15.8,
    trainingSessionTitle: 'حصة إيقاع الماراثون المستهدف (20 كم)',
    trainingPrescription: {
      zoneRecommendation: 'المنطقة الهوائية 3 (سرعة الماراثون 3:28 د/كم)',
      targetHeartRateRange: '156–168 نبضة/دقيقة',
      recommendedDurationMinutes: 72,
      physiologicalRationale: 'عودة HRV إلى النطاق المرجعي الطبيعي مع توازن مثالي بين الجهازين الودي واللاودي.',
      modality: 'جري طريق منتظم الإيقاع',
      hydrationElectrolyteNote: 'تناول جل طاقة متساوي التوتر كل 30 دقيقة مع 250 مل ماء.',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Garmin FR965',
  },
  {
    id: 'rec-2026-10-09',
    date: '2026-10-09',
    hijriDate: '27 ربيع الآخر 1448',
    dayLabel: 'الجمعة',
    recoveryScore: 52,
    recoveryStatus: 'moderate',
    hrv: {
      rmssd: 68,
      sdnn: 90,
      lnRmssd: 4.22,
      lfHfRatio: 1.82,
      baseline7DayRmssd: 84,
      deviationPercent: -19.0,
      morningPoincareSD1: 48.1,
      morningPoincareSD2: 117.2,
    },
    restingHeartRate: 51,
    respiratoryRate: 14.6,
    spo2Percent: 97,
    skinTempDelta: 0.3,
    sleep: {
      totalMinutes: 425,
      deepMinutes: 76,
      remMinutes: 88,
      lightMinutes: 231,
      awakeMinutes: 30,
      efficiencyPercent: 89,
      latencyMinutes: 22,
      bedtime: '23:15',
      wakeTime: '06:20',
    },
    acuteLoad: 855,
    chronicLoad: 668,
    acwr: 1.28,
    sessionStrain: 17.6,
    trainingSessionTitle: 'شبه محاكاة ماراثون (32 كم في أجواء دافئة)',
    trainingPrescription: {
      zoneRecommendation: 'المنطقة 2 مع مراقبة صارمة لانجراف النبض الحراري',
      targetHeartRateRange: '140–154 نبضة/دقيقة',
      recommendedDurationMinutes: 115,
      physiologicalRationale: 'انخفاض ملحوظ في النوم العميق وHRV؛ يجب عدم تجاوز سقف النبض لتفادي الإجهاد الحراري.',
      modality: 'جري طويل مع تبريد وتزود بالسوائل كل 5 كم',
      hydrationElectrolyteNote: '1000 مل/ساعة محلول إلكتروليتات عالي الصوديوم (850 ملغ/لتر).',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Garmin FR965',
  },
  {
    id: 'rec-2026-10-10',
    date: '2026-10-10',
    hijriDate: '28 ربيع الآخر 1448',
    dayLabel: 'السبت',
    recoveryScore: 38,
    recoveryStatus: 'strained',
    hrv: {
      rmssd: 56,
      sdnn: 76,
      lnRmssd: 4.03,
      lfHfRatio: 2.45,
      baseline7DayRmssd: 81,
      deviationPercent: -30.9,
      morningPoincareSD1: 39.6,
      morningPoincareSD2: 98.4,
    },
    restingHeartRate: 55,
    respiratoryRate: 15.3,
    spo2Percent: 96,
    skinTempDelta: 0.5,
    sleep: {
      totalMinutes: 402,
      deepMinutes: 64,
      remMinutes: 79,
      lightMinutes: 221,
      awakeMinutes: 38,
      efficiencyPercent: 85,
      latencyMinutes: 26,
      bedtime: '23:30',
      wakeTime: '06:12',
    },
    acuteLoad: 920,
    chronicLoad: 672,
    acwr: 1.37,
    sessionStrain: 6.4,
    trainingSessionTitle: 'راحة علاجية واستشفاء مائي بارد',
    trainingPrescription: {
      zoneRecommendation: 'راحة تامة أو مشي خفيف + غمر بالماء البارد (12°C)',
      targetHeartRateRange: 'أقل من 115 نبضة/دقيقة',
      recommendedDurationMinutes: 30,
      physiologicalRationale: 'تنبيه إجهاد عصبي عضلي: ACWR وصل إلى 1.37 مع انخفاض rMSSD بنسبة 30.9% وارتفاع حرارة الجلد +0.5°C.',
      modality: 'جلسة علاج طبيعي + غمر مائي بارد لمدة 10 دقائق',
      hydrationElectrolyteNote: 'تعويض السوائل بـ 2.5 لتر على مدار اليوم + مكمل التارت تشيري والمغنيسيوم.',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Polar H10 ECG',
    clinicalNotes: 'رصد هيمنة واضحة للجهاز العصبي الودي (LF/HF = 2.45) بعد جري 32 كم. تم تفعيل بروتوكول الوقاية من إصابات الأوتار.',
  },
  {
    id: 'rec-2026-10-11',
    date: '2026-10-11',
    hijriDate: '29 ربيع الآخر 1448',
    dayLabel: 'الأحد',
    recoveryScore: 62,
    recoveryStatus: 'moderate',
    hrv: {
      rmssd: 74,
      sdnn: 98,
      lnRmssd: 4.30,
      lfHfRatio: 1.38,
      baseline7DayRmssd: 80,
      deviationPercent: -7.5,
      morningPoincareSD1: 52.3,
      morningPoincareSD2: 127.6,
    },
    restingHeartRate: 49,
    respiratoryRate: 14.2,
    spo2Percent: 98,
    skinTempDelta: 0.1,
    sleep: {
      totalMinutes: 482,
      deepMinutes: 106,
      remMinutes: 108,
      lightMinutes: 248,
      awakeMinutes: 20,
      efficiencyPercent: 95,
      latencyMinutes: 12,
      bedtime: '22:05',
      wakeTime: '06:07',
    },
    acuteLoad: 845,
    chronicLoad: 675,
    acwr: 1.25,
    sessionStrain: 11.2,
    trainingSessionTitle: 'جري استشفائي خفيف (10 كم) + تمارين مرونة',
    trainingPrescription: {
      zoneRecommendation: 'المنطقة الهوائية 1–2 (تروية عضلية دون إجهاد)',
      targetHeartRateRange: '128–142 نبضة/دقيقة',
      recommendedDurationMinutes: 50,
      physiologicalRationale: 'تحسن ملموس بعد يوم الراحة العلاجية؛ عودة النوم العميق إلى 106 دقائق وانخفاض النبض أثناء الراحة.',
      modality: 'جري مسطح على مضمار مطاطي',
      hydrationElectrolyteNote: '500 مل ماء + إلكتروليتات خفيفة.',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Garmin FR965',
  },
  {
    id: 'rec-2026-10-12',
    date: '2026-10-12',
    hijriDate: '1 جمادى الأولى 1448',
    dayLabel: 'الإثنين',
    recoveryScore: 79,
    recoveryStatus: 'optimal',
    hrv: {
      rmssd: 85,
      sdnn: 111,
      lnRmssd: 4.44,
      lfHfRatio: 1.02,
      baseline7DayRmssd: 81,
      deviationPercent: 4.9,
      morningPoincareSD1: 60.1,
      morningPoincareSD2: 144.2,
    },
    restingHeartRate: 46,
    respiratoryRate: 13.7,
    spo2Percent: 98,
    skinTempDelta: 0.0,
    sleep: {
      totalMinutes: 492,
      deepMinutes: 114,
      remMinutes: 115,
      lightMinutes: 246,
      awakeMinutes: 17,
      efficiencyPercent: 96,
      latencyMinutes: 10,
      bedtime: '22:10',
      wakeTime: '06:22',
    },
    acuteLoad: 810,
    chronicLoad: 678,
    acwr: 1.19,
    sessionStrain: 14.5,
    trainingSessionTitle: 'جري متناوب السرعات (Fartlek 14 كم)',
    trainingPrescription: {
      zoneRecommendation: 'المنطقة الهوائية 3 (تبديل إيقاعي منضبط)',
      targetHeartRateRange: '150–166 نبضة/دقيقة',
      recommendedDurationMinutes: 65,
      physiologicalRationale: 'استعادة التوازن العصبي اللاودي وتراجع نسبة ACWR إلى المنطقة الآمنة (1.19).',
      modality: 'جري متناوب + تمارين تقوية العضلة النعلية',
      hydrationElectrolyteNote: '650 مل سوائل متوازنة الأملاح.',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Garmin FR965',
  },
  {
    id: 'rec-2026-10-13',
    date: '2026-10-13',
    hijriDate: '2 جمادى الأولى 1448',
    dayLabel: 'الثلاثاء (اليوم)',
    recoveryScore: 87,
    recoveryStatus: 'optimal',
    hrv: {
      rmssd: 92,
      sdnn: 119,
      lnRmssd: 4.52,
      lfHfRatio: 0.88,
      baseline7DayRmssd: 84,
      deviationPercent: 9.5,
      morningPoincareSD1: 65.1,
      morningPoincareSD2: 154.6,
    },
    restingHeartRate: 45,
    respiratoryRate: 13.5,
    spo2Percent: 99,
    skinTempDelta: -0.1,
    sleep: {
      totalMinutes: 504,
      deepMinutes: 119,
      remMinutes: 121,
      lightMinutes: 248,
      awakeMinutes: 16,
      efficiencyPercent: 97,
      latencyMinutes: 9,
      bedtime: '22:00',
      wakeTime: '06:24',
    },
    acuteLoad: 795,
    chronicLoad: 682,
    acwr: 1.17,
    sessionStrain: 15.9,
    trainingSessionTitle: 'وحدات عتبة اللاكتات الموجهة (4 × 3 كم)',
    trainingPrescription: {
      zoneRecommendation: 'المنطقة 4 (عتبة اللاكتات الهوائية-اللاهوائية)',
      targetHeartRateRange: '166–176 نبضة/دقيقة',
      recommendedDurationMinutes: 80,
      physiologicalRationale: 'ارتفاع تقلب معدل ضربات القلب (rMSSD = 92 ms، بزيادة +9.5% عن خط الأساس) مع كفاءة نوم 97% يؤكد جاهزية الجهاز القلبي الوعائي لاستيعاب حمل عالي الشدة.',
      modality: 'إحماء 3 كم + 4×3000م عند إيقاع 3:14 د/كم (استراحة 90 ثانية) + تهدئة 2 كم',
      hydrationElectrolyteNote: '800 مل محلول إلكتروليتات (صوديوم 700 ملغ/لتر) + 45 غرام كربوهيدرات سريعة الامتصاص.',
    },
    sourceDevice: 'سوار WHOOP 4.0 + Garmin FR965',
    clinicalNotes: 'الفحص الصباحي يظهر استقراراً ممتازاً في فترة R-R ونشاطاً عالياً للعصب الحائر مع غياب أي مؤشرات التهابية أو حرارية.',
  },
];

export function computeNewBiometricEntry(params: {
  rmssd: number;
  restingHeartRate: number;
  deepSleepMinutes: number;
  remSleepMinutes: number;
  totalSleepMinutes: number;
  acuteLoad: number;
  chronicLoad: number;
  skinTempDelta: number;
  sourceDevice: string;
  baselineRmssd: number;
}): DailyBiometricRecord {
  const {
    rmssd,
    restingHeartRate,
    deepSleepMinutes,
    remSleepMinutes,
    totalSleepMinutes,
    acuteLoad,
    chronicLoad,
    skinTempDelta,
    sourceDevice,
    baselineRmssd,
  } = params;

  const deviationPercent = Number((((rmssd - baselineRmssd) / baselineRmssd) * 100).toFixed(1));
  const lnRmssd = Number(Math.log(Math.max(rmssd, 10)).toFixed(2));
  const sdnn = Math.round(rmssd * 1.29);
  const acwr = Number((acuteLoad / Math.max(chronicLoad, 1)).toFixed(2));

  // Compute Recovery Score based on HRV vs baseline, RHR, Sleep architecture, and Skin Temp
  const hrvComponent = Math.min(100, Math.max(20, 75 + deviationPercent * 1.6));
  const rhrDelta = 46 - restingHeartRate;
  const rhrComponent = Math.min(100, Math.max(20, 80 + rhrDelta * 4.5));
  const sleepTargetRatio = Math.min(1.08, totalSleepMinutes / 480);
  const deepRemRatio = (deepSleepMinutes + remSleepMinutes) / Math.max(totalSleepMinutes, 1);
  const sleepComponent = Math.min(100, Math.round(sleepTargetRatio * 65 + deepRemRatio * 75));
  const tempPenalty = Math.abs(skinTempDelta) > 0.3 ? (Math.abs(skinTempDelta) - 0.3) * 22 : 0;

  const rawRecovery = Math.round(
    hrvComponent * 0.45 + rhrComponent * 0.2 + sleepComponent * 0.35 - tempPenalty
  );
  const recoveryScore = Math.max(12, Math.min(99, rawRecovery));

  let recoveryStatus: RecoveryStatus = 'optimal';
  if (recoveryScore < 48 || acwr > 1.35) {
    recoveryStatus = 'strained';
  } else if (recoveryScore < 70 || acwr > 1.25) {
    recoveryStatus = 'moderate';
  }

  const lfHfRatio = Number(
    Math.max(0.65, Math.min(3.1, 2.2 - (recoveryScore / 100) * 1.5)).toFixed(2)
  );
  const awakeMinutes = Math.max(
    10,
    Math.round(54 - (deepSleepMinutes / 150) * 34 + Math.max(0, (52 - restingHeartRate) * -0.4))
  );
  const lightMinutes = Math.max(
    110,
    totalSleepMinutes - deepSleepMinutes - remSleepMinutes - awakeMinutes
  );
  const normalizedTotalSleep = deepSleepMinutes + remSleepMinutes + lightMinutes + awakeMinutes;
  const efficiencyPercent = Math.min(
    99,
    Math.max(
      72,
      Math.round(
        ((normalizedTotalSleep - awakeMinutes) / normalizedTotalSleep) * 70 +
          Math.min(29, ((deepSleepMinutes + remSleepMinutes) / normalizedTotalSleep) * 58)
      )
    )
  );

  let trainingPrescription = {
    zoneRecommendation: 'المنطقة 4 (عتبة اللاكتات وتطوير الكفاءة الهوائية القصوى)',
    targetHeartRateRange: '165–176 نبضة/دقيقة',
    recommendedDurationMinutes: 80,
    physiologicalRationale: `مؤشر تقلب النبض (${rmssd} مللي ثانية) ونسبة الحمل الحاد للمزمن (${acwr}) في النطاق الفسيولوجي الأمثل لاستيعاب حصة عالية الشدة.`,
    modality: 'تكرارات عتبة اللاكتات + تمارين القوة الانفجارية',
    hydrationElectrolyteNote: '800 مل محلول إلكتروليتات متوازن (صوديوم 700 ملغ/لتر).',
  };

  let trainingSessionTitle = 'حصة عتبة اللاكتات الموجهة (4 × 3 كم)';
  let sessionStrain = 15.8;

  if (recoveryStatus === 'moderate') {
    trainingSessionTitle = 'جري هوائي منتظم (المنطقة 2) + ثبات حركي';
    sessionStrain = 12.2;
    trainingPrescription = {
      zoneRecommendation: 'المنطقة الهوائية 2 (حفظ القاعدة الهوائية دون إجهاد عصبي)',
      targetHeartRateRange: '135–148 نبضة/دقيقة',
      recommendedDurationMinutes: 55,
      physiologicalRationale: `سجل مؤشر الاستشفاء ${recoveryScore}% مع rMSSD بقدر ${rmssd} مللي ثانية؛ يوصى بتجنب الشدة اللاهوائية اليوم لحماية الجهاز العصبي المستقل.`,
      modality: 'جري هوائي مريح على أرضية منخفضة الصدمات + إطالة حركية',
      hydrationElectrolyteNote: '600 مل سوائل مدعمة بالمغنيسيوم والبوتاسيوم.',
    };
  } else if (recoveryStatus === 'strained') {
    trainingSessionTitle = 'بروتوكول استشفاء علاجي وتفريغ الحمل الميكانيكي';
    sessionStrain = 6.0;
    trainingPrescription = {
      zoneRecommendation: 'المنطقة 1 (استشفاء سلبي أو نشط خفيف جداً)',
      targetHeartRateRange: 'أقل من 120 نبضة/دقيقة',
      recommendedDurationMinutes: 35,
      physiologicalRationale: `رصد إجهاد فسيولوجي مرتفع (الاستشفاء ${recoveryScore}%، نسبة الحمل ACWR = ${acwr}). يجب خفض الحمل فوراً لمنع الإجهاد المفرط وإصابات الأنسجة الرخوة.`,
      modality: 'سباحة استشفائية أو جلسة علاج طبيعي + غمر بالماء البارد',
      hydrationElectrolyteNote: 'تعويض مكثف للسوائل (2.5 لتر يومياً) مع مراقبة نبض الراحة المسائي.',
    };
  }

  return {
    id: `rec-live-${Date.now()}`,
    date: '2026-10-13',
    hijriDate: '2 جمادى الأولى 1448',
    dayLabel: 'الثلاثاء (تحديث مباشر)',
    recoveryScore,
    recoveryStatus,
    hrv: {
      rmssd,
      sdnn,
      lnRmssd,
      lfHfRatio,
      baseline7DayRmssd: baselineRmssd,
      deviationPercent,
      morningPoincareSD1: Number((rmssd * 0.707).toFixed(1)),
      morningPoincareSD2: Number((sdnn * 1.3).toFixed(1)),
    },
    restingHeartRate,
    respiratoryRate: Number((13.4 + (50 - recoveryScore) * 0.025).toFixed(1)),
    spo2Percent: recoveryScore >= 70 ? 99 : 97,
    skinTempDelta,
    sleep: {
      totalMinutes: normalizedTotalSleep,
      deepMinutes: deepSleepMinutes,
      remMinutes: remSleepMinutes,
      lightMinutes,
      awakeMinutes,
      efficiencyPercent,
      latencyMinutes: recoveryScore >= 75 ? 9 : 18,
      bedtime: '22:05',
      wakeTime: '06:25',
    },
    acuteLoad,
    chronicLoad,
    acwr,
    sessionStrain,
    trainingSessionTitle,
    trainingPrescription,
    sourceDevice,
    clinicalNotes: `تم تحديث القياسات الحيوية عبر (${sourceDevice}). حالة التوازن العصبي المستقل: ${
      recoveryStatus === 'optimal'
        ? 'سيادة لاودية مثالية'
        : recoveryStatus === 'moderate'
        ? 'توازن انتقالي متوسط'
        : 'هيمنة ودية تستدعي التفريغ التدريبي'
    }.`,
  };
}

export function evaluateInjuryPreventionAlerts(
  current: DailyBiometricRecord,
  history: DailyBiometricRecord[]
): InjuryPreventionAlert[] {
  const alerts: InjuryPreventionAlert[] = [];

  // 1. Check ACWR (Acute:Chronic Workload Ratio)
  if (current.acwr >= 1.3) {
    alerts.push({
      id: 'alert-acwr-high',
      severity: 'high',
      title: 'ارتفاع حرج في نسبة الحمل التدريبي الحاد إلى المزمن (ACWR)',
      anatomicalOrSystemicTarget: 'الأوتار الحاملة للوزن (وتر العرقوب واللفافة الأخمصية)',
      metricTrigger: 'نسبة الحمل الحاد/المزمن (ACWR)',
      currentValue: `${current.acwr} (الحمل الحاد ${current.acuteLoad} AU)`,
      clinicalThreshold: 'النطاق الآمن: 0.80 – 1.30',
      physiologicalMechanism:
        'تجاوز الحمل التدريبي لآخر 7 أيام قدرة التكيف البنيوي للأوتار المكتسبة خلال 28 يوماً، مما يرفع احتمالية الاعتلال الوتري المجهري.',
      correctiveProtocol:
        'تخفيض حجم الجري بنسبة 35% لمدة 72 ساعة، واستبدال الجري السريع بتمارين التحميل المتساوي الطول (Isometric Calf Holds 5×45s).',
      loincCode: 'LOINC-93832-ACWR',
    });
  } else {
    alerts.push({
      id: 'alert-acwr-nominal',
      severity: 'low',
      title: 'استقرار نسبة الحمل التدريبي الحاد إلى المزمن ضمن النطاق الآمن',
      anatomicalOrSystemicTarget: 'الجهاز العضلي الهيكلي والمفاصل السفلية',
      metricTrigger: 'نسبة الحمل الحاد/المزمن (ACWR)',
      currentValue: `${current.acwr} (${current.acuteLoad} / ${current.chronicLoad} AU)`,
      clinicalThreshold: 'النطاق الآمن: 0.80 – 1.30',
      physiologicalMechanism:
        'تدرج الحمل التدريبي متوافق مع وتيرة التكيف الميكانيكي للأنسجة الضامة والعضلات الهيكلية.',
      correctiveProtocol:
        'الاستمرار في التدرج الأسبوعي بنسبة لا تتجاوز 8–10% في المسافة الكلية مع الحفاظ على تمارين القوة الوقائية.',
      loincCode: 'LOINC-93832-ACWR',
    });
  }

  // 2. Check HRV Autonomic Suppression
  if (current.hrv.deviationPercent <= -15 || current.hrv.lfHfRatio >= 1.8) {
    alerts.push({
      id: 'alert-autonomic-strain',
      severity: 'high',
      title: 'تثبيط في نشاط العصب الحائر وهيمنة الجهاز العصبي الودي',
      anatomicalOrSystemicTarget: 'الجهاز العصبي المستقل والقلب والأوعية الدموية',
      metricTrigger: 'انحراف HRV rMSSD + نسبة LF/HF',
      currentValue: `${current.hrv.rmssd} ms (${current.hrv.deviationPercent}%) · LF/HF ${current.hrv.lfHfRatio}`,
      clinicalThreshold: 'الانحراف المسموح: > -12% عن خط الأساس',
      physiologicalMechanism:
        'تراجع الجذر التربيعي لمتوسط مربعات الفروق المتتالية لفترات النبض يشير إلى تأخر الاستشفاء العصبي وارتفاع الكورتيزول الليلي.',
      correctiveProtocol:
        'إلغاء الحصص اللاهوائية (المنطقة 4 و5)، تطبيق جلسة تنفس رنيني (5.5 نفس/دقيقة لمدة 15 دقيقة قبل النوم)، وتمديد فترة النوم الليلي.',
      loincCode: 'LOINC-80404-7',
    });
  } else {
    alerts.push({
      id: 'alert-autonomic-optimal',
      severity: 'low',
      title: 'كفاءة عالية في الاستشفاء العصبي اللاودي (العصب الحائر)',
      anatomicalOrSystemicTarget: 'التنظيم العصبي القلبي (Autonomic Nervous System)',
      metricTrigger: 'مؤشر HRV rMSSD الصباحي',
      currentValue: `${current.hrv.rmssd} ms (${current.hrv.deviationPercent >= 0 ? '+' : ''}${current.hrv.deviationPercent}%)`,
      clinicalThreshold: `خط الأساس الفردي: ${current.hrv.baseline7DayRmssd} ms`,
      physiologicalMechanism:
        'انتظام التباين الزمني بين نبضات القلب يؤكد كفاءة الاستشفاء العصبي المركزي والقدرة على تحمل إجهاد تدريبي مرتفع.',
      correctiveProtocol:
        'مسموح بتنفيذ وحدات السرعة وعتبة اللاكتات المجدولة مع مراقبة معدل استعادة النبض خلال أول دقيقتين بعد التمرين (HRR2).',
      loincCode: 'LOINC-80404-7',
    });
  }

  // 3. Check Deep Sleep & Thermoregulation
  const recentStrainedDay = history.find((d) => d.acwr >= 1.35 || d.recoveryScore < 45);
  if (current.sleep.deepMinutes < 85 || current.skinTempDelta >= 0.35) {
    alerts.push({
      id: 'alert-sleep-thermo',
      severity: 'moderate',
      title: 'عجز في نوم الموجات البطيئة (SWS) أو انحراف حراري ليلي',
      anatomicalOrSystemicTarget: 'إفراز هرمون النمو البنائي وإصلاح الألياف العضلية الدقيقة',
      metricTrigger: 'النوم العميق + انحراف حرارة الجلد',
      currentValue: `${current.sleep.deepMinutes} دقيقة نوم عميق · حرارة ${current.skinTempDelta > 0 ? '+' : ''}${current.skinTempDelta}°C`,
      clinicalThreshold: 'النوم العميق ≥ 90 دقيقة · الحرارة ±0.2°C',
      physiologicalMechanism:
        'نقص مرحلة الموجات البطيئة يحد من ترميم التمزقات المجهرية في الألياف العضلية بعد الجري الطويل.',
      correctiveProtocol:
        'تبريد غرفة النوم إلى 19°C، إيقاف تناول الكافيين قبل النوم بـ 8 ساعات، وتجنب الوجبات الثقيلة قبل النوم بساعتين.',
      loincCode: 'LOINC-93832-4',
    });
  } else if (recentStrainedDay) {
    alerts.push({
      id: 'alert-post-overload-watch',
      severity: 'moderate',
      title: 'مراقبة ما بعد الذروة التدريبية (سجل إجهاد مرتفع خلال الأسبوع)',
      anatomicalOrSystemicTarget: 'العضلة التوأمية الساقية والعضلة النعلية (Soleus)',
      metricTrigger: 'تتبع الأثر المتبقي لذروة الحمل في 10 أكتوبر',
      currentValue: `تعافٍ حالي ${current.recoveryScore}% بعد هبوط سابق إلى ${recentStrainedDay.recoveryScore}%`,
      clinicalThreshold: 'استقرار لـ 3 أيام متتالية فوق 75%',
      physiologicalMechanism:
        'رغم تعافي المؤشرات العصبية اليوم، فإن إعادة بناء الكولاجين في الأوتار يستغرق 48–72 ساعة إضافية بعد ذروة الحجم التدريبي.',
      correctiveProtocol:
        'إجراء إحماء تدريجي مطول (20 دقيقة) قبل الدخول في سرعة العتبة اليوم، مع فحص تيبس وتر العرقوب الصباحي.',
      loincCode: 'LOINC-8867-4',
    });
  }

  return alerts;
}

export function generateFHIRMedicalBundle(
  profile: AthleteClinicalProfile,
  records: DailyBiometricRecord[],
  physicianNotes: string
): string {
  const latest = records[records.length - 1];
  const bundle = {
    resourceType: 'Bundle',
    id: `misbar-fhir-bundle-${latest.date}`,
    meta: {
      lastUpdated: new Date().toISOString(),
      profile: [
        'http://nphies.sa/fhir/StructureDefinition/bundle-clinical-vital-signs',
        'http://hl7.org/fhir/StructureDefinition/Bundle',
      ],
      security: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality',
          code: 'R',
          display: 'Restricted Clinical Sports Medicine Telemetry (CBAHI / SFDA Compliant)',
        },
      ],
    },
    type: 'collection',
    timestamp: new Date().toISOString(),
    subject: {
      fullName: profile.fullName,
      athleteId: profile.athleteId,
      medicalRecordNumber: profile.medicalRecordNumber,
      supervisingPhysician: profile.supervisingPhysician,
      medicalCenter: profile.medicalCenter,
      complianceStandard: profile.nationalHealthAuthority,
    },
    clinicalReviewNotes: physicianNotes,
    entry: records.slice(-7).map((rec) => ({
      fullUrl: `urn:uuid:${rec.id}`,
      resource: {
        resourceType: 'Observation',
        id: rec.id,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs & Autonomic Telemetry',
              },
            ],
          },
        ],
        effectiveDateTime: `${rec.date}T06:30:00+03:00`,
        device: {
          display: rec.sourceDevice,
        },
        component: [
          {
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '80404-7',
                  display: 'R-R interval.standard deviation (HRV rMSSD / SDNN)',
                },
              ],
            },
            valueQuantity: {
              value: rec.hrv.rmssd,
              unit: 'ms',
              system: 'http://unitsofmeasure.org',
              code: 'ms',
            },
          },
          {
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '8867-4',
                  display: 'Heart rate — Resting morning',
                },
              ],
            },
            valueQuantity: {
              value: rec.restingHeartRate,
              unit: '/min',
              system: 'http://unitsofmeasure.org',
              code: '/min',
            },
          },
          {
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '93832-4',
                  display: 'Sleep duration & efficiency',
                },
              ],
            },
            valueQuantity: {
              value: Number((rec.sleep.totalMinutes / 60).toFixed(2)),
              unit: 'h',
              system: 'http://unitsofmeasure.org',
              code: 'h',
            },
          },
          {
            code: {
              coding: [
                {
                  system: 'http://nphies.sa/terminology/CodeSystem/sports-medicine',
                  code: 'ACWR-RATIO',
                  display: 'Acute to Chronic Workload Ratio',
                },
              ],
            },
            valueQuantity: {
              value: rec.acwr,
              unit: 'ratio',
            },
          },
        ],
      },
    })),
  };

  return JSON.stringify(bundle, null, 2);
}

export function generateClinicalCSV(records: DailyBiometricRecord[]): string {
  const headers = [
    'التاريخ الميلادي',
    'التاريخ الهجري',
    'مؤشر الاستشفاء (%)',
    'حالة الجاهزية',
    'HRV rMSSD (ms)',
    'HRV SDNN (ms)',
    'نسبة التوازن العصبي LF/HF',
    'نبض الراحة (bpm)',
    'معدل التنفس (نفس/د)',
    'تشبع الأكسجين SpO2 (%)',
    'إجمالي النوم (دقيقة)',
    'النوم العميق SWS (دقيقة)',
    'حركة العين السريعة REM (دقيقة)',
    'كفاءة النوم (%)',
    'الحمل الحاد (AU)',
    'الحمل المزمن (AU)',
    'نسبة ACWR',
    'الجهاز المصدر',
  ];

  const rows = records.map((r) => [
    r.date,
    r.hijriDate,
    r.recoveryScore,
    r.recoveryStatus === 'optimal' ? 'مثالي' : r.recoveryStatus === 'moderate' ? 'متوسط' : 'مجهد',
    r.hrv.rmssd,
    r.hrv.sdnn,
    r.hrv.lfHfRatio,
    r.restingHeartRate,
    r.respiratoryRate,
    r.spo2Percent,
    r.sleep.totalMinutes,
    r.sleep.deepMinutes,
    r.sleep.remMinutes,
    r.sleep.efficiencyPercent,
    r.acuteLoad,
    r.chronicLoad,
    r.acwr,
    `"${r.sourceDevice}"`,
  ]);

  return '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
