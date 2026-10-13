import React, { useMemo, useState } from 'react';
import {
  BatteryCharging,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  Printer,
  Radio,
  RefreshCw,
  RotateCcw,
  Sliders,
  Upload,
  Watch,
} from 'lucide-react';
import {
  ATHLETE_PROFILE,
  computeNewBiometricEntry,
  evaluateInjuryPreventionAlerts,
  generateClinicalCSV,
  generateFHIRMedicalBundle,
  INITIAL_BIOMETRIC_RECORDS,
  INITIAL_WEARABLE_DEVICES,
} from './data/biometricEngine';
import { DailyBiometricRecord, RecoveryStatus, WearableDevice } from './types/biometrics';
import {
  ACWRWorkloadChart,
  AnatomicalRecoveryMap,
  BiometricGaugeRing,
  HRVTrendChart,
  MuscleHydrationElectrolyteSection,
  NightlySleepHypnogram,
  OverviewAdvisoryCharts,
  PoincareAutonomicPlot,
  SleepDonutBreakdown,
  SleepStackedBarChart,
  SpiderRadarChart,
} from './components/BiometricCharts';
import {
  GirihHeaderBorder,
  IslamicChartCard,
  IslamicPatternDefs,
} from './components/IslamicPatterns';

type ActiveSection = 'overview' | 'injury' | 'hrv-sleep' | 'devices' | 'medical-export';

const NAV_TABS: Array<{
  id: ActiveSection;
  label: string;
}> = [
  { id: 'overview', label: 'لوحة الصحة الشاملة' },
  { id: 'injury', label: 'خريطة العضلات والوقاية' },
  { id: 'hrv-sleep', label: 'رادار HRV وتحليل النوم' },
  { id: 'devices', label: 'الأجهزة المتصلة' },
  { id: 'medical-export', label: 'التقرير الطبي المعتمد' },
];

