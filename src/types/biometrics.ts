export type RecoveryStatus = 'optimal' | 'moderate' | 'strained';

export interface SleepArchitecture {
  totalMinutes: number;
  deepMinutes: number; // نوم الموجات البطيئة (SWS)
  remMinutes: number; // حركة العين السريعة (REM)
  lightMinutes: number; // نوم خفيف
  awakeMinutes: number; // فترات اليقظة الليلية
  efficiencyPercent: number; // كفاءة النوم %
  latencyMinutes: number; // كمون النوم بالدقائق
  bedtime: string; // وقت النوم (مثال: 22:45)
  wakeTime: string; // وقت الاستيقاظ (مثال: 06:15)
}

export interface HRVMetrics {
  rmssd: number; // الجذر التربيعي لمتوسط مربعات الفروق المتتالية (ms)
  sdnn: number; // الانحراف المعياري لفترات النبض (ms)
  lnRmssd: number; // اللوغاريتم الطبيعي لـ rMSSD
  lfHfRatio: number; // نسبة التوازن الودي / اللاودي (LF/HF)
  baseline7DayRmssd: number; // خط الأساس لآخر 7 أيام (ms)
  deviationPercent: number; // نسبة الانحراف عن خط الأساس %
  morningPoincareSD1: number; // التشتت قصير المدى (ms)
  morningPoincareSD2: number; // التشتت طويل المدى (ms)
}

export interface DailyBiometricRecord {
  id: string;
  date: string; // YYYY-MM-DD
  hijriDate: string; // التاريخ الهجري الموافق
  dayLabel: string; // اسم اليوم بالعربية
  recoveryScore: number; // 0 - 100
  recoveryStatus: RecoveryStatus;
  hrv: HRVMetrics;
  restingHeartRate: number; // bpm
  respiratoryRate: number; // نفس / دقيقة
  spo2Percent: number; // تشبع الأكسجين %
  skinTempDelta: number; // تغير حرارة الجلد الليلية °C
  sleep: SleepArchitecture;
  acuteLoad: number; // الحمل التدريبي الحاد (7 أيام) AU
  chronicLoad: number; // الحمل التدريبي المزمن (28 يوماً) AU
  acwr: number; // نسبة الحمل الحاد إلى المزمن (ACWR)
  sessionStrain: number; // إجهاد الحصة التدريبية (0 - 21)
  trainingSessionTitle: string;
  trainingPrescription: {
    zoneRecommendation: string;
    targetHeartRateRange: string;
    recommendedDurationMinutes: number;
    physiologicalRationale: string;
    modality: string;
    hydrationElectrolyteNote: string;
  };
  sourceDevice: string;
  clinicalNotes?: string;
}

export interface WearableDevice {
  id: string;
  name: string;
  manufacturer: string;
  modelCode: string;
  sensorType: string;
  samplingFrequencyHz: number;
  connected: boolean;
  batteryPercent: number;
  lastSyncTime: string;
  firmwareVersion: string;
  supportedMetrics: string[];
  sfdaRegistrationCode: string; // رمز القيد في الهيئة العامة للغذاء والدواء / الاعتماد الطبي
}

export interface InjuryPreventionAlert {
  id: string;
  severity: 'high' | 'moderate' | 'low';
  title: string;
  anatomicalOrSystemicTarget: string;
  metricTrigger: string;
  currentValue: string;
  clinicalThreshold: string;
  physiologicalMechanism: string;
  correctiveProtocol: string;
  loincCode: string;
}

export interface AthleteClinicalProfile {
  fullName: string;
  athleteId: string;
  medicalRecordNumber: string; // رقم الملف الطبي الموحد
  nationalHealthAuthority: string; // الجهة الصحية المعتمدة
  sportDiscipline: string;
  age: number;
  weightKg: number;
  heightCm: number;
  vo2Max: number;
  maxHeartRate: number;
  restingHrBaseline: number;
  hrvBaselineRmssd: number;
  supervisingPhysician: string;
  medicalCenter: string;
  bloodGroup: string;
}