export default function App() {
  const [records, setRecords] = useState<DailyBiometricRecord[]>(INITIAL_BIOMETRIC_RECORDS);
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    INITIAL_BIOMETRIC_RECORDS[INITIAL_BIOMETRIC_RECORDS.length - 1].id
  );
  const [devices, setDevices] = useState<WearableDevice[]>(INITIAL_WEARABLE_DEVICES);
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [hrvSleepSubTab, setHrvSleepSubTab] = useState<'all' | 'hrv-focus' | 'sleep-focus'>('all');

  // Dashboard Filters
  const [timeWindowDays, setTimeWindowDays] = useState<7 | 14>(14);
  const [statusFilter, setStatusFilter] = useState<'all' | RecoveryStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Biometric Sliders in Aside Panel
  const [inputRmssd, setInputRmssd] = useState<number>(92);
  const [inputRhr, setInputRhr] = useState<number>(45);
  const [inputDeepSleep, setInputDeepSleep] = useState<number>(119);
  const [inputRemSleep, setInputRemSleep] = useState<number>(121);
  const [inputTotalSleep, setInputTotalSleep] = useState<number>(504);
  const [inputAcuteLoad, setInputAcuteLoad] = useState<number>(795);
  const [inputSkinTemp, setInputSkinTemp] = useState<number>(-0.1);

  // Medical Export Notes
  const [physicianNotes, setPhysicianNotes] = useState<string>(
    'تمت مراجعة تخطيط تقلب النبض الصباحي (HRV rMSSD) وخريطة الاستشفاء العضلي ومخطط العنكبوت الفسيولوجي لآخر 14 يوماً. الاستجابة اللاودية ممتازة ولا توجد موانع فسيولوجية أو قلبية للمشاركة في حصص عتبة اللاكتات المجدولة.'
  );
  const [exportFormatPreview, setExportFormatPreview] = useState<'fhir' | 'csv'>('fhir');
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setExportNotification(msg);
    setTimeout(() => setExportNotification(null), 3800);
  };

  const handleSwitchTab = (tabId: ActiveSection) => {
    setActiveSection(tabId);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const slicedRecords = useMemo(() => {
    return records.slice(-timeWindowDays);
  }, [records, timeWindowDays]);

  const selectedRecord = useMemo(() => {
    return (
      slicedRecords.find((r) => r.id === selectedRecordId) ||
      records.find((r) => r.id === selectedRecordId) ||
      records[records.length - 1]
    );
  }, [records, slicedRecords, selectedRecordId]);

  const injuryAlerts = useMemo(() => {
    return evaluateInjuryPreventionAlerts(selectedRecord, records);
  }, [selectedRecord, records]);

  const filteredTableRecords = useMemo(() => {
    return [...slicedRecords]
      .reverse()
      .filter((r) => (statusFilter === 'all' ? true : r.recoveryStatus === statusFilter))
      .filter((r) =>
        searchQuery.trim() === ''
          ? true
          : r.trainingSessionTitle.includes(searchQuery) ||
            r.date.includes(searchQuery) ||
            r.hijriDate.includes(searchQuery) ||
            r.sourceDevice.includes(searchQuery)
      );
  }, [slicedRecords, statusFilter, searchQuery]);

  const handleSelectRecord = (id: string) => {
    setSelectedRecordId(id);
    const found = records.find((r) => r.id === id);
    if (found) {
      setInputRmssd(found.hrv.rmssd);
      setInputRhr(found.restingHeartRate);
      setInputDeepSleep(found.sleep.deepMinutes);
      setInputRemSleep(found.sleep.remMinutes);
      setInputTotalSleep(found.sleep.totalMinutes);
      setInputAcuteLoad(found.acuteLoad);
      setInputSkinTemp(found.skinTempDelta);
    }
  };

  const handleTimeWindowChange = (days: 7 | 14) => {
    setTimeWindowDays(days);
    const nextSlice = records.slice(-days);
    if (!nextSlice.some((r) => r.id === selectedRecordId)) {
      const latest = nextSlice[nextSlice.length - 1];
      if (latest) {
        handleSelectRecord(latest.id);
      }
    }
  };

  const applyBiometricValues = (
    params: {
      rmssd: number;
      rhr: number;
      deepSleep: number;
      remSleep: number;
      totalSleep: number;
      acuteLoad: number;
      skinTemp: number;
      sourceLabel: string;
    },
    silent = false
  ) => {
    setInputRmssd(params.rmssd);
    setInputRhr(params.rhr);
    setInputDeepSleep(params.deepSleep);
    setInputRemSleep(params.remSleep);
    setInputTotalSleep(params.totalSleep);
    setInputAcuteLoad(params.acuteLoad);
    setInputSkinTemp(params.skinTemp);

    const computed = computeNewBiometricEntry({
      rmssd: params.rmssd,
      restingHeartRate: params.rhr,
      deepSleepMinutes: params.deepSleep,
      remSleepMinutes: params.remSleep,
      totalSleepMinutes: params.totalSleep,
      acuteLoad: params.acuteLoad,
      chronicLoad: selectedRecord.chronicLoad || 682,
      skinTempDelta: params.skinTemp,
      sourceDevice: params.sourceLabel,
      baselineRmssd: ATHLETE_PROFILE.hrvBaselineRmssd,
    });

    // Preserve the currently selected record's ID and dates so selection never desyncs
    const updatedRecord: DailyBiometricRecord = {
      ...computed,
      id: selectedRecord.id,
      date: selectedRecord.date,
      hijriDate: selectedRecord.hijriDate,
      dayLabel: selectedRecord.dayLabel,
    };

    setRecords((prev) =>
      prev.map((rec) => (rec.id === selectedRecord.id ? updatedRecord : rec))
    );

    if (!silent) {
      showToast(`تم تحديث قراءات (${selectedRecord.date}) وخريطة الاستشفاء العضلي والمؤشرات.`);
    }
  };

  const handleSliderChange = (
    field: 'rmssd' | 'rhr' | 'deepSleep' | 'acuteLoad',
    val: number
  ) => {
    const nextParams = {
      rmssd: field === 'rmssd' ? val : inputRmssd,
      rhr: field === 'rhr' ? val : inputRhr,
      deepSleep: field === 'deepSleep' ? val : inputDeepSleep,
      remSleep: inputRemSleep,
      totalSleep: inputTotalSleep,
      acuteLoad: field === 'acuteLoad' ? val : inputAcuteLoad,
      skinTemp: inputSkinTemp,
      sourceLabel: 'معايرة فورية مباشرة',
    };
    applyBiometricValues(nextParams, true);
  };

  const handleResetRecords = () => {
    setRecords(INITIAL_BIOMETRIC_RECORDS);
    const latest = INITIAL_BIOMETRIC_RECORDS[INITIAL_BIOMETRIC_RECORDS.length - 1];
    setSelectedRecordId(latest.id);
    setInputRmssd(latest.hrv.rmssd);
    setInputRhr(latest.restingHeartRate);
    setInputDeepSleep(latest.sleep.deepMinutes);
    setInputRemSleep(latest.sleep.remMinutes);
    setInputTotalSleep(latest.sleep.totalMinutes);
    setInputAcuteLoad(latest.acuteLoad);
    setInputSkinTemp(latest.skinTempDelta);
    setStatusFilter('all');
    setSearchQuery('');
    showToast('تمت استعادة السجلات الفسيولوجية الأصلية لآخر 14 يوماً.');
  };

  const handleSyncDevice = (device: WearableDevice) => {
    setSyncingDeviceId(device.id);
    setTimeout(() => {
      const jitterRmssd =
        device.id === 'polar-h10' ? 95 : device.id === 'whoop-4' ? 92 : 89;
      const jitterRhr = device.id === 'polar-h10' ? 44 : 45;
      const deepMins = device.id === 'oura-gen4' ? 126 : 122;
      const remMins = 120;
      const totalMins = 508;
      const acute = 785;

      applyBiometricValues(
        {
          rmssd: jitterRmssd,
          rhr: jitterRhr,
          deepSleep: deepMins,
          remSleep: remMins,
          totalSleep: totalMins,
          acuteLoad: acute,
          skinTemp: -0.1,
          sourceLabel: device.name,
        },
        true
      );

      setDevices((prev) =>
        prev.map((d) =>
          d.id === device.id
            ? {
                ...d,
                connected: true,
                lastSyncTime: 'الآن · متزامن',
              }
            : d
        )
      );
      setSyncingDeviceId(null);
      showToast(`تمت مزامنة القياسات الحيوية بنجاح من ${device.name}`);
    }, 350);
  };

  const handleToggleDeviceConnection = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              connected: !d.connected,
              lastSyncTime: !d.connected ? 'الآن · متصل' : 'تم فصل الاتصال مؤقتاً',
            }
          : d
      )
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        applyBiometricValues(
          {
            rmssd: Number(parsed.rmssd || 90),
            rhr: Number(parsed.rhr || 45),
            deepSleep: Number(parsed.deepSleepMinutes || 116),
            remSleep: Number(parsed.remSleepMinutes || 118),
            totalSleep: Number(parsed.totalSleepMinutes || 498),
            acuteLoad: Number(parsed.acuteLoad || 770),
            skinTemp: 0.0,
            sourceLabel: `ملف مستورد (${file.name})`,
          },
          true
        );
      } catch {
        applyBiometricValues(
          {
            rmssd: 91,
            rhr: 45,
            deepSleep: 118,
            remSleep: 116,
            totalSleep: 500,
            acuteLoad: 775,
            skinTemp: -0.1,
            sourceLabel: `ملف مستورد (${file.name})`,
          },
          true
        );
      }
      showToast(`تم استيراد وتحليل ملف القياسات الحيوية: ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadFile = (type: 'fhir' | 'csv') => {
    const content =
      type === 'fhir'
        ? generateFHIRMedicalBundle(ATHLETE_PROFILE, records, physicianNotes)
        : generateClinicalCSV(records);
    const mimeType =
      type === 'fhir' ? 'application/fhir+json;charset=utf-8' : 'text/csv;charset=utf-8';
    const extension = type === 'fhir' ? 'fhir.json' : 'csv';

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `misbar-health-report-${selectedRecord.date}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      type === 'fhir'
        ? 'تم تصدير التقرير الطبي بصيغة HL7 FHIR R4 المتوافقة مع سباهي (CBAHI).'
        : 'تم تصدير جدول البيانات الصحية بصيغة CSV.'
    );
  };

  const handleCopyPayload = () => {
    const text =
      exportFormatPreview === 'fhir'
        ? generateFHIRMedicalBundle(ATHLETE_PROFILE, records, physicianNotes)
        : generateClinicalCSV(records);
    navigator.clipboard?.writeText(text);
    showToast('تم نسخ محتوى التقرير الطبي إلى الحافظة.');
  };

  const formatHoursMinutes = (totalMins: number) => {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs} س ${mins} د`;
  };

  const recoveryRingColor =
    selectedRecord.recoveryStatus === 'optimal'
      ? '#0B5D46'
      : selectedRecord.recoveryStatus === 'moderate'
      ? '#B45309'
      : '#B91C1C';

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F0E6] text-[#14241F]">
      {/* Global SVG Pattern Definitions for Islamic Girih & Mashrabiya */}
      <IslamicPatternDefs />

      {/* Single Unified Top Navigation Bar — Responsive across Mobile, Tablet, and Desktop */}
      <header className="sticky top-0 z-30 bg-[#0F2922] text-[#FAF7F0] border-b border-[#B8955A]/40 px-3 sm:px-6 py-2.5 sm:py-3 overflow-hidden no-print">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          <rect width="100%" height="100%" fill="url(#mashrabiya-header-pattern)" />
        </svg>

        <div className="relative z-10 max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleSwitchTab('overview');
            }}
            className="order-1 text-sm sm:text-base lg:text-lg font-bold tracking-tight text-[#FAF7F0] font-display whitespace-nowrap shrink-0"
          >
            مِسبار للصحة والأداء الرياضي
          </a>

          {/* Zone 2: Single Navigation Tab Bar — responsive 2-col grid on mobile, wrapped flex on tablet, inline on desktop (no horizontal scroll needed) */}
          <nav
            aria-label="التنقل الرئيسي"
            className="order-3 lg:order-2 w-full lg:w-auto grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[#D5CBB8] max-w-full pt-2 lg:pt-0 border-t border-[#B8955A]/20 lg:border-t-0"
          >
            {NAV_TABS.map((tab, idx) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSwitchTab(tab.id)}
                className={`${
                  idx === 0 ? 'col-span-2 sm:col-span-1' : ''
                } hover:text-white transition-colors text-center py-1.5 px-2.5 rounded-md lg:rounded-t-md lg:rounded-b-none border lg:border-0 lg:border-b-2 cursor-pointer ${
                  activeSection === tab.id
                    ? 'border-[#D4B886] bg-[#D4B886]/20 text-white font-bold'
                    : 'border-[#B8955A]/20 lg:border-transparent bg-[#14332A]/60 lg:bg-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="order-2 lg:order-3 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleDownloadFile('fhir')}
              className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-[#14241F] bg-[#D4B886] rounded-lg hover:bg-[#E2C99B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              تصدير السجل الطبي
            </button>
          </div>
        </div>
      </header>

      {/* Notification Banner */}
      {exportNotification && (
        <div
          role="status"
          className="bg-[#0B5D46] text-white text-xs px-6 py-2.5 border-b border-[#B8955A]/40 no-print"
        >
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{exportNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setExportNotification(null)}
              className="text-white/80 hover:text-white underline text-xs cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Main Health Dashboard Layout: Responsive Across Mobile, Tablet, and Desktop */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-4 sm:gap-5 p-3 sm:p-5">
        {/* RIGHT ASIDE BAR: On Desktop (lg+) appears on the right; on Mobile/Tablet (<1024px) appears below main stage so tab switches are immediately visible at the top */}
        <aside className="order-2 lg:order-1 w-full lg:w-[295px] xl:w-[320px] shrink-0 flex flex-col gap-4 no-print">
          {/* Athlete Health Card with Islamic Geometric Background */}
          <IslamicChartCard className="p-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E6DFD1]">
              <div className="relative w-12 h-12 rounded-full bg-[#0B5D46] text-[#FAF7F0] border-2 border-[#B8955A] flex items-center justify-center font-bold text-base shrink-0">
                ط م
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-[#14241F] truncate">
                  {ATHLETE_PROFILE.fullName}
                </h2>
                <p className="text-xs text-[#5E5A50] truncate">
                  {ATHLETE_PROFILE.sportDiscipline}
                </p>
                <p className="text-[11px] text-[#0B5D46] font-mono-num mt-0.5">
                  {selectedRecord.hijriDate} · {selectedRecord.date}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 text-center border-b border-[#E6DFD1] text-xs">
              <div>
                <span className="text-[#7A7264] block text-[11px]">VO2 Max</span>
                <strong className="font-mono-num text-[#14241F]">{ATHLETE_PROFILE.vo2Max}</strong>
              </div>
              <div>
                <span className="text-[#7A7264] block text-[11px]">فصيلة الدم</span>
                <strong dir="ltr" className="font-mono-num text-[#14241F] inline-block">
                  {ATHLETE_PROFILE.bloodGroup}
                </strong>
              </div>
              <div>
                <span className="text-[#7A7264] block text-[11px]">الوزن</span>
                <strong className="font-mono-num text-[#14241F]">
                  {ATHLETE_PROFILE.weightKg} كغ
                </strong>
              </div>
            </div>

            {/* Date & Time Range Slicers */}
            <div className="pt-3 space-y-3">
              <div>
                <label
                  htmlFor="health-day-select"
                  className="block text-xs font-semibold text-[#14241F] mb-1"
                >
                  تاريخ الفحص اليومي:
                </label>
                <select
                  id="health-day-select"
                  value={selectedRecord.id}
                  onChange={(e) => handleSelectRecord(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono-num bg-[#FAF7F0] border border-[#D5CBB8] rounded-lg text-[#14241F] focus:border-[#0B5D46] focus:outline-none cursor-pointer"
                >
                  {slicedRecords.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.date} · {rec.dayLabel} — ({rec.recoveryScore}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#14241F] mb-1.5">
                  النطاق الزمني للمخططات:
                </span>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#EAE4D7] rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleTimeWindowChange(14)}
                    className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      timeWindowDays === 14
                        ? 'bg-[#FDFCF9] text-[#14241F] shadow-xs font-bold'
                        : 'text-[#5E5A50] hover:text-[#14241F]'
                    }`}
                  >
                    آخر 14 يوماً
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTimeWindowChange(7)}
                    className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      timeWindowDays === 7
                        ? 'bg-[#FDFCF9] text-[#14241F] shadow-xs font-bold'
                        : 'text-[#5E5A50] hover:text-[#14241F]'
                    }`}
                  >
                    آخر 7 أيام
                  </button>
                </div>
              </div>
            </div>
          </IslamicChartCard>

          {/* Interactive Morning Check-In Sliders (Live Update on Drag) */}
          <IslamicChartCard className="p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E6DFD1]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#14241F]">
                <Sliders className="w-4 h-4 text-[#0B5D46]" />
                <span>معايرة القياسات الحيوية ({selectedRecord.date.slice(5)})</span>
              </div>
              <button
                type="button"
                onClick={handleResetRecords}
                title="استعادة القيم الأصلية"
                className="text-[11px] text-[#5E5A50] hover:text-[#0B5D46] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>استعادة</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#5E5A50]">تقلب النبض HRV rMSSD:</span>
                  <span dir="ltr" className="font-mono-num font-bold text-[#0B5D46]">
                    {inputRmssd} ms
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={115}
                  value={inputRmssd}
                  onChange={(e) => handleSliderChange('rmssd', Number(e.target.value))}
                  className="w-full accent-[#0B5D46] cursor-pointer h-1.5 bg-[#EAE4D7] rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#5E5A50]">نبض الراحة RHR:</span>
                  <span dir="ltr" className="font-mono-num font-bold text-[#B45309]">
                    {inputRhr} bpm
                  </span>
                </div>
                <input
                  type="range"
                  min={38}
                  max={68}
                  value={inputRhr}
                  onChange={(e) => handleSliderChange('rhr', Number(e.target.value))}
                  className="w-full accent-[#B45309] cursor-pointer h-1.5 bg-[#EAE4D7] rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#5E5A50]">النوم العميق (SWS):</span>
                  <span className="font-mono-num font-bold text-[#1E4E68]">
                    {inputDeepSleep} د
                  </span>
                </div>
                <input
                  type="range"
                  min={45}
                  max={150}
                  value={inputDeepSleep}
                  onChange={(e) => handleSliderChange('deepSleep', Number(e.target.value))}
                  className="w-full accent-[#1E4E68] cursor-pointer h-1.5 bg-[#EAE4D7] rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#5E5A50]">الحمل التدريبي الحاد (7 أيام):</span>
                  <span dir="ltr" className="font-mono-num font-bold text-[#14241F]">
                    {inputAcuteLoad} AU
                  </span>
                </div>
                <input
                  type="range"
                  min={450}
                  max={1020}
                  value={inputAcuteLoad}
                  onChange={(e) => handleSliderChange('acuteLoad', Number(e.target.value))}
                  className="w-full accent-[#0B5D46] cursor-pointer h-1.5 bg-[#EAE4D7] rounded-lg"
                />
              </div>

              {/* Instant 1-Click Scenario Presets */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    applyBiometricValues({
                      rmssd: 55,
                      rhr: 55,
                      deepSleep: 62,
                      remSleep: 78,
                      totalSleep: 400,
                      acuteLoad: 940,
                      skinTemp: 0.4,
                      sourceLabel: 'محاكاة إجهاد مرتفع',
                    })
                  }
                  className="py-1.5 px-2 text-[11px] font-medium bg-[#FDF2F2] text-[#B91C1C] border border-[#F5C2C2] rounded-lg hover:bg-[#FCE4E4] cursor-pointer"
                >
                  حالة إجهاد مرتفع
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyBiometricValues({
                      rmssd: 96,
                      rhr: 44,
                      deepSleep: 125,
                      remSleep: 122,
                      totalSleep: 510,
                      acuteLoad: 750,
                      skinTemp: -0.1,
                      sourceLabel: 'محاكاة ذروة الاستشفاء',
                    })
                  }
                  className="py-1.5 px-2 text-[11px] font-medium bg-[#EDF7F4] text-[#0B5D46] border border-[#B5DEC8] rounded-lg hover:bg-[#DCF0E9] cursor-pointer"
                >
                  ذروة الاستشفاء
                </button>
              </div>
            </div>
          </IslamicChartCard>

          {/* Connected Fitness Trackers Quick Slicer (Hidden on the dedicated Devices tab to avoid visual duplication) */}
          {activeSection !== 'devices' && (
            <IslamicChartCard className="p-4">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E6DFD1]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#14241F]">
                  <Watch className="w-4 h-4 text-[#0B5D46]" />
                  <span>أجهزة التتبع المتصلة (SFDA)</span>
                </div>
                <label className="text-[11px] text-[#0B5D46] font-medium hover:underline cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>استيراد ملف</span>
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2.5">
                {devices.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-2.5 bg-[#FAF7F0]/90 rounded-lg border border-[#E6DFD1] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[#14241F] truncate">{dev.name}</div>
                      <div className="text-[11px] text-[#5E5A50] font-mono-num mt-0.5">
                        بطارية {dev.batteryPercent}% · {dev.lastSyncTime}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSyncDevice(dev)}
                      disabled={syncingDeviceId === dev.id}
                      className="px-2.5 py-1.5 text-[11px] font-medium bg-[#FDFCF9] border border-[#D5CBB8] text-[#14241F] rounded-md hover:bg-[#0B5D46] hover:text-white hover:border-[#0B5D46] shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${syncingDeviceId === dev.id ? 'animate-spin' : ''}`}
                      />
                      <span>مزامنة</span>
                    </button>
                  </div>
                ))}
              </div>
            </IslamicChartCard>
          )}
        </aside>

        {/* MAIN HEALTH DASHBOARD STAGE */}
        <main className="order-1 lg:order-2 flex-1 min-w-0 flex flex-col gap-4 sm:gap-5">
          {/* Compact Mobile/Tablet Slicer Strip (Visible on <1024px so date & range filters are accessible right at the top) */}
          <div className="lg:hidden bg-[#FDFCF9] border border-[#D5CBB8] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs no-print">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-full bg-[#0B5D46] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                ط م
              </span>
              <div className="truncate">
                <strong className="text-[#14241F] block truncate">{ATHLETE_PROFILE.fullName}</strong>
                <span className="text-[11px] text-[#0B5D46] font-mono-num">
                  استشفاء {selectedRecord.recoveryScore}% · HRV {selectedRecord.hrv.rmssd}ms
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="تاريخ الفحص اليومي"
                value={selectedRecord.id}
                onChange={(e) => handleSelectRecord(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-mono-num bg-[#FAF7F0] border border-[#D5CBB8] rounded-lg text-[#14241F] cursor-pointer"
              >
                {slicedRecords.map((rec) => (
                  <option key={rec.id} value={rec.id}>
                    {rec.date} ({rec.recoveryScore}%)
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 p-0.5 bg-[#EAE4D7] rounded-lg">
                <button
                  type="button"
                  onClick={() => handleTimeWindowChange(14)}
                  className={`px-2 py-1 text-[11px] rounded-md cursor-pointer ${
                    timeWindowDays === 14
                      ? 'bg-[#FDFCF9] text-[#14241F] font-bold'
                      : 'text-[#5E5A50]'
                  }`}
                >
                  14 يوم
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeWindowChange(7)}
                  className={`px-2 py-1 text-[11px] rounded-md cursor-pointer ${
                    timeWindowDays === 7
                      ? 'bg-[#FDFCF9] text-[#14241F] font-bold'
                      : 'text-[#5E5A50]'
                  }`}
                >
                  7 أيام
                </button>
              </div>
            </div>
          </div>

          {/* 3 Circular Health Rings with Direct Actionable Advice (Shown on Overview & HRV-Sleep Tabs) */}
          {(activeSection === 'overview' || activeSection === 'hrv-sleep') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <IslamicChartCard className="p-4 sm:p-5" highlightBorder>
                <BiometricGaugeRing
                  value={selectedRecord.recoveryScore}
                  maxValue={100}
                  unit="%"
                  label="مؤشر الاستشفاء اليومي"
                  sublabel={`تقلب النبض ${selectedRecord.hrv.rmssd} ms · نبض الراحة ${selectedRecord.restingHeartRate} bpm`}
                  adviceText={
                    selectedRecord.recoveryScore >= 75
                      ? 'جاهزية عالية لتنفيذ الحصة الرئيسية بكامل الشدة.'
                      : selectedRecord.recoveryScore >= 55
                      ? 'جاهزية متوسطة؛ تدرّج في الإحماء واخفض الشدة 15%.'
                      : 'إجهاد مرتفع؛ التزم بالاستشفاء النشط والتنفس العلاجي.'
                  }
                  color={recoveryRingColor}
                />
              </IslamicChartCard>

              <IslamicChartCard className="p-4 sm:p-5">
                <BiometricGaugeRing
                  value={selectedRecord.sleep.efficiencyPercent}
                  maxValue={100}
                  unit="%"
                  label="كفاءة وجودة النوم"
                  sublabel={`إجمالي ${formatHoursMinutes(selectedRecord.sleep.totalMinutes)} · عميق ${
                    selectedRecord.sleep.deepMinutes
                  } د · REM ${selectedRecord.sleep.remMinutes} د`}
                  adviceText={
                    selectedRecord.sleep.deepMinutes >= 105
                      ? 'نوم بنائي ممتاز؛ استشفاء الألياف والهرمونات مكتمل.'
                      : 'أضف 400 ملغ مغنيسيوم مساءً وادخل السرير قبل 22:45.'
                  }
                  color="#1E4E68"
                />
              </IslamicChartCard>

              <IslamicChartCard className="p-4 sm:p-5 sm:col-span-2 xl:col-span-1">
                <BiometricGaugeRing
                  value={selectedRecord.sessionStrain}
                  maxValue={21}
                  unit="/21"
                  label="مؤشر الإجهاد البدني"
                  sublabel={`نسبة الحمل ACWR ${selectedRecord.acwr} · تشبع الأكسجين ${selectedRecord.spo2Percent}%`}
                  adviceText={
                    selectedRecord.acwr <= 1.25
                      ? `حمل تدريبي آمن؛ التزم بنبض ${selectedRecord.trainingPrescription.targetHeartRateRange}.`
                      : 'تجاوز عتبة الحذر (ACWR)؛ خفّف الصدمات على الأوتار اليوم.'
                  }
                  color="#B45309"
                />
              </IslamicChartCard>
            </div>
          )}

          {/* DEDICATED HRV & SLEEP TAB HEADER WITH SUB-TABS & QUICK SCENARIOS */}
          {activeSection === 'hrv-sleep' && (
            <IslamicChartCard className="p-3.5 sm:p-5 space-y-4" highlightBorder>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#14241F]">
                    رادار تقلب النبض (HRV) وهندسة النوم الفسيولوجية ({selectedRecord.date})
                  </h2>
                  <p className="text-xs text-[#5E5A50]">
                    تحليل سيادة العصب الحائر (rMSSD {selectedRecord.hrv.rmssd} ms) ومخطط بوانكاريه ومراحل النوم الليلي ({formatHoursMinutes(selectedRecord.sleep.totalMinutes)})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (timeWindowDays === 7) setTimeWindowDays(14);
                      handleSelectRecord('rec-2026-10-10');
                    }}
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      selectedRecord.id === 'rec-2026-10-10'
                        ? 'bg-[#B91C1C] text-white border-[#B91C1C] font-bold'
                        : 'bg-[#FDF2F2] text-[#B91C1C] border-[#F5C2C2] hover:bg-[#FCE4E4]'
                    }`}
                  >
                    ليلة إجهاد الماراثون (10 أكتوبر · 52ms)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRecord(records[records.length - 1].id)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      selectedRecord.id === records[records.length - 1].id
                        ? 'bg-[#0B5D46] text-white border-[#0B5D46] font-bold'
                        : 'bg-[#EDF7F4] text-[#0B5D46] border-[#B5DEC8] hover:bg-[#DCF0E9]'
                    }`}
                  >
                    قراءة اليوم ({records[records.length - 1].hrv.rmssd}ms)
                  </button>
                </div>
              </div>

              <GirihHeaderBorder />

              {/* Sub-Tab Bar inside HRV & Sleep Analyzer */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-2.5 pt-1">
                <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-1.5 p-1 bg-[#EAE4D7] rounded-lg w-full sm:w-auto">
                  {[
                    { id: 'all', label: 'عرض شامل (الرادار + HRV + النوم)' },
                    { id: 'hrv-focus', label: 'تحليل HRV والجهاز العصبي (rMSSD & Poincaré)' },
                    { id: 'sleep-focus', label: 'تحليل هندسة ومراحل النوم (Sleep Stages)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setHrvSleepSubTab(tab.id as 'all' | 'hrv-focus' | 'sleep-focus')
                      }
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors text-right sm:text-center cursor-pointer ${
                        hrvSleepSubTab === tab.id
                          ? 'bg-[#0B5D46] text-white'
                          : 'text-[#5E5A50] hover:text-[#14241F]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-mono-num text-[#5E5A50]">
                  الجهاز النشط: <strong className="text-[#0B5D46]">{selectedRecord.sourceDevice}</strong>
                </div>
              </div>
            </IslamicChartCard>
          )}

          {/* CORE BIOMETRIC CHARTS ROW 1: SPIDER RADAR CHART + DUAL HRV & RHR AREA/LINE CHART */}
          {(activeSection === 'overview' ||
            (activeSection === 'hrv-sleep' &&
              (hrvSleepSubTab === 'all' || hrvSleepSubTab === 'hrv-focus'))) && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
              <IslamicChartCard className="xl:col-span-5 p-3.5 sm:p-5 space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#14241F]">
                      مخطط العنكبوت للتوازن الصحي والتوجيه اليومي
                    </h3>
                    <span className="text-xs font-mono-num text-[#8C6D36] font-semibold">
                      {selectedRecord.date}
                    </span>
                  </div>
                  <p className="text-xs text-[#5E5A50] mt-0.5">
                    انقر على أي مؤشر من الرؤوس الـ 6 لمقارنته بالمعدل المرجعي واستعراض نصيحته
                  </p>
                  <GirihHeaderBorder />
                </div>

                <SpiderRadarChart record={selectedRecord} allRecords={slicedRecords} />
              </IslamicChartCard>

              <IslamicChartCard className="xl:col-span-7 p-3.5 sm:p-5 space-y-3">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#14241F]">
                      منحنى تقلب معدل ضربات القلب (HRV) ونبض الراحة (RHR) مع التوجيه
                    </h3>
                    <div className="text-xs font-mono-num text-[#5E5A50]">
                      SDNN: <strong className="text-[#14241F]">{selectedRecord.hrv.sdnn} ms</strong> · LF/HF:{' '}
                      <strong className="text-[#0B5D46]">{selectedRecord.hrv.lfHfRatio}</strong>
                    </div>
                  </div>
                  <p className="text-xs text-[#5E5A50] mt-0.5">
                    انقر على أي يوم في المنحنى أو الشريط السفلي لاستعراض قراءاته وتوجيه التوازن العصبي
                  </p>
                  <GirihHeaderBorder />
                </div>

                <HRVTrendChart
                  records={slicedRecords}
                  selectedId={selectedRecord.id}
                  onSelectRecord={handleSelectRecord}
                />
              </IslamicChartCard>
            </div>
          )}

          {/* CORE BIOMETRIC CHARTS ROW 2: SLEEP ARCHITECTURE STACKED CHART + SLEEP STAGE BARS / ACWR WORKLOAD CHART */}
          {(activeSection === 'overview' ||
            (activeSection === 'hrv-sleep' &&
              (hrvSleepSubTab === 'all' || hrvSleepSubTab === 'sleep-focus'))) && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
              <IslamicChartCard
                className={
                  activeSection === 'hrv-sleep'
                    ? 'xl:col-span-7 p-3.5 sm:p-5 space-y-3'
                    : 'xl:col-span-6 p-3.5 sm:p-5 space-y-3'
                }
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#14241F]">
                      سجل مراحل النوم الليلي (عميق · REM · خفيف · يقظة)
                    </h3>
                    <span className="text-xs font-mono-num text-[#1E4E68] font-semibold">
                      {selectedRecord.sleep.bedtime} — {selectedRecord.sleep.wakeTime}
                    </span>
                  </div>
                  <p className="text-xs text-[#5E5A50] mt-0.5">
                    توزيع مراحل النوم لليلة المحددة ({formatHoursMinutes(selectedRecord.sleep.totalMinutes)})
                  </p>
                  <GirihHeaderBorder />
                </div>

                <SleepStackedBarChart
                  records={slicedRecords}
                  selectedId={selectedRecord.id}
                  onSelectRecord={handleSelectRecord}
                />
              </IslamicChartCard>

              {activeSection === 'hrv-sleep' ? (
                <IslamicChartCard className="xl:col-span-5 p-3.5 sm:p-5 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#14241F]">
                        تفصيل مراحل النوم لليلة ({selectedRecord.date})
                      </h3>
                      <span className="text-xs font-mono-num text-[#0B5D46] font-bold">
                        كفاءة {selectedRecord.sleep.efficiencyPercent}%
                      </span>
                    </div>
                    <p className="text-xs text-[#5E5A50] mt-0.5">
                      كمون النوم: {selectedRecord.sleep.latencyMinutes} د · معدل التنفس: {selectedRecord.respiratoryRate} د/ن
                    </p>
                    <GirihHeaderBorder />
                  </div>

                  <SleepDonutBreakdown record={selectedRecord} />
                </IslamicChartCard>
              ) : (
                <IslamicChartCard className="xl:col-span-6 p-3.5 sm:p-5 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#14241F]">
                        توازن الحمل التدريبي الحاد والمزمن (ACWR)
                      </h3>
                      <span
                        className={`text-xs font-mono-num font-bold ${
                          selectedRecord.acwr >= 1.3 ? 'text-[#B91C1C]' : 'text-[#0B5D46]'
                        }`}
                      >
                        ACWR: {selectedRecord.acwr}
                      </span>
                    </div>
                    <p className="text-xs text-[#5E5A50] mt-0.5">
                      مراقبة تدرج الأحمال لمنع إصابات الإجهاد الزائد (النطاق الآمن 0.80 – 1.30)
                    </p>
                    <GirihHeaderBorder />
                  </div>

                  <ACWRWorkloadChart
                    records={slicedRecords}
                    selectedId={selectedRecord.id}
                    onSelectRecord={handleSelectRecord}
                  />
                </IslamicChartCard>
              )}
            </div>
          )}

          {/* SMART HEALTH & COACHING ADVICE CHARTS HUB (Shown on لوحة الصحة الشاملة) */}
          {activeSection === 'overview' && (
            <IslamicChartCard className="p-3.5 sm:p-5 space-y-4" highlightBorder>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#14241F]">
                      مخططات التوجيهات الصحية والبرنامج اليومي ({selectedRecord.dayLabel} ·{' '}
                      {selectedRecord.date})
                    </h2>
                    <p className="text-xs text-[#5E5A50]">
                      تحويل المؤشرات الحيوية (HRV · النوم · الحمل التدريبي · العضلات) إلى بوصلة توجيهية ومنحنى أداء على مدار 24 ساعة
                    </p>
                  </div>
                  <span className="text-xs font-mono-num text-[#0B5D46] font-semibold">
                    {selectedRecord.trainingSessionTitle} · {selectedRecord.trainingPrescription.recommendedDurationMinutes} د
                  </span>
                </div>
                <GirihHeaderBorder />
              </div>

              <OverviewAdvisoryCharts record={selectedRecord} allRecords={slicedRecords} />
            </IslamicChartCard>
          )}

          {/* TAB 1 (OVERVIEW) & TAB 2 (INJURY): LARGE ANATOMICAL MUSCLE RECOVERY & INJURY PREVENTION MAP */}
          {(activeSection === 'overview' || activeSection === 'injury') && (
            <IslamicChartCard className="p-3.5 sm:p-6 space-y-4" highlightBorder>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#14241F]">
                      خريطة الاستشفاء العضلي والوقاية من الإصابات (المنظر التشريحي الأمامي والخلفي)
                    </h2>
                    <p className="text-xs text-[#5E5A50]">
                      تقييم الجاهزية الميكانيكية للأوتار والمجموعات العضلية بناءً على قراءات HRV والحمل التدريبي (ACWR {selectedRecord.acwr})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (timeWindowDays === 7) setTimeWindowDays(14);
                        handleSelectRecord('rec-2026-10-10');
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        selectedRecord.id === 'rec-2026-10-10'
                          ? 'bg-[#B91C1C] text-white border-[#B91C1C] font-bold'
                          : 'bg-[#FDF2F2] text-[#B91C1C] border-[#F5C2C2] hover:bg-[#FCE4E4]'
                      }`}
                    >
                      معاينة إجهاد الماراثون (10 أكتوبر · 38%)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectRecord(records[records.length - 1].id)
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        selectedRecord.id === records[records.length - 1].id
                          ? 'bg-[#0B5D46] text-white border-[#0B5D46] font-bold'
                          : 'bg-[#EDF7F4] text-[#0B5D46] border-[#B5DEC8] hover:bg-[#DCF0E9]'
                      }`}
                    >
                      قراءة اليوم ({records[records.length - 1].recoveryScore}%)
                    </button>
                  </div>
                </div>
                <GirihHeaderBorder />
              </div>

              {/* Large Dual Front & Back Anatomical Human Body Map + 6 Muscle Group Bars + Info Modal */}
              <AnatomicalRecoveryMap
                record={selectedRecord}
                showExtendedCards={activeSection === 'injury'}
              />

              {/* Injury Prevention Alerts Row (Shown on Dedicated Injury Tab) */}
              {activeSection === 'injury' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3.5 border-t border-[#E6DFD1]">
                  {injuryAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="text-xs flex flex-col justify-between space-y-2 pb-2 md:pb-0 border-b md:border-b-0 border-[#E6DFD1] last:border-b-0"
                    >
                      <div>
                        <strong
                          className={`block mb-1 ${
                            alert.severity === 'high'
                              ? 'text-[#B91C1C]'
                              : alert.severity === 'moderate'
                              ? 'text-[#B45309]'
                              : 'text-[#0B5D46]'
                          }`}
                        >
                          {alert.title}
                        </strong>
                        <p className="text-[#5E5A50] leading-relaxed">
                          {alert.correctiveProtocol}
                        </p>
                      </div>
                      <div className="text-[11px] font-mono-num text-[#7A7264]">
                        {alert.currentValue}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </IslamicChartCard>
          )}

          {/* Personalized Daily Training Prescription Card (Shown on Injury Tab) */}
          {activeSection === 'injury' && (
            <IslamicChartCard className="p-3.5 sm:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-[#0B5D46] font-semibold block">
                    التوصية التدريبية المخصصة لليوم ({selectedRecord.dayLabel} ·{' '}
                    {selectedRecord.hijriDate})
                  </span>
                  <h2 className="text-lg font-bold text-[#14241F]">
                    {selectedRecord.trainingSessionTitle}
                  </h2>
                  <p className="text-xs text-[#5E5A50] leading-relaxed max-w-3xl">
                    {selectedRecord.trainingPrescription.physiologicalRationale}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E6DFD1] shrink-0">
                  <div>
                    <span className="text-[11px] text-[#7A7264] block">نطاق النبض الموصى به</span>
                    <span className="text-sm font-bold font-mono-num text-[#0B5D46]">
                      {selectedRecord.trainingPrescription.targetHeartRateRange}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#7A7264] block">المدة المستهدفة</span>
                    <span className="text-sm font-bold font-mono-num text-[#14241F]">
                      {selectedRecord.trainingPrescription.recommendedDurationMinutes} دقيقة
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#7A7264] block">الإماهة والأملاح</span>
                    <span className="text-xs font-semibold text-[#14241F]">
                      {selectedRecord.trainingPrescription.hydrationElectrolyteNote}
                    </span>
                  </div>
                </div>
              </div>
            </IslamicChartCard>
          )}

          {/* MUSCLE RECOVERY QUALITY <-> HYDRATION & ELECTROLYTE PRECISION PROTOCOL */}
          {(activeSection === 'overview' || activeSection === 'injury') && (
            <IslamicChartCard className="p-4 sm:p-5 space-y-3" highlightBorder>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#14241F]">
                    بروتوكول الإماهة وتوازن الأملاح المعدنية المرتبط بجودة الاستشفاء العضلي والتوصية التدريبية
                  </h3>
                  <span className="text-xs font-mono-num text-[#0B5D46] font-bold">
                    مخصص لحصة اليوم ({selectedRecord.date})
                  </span>
                </div>
                <p className="text-xs text-[#5E5A50] mt-0.5">
                  معايرة كميات السوائل والشوارد (Na+ · K+ · Mg2+ · Ca2+) بناءً على نسبة إجهاد المجموعات العضلية ومدة التدريب الموصى بها لتحسين الأداء الرياضي
                </p>
                <GirihHeaderBorder />
              </div>

              <MuscleHydrationElectrolyteSection record={selectedRecord} />
            </IslamicChartCard>
          )}

          {/* DEDICATED INJURY TAB: ACWR WORKLOAD CHART */}
          {activeSection === 'injury' && (
            <IslamicChartCard className="p-5 space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#14241F]">
                    توازن الحمل التدريبي الحاد والمزمن (ACWR) ومراقبة خطر الإصابات الوترية
                  </h3>
                  <span
                    className={`text-xs font-mono-num font-bold ${
                      selectedRecord.acwr >= 1.3 ? 'text-[#B91C1C]' : 'text-[#0B5D46]'
                    }`}
                  >
                    ACWR: {selectedRecord.acwr} (الحمل الحاد {selectedRecord.acuteLoad} AU / المزمن{' '}
                    {selectedRecord.chronicLoad} AU)
                  </span>
                </div>
                <p className="text-xs text-[#5E5A50] mt-0.5">
                  مراقبة تدرج الأحمال الميكانيكية لمنع إصابات الإجهاد الزائد (النطاق الآمن 0.80 – 1.30)
                </p>
                <GirihHeaderBorder />
              </div>

              <ACWRWorkloadChart
                records={slicedRecords}
                selectedId={selectedRecord.id}
                onSelectRecord={handleSelectRecord}
              />
            </IslamicChartCard>
          )}

          {/* DEDICATED HRV & SLEEP DEEP-DIVE CHARTS: POINCARE PLOT (SD1/SD2) & NIGHTLY SLEEP HYPNOGRAM */}
          {activeSection === 'hrv-sleep' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
              {(hrvSleepSubTab === 'all' || hrvSleepSubTab === 'hrv-focus') && (
                <IslamicChartCard
                  className={
                    hrvSleepSubTab === 'hrv-focus'
                      ? 'xl:col-span-12 p-5 space-y-3'
                      : 'xl:col-span-5 p-5 space-y-3'
                  }
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#14241F]">
                        مخطط بوانكاريه لانتشار النبض (Poincaré SD1 / SD2 Plot)
                      </h3>
                      <span className="text-xs font-mono-num text-[#0B5D46] font-bold">
                        rMSSD {selectedRecord.hrv.rmssd} ms
                      </span>
                    </div>
                    <p className="text-xs text-[#5E5A50] mt-0.5">
                      تحليل تشتت فترات R-R المتتالية لتقييم استجابة العصب الحائر الصباحية
                    </p>
                    <GirihHeaderBorder />
                  </div>

                  <PoincareAutonomicPlot record={selectedRecord} />
                </IslamicChartCard>
              )}

              {(hrvSleepSubTab === 'all' || hrvSleepSubTab === 'sleep-focus') && (
                <IslamicChartCard
                  className={
                    hrvSleepSubTab === 'sleep-focus'
                      ? 'xl:col-span-12 p-5 space-y-3'
                      : 'xl:col-span-7 p-5 space-y-3'
                  }
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#14241F]">
                        مخطط دورات النوم الليلي (5 دورات فوق يومية — Hypnogram)
                      </h3>
                      <span className="text-xs font-mono-num text-[#1E4E68] font-bold">
                        {selectedRecord.sleep.bedtime} — {selectedRecord.sleep.wakeTime}
                      </span>
                    </div>
                    <p className="text-xs text-[#5E5A50] mt-0.5">
                      تسلسل الانتقال بين النوم العميق (SWS) وحركة العين السريعة (REM) خلال الليل
                    </p>
                    <GirihHeaderBorder />
                  </div>

                  <NightlySleepHypnogram record={selectedRecord} />
                </IslamicChartCard>
              )}
            </div>
          )}

          {/* DEDICATED HRV-SLEEP TAB: AUTONOMIC NERVOUS SYSTEM & SLEEP CLINICAL METRICS */}
          {activeSection === 'hrv-sleep' && (
            <IslamicChartCard className="p-5 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-[#14241F]">
                  المؤشرات السريرية للجهاز العصبي المستقل وهندسة النوم ({selectedRecord.date})
                </h3>
                <GirihHeaderBorder />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF7F0]/60 border border-[#E6DFD1] space-y-1">
                  <span className="text-[#5E5A50] block">مؤشر بوانكاريه الصباحي (SD1 / SD2)</span>
                  <strong className="text-base font-mono-num text-[#0B5D46] block">
                    {selectedRecord.hrv.morningPoincareSD1} / {selectedRecord.hrv.morningPoincareSD2} ms
                  </strong>
                  <span className="text-[11px] text-[#7A7264]">
                    انتشار فترات النبض R-R قصير وطويل المدى
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F0]/60 border border-[#E6DFD1] space-y-1">
                  <span className="text-[#5E5A50] block">التوازن العصبي (LF/HF · lnRMSSD)</span>
                  <strong className="text-base font-mono-num text-[#14241F] block">
                    {selectedRecord.hrv.lfHfRatio} · {selectedRecord.hrv.lnRmssd} ln
                  </strong>
                  <span className="text-[11px] text-[#7A7264]">
                    الانحراف عن خط الأساس: {selectedRecord.hrv.deviationPercent}%
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F0]/60 border border-[#E6DFD1] space-y-1">
                  <span className="text-[#5E5A50] block">معدل التنفس الليلي والأكسجين</span>
                  <strong className="text-base font-mono-num text-[#1E4E68] block">
                    {selectedRecord.respiratoryRate} د/ن · SpO2 {selectedRecord.spo2Percent}%
                  </strong>
                  <span className="text-[11px] text-[#7A7264]">
                    انحراف حرارة الجلد: {selectedRecord.skinTempDelta > 0 ? '+' : ''}
                    {selectedRecord.skinTempDelta}°C
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F0]/60 border border-[#E6DFD1] space-y-1">
                  <span className="text-[#5E5A50] block">نسبة النوم البنائي (SWS + REM)</span>
                  <strong className="text-base font-mono-num text-[#0B5D46] block">
                    {Math.round(
                      ((selectedRecord.sleep.deepMinutes + selectedRecord.sleep.remMinutes) /
                        Math.max(1, selectedRecord.sleep.totalMinutes)) *
                        100
                    )}
                    % ({selectedRecord.sleep.deepMinutes + selectedRecord.sleep.remMinutes} د)
                  </strong>
                  <span className="text-[11px] text-[#7A7264]">
                    كمون الدخول في النوم: {selectedRecord.sleep.latencyMinutes} دقيقة
                  </span>
                </div>
              </div>
            </IslamicChartCard>
          )}

          {/* DEDICATED DEVICES TAB VIEW: Full Wearable Sensor & File Import Hub */}
          {activeSection === 'devices' && (
            <>
              <IslamicChartCard className="p-6 space-y-5" highlightBorder>
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#14241F]">
                        إدارة ومزامنة الأجهزة القابلة للارتداء والحساسات الطبية (SFDA)
                      </h2>
                      <p className="text-xs text-[#5E5A50]">
                        مزامنة فورية مع الأساور الضوئية (PPG) وأحزمة تخطيط القلب (ECG) واستيراد ملفات القياسات الخام
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0B5D46] text-white rounded-lg hover:bg-[#084735] transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>استيراد ملف قياسات حيوية (JSON / CSV)</span>
                      <input
                        type="file"
                        accept=".json,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <GirihHeaderBorder />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className="bg-[#FAF7F0] border border-[#DFD8C8] rounded-xl p-5 flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="text-sm font-bold text-[#14241F]">{device.name}</h3>
                            <span className="text-[11px] font-mono-num text-[#7A7264]">
                              {device.manufacturer} · {device.modelCode}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              device.connected ? 'text-[#0B5D46]' : 'text-[#7A7264]'
                            }`}
                          >
                            {device.connected ? 'متصل ونشط' : 'غير متصل'}
                          </span>
                        </div>

                        <p className="text-xs text-[#3E3B34] mb-3 leading-relaxed">
                          {device.sensorType}
                        </p>

                        <div className="text-xs text-[#5E5A50] pt-2 border-t border-[#E6DFD1]">
                          <strong className="text-[#14241F]">المؤشرات الحيوية المدعومة: </strong>
                          {device.supportedMetrics.join(' · ')}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#E6DFD1] flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 font-mono-num text-[#5E5A50]">
                          <span className="flex items-center gap-1">
                            <BatteryCharging className="w-3.5 h-3.5 text-[#0B5D46]" />
                            {device.batteryPercent}%
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Radio className="w-3.5 h-3.5 text-[#8C6D36]" />
                            {device.samplingFrequencyHz} Hz
                          </span>
                          <span>·</span>
                          <span>{device.sfdaRegistrationCode}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleDeviceConnection(device.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-[#EAE4D7] text-[#14241F] rounded-lg hover:bg-[#DFD8C8] cursor-pointer"
                          >
                            {device.connected ? 'فصل' : 'اتصال'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSyncDevice(device)}
                            disabled={syncingDeviceId === device.id}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0B5D46] text-white rounded-lg hover:bg-[#084735] cursor-pointer"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${
                                syncingDeviceId === device.id ? 'animate-spin' : ''
                              }`}
                            />
                            <span>
                              {syncingDeviceId === device.id ? 'جارٍ المزامنة...' : 'مزامنة الآن'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </IslamicChartCard>

              {/* Sensor Telemetry Verification & Sample Packet Simulator */}
              <IslamicChartCard className="p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#14241F]">
                      فحص جودة الإشارة الحيوية ومحاكاة حزم القياسات (ECG / PPG Telemetry)
                    </h3>
                    <p className="text-xs text-[#5E5A50] mt-0.5">
                      المصدر النشط لليوم المحدد ({selectedRecord.date}):{' '}
                      <strong className="text-[#0B5D46]">{selectedRecord.sourceDevice}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        applyBiometricValues({
                          rmssd: 95,
                          rhr: 44,
                          deepSleep: 124,
                          remSleep: 120,
                          totalSleep: 508,
                          acuteLoad: 780,
                          skinTemp: -0.1,
                          sourceLabel: 'حزام Polar H10 ECG (1000Hz)',
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold bg-[#EDF7F4] text-[#0B5D46] border border-[#B5DEC8] rounded-lg hover:bg-[#DCF0E9] cursor-pointer"
                    >
                      محاكاة فحص صباحي Polar H10 ECG
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        applyBiometricValues({
                          rmssd: 88,
                          rhr: 46,
                          deepSleep: 128,
                          remSleep: 118,
                          totalSleep: 512,
                          acuteLoad: 760,
                          skinTemp: 0.0,
                          sourceLabel: 'خاتم Oura Ring Gen 4 (NTC/IR)',
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold bg-[#FAF7F0] text-[#14241F] border border-[#D5CBB8] rounded-lg hover:bg-[#EAE4D7] cursor-pointer"
                    >
                      محاكاة قراءة نوم Oura Ring 4
                    </button>
                  </div>
                </div>
              </IslamicChartCard>
            </>
          )}

          {/* DEDICATED MEDICAL EXPORT STUDIO */}
          {activeSection === 'medical-export' && (
            <IslamicChartCard className="p-6 space-y-5" highlightBorder>
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#14241F]">
                      التقرير الطبي الرسمي وحزمة التبادل المهيكل (HL7 FHIR R4 / سباهي CBAHI)
                    </h2>
                    <p className="text-xs text-[#5E5A50]">
                      {ATHLETE_PROFILE.nationalHealthAuthority} · ملف طبي: {ATHLETE_PROFILE.medicalRecordNumber}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadFile('fhir')}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#0B5D46] text-white rounded-lg hover:bg-[#084735] cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تنزيل حزمة FHIR JSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile('csv')}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#14241F] text-white rounded-lg hover:bg-[#223831] cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>تنزيل جدول CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPayload}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#EAE4D7] text-[#14241F] rounded-lg hover:bg-[#DFD8C8] cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ التقرير</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#D4B886] text-[#14241F] rounded-lg hover:bg-[#E2C99B] cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة رسمية</span>
                    </button>
                  </div>
                </div>
                <GirihHeaderBorder />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 space-y-3">
                  <div className="bg-[#FAF7F0] border border-[#DFD8C8] rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#5E5A50]">اسم الرياضي:</span>
                      <strong className="text-[#14241F]">{ATHLETE_PROFILE.fullName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5E5A50]">الطبيب الاستشاري المشرف:</span>
                      <strong className="text-[#14241F]">{ATHLETE_PROFILE.supervisingPhysician}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5E5A50]">المركز الطبي المعتمد:</span>
                      <span className="text-[#14241F]">{ATHLETE_PROFILE.medicalCenter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5E5A50]">ترميز القياسات السريرية:</span>
                      <span className="font-mono-num text-[#0B5D46] font-semibold">
                        LOINC 80404-7 · 8867-4 · 93832-4
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#14241F] mb-1.5">
                      ملاحظات الطبيب الاستشاري المرفقة في التقرير الطبي:
                    </label>
                    <textarea
                      rows={5}
                      value={physicianNotes}
                      onChange={(e) => setPhysicianNotes(e.target.value)}
                      className="w-full p-3 text-xs bg-[#FAF7F0] border border-[#D5CBB8] rounded-lg focus:border-[#0B5D46] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#14241F]">
                      معاينة حزمة التبادل الطبي المهيكل (HL7 FHIR R4 / CSV)
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setExportFormatPreview('fhir')}
                        className={`px-3 py-1 text-xs rounded-md font-mono-num cursor-pointer ${
                          exportFormatPreview === 'fhir'
                            ? 'bg-[#0B5D46] text-white font-bold'
                            : 'bg-[#EAE4D7] text-[#5E5A50]'
                        }`}
                      >
                        HL7 FHIR JSON
                      </button>
                      <button
                        type="button"
                        onClick={() => setExportFormatPreview('csv')}
                        className={`px-3 py-1 text-xs rounded-md font-mono-num cursor-pointer ${
                          exportFormatPreview === 'csv'
                            ? 'bg-[#0B5D46] text-white font-bold'
                            : 'bg-[#EAE4D7] text-[#5E5A50]'
                        }`}
                      >
                        جدول CSV المهيكل
                      </button>
                    </div>
                  </div>

                  {exportFormatPreview === 'fhir' ? (
                    <pre
                      dir="ltr"
                      className="text-[11px] font-mono-num bg-[#14241F] text-[#EAE4D7] p-3.5 rounded-xl whitespace-pre-wrap break-all sm:break-words overflow-x-hidden max-h-64 overflow-y-auto leading-relaxed select-all"
                    >
                      {generateFHIRMedicalBundle(ATHLETE_PROFILE, records, physicianNotes)}
                    </pre>
                  ) : (
                    <div className="bg-[#14241F] text-[#EAE4D7] p-3 rounded-xl overflow-x-auto max-h-64">
                      <table className="w-full text-right border-collapse text-[11px] font-mono-num">
                        <thead>
                          <tr className="border-b border-[#B8955A]/30 text-[#D4B886]">
                            <th className="py-1.5 px-2">التاريخ</th>
                            <th className="py-1.5 px-2">الاستشفاء</th>
                            <th className="py-1.5 px-2">HRV rMSSD</th>
                            <th className="py-1.5 px-2">SDNN</th>
                            <th className="py-1.5 px-2">RHR</th>
                            <th className="py-1.5 px-2">النوم (د)</th>
                            <th className="py-1.5 px-2">ACWR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAE4D7]/10">
                          {records.slice(-7).map((r) => (
                            <tr key={r.id}>
                              <td className="py-1.5 px-2">{r.date}</td>
                              <td className="py-1.5 px-2">{r.recoveryScore}%</td>
                              <td className="py-1.5 px-2">{r.hrv.rmssd} ms</td>
                              <td className="py-1.5 px-2">{r.hrv.sdnn} ms</td>
                              <td className="py-1.5 px-2">{r.restingHeartRate} bpm</td>
                              <td className="py-1.5 px-2">{r.sleep.totalMinutes}</td>
                              <td className="py-1.5 px-2">{r.acwr}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </IslamicChartCard>
          )}

          {/* HEALTH TRENDS TABLE & MEDICAL COMPLIANCE EXPORT (Medical Export Tab) */}
          {activeSection === 'medical-export' && (
            <IslamicChartCard className="p-3.5 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6DFD1] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#14241F]">
                    سجل القياسات الصحية اليومية والتصدير الطبي المعتمد (سباهي CBAHI / HL7 FHIR)
                  </h3>
                  <p className="text-xs text-[#5E5A50] mt-0.5">
                    إشراف: {ATHLETE_PROFILE.supervisingPhysician} · {ATHLETE_PROFILE.medicalCenter}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto no-print">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث بالتاريخ أو التمرين..."
                    className="px-3 py-1.5 text-xs bg-[#FAF7F0] border border-[#D5CBB8] rounded-lg focus:border-[#0B5D46] focus:outline-none flex-1 sm:w-44"
                  />

                  <div className="flex items-center gap-1 p-1 bg-[#EAE4D7] rounded-lg">
                    {[
                      { id: 'all', label: 'الكل' },
                      { id: 'optimal', label: 'مثالي' },
                      { id: 'moderate', label: 'متوسط' },
                      { id: 'strained', label: 'مجهد' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStatusFilter(tab.id as 'all' | RecoveryStatus)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                          statusFilter === tab.id
                            ? 'bg-[#FDFCF9] text-[#14241F] shadow-xs font-bold'
                            : 'text-[#5E5A50] hover:text-[#14241F]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadFile('fhir')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0B5D46] text-white rounded-lg hover:bg-[#084735] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>FHIR JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile('csv')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#14241F] text-white rounded-lg hover:bg-[#223831] cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>تصدير CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#EAE4D7] text-[#14241F] rounded-lg hover:bg-[#DFD8C8] cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة</span>
                  </button>
                </div>
              </div>

              {/* Mobile & Small Tablet Card Grid (<768px) — zero horizontal scrolling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:hidden">
                {filteredTableRecords.length === 0 ? (
                  <div className="col-span-full py-6 text-center text-xs text-[#5E5A50] bg-[#FAF7F0] rounded-lg border border-[#E6DFD1]">
                    <span>لا توجد سجلات مطابقة لمعايير التصفية الحالية.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('all');
                        setSearchQuery('');
                      }}
                      className="mr-2 text-[#0B5D46] font-bold underline cursor-pointer"
                    >
                      إعادة ضبط الفلتر
                    </button>
                  </div>
                ) : (
                  filteredTableRecords.map((rec) => {
                    const isSelected = rec.id === selectedRecord.id;
                    const badgeColor =
                      rec.recoveryStatus === 'optimal'
                        ? 'bg-[#0B5D46] text-white'
                        : rec.recoveryStatus === 'moderate'
                        ? 'bg-[#B45309] text-white'
                        : 'bg-[#B91C1C] text-white';
                    return (
                      <div
                        key={rec.id}
                        onClick={() => handleSelectRecord(rec.id)}
                        className={`p-3 rounded-xl border text-xs space-y-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#E5DEC9]/65 border-[#0B5D46] font-semibold'
                            : 'bg-[#FAF7F0] border-[#E6DFD1] hover:border-[#B8955A]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-mono-num font-bold text-[#14241F]">
                              {rec.date}
                            </span>
                            <span className="text-[#7A7264] mr-1 text-[11px]">
                              · {rec.dayLabel}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono-num text-[11px] font-bold ${badgeColor}`}
                          >
                            استشفاء {rec.recoveryScore}%
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-[11px] bg-[#FDFCF9] p-2 rounded-lg border border-[#E6DFD1] text-center">
                          <div>
                            <span className="text-[#7A7264] block">HRV rMSSD</span>
                            <strong dir="ltr" className="font-mono-num text-[#0B5D46] inline-block">
                              {rec.hrv.rmssd} ms
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#7A7264] block">نبض الراحة</span>
                            <strong dir="ltr" className="font-mono-num text-[#14241F] inline-block">
                              {rec.restingHeartRate} bpm
                            </strong>
                          </div>
                          <div>
                            <span className="text-[#7A7264] block">ACWR</span>
                            <strong
                              className={`font-mono-num ${
                                rec.acwr >= 1.3 ? 'text-[#B91C1C]' : 'text-[#14241F]'
                              }`}
                            >
                              {rec.acwr.toFixed(2)}
                            </strong>
                          </div>
                        </div>

                        <div className="text-[11px] text-[#3E3B34] truncate">
                          <strong className="text-[#0B5D46]">التوصية: </strong>
                          {rec.trainingSessionTitle}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop Table View (md+) */}
              <div className="hidden md:block overflow-x-auto bg-[#FAF7F0]/80 rounded-lg border border-[#E6DFD1]">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#DFD8C8] bg-[#F2ECE0] text-[#5E5A50]">
                      <th className="py-2.5 px-3 font-semibold">التاريخ الميلادي والهجري</th>
                      <th className="py-2.5 px-3 font-semibold">مؤشر الاستشفاء</th>
                      <th className="py-2.5 px-3 font-semibold text-left">HRV rMSSD</th>
                      <th className="py-2.5 px-3 font-semibold text-left">نبض الراحة</th>
                      <th className="py-2.5 px-3 font-semibold text-left">النوم الكلي (عميق/REM)</th>
                      <th className="py-2.5 px-3 font-semibold text-left">ACWR</th>
                      <th className="py-2.5 px-3 font-semibold">التوصية / الحصة التدريبية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6DFD1]">
                    {filteredTableRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#5E5A50]">
                          <span>لا توجد سجلات مطابقة لمعايير التصفية الحالية.</span>
                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter('all');
                              setSearchQuery('');
                            }}
                            className="mr-2 text-[#0B5D46] font-bold underline cursor-pointer"
                          >
                            إعادة ضبط الفلتر
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredTableRecords.map((rec) => {
                        const isSelected = rec.id === selectedRecord.id;
                        const barColor =
                          rec.recoveryStatus === 'optimal'
                            ? 'bg-[#0B5D46]'
                            : rec.recoveryStatus === 'moderate'
                            ? 'bg-[#B45309]'
                            : 'bg-[#B91C1C]';
                        return (
                          <tr
                            key={rec.id}
                            onClick={() => handleSelectRecord(rec.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-[#E5DEC9]/65 font-semibold' : 'hover:bg-[#F5F0E6]'
                            }`}
                          >
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="font-mono-num text-[#14241F]">{rec.date}</span>
                              <span className="text-[#7A7264] mr-1.5">· {rec.hijriDate}</span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-mono-num font-bold w-9">
                                  {rec.recoveryScore}%
                                </span>
                                <div className="w-16 h-2 bg-[#DFD8C8] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${barColor}`}
                                    style={{ width: `${rec.recoveryScore}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono-num text-left whitespace-nowrap text-[#0B5D46] font-semibold">
                              {rec.hrv.rmssd} ms
                            </td>
                            <td className="py-2.5 px-3 font-mono-num text-left whitespace-nowrap">
                              {rec.restingHeartRate} bpm
                            </td>
                            <td className="py-2.5 px-3 font-mono-num text-left whitespace-nowrap">
                              {formatHoursMinutes(rec.sleep.totalMinutes)} ({rec.sleep.deepMinutes}د /{' '}
                              {rec.sleep.remMinutes}د)
                            </td>
                            <td
                              className={`py-2.5 px-3 font-mono-num text-left whitespace-nowrap font-bold ${
                                rec.acwr >= 1.3 ? 'text-[#B91C1C]' : 'text-[#14241F]'
                              }`}
                            >
                              {rec.acwr.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-[#3E3B34] max-w-xs truncate">
                              {rec.trainingSessionTitle}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </IslamicChartCard>
          )}
        </main>
      </div>
    </div>
  );
}
