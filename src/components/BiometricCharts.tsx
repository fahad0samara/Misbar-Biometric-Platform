import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  Clock,
  Info,
  Play,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { DailyBiometricRecord } from '../types/biometrics';
import {
  GirihHeaderBorder,
  KhatimCornerOrnament,
  KhatimStarEmblem,
} from './IslamicPatterns';

interface BiometricRingProps {
  value: number;
  maxValue?: number;
  label: string;
  sublabel: string;
  adviceText?: string;
  unit?: string;
  color: string;
  trackColor?: string;
}

export const BiometricGaugeRing: React.FC<BiometricRingProps> = ({
  value,
  maxValue = 100,
  label,
  sublabel,
  adviceText,
  unit = '%',
  color,
}) => {
  const pct = Math.min(100, Math.max(8, Math.round((value / maxValue) * 100)));
  const statusLabel =
    pct >= 75 ? 'نطاق مثالي' : pct >= 55 ? 'نطاق متوسط' : 'يتطلب عناية';

  // Deterministic 7-bar mini trend heights based on current percentage
  const sparkHeights = [
    Math.max(25, pct - 14),
    Math.max(25, pct - 8),
    Math.min(100, pct + 4),
    Math.max(22, pct - 18),
    Math.max(28, pct - 6),
    Math.min(100, pct - 2),
    pct,
  ];

  return (
    <div className="w-full min-w-0 space-y-2.5">
      {/* Top Row: Label + Value + Mini 7-Bar Sparkline Chart */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-xs sm:text-sm font-bold text-[#14241F] block truncate">{label}</span>
          <div className="text-[11px] text-[#5E5A50] mt-0.5 leading-snug">{sublabel}</div>
        </div>

        <div className="flex items-end gap-2.5 shrink-0">
          <div
            className="flex items-end gap-0.5 h-8 px-1.5 py-1 rounded bg-[#FAF7F0] border border-[#E6DFD1]"
            aria-hidden="true"
          >
            {sparkHeights.map((h, idx) => (
              <span
                key={idx}
                className="w-1.5 rounded-t-xs transition-opacity duration-200"
                style={{
                  height: `${Math.max(20, h)}%`,
                  backgroundColor: idx === sparkHeights.length - 1 ? color : '#D5CBB8',
                }}
              />
            ))}
          </div>

          <div className="text-left" dir="ltr">
            <span className="text-xl sm:text-2xl font-bold font-mono-num text-[#14241F]">
              {value}
            </span>
            <span className="text-xs font-mono-num text-[#6E6A5F] ml-0.5">{unit}</span>
          </div>
        </div>
      </div>

      {/* Horizontal Multi-Zone Segmented Bar Gauge */}
      <div className="space-y-1">
        <div className="w-full h-2 bg-[#EAE4D7] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono-num text-[#7A7264]">
          <span>العتبة الدنيا</span>
          <span className="font-semibold" style={{ color }}>
            {statusLabel} · {pct}%
          </span>
          <span>الذروة الفسيولوجية</span>
        </div>
      </div>

      {/* Direct Actionable Advice Line (clean unboxed divider) */}
      {adviceText && (
        <div
          className="text-[11px] font-medium pt-2 border-t border-[#E6DFD1] leading-snug"
          style={{ color }}
        >
          التوجيه اليومي: {adviceText}
        </div>
      )}
    </div>
  );
};

export interface StretchingExercise {
  title: string;
  durationOrSets: string;
  targetTissue: string;
  instructions: string;
}

export interface MuscleRegionData {
  id: string;
  name: string;
  shortTag: string;
  anatomicalName: string;
  view: 'المنظر الأمامي' | 'المنظر الخلفي' | 'كلا المنظرين';
  readiness: number;
  statusLabel: string;
  strainLevel: 'optimal' | 'moderate' | 'high';
  color: string;
  loadShareAU: number;
  recoveryProtocol: string;
  stretchingExercises: StretchingExercise[];
  modalities: {
    thermalProtocol: string;
    myofascialRelease: string;
    clinicalPrecaution: string;
  };
}

const getToneColor = (score: number) => {
  if (score >= 76) return '#0B5D46'; // Emerald Optimal
  if (score >= 55) return '#D97706'; // Amber Moderate Fatigue
  return '#DC2626'; // Crimson High Risk / Strained
};

export function buildMuscleRegions(
  record: DailyBiometricRecord,
  completedProtocols: Record<string, boolean> = {}
): MuscleRegionData[] {
  const base = record.recoveryScore;
  const acwrPenalty = record.acwr >= 1.3 ? 28 : record.acwr >= 1.2 ? 12 : 0;
  const bonus = (id: string) => (completedProtocols[id] ? 5 : 0);

  const cardiacScore = Math.min(99, Math.max(38, base + 5 + bonus('cardiac-autonomic')));
  const shouldersChestScore = Math.min(98, Math.max(60, base + 8 + bonus('upper-shoulders')));
  const coreHipScore = Math.min(
    96,
    Math.max(48, base - Math.round(acwrPenalty * 0.4) + bonus('core-lowerback'))
  );
  const quadsScore = Math.min(
    95,
    Math.max(42, base - Math.round(acwrPenalty * 0.7) + bonus('quads-tibialis'))
  );
  const hamstringsGlutesScore = Math.min(
    94,
    Math.max(38, base - Math.round(acwrPenalty * 0.85) + bonus('hamstrings-glutes'))
  );
  const calvesAchillesScore = Math.min(
    93,
    Math.max(32, base - acwrPenalty - 4 + bonus('calves-achilles'))
  );

  return [
    {
      id: 'calves-achilles',
      name: 'عضلة السمانة ووتر العرقوب',
      shortTag: 'السمانة والعرقوب',
      anatomicalName: 'Gastrocnemius · Soleus · Achilles Tendon',
      view: 'المنظر الخلفي',
      readiness: calvesAchillesScore,
      statusLabel:
        calvesAchillesScore < 55
          ? 'إجهاد وتري حرج — خطر إصابة'
          : calvesAchillesScore < 76
          ? 'تيبس عضلي متوسط'
          : 'جاهزية ميكانيكية ممتازة',
      strainLevel:
        calvesAchillesScore < 55 ? 'high' : calvesAchillesScore < 76 ? 'moderate' : 'optimal',
      color: getToneColor(calvesAchillesScore),
      loadShareAU: Math.round(record.acuteLoad * 0.34),
      recoveryProtocol:
        calvesAchillesScore < 55
          ? 'تجنب الجري السريع والقفز لمدة 48 ساعة، تطبيق تمارين الثبات المتساوي الطول (Isometric Calf Holds 5×45s) وغمر بالماء البارد.'
          : 'إحماء تدريجي لمفصل الكاحل وتمارين تقوية العضلة النعلية بعد التمرين.',
      stretchingExercises: [
        {
          title: 'إطالة السمانة والعضلة النعلية على الجدار (Bent-Knee Soleus Wall Stretch)',
          durationOrSets: '4 جولات × 45 ثانية لكل ساق',
          targetTissue: 'العضلة النعلية العميقة (Soleus) ووتر العرقوب السفلي',
          instructions:
            'قف بمواجهة الجدار مع وضع قدم خلف الأخرى، اثنِ الركبة الخلفية ببطء مع إبقاء الكعب ملتصقاً بالأرض تماماً حتى تشعر بإطالة عميقة أسفل السمانة دون ألم حاد.',
        },
        {
          title: 'التحميل المتساوي الطول لوتر العرقوب (Isometric Achilles Tendon Hold)',
          durationOrSets: '5 جولات × 45 ثانية (راحة دقيقة بين الجولات)',
          targetTissue: 'نسيج الكولاجين في وتر العرقوب (Mid-portion Achilles)',
          instructions:
            'ارفع كعبيك عن الأرض بمنتصف المدى الحركي (زاوية 30 درجة) واثبت في مكانك؛ يحفز هذا التمرين تسكين الألم العصبي وإعادة ترتيب ألياف الكولاجين.',
        },
        {
          title: 'الإطالة اللامركزية البطيئة على الدرج (Eccentric Heel Drop — Alfredson Protocol)',
          durationOrSets: '3 جولات × 12 تكراراً بطيئاً (4 ثوانٍ نزول)',
          targetTissue: 'العضلة التوأمية الساقية (Gastrocnemius) واللفافة الأخمصية',
          instructions:
            'اصعد بكلتا القدمين على حافة درجة، ثم انزل ببطء شديد على قدم واحدة لمدة 4 ثوانٍ حتى يهبط الكعب قليلاً تحت مستوى الدرجة، ثم اصعد بالقدم السليمة.',
        },
      ],
      modalities: {
        thermalProtocol:
          'غمر الساقين في ماء بارد (12–14°C) لمدة 10 دقائق عقب الجري الطويل لتخفيف الوذمة الموضعية.',
        myofascialRelease:
          'تدليك لطيف بأسطوانة الفوم لبطن عضلة السمانة مع تجنب الضغط المباشر على وتر العرقوب الملتهب.',
        clinicalPrecaution:
          'يُحظر إجراء إطالة قسرية عنيفة إذا كان هناك ألم صباحي عند أول خطوات المشي.',
      },
    },
    {
      id: 'hamstrings-glutes',
      name: 'عضلات الفخذ الخلفية والألوية',
      shortTag: 'الفخذ الخلفية',
      anatomicalName: 'Biceps Femoris · Semitendinosus · Gluteus',
      view: 'المنظر الخلفي',
      readiness: hamstringsGlutesScore,
      statusLabel:
        hamstringsGlutesScore < 55
          ? 'إجهاد ألياف مرتفع'
          : hamstringsGlutesScore < 76
          ? 'حمل انتقالي متوسط'
          : 'ألياف مستشفية بالكامل',
      strainLevel:
        hamstringsGlutesScore < 55
          ? 'high'
          : hamstringsGlutesScore < 76
          ? 'moderate'
          : 'optimal',
      color: getToneColor(hamstringsGlutesScore),
      loadShareAU: Math.round(record.acuteLoad * 0.24),
      recoveryProtocol:
        hamstringsGlutesScore < 70
          ? 'جلسة تحرير لفافي (Foam Rolling) مع إطالة حركية خفيفة وتجنب تكرارات السرعة القصوى.'
          : 'جاهزة لاستيعاب سرعات عتبة اللاكتات وتدريبات المرتفعات.',
      stretchingExercises: [
        {
          title:
            'إطالة الفخذ الخلفية العصبية الحركية في وضع الاستلقاء (Supine Active PNF Hamstring Stretch)',
          durationOrSets: '3 جولات × 40 ثانية لكل ساق',
          targetTissue: 'العضلة ذات الرأسين الفخذية (Biceps Femoris) والوتر النصف وتري',
          instructions:
            'استلقِ على ظهرك وارفع ساقاً واحدة بزاوية 90 درجة في الورك مع مسك خلف الفخذ، ثم افرد الركبة تدريجياً للأعلى مع شد مشط القدم نحوك ببطء.',
        },
        {
          title: 'إطالة عضلة الكمثرى والألوية العميقة (Figure-4 Piriformis & Glute Stretch)',
          durationOrSets: '3 جولات × 45 ثانية لكل جانب',
          targetTissue: 'العضلة الألوية الكبرى والوسطى وعضلة الكمثرى (Piriformis)',
          instructions:
            'ضع كاحل القدم اليمنى فوق ركبة اليسرى وأنت مستلقٍ، ثم اسحب الفخذ الأيسر نحو الصدر بهدوء لتفريغ الشد المتراكم حول مفصل الورك والعصب الوركي.',
        },
        {
          title: 'جسر الألوية المتساوي الطول (Isometric Glute-Hamstring Bridge)',
          durationOrSets: '4 جولات × 30 ثانية ثبات',
          targetTissue: 'المنشأ العلوي لعضلات الفخذ الخلفية والحوض',
          instructions:
            'ارفع الحوض عن الأرض مع إبقاء الركبتين مثنيتين بزاوية 110 درجات، واثبت مع شد عضلات الألوية لتنشيط التروية الدموية دون إجهاد ميكانيكي.',
        },
      ],
      modalities: {
        thermalProtocol:
          'كمادات دافئة أو حمام دافئ (38°C) لمدة 12 دقيقة قبل تمارين الإطالة المسائية لزيادة مرونة الألياف.',
        myofascialRelease:
          'استخدام الكرة العلاجية (Lacrosse Ball) تحت عضلات الألوية لمدة 90 ثانية لكل جانب.',
        clinicalPrecaution:
          'تجنب الانحناء الأمامي العنيف والركبة مفرودة بالكامل في الصباح الباكر.',
      },
    },
    {
      id: 'quads-tibialis',
      name: 'عضلات الفخذ الرباعية والقصبة الأمامية',
      shortTag: 'الفخذ الرباعية',
      anatomicalName: 'Quadriceps Femoris · Vastus Medialis · Tibialis',
      view: 'المنظر الأمامي',
      readiness: quadsScore,
      statusLabel:
        quadsScore < 55
          ? 'إجهاد ميكانيكي عالٍ'
          : quadsScore < 76
          ? 'استشفاء جزئي'
          : 'قوة انقباض مثالية',
      strainLevel: quadsScore < 55 ? 'high' : quadsScore < 76 ? 'moderate' : 'optimal',
      color: getToneColor(quadsScore),
      loadShareAU: Math.round(record.acuteLoad * 0.22),
      recoveryProtocol:
        quadsScore < 70
          ? 'كمادات باردة/دافئة متناوبة وتخفيف الجري على المنحدرات الصلبة.'
          : 'الاستمرار في برنامج القوة الانفجارية المعتاد.',
      stretchingExercises: [
        {
          title:
            'إطالة الفخذ الرباعية ومثنيات الورك بنصف الركوع (Couch / Half-Kneeling Quad Stretch)',
          durationOrSets: '3 جولات × 45 ثانية لكل ساق',
          targetTissue: 'العضلة المستقيمة الفخذية (Rectus Femoris) والعضلة الحرقفية القطنية',
          instructions:
            'ارتكز على ركبة واحدة فوق وسادة لينة مع إسناد مشط القدم الخلفية على جدار أو مقعد، وحافظ على استقامة الجذع وإمالة الحوض للخلف قليلاً.',
        },
        {
          title:
            'إطالة العضلة الظنبوبية الأمامية ومفصل الكاحل (Seated Tibialis Anterior Stretch)',
          durationOrSets: '3 جولات × 35 ثانية',
          targetTissue: 'العضلة الظنبوبية الأمامية (Tibialis Anterior) والوقاية من جبائر الساق',
          instructions:
            'اجلس على كعبيك فوق بساط مريح مع بسط مشط القدمين بالكامل على الأرض لتخفيف الشد الناتج عن امتصاص الصدمات أثناء الجري على الأسفلت.',
        },
        {
          title: 'تحريك الرضفة والرباط الرضفي (Patellar Mobility & VMO Activation)',
          durationOrSets: '3 جولات × 15 تكراراً هادئاً',
          targetTissue: 'العضلة المتسعة الإنسية (Vastus Medialis Oblique) والرباط الرضفي',
          instructions:
            'مد الساق بالكامل على الأرض مع وضع منشفة ملفوفة تحت الركبة، واضغط بالركبة لأسفل لمدة 5 ثوانٍ مع شد عضلة الفخذ الداخلية.',
        },
      ],
      modalities: {
        thermalProtocol:
          'التباين المائي (دقيقتان ماء دافئ / دقيقة ماء بارد × 3 دورات) لتسريع تصريف مستقلبات الجهد.',
        myofascialRelease:
          'دحرجة الفخذ الأمامية والجانبية (IT Band المحاذي) بأسطوانة الفوم الملساء لمدة دقيقتين.',
        clinicalPrecaution: 'لا تضغط على الركبة بزاوية ثني كاملة إذا كان هناك تورم حول الرضفة.',
      },
    },
    {
      id: 'core-lowerback',
      name: 'عضلات الجذع وأسفل الظهر القطني',
      shortTag: 'الجذع والظهر',
      anatomicalName: 'Rectus Abdominis · Obliques · Erector Spinae',
      view: 'كلا المنظرين',
      readiness: coreHipScore,
      statusLabel:
        coreHipScore < 55
          ? 'إجهاد ثبات الحوض'
          : coreHipScore < 76
          ? 'جاهزية متوسطة'
          : 'ثبات محوري ممتاز',
      strainLevel: coreHipScore < 55 ? 'high' : coreHipScore < 76 ? 'moderate' : 'optimal',
      color: getToneColor(coreHipScore),
      loadShareAU: Math.round(record.acuteLoad * 0.12),
      recoveryProtocol: 'تمارين ثبات الحوض والفقرات القطنية لمدة 12 دقيقة قبل الحصة التدريبية.',
      stretchingExercises: [
        {
          title: 'تفريغ ضغط الفقرات القطنية (Cat-Cow & Child Pose Decompression)',
          durationOrSets: '3 جولات × 60 ثانية مع تنفس حجابي عميق',
          targetTissue: 'العضلات الناصبة للفقار (Erector Spinae) واللفافة الصدرية القطنية',
          instructions:
            'ارتكز على اليدين والركبتين وقوّس الظهر للأعلى مع الزفير، ثم اثنِ الوركين للخلف فوق الكعبين مع مد الذراعين للأمام لتوسيع المسافات بين الفقرات.',
        },
        {
          title: 'إطالة الدوران القطني والعضلة المربعة القطنية (Supine Spinal Twist)',
          durationOrSets: '3 جولات × 40 ثانية لكل جهة',
          targetTissue: 'العضلات المائلة البطنية (Obliques) والعضلة المربعة القطنية (QL)',
          instructions:
            'استلقِ على ظهرك واثنِ ركبتك اليمنى باتجاه الجانب الأيسر مع إبقاء الكتفين ملتصقين بالأرض تماماً وأخذ 6 أنفاس بطيئة.',
        },
        {
          title: 'التنشيط المتقاطع لثبات الجذع (McGill Bird-Dog Core Stabilization)',
          durationOrSets: '3 جولات × 8 تكرارات (ثبات 6 ثوانٍ)',
          targetTissue: 'العضلة المستعرضة البطنية والعضلات العديدة الفلوح (Multifidus)',
          instructions:
            'مد الذراع اليمنى للأمام والساق اليسرى للخلف في خط أفقي واحد دون تقويس أسفل الظهر لحماية العمود الفقري أثناء الجري الطويل.',
        },
      ],
      modalities: {
        thermalProtocol:
          'كمادة حرارية رطبة على المنطقة القطنية لمدة 15 دقيقة في حال الشعور بتيبس بعد الجري.',
        myofascialRelease:
          'تدليك جانبي العمود الفقري بكرة مزدوجة (Peanut Ball) دون الضغط على النتوءات الشوكية.',
        clinicalPrecaution: 'حافظ على حيادية الحوض وتجنب فرط بسط الظهر.',
      },
    },
    {
      id: 'cardiac-autonomic',
      name: 'القلب والجهاز العصبي المستقل (العصب الحائر)',
      shortTag: 'القلب وHRV',
      anatomicalName: 'Cardiac Autonomic Plexus · Vagus Nerve (HRV)',
      view: 'المنظر الأمامي',
      readiness: cardiacScore,
      statusLabel:
        record.hrv.deviationPercent <= -15
          ? 'هيمنة ودية — تثبيط لاودي'
          : 'سيادة لاودية ممتازة (HRV مرتفع)',
      strainLevel:
        cardiacScore < 55 ? 'high' : cardiacScore < 76 ? 'moderate' : 'optimal',
      color: getToneColor(cardiacScore),
      loadShareAU: Math.round(record.acuteLoad * 0.08),
      recoveryProtocol: `قراءة HRV rMSSD الصباحية ${record.hrv.rmssd} ms ونبض الراحة ${record.restingHeartRate} bpm. ينصح بالتنفس الرنيني البطيء (5.5 نفس/دقيقة) قبل النوم.`,
      stretchingExercises: [
        {
          title:
            'بروتوكول التنفس الرنيني لتنشيط العصب الحائر (Resonance Frequency Breathing 5.5 bpm)',
          durationOrSets: 'جلسة واحدة × 10 دقائق (شهيق 4.5 ثانية / زفير 6.5 ثانية)',
          targetTissue: 'العصب الحائر (Vagus Nerve) ومستقبلات الضغط الشرياني (Baroreceptors)',
          instructions:
            'استلقِ في غرفة هادئة، خذ شهيقاً هادئاً من الأنف بتوسيع الحجاب الحاجز لمدة 4.5 ثانية، ثم أخرج الزفير ببطء لمدة 6.5 ثانية؛ يرفع هذا التمرين مؤشر HRV rMSSD مباشرة.',
        },
        {
          title:
            'إطالة القفص الصدري والحجاب الحاجز (Thoracic Expansion & Diaphragmatic Release)',
          durationOrSets: '3 جولات × 45 ثانية',
          targetTissue: 'عضلة الحجاب الحاجز والعضلات الوربية بين الأضلاع',
          instructions:
            'افتح الذراعين بزاوية 90 درجة مع سند أعلى الظهر على أسطوانة فوم أفقية، وخذ شهيقاً عميقاً لتوسيع القفص الصدري وخفض معدل التنفس الليلي.',
        },
        {
          title:
            'رفع الساقين السلبي على الجدار لتعزيز العود الوريدي (Passive Legs-Up-The-Wall Parasympathetic Reset)',
          durationOrSets: 'جلسة واحدة × 8–12 دقيقة بعد التمرين',
          targetTissue: 'الدورة الدموية الوريدية والمنعكس القلبي اللاودي',
          instructions:
            'استلقِ على الأرض وارفع ساقيك عمودياً على الجدار؛ يساعد ذلك على عودة الدم للقلب دون جهد وخفض نبض الراحة بمقدار 4–6 نبضات/دقيقة.',
        },
      ],
      modalities: {
        thermalProtocol:
          'غسل الوجه والرقبة بماء بارد لتحفيز منعكس الغوص الثديي (Mammalian Dive Reflex) وتنشيط العصب الحائر.',
        myofascialRelease:
          'تحرير لطيف لعضلات الرقبة الجانبية وتحت القذال (Suboccipital Release).',
        clinicalPrecaution:
          'إذا انخفض HRV بأكثر من 20% مع ارتفاع حرارة الجلد +0.5°C، أوقف التدريب عالي الشدة فوراً.',
      },
    },
    {
      id: 'upper-shoulders',
      name: 'الحزام الكتفي والصدري العلوي',
      shortTag: 'الكتف والصدر',
      anatomicalName: 'Deltoids · Pectoralis · Trapezius',
      view: 'كلا المنظرين',
      readiness: shouldersChestScore,
      statusLabel: 'جاهزية عالية',
      strainLevel: 'optimal',
      color: getToneColor(shouldersChestScore),
      loadShareAU: Math.round(record.acuteLoad * 0.05),
      recoveryProtocol: 'مرونة الكتفين وحركة الذراعين الإيقاعية أثناء الجري في حالة مثالية.',
      stretchingExercises: [
        {
          title:
            'إطالة العضلة الصدرية الكبرى والكتف الأمامي على إطار الباب (Doorway Pectoralis Stretch)',
          durationOrSets: '3 جولات × 35 ثانية',
          targetTissue: 'العضلة الصدرية الكبرى والصغرى والدالية الأمامية',
          instructions:
            'ضع الساعدين على جانبي إطار الباب بزاوية 90 درجة وتقدم خطوة للأمام لفتح الصدر وتحسين كفاءة حركة الذراعين واقتصاد الجري (Running Economy).',
        },
        {
          title:
            'إطالة العضلة شبه المنحرفة العلوية والعنق (Upper Trapezius & Levator Scapulae Release)',
          durationOrSets: '3 جولات × 30 ثانية لكل جانب',
          targetTissue: 'أعلى الكتفين والرقبة',
          instructions:
            'أمل الرأس بلطف نحو الكتف المقابل مع خفض الكتف لأسفل لتفريغ الشد الناتج عن تثبيت الذراعين خلال الجري لمسافات طويلة.',
        },
        {
          title: 'دوران العمود الفقري الصدري (Open-Book Thoracic Mobility)',
          durationOrSets: '3 جولات × 10 تكرارات لكل جانب',
          targetTissue: 'المفاصل الصدرية والعضلات المعينية بين لوحي الكتف',
          instructions:
            'استلقِ على جانبك مع ثني الركبتين وافتح الذراع العلوية للجهة المقابلة في قوس كامل مع متابعتها بنظرك.',
        },
      ],
      modalities: {
        thermalProtocol: 'دش دافئ على منطقة الكتفين وأعلى الظهر لمدة 5 دقائق.',
        myofascialRelease: 'تحرير النقاط الزنادية بين لوحي الكتف.',
        clinicalPrecaution:
          'تجنب رفع الكتفين نحو الأذنين أثناء التعب في الكيلومترات الأخيرة من الجري.',
      },
    },
  ];
}

const MASSAGE_PROTOCOLS_BY_MUSCLE: Record<
  string,
  {
    technique: string;
    tool: string;
    duration: string;
    pressure: string;
    direction: string;
    steps: string;
  }
> = {
  'calves-achilles': {
    technique: 'التدليك التصاعدي العميق لبطن السمانة وتحرير اللفافة الأخمصية',
    tool: 'أسطوانة الفوم المضغوطة (Foam Roller) + كرة تدليك صغيرة لقوس القدم',
    duration: '8 دقائق (4 دقائق لكل ساق)',
    pressure: 'متوسط (6/10) على بطن السمانة، وخفيف جداً (2/10) قرب وتر العرقوب',
    direction: 'من فوق الكعب صعوداً باتجاه باطن الركبة (مع اتجاه العائد الوريدي)',
    steps:
      'ضع الساق فوق أسطوانة الفوم ودحرج ببطء من أعلى وتر العرقوب حتى أسفل الركبة مع تدوير القدم للداخل والخارج لاستهداف الرأس الإنسي والوحشي للسمانة، وتوقف 20 ثانية عند نقاط الشد العضلي مع التنفس العميق.',
  },
  'hamstrings-glutes': {
    technique: 'تحرير نقاط الزناد العميقة في الألوية وتدليك الألياف الطولية الخلفية',
    tool: 'كرة التدليك المطاطية (Lacrosse Ball) للألوية + أسطوانة الفوم للأوتار الخلفية',
    duration: '10 دقائق (5 دقائق لكل جانب)',
    pressure: 'متوسط إلى عميق (6/10) مع تجنب الضغط المباشر على عظم الجلوس',
    direction: 'دوائر بطيئة على العضلة الألوية والكمثرية ومسارات طولية صاعدة خلف الفخذ',
    steps:
      'اجلس بزاوية مائلة على كرة التدليك تحت العضلة الألوية لمدة 60 ثانية لتحرير العقد العضلية العميقة، ثم استخدم أسطوانة الفوم تحت الفخذ الخلفي بحركات انسيابية بطيئة من فوق الركبة حتى الحوض.',
  },
  'quads-tibialis': {
    technique: 'تحرير اللفافة العضلية البطيء للفخذ الرباعية والظنبوب الأمامي',
    tool: 'أسطوانة الفوم متوسطة الكثافة أو جهاز التدليك الإيقاعي (سرعة منخفضة 1800 RPM)',
    duration: '8 دقائق (4 دقائق لكل فخذ)',
    pressure: 'متوسط ومضبوط (5/10) لتجنب إثارة مستقبلات الألم الأمامية',
    direction: 'من أعلى الرضفة (الركبة) صعوداً نحو مفصل الورك',
    steps:
      'استلقِ بوضعية البلانك الأمامي فوق أسطوانة الفوم ومررها ببطء بمعدل 2 سم/ثانية على طول الفخذ الأمامي والجانب الوحشي، مع ثني الركبة وبسطها ببطء عند النقاط المشدودة لتحرير الالتصاقات اللفافية.',
  },
  'core-lowerback': {
    technique: 'تحرير العضلات الموازية للعمود الفقري ومثنيات الورك (Paraspinal & Psoas Release)',
    tool: 'كرة التدليك المزدوجة (Peanut Ball) على جانبي الفقرات — وليس فوق العظام مباشرة',
    duration: '7 دقائق',
    pressure: 'خفيف إلى متوسط (4/10) متزامن مع التنفس الحجابي العميق',
    direction: 'على امتداد العضلات الناصبة للعمود الفقري من أعلى الحوض حتى منتصف الظهر',
    steps:
      'استند بظهرك على الحائط مع وضع الكرة المزدوجة على العضلات الجانبية الموازية للفقرات القطنية والصدرية، وتحرك ببطء للأعلى والأسفل مع إخراج زفير طويل لإرخاء التشنج العضلي العميق.',
  },
  'upper-shoulders': {
    technique: 'تحرير نقاط الزناد في العضلة شبه المنحرفة ولوح الكتف والصدر',
    tool: 'كرة التدليك على الحائط (Wall Ball) أو التدليك اليدوي بزيت المغنيسيوم',
    duration: '6 دقائق (3 دقائق لكل جانب)',
    pressure: 'متوسط ومريح (5/10)',
    direction: 'ضغط ثابت لمدة 20 ثانية على النقاط المتصلبة يليه مسارات دائرية صغيرة',
    steps:
      'ثبت كرة التدليك بين المنطقة المحيطة بلوح الكتف والحائط، واضغط برفق مع تحريك الذراع ببطء للأعلى والأسفل في قوس مريح لفك التوتر المتراكم في الكفة المدورة وأعلى الكتف.',
  },
  'cardiac-autonomic': {
    technique: 'التدليك العصبي الهادئ لتنشيط العصب الحائر وقاعدة الجمجمة (Vagal & Suboccipital Release)',
    tool: 'أطراف الأصابع اليدوية بضغط ناعم جداً أو وسادة الاسترخاء العنقية',
    duration: '5 دقائق',
    pressure: 'خفيف ولطيف جداً (2/10)',
    direction: 'مسارات هادئة من خلف الأذن وقاعدة الجمجمة نزولاً نحو الترقوة',
    steps:
      'استلقِ في إضاءة خافتة ودلك العضلات تحت القفوية أسفل الرأس وجانبي الرقبة بحركات دائرية بطيئة جداً مع إطالة زمن الزفير (4 ثوانٍ شهيق / 6 ثوانٍ زفير) لخفض نبض القلب ورفع HRV.',
  },
};

const COOLING_PROTOCOLS_BY_MUSCLE: Record<
  string,
  {
    modality: string;
    temperature: string;
    duration: string;
    timing: string;
    physiologicalBenefit: string;
    steps: string;
  }
> = {
  'calves-achilles': {
    modality: 'الغمر المائي البارد للساقين + رفع الساقين (Cold Immersion + Legs-Up-The-Wall)',
    temperature: '12°C – 14°C (54°F – 57°F)',
    duration: '8 دقائق غمر بارد + 10 دقائق رفع الساقين',
    timing: 'خلال 30 دقيقة بعد التمرين أو في المساء',
    physiologicalBenefit:
      'تضييق الأوعية الدموية لتقليل الوذمة المجهرية حول غمد وتر العرقوب وتسريع التصريف اللمفاوي.',
    steps:
      'اغمر القدمين والساقين حتى الركبة في دلو ماء بارد (12–14°C) لمدة 8 دقائق، ثم جففهما واستلقِ على ظهرك مع رفع الساقين عمودياً على الحائط لمدة 10 دقائق لتفريغ الاحتقان الوريدي.',
  },
  'hamstrings-glutes': {
    modality: 'العلاج المائي المتناوب للسلسلة الخلفية (Contrast Water Therapy - CWT)',
    temperature: 'تناوب 12°C بارد (دقيقة) ↔ 38°C دافئ (دقيقتان)',
    duration: '12 دقيقة (4 دورات متتالية)',
    timing: 'بعد الحصص التدريبية عالية الشدة أو تمارين السرعة',
    physiologicalBenefit:
      'تنشيط الضخ الوعائي الدموي وإزالة نواتج الأيض الخلوي دون التسبب في تيبس الأوتار الخلفية.',
    steps:
      'ابدأ بدقيقتين من الماء الدافئ لإرخاء الألياف الخلفية، ثم انتقل لدقيقة كاملة من الماء البارد لتخفيف الالتهاب المجهري، وكرر الدورة 4 مرات متتالية مع الختام بالماء البارد.',
  },
  'quads-tibialis': {
    modality: 'حوض التبريد المائي للنصف السفلي (Lower-Body Cryotherapy Bath)',
    temperature: '11°C – 13°C (52°F – 55°F)',
    duration: '8 إلى 10 دقائق متواصلة',
    timing: 'خلال 45 دقيقة بعد انتهاء الحمل العضلي',
    physiologicalBenefit:
      'خفض إنزيم الكرياتين كيناز (CK) وتقليل ألم العضلات المتأخر (DOMS) في ألياف الفخذ الرباعية.',
    steps:
      'اجلس في حوض الماء البارد حتى مستوى أعلى الوركين مع الحفاظ على دفء الجزء العلوي من الجسم والتنفس البطني الهادئ لمدة 8–10 دقائق، ثم اترك العضلات تستعيد حرارتها تدريجياً في الغرفة.',
  },
  'core-lowerback': {
    modality: 'التهدئة الحرارية المتبوعة بكمادة تبريد موضعية لطيفة (Thermal-Cool Lumbar Contrast)',
    temperature: '39°C دافئ (8 دقائق) ثم 16°C تبريد معتدل (4 دقائق)',
    duration: '12 دقيقة إجمالاً',
    timing: 'في الفترة المسائية قبل تمارين الإطالة',
    physiologicalBenefit:
      'فك التشنج العضلي الانعكاسي في أسفل الظهر أولاً ثم تهدئة الالتهاب المفصلي الموضعي.',
    steps:
      'تجنب وضع الثلج المباشر فوراً على أسفل الظهر المتشنج؛ ابدأ بكمادة دافئة لـ 8 دقائق لإرخاء العضلات الناصبة للعمود الفقري، ثم اختم بـ 4 دقائق من التبريد الموضعي المعتدل.',
  },
  'upper-shoulders': {
    modality: 'كمادات التبريد الموضعية للكتف مع تيار مائي متناوب (Cryo-Shoulder Wrap)',
    temperature: '13°C – 15°C',
    duration: '8 دقائق',
    timing: 'بعد تمارين الجزء العلوي أو عند الشعور بإجهاد الكتف',
    physiologicalBenefit:
      'تهدئة أوتار الكفة المدورة (Rotator Cuff) وتخفيف الاحتقان في المفصل الأخرمي الترقوي.',
    steps:
      'ضع كمادة الجل المبردة (ملفوفة بقماش قطني رقيق) حول الكتف الأمامي والعلوي لمدة 8 دقائق مع إسناد الذراع بالكامل على وسادة مريحة لإلغاء شد الجاذبية.',
  },
  'cardiac-autonomic': {
    modality: 'التبريد الوجْهي والعنقي لتحفيز منعكس الغوص اللاودي (Mammalian Dive Reflex Cooling)',
    temperature: '10°C – 12°C (ماء بارد أو كمادة باردة) + غرفة نوم 18°C',
    duration: '3 دقائق (تطبيق متقطع 30 ثانية × 4 مرات)',
    timing: 'عند ارتفاع التوتر العصبي أو قبل النوم بـ 60 دقيقة',
    physiologicalBenefit:
      'تحفيز فوري للعصب الثلاثي التوائم والعصب الحائر مما يخفض معدل ضربات القلب ويرفع مؤشر HRV خلال دقائق.',
    steps:
      'ضع كمادة ماء بارد (10–12°C) على الجبهة وحول العينين والجانب الأمامي للرقبة لمدة 30 ثانية مع زفير بطيء، وكرر ذلك 4 مرات لتهيئة الجهاز العصبي للدخول في النوم العميق.',
  },
};

export const AnatomicalRecoveryMap: React.FC<{
  record: DailyBiometricRecord;
  showExtendedCards?: boolean;
}> = ({ record, showExtendedCards = false }) => {
  const [completedProtocols, setCompletedProtocols] = useState<Record<string, boolean>>({});
  const [modalMuscleId, setModalMuscleId] = useState<string | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<
    'all' | 'stretching' | 'massage' | 'cooling'
  >('all');
  const [bodyViewFilter, setBodyViewFilter] = useState<'both' | 'anterior' | 'posterior'>('both');
  const [selectedMuscleId, setSelectedMuscleId] = useState<string>('calves-achilles');
  const [hoveredMuscleId, setHoveredMuscleId] = useState<string | null>(null);

  // Interactive Protocol Timer inside the modal (supports Stretching, Massage, and Cooling)
  const [timerSeconds, setTimerSeconds] = useState<number>(45);
  const [timerInitialSeconds, setTimerInitialSeconds] = useState<number>(45);
  const [timerLabel, setTimerLabel] = useState<string>('مؤقت تمرين الإطالة');
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Close modal on Escape key
  useEffect(() => {
    if (!modalMuscleId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalMuscleId(null);
        setTimerRunning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalMuscleId]);

  const startCustomTimer = (seconds: number, label: string) => {
    setTimerInitialSeconds(seconds);
    setTimerSeconds(seconds);
    setTimerLabel(label);
    setTimerRunning(true);
  };

  const muscleRegions = useMemo(
    () => buildMuscleRegions(record, completedProtocols),
    [record, completedProtocols]
  );

  const filteredMuscleList = useMemo(() => {
    if (bodyViewFilter === 'both') return muscleRegions;
    if (bodyViewFilter === 'anterior') {
      return muscleRegions.filter(
        (m) => m.view === 'المنظر الأمامي' || m.view === 'كلا المنظرين'
      );
    }
    return muscleRegions.filter(
      (m) => m.view === 'المنظر الخلفي' || m.view === 'كلا المنظرين'
    );
  }, [muscleRegions, bodyViewFilter]);

  // Ensure selectedMuscleId is always valid for the active view filter sub-tab
  const handleSwitchBodyView = (nextView: 'both' | 'anterior' | 'posterior') => {
    setBodyViewFilter(nextView);
    if (nextView === 'anterior') {
      const current = muscleRegions.find((m) => m.id === selectedMuscleId);
      if (!current || current.view === 'المنظر الخلفي') {
        setSelectedMuscleId('quads-tibialis');
      }
    } else if (nextView === 'posterior') {
      const current = muscleRegions.find((m) => m.id === selectedMuscleId);
      if (!current || current.view === 'المنظر الأمامي') {
        setSelectedMuscleId('calves-achilles');
      }
    }
  };

  const activeMuscle =
    filteredMuscleList.find((m) => m.id === (hoveredMuscleId || selectedMuscleId)) ||
    filteredMuscleList[0] ||
    muscleRegions[0];

  const modalMuscle = modalMuscleId
    ? muscleRegions.find((m) => m.id === modalMuscleId) || null
    : null;

  const getMuscleColor = (id: string) => {
    const found = muscleRegions.find((m) => m.id === id);
    return found ? found.color : '#0B5D46';
  };

  const openMuscleModal = (
    id: string,
    e?: React.MouseEvent,
    initialTab: 'all' | 'stretching' | 'massage' | 'cooling' = 'all'
  ) => {
    if (e) e.stopPropagation();
    setSelectedMuscleId(id);
    setModalMuscleId(id);
    setModalActiveTab(initialTab);
    setTimerRunning(false);
    if (initialTab === 'massage') {
      setTimerInitialSeconds(90);
      setTimerSeconds(90);
      setTimerLabel('مؤقت جلسة التدليك واللفافة');
    } else if (initialTab === 'cooling') {
      setTimerInitialSeconds(120);
      setTimerSeconds(120);
      setTimerLabel('مؤقت جلسة التبريد الموضعي');
    } else {
      setTimerInitialSeconds(45);
      setTimerSeconds(45);
      setTimerLabel('مؤقت تمرين الإطالة');
    }
  };

  const navigateModalMuscle = (dir: 'prev' | 'next') => {
    if (!modalMuscleId) return;
    const idx = muscleRegions.findIndex((m) => m.id === modalMuscleId);
    if (idx === -1) return;
    const nextIdx =
      dir === 'next'
        ? (idx + 1) % muscleRegions.length
        : (idx - 1 + muscleRegions.length) % muscleRegions.length;
    const nextMuscle = muscleRegions[nextIdx];
    setSelectedMuscleId(nextMuscle.id);
    setModalMuscleId(nextMuscle.id);
    setTimerRunning(false);
  };

  const handleCompleteProtocol = (id: string) => {
    setCompletedProtocols((prev) => ({ ...prev, [id]: true }));
    setTimerRunning(false);
  };

  // Interactive SVG region props: clicking directly on ANY muscle on the map opens the custom recovery protocol Modal!
  const getRegionProps = (id: string) => {
    const region = muscleRegions.find((m) => m.id === id);
    const isSelected = activeMuscle.id === id;
    const isHovered = hoveredMuscleId === id;
    const fill = region ? region.color : '#0B5D46';
    return {
      fill,
      fillOpacity: isHovered ? 0.92 : isSelected ? 0.82 : 0.54,
      stroke: isHovered || isSelected ? '#14241F' : fill,
      strokeWidth: isHovered ? 2.6 : isSelected ? 2.2 : 1.2,
      className: 'cursor-pointer transition-all duration-200 hover:brightness-110',
      role: 'button' as const,
      tabIndex: 0,
      'aria-label': `انقر لاستعراض بروتوكول تعافي ${region?.name || id}`,
      onMouseEnter: () => setHoveredMuscleId(id),
      onMouseLeave: () => setHoveredMuscleId(null),
      onClick: (e: React.MouseEvent) => openMuscleModal(id, e, 'all'),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openMuscleModal(id);
        }
      },
    };
  };

  // Helper to render a non-overlapping SVG callout pill badge with anatomical hotspot pin
  const renderCalloutBadge = (params: {
    muscleId: string;
    label: string;
    targetX: number;
    targetY: number;
    badgeX: number;
    badgeY: number;
    anchorSide: 'left' | 'right';
  }) => {
    const region = muscleRegions.find((m) => m.id === params.muscleId);
    const isSelected = activeMuscle.id === params.muscleId;
    const isHovered = hoveredMuscleId === params.muscleId;
    const color = getMuscleColor(params.muscleId);
    const badgeWidth = 108;
    const badgeHeight = 23;
    const lineEndX =
      params.anchorSide === 'left' ? params.badgeX + badgeWidth : params.badgeX;
    const lineEndY = params.badgeY + badgeHeight / 2;

    return (
      <g
        onClick={(e) => openMuscleModal(params.muscleId, e, 'all')}
        onMouseEnter={() => setHoveredMuscleId(params.muscleId)}
        onMouseLeave={() => setHoveredMuscleId(null)}
        className="cursor-pointer"
      >
        <line
          x1={params.targetX}
          y1={params.targetY}
          x2={lineEndX}
          y2={lineEndY}
          stroke={color}
          strokeWidth={isSelected || isHovered ? '1.8' : '1.2'}
          strokeDasharray={isSelected || isHovered ? 'none' : '2 2'}
        />
        {/* Interactive hotspot pin on the muscle itself */}
        <circle
          cx={params.targetX}
          cy={params.targetY}
          r={isSelected || isHovered ? '5' : '3.8'}
          fill="#FDFCF9"
          stroke={color}
          strokeWidth="1.8"
        />
        <circle cx={params.targetX} cy={params.targetY} r="1.8" fill={color} />
        <rect
          x={params.badgeX}
          y={params.badgeY}
          width={badgeWidth}
          height={badgeHeight}
          rx="6"
          fill={isSelected || isHovered ? '#14241F' : '#FDFCF9'}
          stroke={color}
          strokeWidth={isSelected || isHovered ? '1.8' : '1.2'}
        />
        <circle cx={params.badgeX + 13} cy={params.badgeY + 11.5} r="7.5" fill={color} />
        <text
          x={params.badgeX + 13}
          y={params.badgeY + 14.5}
          textAnchor="middle"
          className="fill-white text-[7.5px] font-mono-num font-bold"
        >
          {region?.readiness ?? 80}%
        </text>
        <text
          x={params.badgeX + 64}
          y={params.badgeY + 15}
          textAnchor="middle"
          fill={isSelected || isHovered ? '#FDFCF9' : '#14241F'}
          className="text-[9.5px] font-bold"
        >
          {params.label}
        </text>
      </g>
    );
  };

  return (
    <div className="relative space-y-5 w-full min-w-0">
      {/* Interactive Muscle Switcher Bar */}
      <div className="pb-3 border-b border-[#E6DFD1] flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#5E5A50]">
          انقر على أي عضلة في المجسم التشريحي أو القائمة لاستعراض بروتوكول التعافي المخصص (إطالة · تدليك · تبريد)
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {muscleRegions.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={(e) => openMuscleModal(m.id, e, 'all')}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#FAF7F0] border border-[#DFD8C8] hover:border-[#0B5D46] hover:bg-[#0B5D46] hover:text-white text-[#14241F] transition-colors cursor-pointer"
            >
              {m.shortTag} ({m.readiness}%)
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* LEFT / CENTER 7 COLS: LARGE DUAL ANATOMICAL HUMAN BODY MAP (FRONT & BACK VIEWS) */}
        <div className="xl:col-span-7 min-w-0 bg-[#FAF7F0]/60 rounded-xl border border-[#E6DFD1] p-3.5 sm:p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-[#E6DFD1] text-xs">
            {/* Anatomical View Sub-Tabs */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EAE4D7] rounded-lg max-w-full">
              {[
                { id: 'both', label: 'المنظر الأمامي والخلفي' },
                { id: 'anterior', label: 'الأمامي فقط' },
                { id: 'posterior', label: 'الخلفي فقط' },
              ].map((vTab) => (
                <button
                  key={vTab.id}
                  type="button"
                  onClick={() =>
                    handleSwitchBodyView(vTab.id as 'both' | 'anterior' | 'posterior')
                  }
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    bodyViewFilter === vTab.id
                      ? 'bg-[#0B5D46] text-white'
                      : 'text-[#5E5A50] hover:text-[#14241F]'
                  }`}
                >
                  {vTab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-medium text-[#5E5A50]">
              <span className="text-[#0B5D46] font-semibold">مستشفية ≥76%</span>
              <span>·</span>
              <span className="text-[#B45309] font-semibold">إجهاد متوسط 55–75%</span>
              <span>·</span>
              <span className="text-[#B91C1C] font-semibold">إجهاد حرج &lt;55%</span>
            </div>
          </div>

          {/* Dual Front & Back High-Detail Anatomical SVG with Stabilized Container Dimensions */}
          <div className="w-full max-w-full h-[250px] sm:h-[325px] flex items-center justify-center py-1 overflow-hidden">
            <svg
              viewBox={
                bodyViewFilter === 'anterior'
                  ? '0 0 320 410'
                  : bodyViewFilter === 'posterior'
                  ? '320 0 320 410'
                  : '0 0 640 410'
              }
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-[240px] sm:h-[315px] max-h-[315px] block select-none overflow-hidden"
              role="img"
              aria-label="خريطة الجسم التشريحية الأمامية والخلفية التفاعلية للاستشفاء العضلي"
            >
              {/* Background Medical Coordinate Grid */}
              <g stroke="#E6DFD1" strokeWidth="0.7" strokeDasharray="3 3">
                <line x1="15" y1="65" x2="625" y2="65" />
                <line x1="15" y1="145" x2="625" y2="145" />
                <line x1="15" y1="225" x2="625" y2="225" />
                <line x1="15" y1="305" x2="625" y2="305" />
                {bodyViewFilter === 'both' && (
                  <line
                    x1="320"
                    y1="15"
                    x2="320"
                    y2="395"
                    strokeDasharray="none"
                    stroke="#D5CBB8"
                  />
                )}
              </g>

              {bodyViewFilter !== 'posterior' && (
                <text
                  x="190"
                  y="22"
                  textAnchor="middle"
                  className="fill-[#14241F] text-[11.5px] font-bold"
                >
                  المنظر الأمامي (انقر على العضلة للبروتوكول)
                </text>
              )}
              {bodyViewFilter !== 'anterior' && (
                <text
                  x="450"
                  y="22"
                  textAnchor="middle"
                  className="fill-[#14241F] text-[11.5px] font-bold"
                >
                  المنظر الخلفي (انقر على العضلة للبروتوكول)
                </text>
              )}

              {/* 1. FRONT ANATOMICAL BODY (Translated to x=75 so center is x=195) */}
              {bodyViewFilter !== 'posterior' && (
                <g transform="translate(75, 0)">
                  <ellipse
                    cx="120"
                    cy="52"
                    rx="16"
                    ry="20"
                    fill="#EAE4D7"
                    stroke="#8C8270"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M112 71 L108 84 L132 84 L128 71 Z"
                    {...getRegionProps('upper-shoulders')}
                  />

                  <g {...getRegionProps('upper-shoulders')}>
                    <title>انقر لاستعراض بروتوكول تعافي الحزام الكتفي والصدر والذراعين</title>
                    <path d="M88 84 C74 86, 68 98, 70 114 L86 112 L94 88 Z" />
                    <path d="M152 84 C166 86, 172 98, 170 114 L154 112 L146 88 Z" />
                    <path d="M94 86 L119 86 L119 118 L90 114 C88 104, 90 92, 94 86 Z" />
                    <path d="M121 86 L146 86 L150 114 L121 118 Z" />
                    {/* Interactive Biceps & Forearms */}
                    <path d="M70 115 C64 134, 62 152, 58 178 L70 180 C76 156, 80 136, 85 113 Z" />
                    <path d="M58 180 L52 212 L62 214 L70 180 Z" />
                    <path d="M170 115 C176 134, 178 152, 182 178 L170 180 C164 156, 160 136, 155 113 Z" />
                    <path d="M182 180 L188 212 L178 214 L170 180 Z" />
                  </g>

                  <g {...getRegionProps('cardiac-autonomic')}>
                    <title>انقر لاستعراض بروتوكول تعافي القلب والجهاز العصبي الذاتي</title>
                    <circle cx="127" cy="103" r="11" />
                    <path
                      d="M121 103 L125 103 L127 97 L130 109 L132 103 L136 103"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.6"
                    />
                  </g>

                  <g {...getRegionProps('core-lowerback')}>
                    <title>انقر لاستعراض بروتوكول تعافي عضلات الجذع ومثنيات الورك</title>
                    <path d="M92 118 L148 118 L144 176 L96 176 Z" />
                    <line x1="120" y1="118" x2="120" y2="176" stroke="#FDFCF9" strokeWidth="1.2" />
                    <line x1="95" y1="136" x2="145" y2="136" stroke="#FDFCF9" strokeWidth="1" />
                    <line x1="96" y1="155" x2="144" y2="155" stroke="#FDFCF9" strokeWidth="1" />
                    <path d="M95 177 L145 177 L150 198 L120 206 L90 198 Z" />
                  </g>

                  <g {...getRegionProps('quads-tibialis')}>
                    <title>انقر لاستعراض بروتوكول تعافي عضلات الفخذ الرباعية</title>
                    <path d="M90 198 L117 206 L114 276 C104 280, 94 278, 88 272 C84 244, 86 218, 90 198 Z" />
                    <path d="M104 204 L102 272" stroke="#FDFCF9" strokeWidth="1" />
                    <path d="M150 198 L123 206 L126 276 C136 280, 146 278, 152 272 C156 244, 154 218, 150 198 Z" />
                    <path d="M136 204 L138 272" stroke="#FDFCF9" strokeWidth="1" />
                  </g>

                  <ellipse cx="102" cy="285" rx="11" ry="9" fill="#EAE4D7" stroke="#9E9482" />
                  <ellipse cx="138" cy="285" rx="11" ry="9" fill="#EAE4D7" stroke="#9E9482" />

                  <g {...getRegionProps('quads-tibialis')}>
                    <title>انقر لاستعراض بروتوكول تعافي الظنبوب الأمامي والساق</title>
                    <path d="M90 294 L112 294 L108 364 L93 364 C87 338, 87 314, 90 294 Z" />
                    <path d="M128 294 L150 294 C153 314, 153 338, 147 364 L132 364 Z" />
                  </g>

                  <path
                    d="M92 365 L108 365 L112 384 L86 384 Z"
                    fill="#EAE4D7"
                    stroke="#8C8270"
                  />
                  <path
                    d="M132 365 L148 365 L154 384 L128 384 Z"
                    fill="#EAE4D7"
                    stroke="#8C8270"
                  />

                  {/* Callout Badges on Front Body */}
                  {renderCalloutBadge({
                    muscleId: 'cardiac-autonomic',
                    label: 'القلب وHRV',
                    targetX: 127,
                    targetY: 103,
                    badgeX: -66,
                    badgeY: 76,
                    anchorSide: 'left',
                  })}

                  {renderCalloutBadge({
                    muscleId: 'core-lowerback',
                    label: 'عضلات الجذع',
                    targetX: 98,
                    targetY: 146,
                    badgeX: -66,
                    badgeY: 135,
                    anchorSide: 'left',
                  })}

                  {renderCalloutBadge({
                    muscleId: 'quads-tibialis',
                    label: 'الفخذ الرباعية',
                    targetX: 95,
                    targetY: 242,
                    badgeX: -66,
                    badgeY: 231,
                    anchorSide: 'left',
                  })}
                </g>
              )}

              {/* 2. BACK ANATOMICAL BODY (Translated to x=325 so center is x=445) */}
              {bodyViewFilter !== 'anterior' && (
                <g transform="translate(325, 0)">
                  <ellipse
                    cx="120"
                    cy="52"
                    rx="16"
                    ry="20"
                    fill="#EAE4D7"
                    stroke="#8C8270"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M111 71 L106 84 L134 84 L129 71 Z"
                    {...getRegionProps('upper-shoulders')}
                  />

                  <g {...getRegionProps('upper-shoulders')}>
                    <title>انقر لاستعراض بروتوكول تعافي الكتف وأعلى الظهر والذراعين</title>
                    <path d="M88 84 L152 84 L146 130 L120 140 L94 130 Z" />
                    <path d="M88 84 C74 86, 68 98, 70 114 L88 112 Z" />
                    <path d="M152 84 C166 86, 172 98, 170 114 L152 112 Z" />
                    {/* Interactive Triceps & Posterior Forearms */}
                    <path d="M70 115 C64 134, 62 152, 58 178 L70 180 C76 156, 80 136, 85 113 Z" />
                    <path d="M58 180 L52 212 L62 214 L70 180 Z" />
                    <path d="M170 115 C176 134, 178 152, 182 178 L170 180 C164 156, 160 136, 155 113 Z" />
                    <path d="M182 180 L188 212 L178 214 L170 180 Z" />
                  </g>

                  <g {...getRegionProps('core-lowerback')}>
                    <title>انقر لاستعراض بروتوكول تعافي أسفل الظهر والعمود الفقري</title>
                    <path d="M94 131 L120 140 L146 131 L144 174 L96 174 Z" />
                    <line x1="120" y1="86" x2="120" y2="174" stroke="#FDFCF9" strokeWidth="1.3" />
                  </g>

                  <g {...getRegionProps('hamstrings-glutes')}>
                    <title>انقر لاستعراض بروتوكول تعافي الألوية والأوتار الخلفية</title>
                    <path d="M94 175 L120 175 L120 212 C104 214, 90 206, 88 192 Z" />
                    <path d="M120 175 L146 175 L152 192 C150 206, 136 214, 120 212 Z" />
                    <path d="M89 208 L117 212 L113 278 L90 278 C85 254, 86 228, 89 208 Z" />
                    <path d="M151 208 L123 212 L127 278 L150 278 C155 254, 154 228, 151 208 Z" />
                    <line x1="103" y1="214" x2="102" y2="276" stroke="#FDFCF9" strokeWidth="1" />
                    <line x1="137" y1="214" x2="138" y2="276" stroke="#FDFCF9" strokeWidth="1" />
                  </g>

                  <rect
                    x="91"
                    y="279"
                    width="21"
                    height="12"
                    rx="4"
                    fill="#EAE4D7"
                    stroke="#9E9482"
                  />
                  <rect
                    x="128"
                    y="279"
                    width="21"
                    height="12"
                    rx="4"
                    fill="#EAE4D7"
                    stroke="#9E9482"
                  />

                  <g {...getRegionProps('calves-achilles')}>
                    <title>انقر لاستعراض بروتوكول تعافي عضلة السمانة ووتر العرقوب</title>
                    <path d="M89 292 L113 292 C117 312, 115 332, 107 348 L104 374 L96 374 L93 348 C85 332, 85 312, 89 292 Z" />
                    <line x1="101" y1="294" x2="101" y2="332" stroke="#FDFCF9" strokeWidth="1.1" />
                    <path d="M127 292 L151 292 C155 312, 155 332, 147 348 L144 374 L136 374 L133 348 C125 332, 123 312, 127 292 Z" />
                    <line x1="139" y1="294" x2="139" y2="332" stroke="#FDFCF9" strokeWidth="1.1" />
                  </g>

                  <ellipse cx="100" cy="380" rx="8" ry="6" fill="#EAE4D7" stroke="#8C8270" />
                  <ellipse cx="140" cy="380" rx="8" ry="6" fill="#EAE4D7" stroke="#8C8270" />

                  {/* Callout Badges on Back Body */}
                  {renderCalloutBadge({
                    muscleId: 'upper-shoulders',
                    label: 'الكتف والصدر',
                    targetX: 148,
                    targetY: 102,
                    badgeX: 198,
                    badgeY: 91,
                    anchorSide: 'right',
                  })}

                  {renderCalloutBadge({
                    muscleId: 'hamstrings-glutes',
                    label: 'الفخذ الخلفية',
                    targetX: 145,
                    targetY: 242,
                    badgeX: 198,
                    badgeY: 231,
                    anchorSide: 'right',
                  })}

                  {renderCalloutBadge({
                    muscleId: 'calves-achilles',
                    label: 'السمانة والعرقوب',
                    targetX: 143,
                    targetY: 335,
                    badgeX: 198,
                    badgeY: 324,
                    anchorSide: 'right',
                  })}
                </g>
              )}
            </svg>
          </div>

          {/* Bottom Active Muscle Inspector Strip */}
          <div className="pt-3 mt-1 border-t border-[#E6DFD1]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#14241F]">{activeMuscle.name}</span>
                <span
                  className="text-xs font-mono-num font-bold"
                  style={{ color: activeMuscle.color }}
                >
                  {activeMuscle.readiness}%
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => openMuscleModal(activeMuscle.id, e, 'stretching')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-[#0B5D46]/10 text-[#0B5D46] hover:bg-[#0B5D46] hover:text-white rounded-md transition-colors cursor-pointer"
                >
                  إطالة
                </button>
                <button
                  type="button"
                  onClick={(e) => openMuscleModal(activeMuscle.id, e, 'massage')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-[#B8955A]/15 text-[#8A6D3B] hover:bg-[#B8955A] hover:text-white rounded-md transition-colors cursor-pointer"
                >
                  تدليك
                </button>
                <button
                  type="button"
                  onClick={(e) => openMuscleModal(activeMuscle.id, e, 'cooling')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-[#2563EB]/10 text-[#1D4ED8] hover:bg-[#2563EB] hover:text-white rounded-md transition-colors cursor-pointer"
                >
                  تبريد
                </button>
                <button
                  type="button"
                  onClick={(e) => openMuscleModal(activeMuscle.id, e, 'all')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-[#0B5D46] text-white rounded-md hover:bg-[#084735] transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>نافذة التعافي الكاملة</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-[#3E3B34] leading-relaxed">
              <strong className="text-[#0B5D46]">التوجيه السريع: </strong>
              {activeMuscle.recoveryProtocol}
            </p>
          </div>
        </div>

        {/* RIGHT 5 COLS: INTERACTIVE MUSCLE & TENDON READINESS LIST */}
        <div className="xl:col-span-5 flex flex-col justify-between gap-4">
          <div className="bg-[#FAF7F0]/60 rounded-xl border border-[#E6DFD1] p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD1] pb-2">
              <h4 className="text-xs font-bold text-[#14241F]">
                تفصيل الجاهزية التشريحية وبروتوكولات التعافي
              </h4>
              <span className="text-[11px] font-mono-num text-[#7A7264]">
                ACWR {record.acwr} · استشفاء {record.recoveryScore}%
              </span>
            </div>

            <div className="divide-y divide-[#E6DFD1]">
              {filteredMuscleList.map((m) => {
                const isSelected = m.id === activeMuscle.id;
                const isDone = completedProtocols[m.id];
                return (
                  <div
                    key={m.id}
                    onClick={(e) => openMuscleModal(m.id, e, 'all')}
                    onMouseEnter={() => setHoveredMuscleId(m.id)}
                    onMouseLeave={() => setHoveredMuscleId(null)}
                    className={`w-full text-right py-2.5 px-2 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#FDFCF9]' : 'hover:bg-[#FDFCF9]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-[#14241F] truncate">{m.name}</span>
                        {isDone && (
                          <span className="text-[10px] text-[#0B5D46] font-semibold whitespace-nowrap">
                            · مكتمل
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="font-mono-num font-bold text-xs"
                          style={{ color: m.color }}
                        >
                          {m.readiness}%
                        </span>

                        <button
                          type="button"
                          onClick={(e) => openMuscleModal(m.id, e, 'all')}
                          title={`بروتوكول التعافي لـ ${m.name}`}
                          aria-label={`بروتوكول التعافي لـ ${m.name}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0B5D46]/10 text-[#0B5D46] hover:bg-[#0B5D46] hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
                        >
                          <span>البروتوكول</span>
                        </button>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-[#EAE4D7] rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${m.readiness}%`, backgroundColor: m.color }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => openMuscleModal(m.id, e, 'stretching')}
                        className="px-2 py-1 rounded bg-[#0B5D46]/8 hover:bg-[#0B5D46] text-[#0B5D46] hover:text-white text-[10px] font-semibold text-center transition-colors cursor-pointer truncate"
                      >
                        إطالة ({m.stretchingExercises.length})
                      </button>
                      <button
                        type="button"
                        onClick={(e) => openMuscleModal(m.id, e, 'massage')}
                        className="px-2 py-1 rounded bg-[#B8955A]/15 hover:bg-[#B8955A] text-[#8A6D3B] hover:text-white text-[10px] font-semibold text-center transition-colors cursor-pointer truncate"
                      >
                        تدليك اللفافة
                      </button>
                      <button
                        type="button"
                        onClick={(e) => openMuscleModal(m.id, e, 'cooling')}
                        className="px-2 py-1 rounded bg-[#2563EB]/10 hover:bg-[#2563EB] text-[#1D4ED8] hover:text-white text-[10px] font-semibold text-center transition-colors cursor-pointer truncate"
                      >
                        تبريد مائي
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* EXTENDED 6-MUSCLE STRETCHING, MASSAGE & COOLING CARDS */}
      {showExtendedCards && (
        <div className="pt-4 border-t border-[#E6DFD1] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[#14241F]">
              دليل بروتوكولات التعافي المخصصة (إطالة · تدليك · تبريد) لجميع المجموعات العضلية
            </h3>
            <span className="text-xs text-[#5E5A50]">
              انقر على أي مجموعة عضلية لفتح النافذة المنبثقة والمؤقت التفاعلي
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {muscleRegions.map((m) => (
              <div
                key={m.id}
                onClick={(e) => openMuscleModal(m.id, e, 'all')}
                className="p-4 rounded-xl bg-[#FAF7F0]/60 border border-[#E6DFD1] hover:border-[#0B5D46] transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#14241F]">{m.name}</span>
                    <span
                      className="text-xs font-mono-num font-bold"
                      style={{ color: m.color }}
                    >
                      {m.readiness}%
                    </span>
                  </div>
                  <p className="text-[11px] font-mono-num text-[#7A7264]">
                    {m.view} · حصة الحمل: {m.loadShareAU} AU
                  </p>
                  <div className="text-xs text-[#2C3330] pt-1.5 border-t border-[#E6DFD1] space-y-1">
                    <div className="truncate">
                      <strong className="text-[#0B5D46]">إطالة:</strong>{' '}
                      {m.stretchingExercises[0]?.title}
                    </div>
                    <div className="truncate">
                      <strong className="text-[#8A6D3B]">تدليك:</strong>{' '}
                      {MASSAGE_PROTOCOLS_BY_MUSCLE[m.id]?.technique || m.modalities.myofascialRelease}
                    </div>
                    <div className="truncate">
                      <strong className="text-[#1D4ED8]">تبريد:</strong>{' '}
                      {COOLING_PROTOCOLS_BY_MUSCLE[m.id]?.modality || m.modalities.thermalProtocol}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E6DFD1] text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => openMuscleModal(m.id, e, 'stretching')}
                      className="px-2 py-0.5 rounded bg-[#0B5D46]/10 text-[#0B5D46] text-[10px] font-bold hover:bg-[#0B5D46] hover:text-white cursor-pointer"
                    >
                      إطالة
                    </button>
                    <button
                      type="button"
                      onClick={(e) => openMuscleModal(m.id, e, 'massage')}
                      className="px-2 py-0.5 rounded bg-[#B8955A]/15 text-[#8A6D3B] text-[10px] font-bold hover:bg-[#B8955A] hover:text-white cursor-pointer"
                    >
                      تدليك
                    </button>
                    <button
                      type="button"
                      onClick={(e) => openMuscleModal(m.id, e, 'cooling')}
                      className="px-2 py-0.5 rounded bg-[#2563EB]/10 text-[#1D4ED8] text-[10px] font-bold hover:bg-[#2563EB] hover:text-white cursor-pointer"
                    >
                      تبريد
                    </button>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[#0B5D46] font-bold">
                    <span>فتح البروتوكول</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ELEGANT PORTAL POPUP MODAL: CUSTOM MUSCLE RECOVERY PROTOCOL (إطالة / تدليك / تبريد) */}
      {modalMuscle &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-[#14241F]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="muscle-modal-title"
            dir="rtl"
            onClick={() => {
              setModalMuscleId(null);
              setTimerRunning(false);
            }}
          >
            <div
              className="relative bg-[#FDFCF9] border border-[#DFD8C8] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl text-right animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative z-10 space-y-4">
                {/* Modal Header with Prev/Next Navigation & Close Button */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs text-[#0B5D46] font-semibold block">
                      بروتوكول التعافي العضلي المخصص (إطالة · تدليك · تبريد)
                    </span>
                    <h3 id="muscle-modal-title" className="text-lg sm:text-xl font-bold text-[#14241F]">
                      {modalMuscle.name}
                    </h3>
                    <p className="text-xs font-mono-num text-[#7A7264]">
                      {modalMuscle.anatomicalName} · {modalMuscle.view} · حصة الحمل التدريبي:{' '}
                      {modalMuscle.loadShareAU} AU
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => navigateModalMuscle('prev')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#EAE4D7] text-[#14241F] hover:bg-[#DFD8C8] text-xs font-bold transition-colors cursor-pointer"
                      title="العضلة السابقة"
                    >
                      السابق
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateModalMuscle('next')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#EAE4D7] text-[#14241F] hover:bg-[#DFD8C8] text-xs font-bold transition-colors cursor-pointer"
                      title="العضلة التالية"
                    >
                      التالي
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalMuscleId(null);
                        setTimerRunning(false);
                      }}
                      className="p-2 rounded-lg bg-[#EAE4D7] text-[#14241F] hover:bg-[#DC2626] hover:text-white transition-colors cursor-pointer"
                      aria-label="إغلاق النافذة"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Muscle Switcher Strip inside Modal */}
                <div className="flex flex-wrap items-center gap-1.5 pb-1">
                  {muscleRegions.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMuscleId(m.id);
                        setModalMuscleId(m.id);
                        setTimerRunning(false);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer border ${
                        m.id === modalMuscle.id
                          ? 'bg-[#0B5D46] text-white border-[#0B5D46] font-bold'
                          : 'bg-[#FAF7F0] text-[#5E5A50] border-[#DFD8C8] hover:text-[#14241F]'
                      }`}
                    >
                      {m.shortTag} ({m.readiness}%)
                    </button>
                  ))}
                </div>

                <GirihHeaderBorder />

                {/* Muscle Status Summary Bar + Interactive Recovery Timer */}
                <div className="bg-[#FAF7F0] border border-[#E6DFD1] rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-[#5E5A50] block">
                      حالة الجاهزية الموضعية الحالية والتشخيص
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-2xl font-bold font-mono-num"
                        style={{ color: modalMuscle.color }}
                      >
                        {modalMuscle.readiness}%
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: modalMuscle.color }}
                      >
                        · {modalMuscle.statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-[#3E3B34] max-w-md pt-0.5">
                      {modalMuscle.recoveryProtocol}
                    </p>
                  </div>

                  {/* Interactive Multi-Mode Recovery Timer */}
                  <div className="flex flex-wrap items-center gap-2.5 bg-[#FDFCF9] border border-[#E6DFD1] rounded-xl px-3.5 py-2.5">
                    <Clock className="w-4 h-4 text-[#0B5D46]" />
                    <div className="text-xs">
                      <span className="text-[#5E5A50] block text-[10px]">{timerLabel}</span>
                      <span className="font-mono-num font-bold text-sm text-[#14241F]">
                        {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                        {String(timerSeconds % 60).padStart(2, '0')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTimerRunning((prev) => !prev)}
                      className="px-2.5 py-1 text-xs font-medium bg-[#0B5D46] text-white rounded-md hover:bg-[#084735] flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>{timerRunning ? 'إيقاف مؤقت' : 'بدء المؤقت'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTimerRunning(false);
                        setTimerSeconds(timerInitialSeconds);
                      }}
                      className="p-1 text-[#5E5A50] hover:text-[#14241F] cursor-pointer"
                      title="إعادة ضبط المؤقت"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Modal Content Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#EAE4D7] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setModalActiveTab('all')}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      modalActiveTab === 'all'
                        ? 'bg-[#0B5D46] text-white'
                        : 'text-[#5E5A50] hover:text-[#14241F]'
                    }`}
                  >
                    البروتوكول الشامل
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalActiveTab('stretching');
                      startCustomTimer(45, 'مؤقت تمرين الإطالة (45 ثانية)');
                      setTimerRunning(false);
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      modalActiveTab === 'stretching'
                        ? 'bg-[#0B5D46] text-white'
                        : 'text-[#5E5A50] hover:text-[#14241F]'
                    }`}
                  >
                    1. الإطالة ({modalMuscle.stretchingExercises.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalActiveTab('massage');
                      startCustomTimer(90, 'مؤقت جلسة التدليك (90 ثانية)');
                      setTimerRunning(false);
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      modalActiveTab === 'massage'
                        ? 'bg-[#0B5D46] text-white'
                        : 'text-[#5E5A50] hover:text-[#14241F]'
                    }`}
                  >
                    2. التدليك واللفافة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalActiveTab('cooling');
                      startCustomTimer(120, 'مؤقت جلسة التبريد (دقيقتان)');
                      setTimerRunning(false);
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      modalActiveTab === 'cooling'
                        ? 'bg-[#0B5D46] text-white'
                        : 'text-[#5E5A50] hover:text-[#14241F]'
                    }`}
                  >
                    3. التبريد والماء
                  </button>
                </div>

                {/* PILLAR 1: STRETCHING PROTOCOL */}
                {(modalActiveTab === 'all' || modalActiveTab === 'stretching') && (
                  <div className="space-y-3 bg-[#FAF7F0] border border-[#E6DFD1] rounded-xl p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD1] pb-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[#0B5D46]">
                        أولاً: بروتوكول الإطالة والمرونة التشريحية
                      </h4>
                      <button
                        type="button"
                        onClick={() => startCustomTimer(45, `إطالة: ${modalMuscle.shortTag}`)}
                        className="px-2.5 py-1 rounded-md bg-[#0B5D46]/10 hover:bg-[#0B5D46] text-[#0B5D46] hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>تشغيل مؤقت 45 ثانية</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {modalMuscle.stretchingExercises.map((ex, index) => (
                        <div
                          key={ex.title}
                          className="bg-[#FDFCF9] border border-[#E6DFD1] rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <h5 className="text-xs sm:text-sm font-bold text-[#0B5D46]">
                                0{index + 1}. {ex.title}
                              </h5>
                              <span className="text-[11px] font-mono-num font-semibold text-[#8C6D36]">
                                {ex.durationOrSets}
                              </span>
                            </div>

                            <div className="text-[11px] text-[#5E5A50]">
                              <strong className="text-[#14241F]">النسيج المستهدف: </strong>
                              {ex.targetTissue}
                            </div>

                            <p className="text-xs text-[#2C3330] leading-relaxed pt-1 border-t border-[#E6DFD1]">
                              <strong className="text-[#14241F]">طريقة الأداء: </strong>
                              {ex.instructions}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => startCustomTimer(45, ex.title)}
                            className="w-full py-1.5 px-3 rounded-lg bg-[#0B5D46]/10 hover:bg-[#0B5D46] text-[#0B5D46] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>بدء مؤقت التمرين (45 ثانية)</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PILLAR 2: MASSAGE & MYOFASCIAL RELEASE PROTOCOL */}
                {(modalActiveTab === 'all' || modalActiveTab === 'massage') && (() => {
                  const massage = MASSAGE_PROTOCOLS_BY_MUSCLE[modalMuscle.id] || {
                    technique: modalMuscle.modalities.myofascialRelease,
                    tool: 'أسطوانة الفوم (Foam Roller) أو كرة التدليك الموضعية',
                    duration: '8 دقائق',
                    pressure: 'متوسط ومضبوط (5/10)',
                    direction: 'باتجاه العائد الوريدي نحو القلب',
                    steps: modalMuscle.modalities.myofascialRelease,
                  };
                  return (
                    <div className="space-y-3 bg-[#FAF7F0] border border-[#E6DFD1] rounded-xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD1] pb-2">
                        <h4 className="text-xs sm:text-sm font-bold text-[#8A6D3B]">
                          ثانياً: بروتوكول التدليك وتحرير اللفافة العضلية
                        </h4>
                        <button
                          type="button"
                          onClick={() => startCustomTimer(90, `تدليك: ${modalMuscle.shortTag}`)}
                          className="px-2.5 py-1 rounded-md bg-[#B8955A]/15 hover:bg-[#B8955A] text-[#8A6D3B] hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>تشغيل مؤقت التدليك (90 ثانية)</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="bg-[#FDFCF9] border border-[#E6DFD1] rounded-lg p-2.5">
                          <span className="text-[10px] text-[#7A7264] font-semibold block">
                            الأداة الموصى بها
                          </span>
                          <strong className="text-[#14241F] mt-0.5 block">{massage.tool}</strong>
                        </div>
                        <div className="bg-[#FDFCF9] border border-[#E6DFD1] rounded-lg p-2.5">
                          <span className="text-[10px] text-[#7A7264] font-semibold block">
                            المدة ومستوى الضغط
                          </span>
                          <strong className="text-[#8A6D3B] mt-0.5 block">
                            {massage.duration} · {massage.pressure}
                          </strong>
                        </div>
                        <div className="bg-[#FDFCF9] border border-[#E6DFD1] rounded-lg p-2.5">
                          <span className="text-[10px] text-[#7A7264] font-semibold block">
                            اتجاه المسارات
                          </span>
                          <strong className="text-[#14241F] mt-0.5 block">{massage.direction}</strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E6DFD1] space-y-1 text-xs">
                        <strong className="text-[#8A6D3B] block">
                          التقنية والخطوات العملية ({massage.technique}):
                        </strong>
                        <p className="text-[#2C3330] leading-relaxed">{massage.steps}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* PILLAR 3: COOLING & THERMAL PROTOCOL */}
                {(modalActiveTab === 'all' || modalActiveTab === 'cooling') && (() => {
                  const cooling = COOLING_PROTOCOLS_BY_MUSCLE[modalMuscle.id] || {
                    modality: modalMuscle.modalities.thermalProtocol,
                    temperature: '12°C – 15°C',
                    duration: '8 دقائق',
                    timing: 'بعد التدريب مباشرة',
                    physiologicalBenefit: 'تخفيف الالتهاب المجهري وتسريع استشفاء الألياف العضلية.',
                    steps: modalMuscle.modalities.thermalProtocol,
                  };
                  return (
                    <div className="space-y-3 bg-[#FAF7F0] border border-[#E6DFD1] rounded-xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD1] pb-2">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1D4ED8]">
                          ثالثاً: بروتوكول التبريد والاستشفاء المائي/الحراري
                        </h4>
                        <button
                          type="button"
                          onClick={() => startCustomTimer(120, `تبريد: ${modalMuscle.shortTag}`)}
                          className="px-2.5 py-1 rounded-md bg-[#2563EB]/10 hover:bg-[#2563EB] text-[#1D4ED8] hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>تشغيل مؤقت التبريد (دقيقتان)</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="bg-[#FDFCF9] border border-[#E6DFD1] rounded-lg p-2.5">
                          <span className="text-[10px] text-[#7A7264] font-semibold block">
                            وسيلة التبريد المخصصة
                          </span>
                          <strong className="text-[#14241F] mt-0.5 block">{cooling.modality}</strong>
                        </div>
                        <div className="bg-[#FDFCF9] border border-[#E6DFD1] rounded-lg p-2.5">
                          <span className="text-[10px] text-[#7A7264] font-semibold block">
                            درجة الحرارة والمدة
                          </span>
                          <strong className="text-[#1D4ED8] font-mono-num mt-0.5 block">
                            {cooling.temperature} · {cooling.duration}
                          </strong>
                        </div>
                        <div className="bg-[#FDFCF9] border border-[#E6DFD1] rounded-lg p-2.5">
                          <span className="text-[10px] text-[#7A7264] font-semibold block">
                            التوقيت المثالي
                          </span>
                          <strong className="text-[#14241F] mt-0.5 block">{cooling.timing}</strong>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E6DFD1] space-y-1.5 text-xs">
                        <strong className="text-[#1D4ED8] block">
                          خطوات التطبيق والأثر الفسيولوجي:
                        </strong>
                        <p className="text-[#2C3330] leading-relaxed">{cooling.steps}</p>
                        <p className="text-[11px] text-[#5E5A50]">
                          <strong className="text-[#14241F]">العائد الفسيولوجي: </strong>
                          {cooling.physiologicalBenefit}
                        </p>
                        <p className="text-[11px] text-[#B91C1C]">
                          <strong>تنبيه سريري وقائي: </strong>
                          {modalMuscle.modalities.clinicalPrecaution}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Modal Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E6DFD1]">
                  {completedProtocols[modalMuscle.id] ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0B5D46]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        تم تسجيل إتمام بروتوكول التعافي لهذه العضلة (+5% جاهزية موضعية)
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCompleteProtocol(modalMuscle.id)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0B5D46] text-white rounded-lg hover:bg-[#084735] transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>تسجيل إتمام بروتوكول التعافي (إطالة + تدليك + تبريد) (+5% جاهزية)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setModalMuscleId(null);
                      setTimerRunning(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-[#EAE4D7] text-[#14241F] rounded-lg hover:bg-[#DFD8C8] transition-colors cursor-pointer"
                  >
                    إغلاق النافذة
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

interface SpiderRadarChartProps {
  record: DailyBiometricRecord;
  allRecords: DailyBiometricRecord[];
}

export const SpiderRadarChart: React.FC<SpiderRadarChartProps> = ({
  record,
  allRecords,
}) => {
  const [activeVertexIndex, setActiveVertexIndex] = useState<number>(0);

  const avgRmssd =
    allRecords.reduce((acc, r) => acc + r.hrv.rmssd, 0) / Math.max(1, allRecords.length);
  const avgDeep =
    allRecords.reduce((acc, r) => acc + r.sleep.deepMinutes, 0) / Math.max(1, allRecords.length);
  const avgRem =
    allRecords.reduce((acc, r) => acc + r.sleep.remMinutes, 0) / Math.max(1, allRecords.length);
  const avgEff =
    allRecords.reduce((acc, r) => acc + r.sleep.efficiencyPercent, 0) /
    Math.max(1, allRecords.length);

  const radarData = [
    {
      metric: 'تقلب النبض HRV',
      shortLabel: 'HRV rMSSD',
      rawCurrent: `${record.hrv.rmssd} ms`,
      rawBaseline: `${Math.round(avgRmssd)} ms`,
      current: Math.min(100, Math.max(25, Math.round((record.hrv.rmssd / 100) * 100))),
      baseline: Math.min(100, Math.max(25, Math.round((avgRmssd / 100) * 100))),
      clinicalNote: 'يعكس نشاط العصب الحائر (اللاودي) وسرعة الاستشفاء العصبي القلبي.',
    },
    {
      metric: 'النوم العميق SWS',
      shortLabel: 'النوم العميق',
      rawCurrent: `${record.sleep.deepMinutes} د`,
      rawBaseline: `${Math.round(avgDeep)} د`,
      current: Math.min(100, Math.max(25, Math.round((record.sleep.deepMinutes / 130) * 100))),
      baseline: Math.min(100, Math.max(25, Math.round((avgDeep / 130) * 100))),
      clinicalNote: 'مسؤول عن إفراز هرمون النمو البنائي وإصلاح الألياف العضلية الدقيقة.',
    },
    {
      metric: 'نوم الأحلام REM',
      shortLabel: 'نوم REM',
      rawCurrent: `${record.sleep.remMinutes} د`,
      rawBaseline: `${Math.round(avgRem)} د`,
      current: Math.min(100, Math.max(25, Math.round((record.sleep.remMinutes / 130) * 100))),
      baseline: Math.min(100, Math.max(25, Math.round((avgRem / 130) * 100))),
      clinicalNote: 'يعزز التآزر العصبي العضلي وسرعة الاستجابة الحركية والتركيز الذهني.',
    },
    {
      metric: 'راحة القلب RHR',
      shortLabel: 'نبض الراحة',
      rawCurrent: `${record.restingHeartRate} bpm`,
      rawBaseline: '46 bpm',
      current: Math.min(
        100,
        Math.max(25, Math.round(((66 - record.restingHeartRate) / 24) * 100))
      ),
      baseline: 84,
      clinicalNote: 'انخفاض نبض الراحة الصباحي يدل على كفاءة حجم الضربة القلبية وزوال الإجهاد.',
    },
    {
      metric: 'توازن الحمل ACWR',
      shortLabel: 'توازن الحمل',
      rawCurrent: `${record.acwr}`,
      rawBaseline: '1.12',
      current:
        record.acwr <= 1.2
          ? 92
          : record.acwr <= 1.3
          ? 75
          : Math.max(30, Math.round(100 - (record.acwr - 1.0) * 140)),
      baseline: 85,
      clinicalNote: 'نسبة الحمل الحاد إلى المزمن (النطاق الآمن للوقاية من الإصابات 0.80 – 1.30).',
    },
    {
      metric: 'كفاءة النوم',
      shortLabel: 'كفاءة النوم',
      rawCurrent: `${record.sleep.efficiencyPercent}%`,
      rawBaseline: `${Math.round(avgEff)}%`,
      current: record.sleep.efficiencyPercent,
      baseline: Math.round(avgEff),
      clinicalNote: 'نسبة النوم الفعلي المتصل من إجمالي وقت البقاء في السرير.',
    },
  ];

  const primaryColor =
    record.recoveryStatus === 'optimal'
      ? '#0B5D46'
      : record.recoveryStatus === 'moderate'
      ? '#B45309'
      : '#B91C1C';

  const cx = 230;
  const cy = 148;
  const maxR = 88;
  const angles = [-90, -30, 30, 90, 150, 210];

  const getCoord = (angleDeg: number, pct: number, radiusOverride?: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    const r = radiusOverride !== undefined ? radiusOverride : (pct / 100) * maxR;
    return {
      x: Number((cx + r * Math.cos(rad)).toFixed(1)),
      y: Number((cy + r * Math.sin(rad)).toFixed(1)),
    };
  };

  const baselinePoints = radarData
    .map((d, i) => {
      const pt = getCoord(angles[i], d.baseline);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const currentPoints = radarData
    .map((d, i) => {
      const pt = getCoord(angles[i], d.current);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const activeVertex = radarData[activeVertexIndex] || radarData[0];

  return (
    <div className="w-full min-w-0 bg-[#FAF7F0]/70 rounded-lg border border-[#E6DFD1] p-2.5 sm:p-3 space-y-2.5 overflow-hidden">
      <div className="w-full max-w-full h-[195px] sm:h-[225px] flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 460 296"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-[190px] sm:h-[220px] max-h-[220px] block select-none overflow-hidden"
          role="img"
          aria-label="مخطط العنكبوت للتوازن الصحي"
        >
        {/* Subtle Islamic 8-Pointed Khatim Center Watermark */}
        <g
          transform={`translate(${cx}, ${cy})`}
          stroke="#B8955A"
          strokeWidth="0.7"
          fill="none"
          opacity="0.22"
        >
          <rect x="-26" y="-26" width="52" height="52" />
          <rect x="-26" y="-26" width="52" height="52" transform="rotate(45)" />
        </g>

        {/* 4 Concentric Hexagonal Rings (25%, 50%, 75%, 100%) */}
        {[25, 50, 75, 100].map((level) => {
          const pts = angles
            .map((ang) => {
              const p = getCoord(ang, level);
              return `${p.x},${p.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke={level === 100 ? '#C7B99E' : '#DED6C6'}
              strokeWidth={level === 100 ? '1.2' : '0.9'}
              strokeDasharray={level === 100 ? undefined : '3 3'}
            />
          );
        })}

        {/* Radial Axes Spokes */}
        {angles.map((ang, i) => {
          const outer = getCoord(ang, 100);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="#D5CBB8"
              strokeWidth="0.9"
            />
          );
        })}

        {/* Baseline Polygon (Golden Dashed) */}
        <polygon
          points={baselinePoints}
          fill="#B8955A"
          fillOpacity="0.16"
          stroke="#9C7A44"
          strokeWidth="1.8"
          strokeDasharray="4 3"
        />

        {/* Current Day Polygon */}
        <polygon
          points={currentPoints}
          fill={primaryColor}
          fillOpacity="0.28"
          stroke={primaryColor}
          strokeWidth="2.5"
        />

        {/* Vertex Dots & Interactive Callout Badges */}
        {radarData.map((d, i) => {
          const curPt = getCoord(angles[i], d.current);
          const basePt = getCoord(angles[i], d.baseline);
          const labelCenter = getCoord(
            angles[i],
            100,
            i === 0 || i === 3 ? maxR + 34 : maxR + 58
          );
          const isSelected = activeVertexIndex === i;
          const pillW = 112;
          const pillH = 34;

          return (
            <g
              key={d.metric}
              onClick={() => setActiveVertexIndex(i)}
              className="cursor-pointer"
            >
              {/* Baseline Dot */}
              <circle
                cx={basePt.x}
                cy={basePt.y}
                r="3"
                fill="#9C7A44"
                stroke="#FDFCF9"
                strokeWidth="1"
              />
              {/* Current Score Dot */}
              <circle
                cx={curPt.x}
                cy={curPt.y}
                r={isSelected ? '5.5' : '4'}
                fill={primaryColor}
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              {/* Callout Badge around Hexagon Perimeter */}
              <rect
                x={labelCenter.x - pillW / 2}
                y={labelCenter.y - pillH / 2}
                width={pillW}
                height={pillH}
                rx="7"
                fill={isSelected ? '#14241F' : '#FDFCF9'}
                stroke={isSelected ? '#D4B886' : '#D5CBB8'}
                strokeWidth={isSelected ? '1.5' : '1'}
              />
              <text
                x={labelCenter.x}
                y={labelCenter.y - 3}
                textAnchor="middle"
                fill={isSelected ? '#FAF7F0' : '#14241F'}
                fontSize="10"
                fontWeight="700"
              >
                {d.shortLabel}
              </text>
              <text
                x={labelCenter.x}
                y={labelCenter.y + 11}
                textAnchor="middle"
                fill={isSelected ? '#D4B886' : primaryColor}
                fontSize="10"
                fontWeight="700"
              >
                {d.current}% ({d.rawCurrent})
              </text>
            </g>
          );
        })}
        </svg>
      </div>

      {/* Interactive Vertex Detail & Legend Bar */}
      <div className="p-2.5 rounded-lg bg-[#FDFCF9] border border-[#E6DFD1] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: primaryColor }}
            />
            <strong className="text-[#14241F]">{activeVertex.metric}:</strong>
            <span className="font-mono-num font-bold text-[#0B5D46]">
              {activeVertex.rawCurrent} ({activeVertex.current}%)
            </span>
            <span className="text-[#7A7264] font-mono-num">
              مقابل المرجع {activeVertex.rawBaseline} ({activeVertex.baseline}%)
            </span>
          </div>
          <p className="text-[11px] text-[#5E5A50] mt-0.5">{activeVertex.clinicalNote}</p>
        </div>

        <div className="flex items-center gap-3 text-[11px] shrink-0 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-[#E6DFD1]">
          <span className="flex items-center gap-1.5 font-semibold text-[#14241F]">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: primaryColor }}
            />
            قراءة اليوم ({record.date.slice(5)})
          </span>
          <span className="flex items-center gap-1.5 text-[#7A7264]">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#B8955A]" />
            المعدل المرجعي ({allRecords.length} يوم)
          </span>
        </div>
      </div>
    </div>
  );
};

interface HRVTrendChartProps {
  records: DailyBiometricRecord[];
  selectedId: string;
  onSelectRecord: (id: string) => void;
}

export const HRVTrendChart: React.FC<HRVTrendChartProps> = ({
  records,
  selectedId,
  onSelectRecord,
}) => {
  const data = records.map((r) => ({
    id: r.id,
    dateLabel: r.date.slice(5),
    dayName: r.dayLabel,
    rmssd: r.hrv.rmssd,
    sdnn: r.hrv.sdnn,
    rhr: r.restingHeartRate,
    baseline: r.hrv.baseline7DayRmssd,
    recovery: r.recoveryScore,
  }));

  const selectedEntry = data.find((d) => d.id === selectedId) || data[data.length - 1] || data[0];

  // Deterministic SVG coordinate geometry (viewBox 0 0 620 225)
  const plotLeft = 48;
  const plotRight = 572;
  const plotTop = 24;
  const plotBottom = 182;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  const getX = (idx: number) => {
    if (data.length <= 1) return plotLeft + plotW / 2;
    return Number((plotLeft + (idx / (data.length - 1)) * plotW).toFixed(1));
  };

  // Left Y-axis: HRV rMSSD [35 .. 115 ms]
  const getHrvY = (val: number) => {
    const clamped = Math.max(35, Math.min(115, val));
    return Number((plotBottom - ((clamped - 35) / 80) * plotH).toFixed(1));
  };

  // Right Y-axis: Resting HR [36 .. 68 bpm]
  const getRhrY = (val: number) => {
    const clamped = Math.max(36, Math.min(68, val));
    return Number((plotBottom - ((clamped - 36) / 32) * plotH).toFixed(1));
  };

  const hrvLinePts = data.map((d, i) => `${getX(i)},${getHrvY(d.rmssd)}`).join(' L ');
  const hrvAreaPath =
    data.length > 0
      ? `M ${getX(0)},${plotBottom} L ${hrvLinePts} L ${getX(data.length - 1)},${plotBottom} Z`
      : '';
  const hrvLinePath = data.length > 0 ? `M ${hrvLinePts}` : '';
  const rhrLinePath =
    data.length > 0
      ? `M ${data.map((d, i) => `${getX(i)},${getRhrY(d.rhr)}`).join(' L ')}`
      : '';
  const baselineY = getHrvY(84);

  return (
    <div className="w-full min-w-0 bg-[#FAF7F0]/70 rounded-lg border border-[#E6DFD1] p-2.5 sm:p-3 space-y-2 overflow-hidden">
      {/* Top Legend & Selected Day Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pb-1 border-b border-[#E6DFD1]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-[#0B5D46]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B5D46] inline-block" />
            تقلب النبض HRV (ms)
          </span>
          <span className="flex items-center gap-1.5 font-bold text-[#B45309]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B45309] inline-block" />
            نبض الراحة RHR (bpm)
          </span>
          <span className="flex items-center gap-1.5 text-[#8C6D36]">
            <span className="w-3 h-0.5 bg-[#B8955A] inline-block" />
            خط الأساس (84 ms)
          </span>
        </div>
        {selectedEntry && (
          <div className="font-mono-num text-[11px] bg-[#FDFCF9] px-2 py-0.5 rounded border border-[#DFD8C8]">
            <strong className="text-[#14241F]">{selectedEntry.dateLabel}:</strong>{' '}
            <strong className="text-[#0B5D46]">{selectedEntry.rmssd} ms</strong> ·{' '}
            <strong className="text-[#B45309]">{selectedEntry.rhr} bpm</strong>
          </div>
        )}
      </div>

      {/* Deterministic Native SVG Dual-Axis HRV & RHR Chart */}
      <div className="w-full max-w-full h-[195px] sm:h-[225px] flex items-center justify-center bg-[#FDFCF9] rounded-lg border border-[#E6DFD1] p-1 overflow-hidden">
        <svg
          viewBox="0 0 620 225"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-[185px] sm:h-[215px] max-h-[215px] block select-none overflow-hidden"
          role="img"
          aria-label="منحنى تقلب معدل ضربات القلب HRV ونبض الراحة RHR"
        >
          <defs>
            <linearGradient id="hrvHealthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0B5D46" stopOpacity="0.28" />
              <stop offset="95%" stopColor="#0B5D46" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines + Left Y-Axis (HRV ms) & Right Y-Axis (RHR bpm) Labels */}
          {[
            { hrv: 110, rhr: 66 },
            { hrv: 90, rhr: 58 },
            { hrv: 70, rhr: 50 },
            { hrv: 50, rhr: 42 },
          ].map((row) => {
            const y = getHrvY(row.hrv);
            return (
              <g key={row.hrv}>
                <line
                  x1={plotLeft}
                  y1={y}
                  x2={plotRight}
                  y2={y}
                  stroke="#E5DEC9"
                  strokeDasharray="3 3"
                />
                <text
                  x={plotLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#0B5D46"
                  fontSize="9.5"
                  fontWeight="600"
                >
                  {row.hrv}ms
                </text>
                <text
                  x={plotRight + 6}
                  y={y + 3.5}
                  textAnchor="start"
                  fill="#B45309"
                  fontSize="9.5"
                  fontWeight="600"
                >
                  {row.rhr}bpm
                </text>
              </g>
            );
          })}

          {/* Baseline Reference Line (84 ms) */}
          <line
            x1={plotLeft}
            y1={baselineY}
            x2={plotRight}
            y2={baselineY}
            stroke="#B8955A"
            strokeWidth="1.3"
            strokeDasharray="4 4"
          />
          <text
            x={plotLeft + 6}
            y={baselineY - 5}
            textAnchor="start"
            fill="#8C6D36"
            fontSize="9.5"
            fontWeight="700"
          >
            خط الأساس 84ms
          </text>

          {/* HRV Shaded Area & Smooth Curve */}
          {hrvAreaPath && <path d={hrvAreaPath} fill="url(#hrvHealthGrad)" />}
          {hrvLinePath && (
            <path
              d={hrvLinePath}
              fill="none"
              stroke="#0B5D46"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* RHR Line Curve */}
          {rhrLinePath && (
            <path
              d={rhrLinePath}
              fill="none"
              stroke="#B45309"
              strokeWidth="2"
              strokeDasharray="3 2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Data Columns, Dots, and Value Labels */}
          {data.map((d, i) => {
            const x = getX(i);
            const yHrv = getHrvY(d.rmssd);
            const yRhr = getRhrY(d.rhr);
            const isSel = d.id === selectedEntry?.id;
            const showDate = data.length <= 8 || i % 2 === 0 || isSel || i === data.length - 1;

            return (
              <g
                key={d.id}
                onClick={() => onSelectRecord(d.id)}
                className="cursor-pointer"
              >
                {/* Invisible wide click hit-area for touch/mouse */}
                <rect
                  x={x - plotW / Math.max(2, data.length * 2)}
                  y={plotTop}
                  width={plotW / Math.max(1, data.length)}
                  height={plotH + 25}
                  fill="transparent"
                />

                {isSel && (
                  <line
                    x1={x}
                    y1={plotTop}
                    x2={x}
                    y2={plotBottom}
                    stroke="#0B5D46"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* RHR Dot */}
                <circle
                  cx={x}
                  cy={yRhr}
                  r={isSel ? '4.5' : '3'}
                  fill="#B45309"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />

                {/* HRV Dot */}
                <circle
                  cx={x}
                  cy={yHrv}
                  r={isSel ? '6' : '3.8'}
                  fill="#0B5D46"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                />

                {/* Value Callout on Selected or Key Nodes */}
                {(isSel || data.length <= 7) && (
                  <text
                    x={x}
                    y={Math.max(15, yHrv - 9)}
                    textAnchor="middle"
                    fill={isSel ? '#0B5D46' : '#3E3B34'}
                    fontSize={isSel ? '10' : '9'}
                    fontWeight="700"
                  >
                    {d.rmssd}
                  </text>
                )}

                {/* X-Axis Date Label */}
                {showDate && (
                  <text
                    x={x}
                    y={plotBottom + 18}
                    textAnchor="middle"
                    fill={isSel ? '#0B5D46' : '#5E5A50'}
                    fontSize="9.5"
                    fontWeight={isSel ? '700' : '500'}
                  >
                    {d.dateLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Day Selector Strip — wraps cleanly on mobile without horizontal scroll */}
      <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-[#E6DFD1]">
        <span className="text-[11px] text-[#7A7264] shrink-0 ml-1">اختر اليوم:</span>
        {records.map((r) => {
          const active = r.id === selectedId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectRecord(r.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono-num shrink-0 transition-colors cursor-pointer ${
                active
                  ? 'bg-[#0B5D46] text-white font-bold'
                  : 'bg-[#FDFCF9] text-[#5E5A50] border border-[#E6DFD1] hover:border-[#0B5D46]'
              }`}
            >
              {r.date.slice(5)}
            </button>
          );
        })}
      </div>

      {/* Integrated HRV Coaching Advice Banner */}
      {selectedEntry && (
        <div className="pt-2 border-t border-[#E6DFD1] text-xs">
          <strong className="text-[#0B5D46]">توجيه توازن النبض (HRV): </strong>
          <span className="text-[#3E3B34]">
            {selectedEntry.rmssd >= 80
              ? `قراءة ممتازة (${selectedEntry.rmssd} ms) تفوق خط الأساس؛ الجهاز العصبي جاهز لتحمل الحصص التنافسية والسرعات.`
              : selectedEntry.rmssd >= 65
              ? `قراءة مستقرة (${selectedEntry.rmssd} ms)؛ حافظ على شدة هوائية متوسطة وتدرّج في الإحماء 15 دقيقة.`
              : `هبوط في HRV (${selectedEntry.rmssd} ms) مع ارتفاع نبض الراحة (${selectedEntry.rhr} bpm)؛ يُنصح بيوم استشفاء نشط وتنفس حجابي.`}
          </span>
        </div>
      )}
    </div>
  );
};

interface SleepStackedChartProps {
  records: DailyBiometricRecord[];
  selectedId: string;
  onSelectRecord: (id: string) => void;
}

export const SleepStackedBarChart: React.FC<SleepStackedChartProps> = ({
  records,
  selectedId,
  onSelectRecord,
}) => {
  const data = records.map((r) => {
    const deepHours = Number((r.sleep.deepMinutes / 60).toFixed(2));
    const remHours = Number((r.sleep.remMinutes / 60).toFixed(2));
    const lightHours = Number((r.sleep.lightMinutes / 60).toFixed(2));
    const awakeHours = Number((r.sleep.awakeMinutes / 60).toFixed(2));
    return {
      id: r.id,
      dateLabel: r.date.slice(5),
      deepHours,
      remHours,
      lightHours,
      awakeHours,
      totalHours: Number((deepHours + remHours + lightHours + awakeHours).toFixed(1)),
      efficiency: r.sleep.efficiencyPercent,
    };
  });

  const selectedEntry = data.find((d) => d.id === selectedId) || data[data.length - 1] || data[0];

  const plotLeft = 42;
  const plotRight = 595;
  const plotTop = 22;
  const plotBottom = 182;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;
  const maxHours = 10.5;

  const hToPx = (hrs: number) => Number(((Math.max(0, hrs) / maxHours) * plotH).toFixed(1));
  const colStep = plotW / Math.max(1, data.length);
  const barW = Math.min(28, Math.max(12, Math.floor(colStep * 0.56)));

  return (
    <div className="w-full min-w-0 bg-[#FAF7F0]/70 rounded-lg border border-[#E6DFD1] p-2.5 sm:p-3 space-y-2 overflow-hidden">
      {/* Top Legend Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pb-1 border-b border-[#E6DFD1]">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1 font-bold text-[#1E4E68]">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#1E4E68] inline-block" />
            نوم عميق
          </span>
          <span className="flex items-center gap-1 font-bold text-[#0B5D46]">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#0B5D46] inline-block" />
            حركة العين REM
          </span>
          <span className="flex items-center gap-1 font-semibold text-[#7A7264]">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#C7B99E] inline-block" />
            نوم خفيف
          </span>
          <span className="flex items-center gap-1 font-semibold text-[#B45309]">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#B45309] inline-block" />
            يقظة
          </span>
        </div>
        {selectedEntry && (
          <span className="font-mono-num text-[11px] bg-[#FDFCF9] px-2 py-0.5 rounded border border-[#DFD8C8]">
            <strong className="text-[#1E4E68]">{selectedEntry.dateLabel}:</strong>{' '}
            عميق {selectedEntry.deepHours}س · REM {selectedEntry.remHours}س (كفاءة {selectedEntry.efficiency}%)
          </span>
        )}
      </div>

      {/* Deterministic Native SVG Stacked Bar Chart */}
      <div className="w-full max-w-full h-[195px] sm:h-[225px] flex items-center justify-center bg-[#FDFCF9] rounded-lg border border-[#E6DFD1] p-1 overflow-hidden">
        <svg
          viewBox="0 0 620 225"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-[185px] sm:h-[215px] max-h-[215px] block select-none overflow-hidden"
          role="img"
          aria-label="سجل مراحل النوم الليلي"
        >
          {/* Horizontal Hour Grid Lines */}
          {[2, 4, 6, 8, 10].map((hr) => {
            const y = plotBottom - hToPx(hr);
            return (
              <g key={hr}>
                <line
                  x1={plotLeft}
                  y1={y}
                  x2={plotRight}
                  y2={y}
                  stroke={hr === 8 ? '#0B5D46' : '#E5DEC9'}
                  strokeDasharray={hr === 8 ? '4 4' : '3 3'}
                  strokeWidth={hr === 8 ? '1.1' : '0.9'}
                />
                <text
                  x={plotLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fill={hr === 8 ? '#0B5D46' : '#5E5A50'}
                  fontSize="9.5"
                  fontWeight={hr === 8 ? '700' : '500'}
                >
                  {hr}h
                </text>
              </g>
            );
          })}

          {/* Stacked Sleep Bars per Night */}
          {data.map((d, i) => {
            const centerX = Number((plotLeft + (i + 0.5) * colStep).toFixed(1));
            const x = centerX - barW / 2;
            const isSel = d.id === selectedEntry?.id;

            const hDeep = hToPx(d.deepHours);
            const hRem = hToPx(d.remHours);
            const hLight = hToPx(d.lightHours);
            const hAwake = hToPx(d.awakeHours);

            const yDeep = plotBottom - hDeep;
            const yRem = yDeep - hRem;
            const yLight = yRem - hLight;
            const yAwake = yLight - hAwake;

            const showDate = data.length <= 8 || i % 2 === 0 || isSel || i === data.length - 1;

            return (
              <g
                key={d.id}
                onClick={() => onSelectRecord(d.id)}
                className="cursor-pointer"
              >
                {/* Highlight background for selected night */}
                {isSel && (
                  <rect
                    x={centerX - barW / 2 - 4}
                    y={plotTop - 4}
                    width={barW + 8}
                    height={plotH + 6}
                    rx="5"
                    fill="#0B5D46"
                    fillOpacity="0.08"
                    stroke="#0B5D46"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Deep Sleep (Bottom) */}
                <rect x={x} y={yDeep} width={barW} height={hDeep} fill="#1E4E68" />
                {/* REM Sleep */}
                <rect x={x} y={yRem} width={barW} height={hRem} fill="#0B5D46" />
                {/* Light Sleep */}
                <rect x={x} y={yLight} width={barW} height={hLight} fill="#C7B99E" />
                {/* Awake (Top) */}
                <rect
                  x={x}
                  y={yAwake}
                  width={barW}
                  height={Math.max(2, hAwake)}
                  rx="2"
                  fill="#B45309"
                />

                {/* Total Hours Callout above Bar */}
                {(isSel || data.length <= 7) && (
                  <text
                    x={centerX}
                    y={Math.max(14, yAwake - 5)}
                    textAnchor="middle"
                    fill={isSel ? '#1E4E68' : '#5E5A50'}
                    fontSize="9"
                    fontWeight="700"
                  >
                    {d.totalHours}h
                  </text>
                )}

                {showDate && (
                  <text
                    x={centerX}
                    y={plotBottom + 18}
                    textAnchor="middle"
                    fill={isSel ? '#1E4E68' : '#5E5A50'}
                    fontSize="9.5"
                    fontWeight={isSel ? '700' : '500'}
                  >
                    {d.dateLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Night Selector Strip — wraps cleanly on mobile without horizontal scroll */}
      <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-[#E6DFD1]">
        <span className="text-[11px] text-[#7A7264] shrink-0 ml-1">اختر الليلة:</span>
        {records.map((r) => {
          const active = r.id === selectedId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectRecord(r.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono-num shrink-0 transition-colors cursor-pointer ${
                active
                  ? 'bg-[#1E4E68] text-white font-bold'
                  : 'bg-[#FDFCF9] text-[#5E5A50] border border-[#E6DFD1] hover:border-[#1E4E68]'
              }`}
            >
              {r.date.slice(5)}
            </button>
          );
        })}
      </div>

      {/* Integrated Sleep Trend Coaching Advice Banner */}
      {selectedEntry && (
        <div className="pt-2 border-t border-[#E6DFD1] text-xs">
          <strong className="text-[#1E4E68]">توجيه هندسة النوم الليلي: </strong>
          <span className="text-[#3E3B34]">
            {selectedEntry.deepHours >= 1.75
              ? `حصة النوم العميق ممتازة (${selectedEntry.deepHours} ساعة) وتدعم إفراز هرمون النمو البنائي واستشفاء الألياف.`
              : `النوم العميق (${selectedEntry.deepHours} ساعة) أقل من المستهدف؛ يُنصح بخفض حرارة الغرفة إلى 19°C وتناول المغنيسيوم قبل النوم بـ 60 دقيقة.`}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Horizontal Sleep Stage Distribution & Clinical Target Comparison Bar Chart
 * (Replaces the Pie/Donut Chart with a clean multi-stage horizontal bar chart + actionable sleep advice)
 */
export const SleepDonutBreakdown: React.FC<{ record: DailyBiometricRecord }> = ({ record }) => {
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);

  const total = Math.max(1, record.sleep.totalMinutes);
  const hrs = Math.floor(total / 60);
  const mins = total % 60;

  const stages = [
    {
      name: 'نوم عميق SWS (بناء عضلي)',
      shortName: 'عميق SWS',
      value: record.sleep.deepMinutes,
      targetMinutes: 115,
      pct: Math.round((record.sleep.deepMinutes / total) * 100),
      targetPct: 23,
      color: '#1E4E68',
      role: 'إفراز هرمون النمو البنائي وإصلاح الأنسجة العضلية وتجديد الجليكوجين.',
      advice:
        record.sleep.deepMinutes >= 105
          ? 'المستوى مثالي؛ حافظ على توقيت النوم الحالي وتجنب الشاشات قبل النوم.'
          : 'لتعزيز النوم العميق الليلة: تناول 400 ملغ مغنيسيوم بيسجليسينات وابرّد الغرفة إلى 19°C.',
    },
    {
      name: 'حركة العين السريعة REM (تآزر عصبي)',
      shortName: 'نوم REM',
      value: record.sleep.remMinutes,
      targetMinutes: 115,
      pct: Math.round((record.sleep.remMinutes / total) * 100),
      targetPct: 23,
      color: '#0B5D46',
      role: 'استشفاء الجهاز العصبي المركزي وتثبيت المهارات الحركية والتوافق العصبي.',
      advice:
        record.sleep.remMinutes >= 100
          ? 'استشفاء عصبي ممتاز يدعم سرعة رد الفعل والتركيز التكتيكي اليوم.'
          : 'تجنب المنبهات بعد الظهر وأضف 30 دقيقة نوم صباحي لرفع حصة REM في الدورات الأخيرة.',
    },
    {
      name: 'نوم خفيف N1/N2 (تهدئة الأيض)',
      shortName: 'نوم خفيف',
      value: record.sleep.lightMinutes,
      targetMinutes: 245,
      pct: Math.round((record.sleep.lightMinutes / total) * 100),
      targetPct: 50,
      color: '#8C6D36',
      role: 'المرحلة الانتقالية لتهدئة معدل ضربات القلب وخفض حرارة الجسم الأساسية.',
      advice: 'يمثل القاعدة الأساسية لربط دورات النوم الخمس وتنظيم معدل التنفس الليلي.',
    },
    {
      name: 'يقظة ليلية متقطعة',
      shortName: 'يقظة',
      value: record.sleep.awakeMinutes,
      targetMinutes: 20,
      pct: Math.round((record.sleep.awakeMinutes / total) * 100),
      targetPct: 4,
      color: '#B45309',
      role: 'فترات الاستيقاظ القصيرة بين دورات النوم (الطبيعي أقل من 5% من إجمالي النوم).',
      advice:
        record.sleep.awakeMinutes <= 22
          ? 'نوم متصل عالي الكفاءة؛ استمرارية النوم ممتازة.'
          : 'لتقليل التقطع الليلي: أوقف شرب السوائل الكثيفة قبل النوم بـ 90 دقيقة.',
    },
  ];

  const activeStage = stages[selectedStageIndex] || stages[0];

  return (
    <div className="w-full min-w-0 bg-[#FAF7F0]/70 rounded-lg border border-[#E6DFD1] p-3.5 space-y-3 overflow-hidden">
      {/* Top Summary Bar + Stacked 100% Horizontal Proportion Bar Chart */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-[#14241F]">
            توزيع مراحل النوم الكلي: <strong className="font-mono-num text-[#0B5D46]">{hrs}س {mins}د</strong>
          </span>
          <span className="font-mono-num text-[11px] text-[#5E5A50]">
            كفاءة النوم: <strong className="text-[#1E4E68]">{record.sleep.efficiencyPercent}%</strong> · كمون: {record.sleep.latencyMinutes} د
          </span>
        </div>

        {/* 100% Stacked Horizontal Distribution Bar (Replaces Pie/Donut Chart) */}
        <div className="w-full h-6 rounded-lg overflow-hidden flex gap-0.5 bg-[#EAE4D7] p-0.5">
          {stages.map((st, idx) => (
            <button
              key={st.name}
              type="button"
              onClick={() => setSelectedStageIndex(idx)}
              style={{
                width: `${Math.max(6, st.pct)}%`,
                backgroundColor: st.color,
              }}
              className={`h-full first:rounded-r-md last:rounded-l-md transition-all flex items-center justify-center text-[10px] font-mono-num font-bold text-white cursor-pointer ${
                selectedStageIndex === idx ? 'ring-2 ring-[#14241F] z-10' : 'opacity-90 hover:opacity-100'
              }`}
              title={`${st.name}: ${st.value} دقيقة (${st.pct}%)`}
            >
              {st.pct >= 12 ? `${st.pct}%` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Comparison Bars (Actual vs Target Duration for each Sleep Stage) */}
      <div className="space-y-2 text-xs">
        {stages.map((stage, idx) => {
          const isSelected = selectedStageIndex === idx;
          const barFillPct = Math.min(
            100,
            Math.round((stage.value / Math.max(stage.targetMinutes * 1.25, 60)) * 100)
          );
          return (
            <button
              key={stage.name}
              type="button"
              onClick={() => setSelectedStageIndex(idx)}
              className={`w-full p-2.5 rounded-lg border transition-colors text-right cursor-pointer space-y-1.5 ${
                isSelected
                  ? 'bg-[#EDF7F4] border-[#0B5D46]'
                  : 'bg-[#FDFCF9] border-[#E6DFD1] hover:border-[#B8955A]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-bold text-[#14241F] truncate">{stage.name}</span>
                </div>
                <span className="font-mono-num text-[11px] text-[#5E5A50] shrink-0">
                  <strong className="text-[#14241F]">{stage.value} د</strong> ({stage.pct}%) · المستهدف {stage.targetMinutes} د
                </span>
              </div>

              <div className="w-full h-2 bg-[#EAE4D7] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${barFillPct}%`, backgroundColor: stage.color }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Sleep Stage Actionable Coaching Advice */}
      <div className="pt-2.5 border-t border-[#E6DFD1] text-xs space-y-1">
        <div className="flex items-center justify-between gap-2">
          <strong className="text-[#14241F]">{activeStage.name}:</strong>
          <span className="font-mono-num font-bold text-[#0B5D46] shrink-0">
            {activeStage.value} دقيقة ({activeStage.pct}%)
          </span>
        </div>
        <p className="text-[#5E5A50] text-[11px]">{activeStage.role}</p>
        <div className="text-[11px] font-semibold text-[#0B5D46]">
          التوجيه العلاجي: {activeStage.advice}
        </div>
      </div>
    </div>
  );
};

/**
 * Interactive SVG Poincaré Plot (SD1 / SD2) for Autonomic Nervous System HRV Sub-Tab
 */
export const PoincareAutonomicPlot: React.FC<{ record: DailyBiometricRecord }> = ({
  record,
}) => {
  const sd1 = record.hrv.morningPoincareSD1;
  const sd2 = record.hrv.morningPoincareSD2;
  const meanRR = Math.round(60000 / Math.max(38, record.restingHeartRate));

  // Generate deterministic R-R interval scatter points around meanRR based on SD1 & SD2
  const points = useMemo(() => {
    const arr: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const radialFactor = ((i * 7) % 11) / 11;
      const u = Math.cos(angle) * sd2 * (0.35 + radialFactor * 0.65);
      const v = Math.sin(angle) * sd1 * (0.35 + radialFactor * 0.65);
      const rrN = meanRR + (u - v) * 0.707;
      const rrNext = meanRR + (u + v) * 0.707;
      arr.push({ x: rrN, y: rrNext });
    }
    return arr;
  }, [sd1, sd2, meanRR]);

  const mapToSvg = (rr: number) => {
    // Map RR [850..1650 ms] -> [45..355]
    const clamped = Math.max(850, Math.min(1650, rr));
    return 45 + ((clamped - 850) / 800) * 310;
  };

  const centerSvgX = mapToSvg(meanRR);
  const centerSvgY = 235 - (mapToSvg(meanRR) - 45) * (190 / 310);
  const rx = Math.max(18, Math.min(85, (sd2 / 800) * 310));
  const ry = Math.max(10, Math.min(52, (sd1 / 800) * 190));

  return (
    <div className="w-full min-w-0 bg-[#FAF7F0]/70 rounded-lg border border-[#E6DFD1] p-2.5 sm:p-3 space-y-2 overflow-hidden">
      <div className="w-full max-w-full h-[190px] sm:h-[220px] flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 400 250"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-[185px] sm:h-[215px] max-h-[215px] block select-none overflow-hidden"
          role="img"
          aria-label="مخطط بوانكاريه لفترات النبض SD1/SD2"
        >
        {/* Grid lines */}
        {[80, 130, 180].map((y) => (
          <line
            key={y}
            x1="45"
            y1={y}
            x2="365"
            y2={y}
            stroke="#E5DEC9"
            strokeDasharray="3 3"
          />
        ))}
        {[110, 195, 280].map((x) => (
          <line
            key={x}
            x1={x}
            y1="25"
            x2={x}
            y2="215"
            stroke="#E5DEC9"
            strokeDasharray="3 3"
          />
        ))}

        {/* Identity Line RR(n) = RR(n+1) */}
        <line
          x1="55"
          y1="210"
          x2="355"
          y2="30"
          stroke="#B8955A"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />

        {/* SD1 / SD2 Confidence Ellipse */}
        <g transform={`translate(${centerSvgX}, ${centerSvgY}) rotate(-31)`}>
          <ellipse
            cx="0"
            cy="0"
            rx={rx}
            ry={ry}
            fill="#0B5D46"
            fillOpacity="0.16"
            stroke="#0B5D46"
            strokeWidth="2"
          />
          <line x1={-rx} y1="0" x2={rx} y2="0" stroke="#0B5D46" strokeWidth="1.2" />
          <line x1="0" y1={-ry} x2="0" y2={ry} stroke="#B45309" strokeWidth="1.5" />
        </g>

        {/* R-R Scatter Points */}
        {points.map((pt, idx) => {
          const sx = mapToSvg(pt.x);
          const sy = 235 - (mapToSvg(pt.y) - 45) * (190 / 310);
          return (
            <circle
              key={idx}
              cx={sx}
              cy={sy}
              r="3"
              fill="#0B5D46"
              fillOpacity="0.75"
              stroke="#FFFFFF"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Axes Labels */}
        <text x="205" y="238" textAnchor="middle" fill="#5E5A50" fontSize="10" fontWeight="600">
          فترة النبض RR(n) بالمللي ثانية (متوسط {meanRR} ms)
        </text>
        <text x="355" y="22" textAnchor="end" fill="#0B5D46" fontSize="10" fontWeight="700">
          SD1: {sd1} ms · SD2: {sd2} ms (نسبة SD1/SD2 = {(sd1 / Math.max(1, sd2)).toFixed(2)})
        </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-[#FDFCF9] p-2 rounded-lg border border-[#E6DFD1]">
        <div>
          <span className="text-[#7A7264] block">المحور العرضي SD1 (لاودي)</span>
          <strong className="font-mono-num text-[#0B5D46]">{sd1} ms</strong>
        </div>
        <div>
          <span className="text-[#7A7264] block">المحور الطولي SD2 (كلي)</span>
          <strong className="font-mono-num text-[#14241F]">{sd2} ms</strong>
        </div>
        <div>
          <span className="text-[#7A7264] block">متوسط فترة النبض R-R</span>
          <strong className="font-mono-num text-[#B45309]">{meanRR} ms</strong>
        </div>
      </div>
    </div>
  );
};

/**
 * Interactive Nightly Sleep Cycles Hypnogram for Sleep Architecture Sub-Tab
 */
export const NightlySleepHypnogram: React.FC<{ record: DailyBiometricRecord }> = ({
  record,
}) => {
  // 5 ultradian 90-min sleep cycles across the night
  const cycles = [
    { cycle: 'الدورة 1 (23:00)', stage: 'عميق SWS', level: 4, duration: '90 د', color: '#1E4E68' },
    { cycle: 'الدورة 2 (00:30)', stage: 'عميق SWS + REM', level: 4, duration: '95 د', color: '#1E4E68' },
    { cycle: 'الدورة 3 (02:05)', stage: 'خفيف + REM', level: 3, duration: '90 د', color: '#0B5D46' },
    { cycle: 'الدورة 4 (03:35)', stage: 'حركة العين REM', level: 3, duration: '95 د', color: '#0B5D46' },
    { cycle: 'الدورة 5 (05:10)', stage: 'REM + استيقاظ', level: 2, duration: '85 د', color: '#C7B99E' },
  ];

  return (
    <div className="w-full min-w-0 bg-[#FAF7F0]/70 rounded-lg border border-[#E6DFD1] p-2.5 sm:p-3.5 space-y-3 overflow-hidden">
      <div className="w-full max-w-full h-[145px] sm:h-[170px] flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 520 175"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-[140px] sm:h-[165px] max-h-[165px] block select-none overflow-hidden"
          role="img"
          aria-label="مخطط دورات النوم الليلي (Hypnogram)"
        >
          {/* Stage horizontal guides */}
          {[
            { y: 28, label: 'يقظة', color: '#B45309' },
            { y: 65, label: 'حركة العين REM', color: '#0B5D46' },
            { y: 102, label: 'نوم خفيف N2', color: '#8C6D36' },
            { y: 140, label: 'نوم عميق SWS', color: '#1E4E68' },
          ].map((row) => (
            <g key={row.label}>
              <line
                x1="95"
                y1={row.y}
                x2="500"
                y2={row.y}
                stroke="#E5DEC9"
                strokeDasharray="3 3"
              />
              <text
                x="88"
                y={row.y + 4}
                textAnchor="end"
                fill={row.color}
                fontSize="10"
                fontWeight="700"
              >
                {row.label}
              </text>
            </g>
          ))}

          {/* Step Hypnogram Path */}
          <path
            d="M 100 28 L 120 28 L 120 102 L 145 102 L 145 140 L 195 140 L 195 65 L 220 65 L 220 102 L 245 102 L 245 140 L 285 140 L 285 65 L 325 65 L 325 102 L 360 102 L 360 65 L 415 65 L 415 28 L 425 28 L 425 102 L 455 102 L 455 65 L 490 65 L 490 28"
            fill="none"
            stroke="#1E4E68"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* Time markers */}
          <text x="105" y="166" fill="#5E5A50" fontSize="10" textAnchor="middle">
            {record.sleep.bedtime}
          </text>
          <text x="230" y="166" fill="#5E5A50" fontSize="10" textAnchor="middle">
            01:00
          </text>
          <text x="355" y="166" fill="#5E5A50" fontSize="10" textAnchor="middle">
            03:30
          </text>
          <text x="485" y="166" fill="#5E5A50" fontSize="10" textAnchor="middle">
            {record.sleep.wakeTime}
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-[11px]">
        {cycles.map((c) => (
          <div
            key={c.cycle}
            className="p-2 rounded-lg bg-[#FDFCF9] border border-[#E6DFD1] text-center"
          >
            <div className="font-bold text-[#14241F]">{c.cycle}</div>
            <div className="font-semibold mt-0.5" style={{ color: c.color }}>
              {c.stage}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ACWRChartProps {
  records: DailyBiometricRecord[];
  selectedId: string;
  onSelectRecord: (id: string) => void;
}

export const ACWRWorkloadChart: React.FC<ACWRChartProps> = ({
  records,
  selectedId,
  onSelectRecord,
}) => {
  const data = records.map((r) => ({
    id: r.id,
    dateLabel: r.date.slice(5),
    acuteLoad: r.acuteLoad,
    chronicLoad: r.chronicLoad,
    acwr: r.acwr,
  }));

  const selectedEntry = data.find((d) => d.id === selectedId) || data[data.length - 1] || data[0];

  const plotLeft = 46;
  const plotRight = 576;
  const plotTop = 24;
  const plotBottom = 182;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;
  const colStep = plotW / Math.max(1, data.length);
  const singleBarW = Math.min(13, Math.max(6, Math.floor(colStep * 0.28)));

  // Left Y-axis: Load AU [0 .. 1100]
  const getLoadH = (val: number) => {
    const clamped = Math.max(0, Math.min(1100, val));
    return Number(((clamped / 1100) * plotH).toFixed(1));
  };

  // Right Y-axis: ACWR Ratio [0.70 .. 1.60]
  const getAcwrY = (val: number) => {
    const clamped = Math.max(0.7, Math.min(1.6, val));
    return Number((plotBottom - ((clamped - 0.7) / 0.9) * plotH).toFixed(1));
  };

  const getColCenterX = (i: number) => Number((plotLeft + (i + 0.5) * colStep).toFixed(1));
  const acwrLinePath =
    data.length > 0
      ? `M ${data.map((d, i) => `${getColCenterX(i)},${getAcwrY(d.acwr)}`).join(' L ')}`
      : '';
  const thresholdY = getAcwrY(1.3);

  return (
    <div className="w-full min-w-0 bg-[#FAF7F0]/70 rounded-lg border border-[#E6DFD1] p-2.5 sm:p-3 space-y-2 overflow-hidden">
      {/* Top Legend Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pb-1 border-b border-[#E6DFD1]">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1 font-bold text-[#0B5D46]">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#0B5D46] inline-block" />
            الحمل الحاد (7 أيام)
          </span>
          <span className="flex items-center gap-1 font-semibold text-[#7A7264]">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D5CBB8] inline-block" />
            الحمل المزمن (28 يوماً)
          </span>
          <span className="flex items-center gap-1 font-bold text-[#B91C1C]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B91C1C] inline-block" />
            نسبة الإجهاد ACWR
          </span>
        </div>
        {selectedEntry && (
          <span className="font-mono-num text-[11px] bg-[#FDFCF9] px-2 py-0.5 rounded border border-[#DFD8C8]">
            <strong className="text-[#14241F]">{selectedEntry.dateLabel}:</strong>{' '}
            حاد {selectedEntry.acuteLoad} AU · مزمن {selectedEntry.chronicLoad} AU ·{' '}
            <strong className={selectedEntry.acwr >= 1.3 ? 'text-[#B91C1C]' : 'text-[#0B5D46]'}>
              ACWR {selectedEntry.acwr}
            </strong>
          </span>
        )}
      </div>

      {/* Deterministic Native SVG Dual-Axis ACWR Workload Chart */}
      <div className="w-full max-w-full h-[195px] sm:h-[225px] flex items-center justify-center bg-[#FDFCF9] rounded-lg border border-[#E6DFD1] p-1 overflow-hidden">
        <svg
          viewBox="0 0 620 225"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-[185px] sm:h-[215px] max-h-[215px] block select-none overflow-hidden"
          role="img"
          aria-label="مخطط توازن الحمل التدريبي الحاد والمزمن ACWR"
        >
          {/* Horizontal Grid Lines + Left Y-Axis (AU) & Right Y-Axis (ACWR) */}
          {[
            { load: 1000, ratio: '1.50' },
            { load: 750, ratio: '1.30' },
            { load: 500, ratio: '1.10' },
            { load: 250, ratio: '0.90' },
          ].map((row) => {
            const y = plotBottom - getLoadH(row.load);
            return (
              <g key={row.load}>
                <line
                  x1={plotLeft}
                  y1={y}
                  x2={plotRight}
                  y2={y}
                  stroke="#E5DEC9"
                  strokeDasharray="3 3"
                />
                <text
                  x={plotLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#5E5A50"
                  fontSize="9.5"
                >
                  {row.load}
                </text>
                <text
                  x={plotRight + 6}
                  y={y + 3.5}
                  textAnchor="start"
                  fill="#B91C1C"
                  fontSize="9.5"
                  fontWeight="600"
                >
                  {row.ratio}
                </text>
              </g>
            );
          })}

          {/* Danger Threshold Line (ACWR = 1.30) */}
          <line
            x1={plotLeft}
            y1={thresholdY}
            x2={plotRight}
            y2={thresholdY}
            stroke="#B91C1C"
            strokeWidth="1.3"
            strokeDasharray="4 4"
          />
          <text
            x={plotRight - 6}
            y={thresholdY - 5}
            textAnchor="end"
            fill="#B91C1C"
            fontSize="9.5"
            fontWeight="700"
          >
            عتبة خطر الإصابة 1.30
          </text>

          {/* Grouped Chronic & Acute Load Bars */}
          {data.map((d, i) => {
            const centerX = getColCenterX(i);
            const isSel = d.id === selectedEntry?.id;
            const hChronic = getLoadH(d.chronicLoad);
            const hAcute = getLoadH(d.acuteLoad);
            const showDate = data.length <= 8 || i % 2 === 0 || isSel || i === data.length - 1;

            return (
              <g
                key={d.id}
                onClick={() => onSelectRecord(d.id)}
                className="cursor-pointer"
              >
                {isSel && (
                  <rect
                    x={centerX - singleBarW - 4}
                    y={plotTop - 4}
                    width={singleBarW * 2 + 10}
                    height={plotH + 6}
                    rx="5"
                    fill="#B45309"
                    fillOpacity="0.08"
                    stroke="#B45309"
                    strokeWidth="1.1"
                    strokeDasharray="2 2"
                  />
                )}
                {/* Chronic Load Bar */}
                <rect
                  x={centerX - singleBarW - 1}
                  y={plotBottom - hChronic}
                  width={singleBarW}
                  height={hChronic}
                  rx="2"
                  fill="#D5CBB8"
                />
                {/* Acute Load Bar */}
                <rect
                  x={centerX + 1}
                  y={plotBottom - hAcute}
                  width={singleBarW}
                  height={hAcute}
                  rx="2"
                  fill="#0B5D46"
                />

                {showDate && (
                  <text
                    x={centerX}
                    y={plotBottom + 18}
                    textAnchor="middle"
                    fill={isSel ? '#B45309' : '#5E5A50'}
                    fontSize="9.5"
                    fontWeight={isSel ? '700' : '500'}
                  >
                    {d.dateLabel}
                  </text>
                )}
              </g>
            );
          })}

          {/* ACWR Ratio Line Overlay */}
          {acwrLinePath && (
            <path
              d={acwrLinePath}
              fill="none"
              stroke="#B91C1C"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* ACWR Ratio Dots & Labels */}
          {data.map((d, i) => {
            const centerX = getColCenterX(i);
            const yAcwr = getAcwrY(d.acwr);
            const isSel = d.id === selectedEntry?.id;
            return (
              <g
                key={`acwr-pt-${d.id}`}
                onClick={() => onSelectRecord(d.id)}
                className="cursor-pointer"
              >
                <circle
                  cx={centerX}
                  cy={yAcwr}
                  r={isSel ? '5.5' : '3.5'}
                  fill={d.acwr >= 1.3 ? '#B91C1C' : '#0B5D46'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
                {(isSel || data.length <= 7) && (
                  <text
                    x={centerX}
                    y={Math.max(15, yAcwr - 8)}
                    textAnchor="middle"
                    fill={d.acwr >= 1.3 ? '#B91C1C' : '#14241F'}
                    fontSize="9.5"
                    fontWeight="700"
                  >
                    {d.acwr}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Day Selector Strip — wraps cleanly on mobile without horizontal scroll */}
      <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-[#E6DFD1]">
        <span className="text-[11px] text-[#7A7264] shrink-0 ml-1">اختر اليوم:</span>
        {records.map((r) => {
          const active = r.id === selectedId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectRecord(r.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono-num shrink-0 transition-colors cursor-pointer ${
                active
                  ? 'bg-[#B45309] text-white font-bold'
                  : 'bg-[#FDFCF9] text-[#5E5A50] border border-[#E6DFD1] hover:border-[#B45309]'
              }`}
            >
              {r.date.slice(5)}
            </button>
          );
        })}
      </div>

      {/* Integrated ACWR Workload Advice Banner */}
      {selectedEntry && (
        <div className="pt-2 border-t border-[#E6DFD1] text-xs">
          <strong
            className={
              selectedEntry.acwr >= 1.3 ? 'text-[#B91C1C]' : 'text-[#0B5D46]'
            }
          >
            توجيه تدرج الأحمال (ACWR {selectedEntry.acwr}):{' '}
          </strong>
          <span className="text-[#3E3B34]">
            {selectedEntry.acwr <= 1.2
              ? 'الحمل الحاد متوازن تماماً مع الحمل المزمن؛ يمكنك تنفيذ الحصة التدريبية المقررة بأمان.'
              : selectedEntry.acwr <= 1.3
              ? 'الحمل يقترب من الحد الأعلى؛ تجنب زيادة المسافة أو السرعة اليوم وركّز على الإطالة بعد التمرين.'
              : 'تحذير: تجاوز عتبة خطر الإصابات (1.30)؛ يجب خفض الحمل التدريبي اليوم 35% لحماية الأوتار.'}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Muscle Recovery Quality <-> Hydration & Electrolyte Precision Protocol Section
 * Links muscle group readiness, ACWR strain, skin temperature delta, and daily training duration
 * to exact fluid (mL) and electrolyte (Na+, K+, Mg2+, Ca2+) recommendations.
 */
export const MuscleHydrationElectrolyteSection: React.FC<{
  record: DailyBiometricRecord;
}> = ({ record }) => {
  const [ambientClimate, setAmbientClimate] = useState<'temperate' | 'warm' | 'hot'>('warm');
  const [loggedIntakeMl, setLoggedIntakeMl] = useState<number>(1750);

  const muscleRegions = useMemo(() => buildMuscleRegions(record), [record]);
  const avgMuscleReadiness = useMemo(
    () =>
      Math.round(
        muscleRegions.reduce((acc, m) => acc + m.readiness, 0) /
          Math.max(1, muscleRegions.length)
      ),
    [muscleRegions]
  );

  // Sort muscles from most fatigued (lowest readiness) to highest readiness
  const sortedByFatigue = useMemo(
    () => [...muscleRegions].sort((a, b) => a.readiness - b.readiness),
    [muscleRegions]
  );
  const mostStrainedMuscle = sortedByFatigue[0];

  const durationMins = record.trainingPrescription.recommendedDurationMinutes;
  const climateMultiplier =
    ambientClimate === 'hot' ? 1.28 : ambientClimate === 'warm' ? 1.12 : 1.0;
  const recoveryDeficitFactor =
    avgMuscleReadiness < 60 ? 1.22 : avgMuscleReadiness < 78 ? 1.1 : 1.0;
  const skinTempExtraMl = record.skinTempDelta > 0.2 ? Math.round(record.skinTempDelta * 450) : 0;

  // Fluid distribution (Pre, Intra, Post, Total Daily)
  const preWorkoutMl = Math.round(480 * climateMultiplier);
  const intraWorkoutMl = Math.round((durationMins / 60) * 760 * climateMultiplier);
  const postWorkoutRecoveryMl = Math.round(
    820 * recoveryDeficitFactor * climateMultiplier + skinTempExtraMl
  );
  const totalDailyTargetMl = Math.round(
    2400 + preWorkoutMl + intraWorkoutMl + postWorkoutRecoveryMl * 0.65
  );

  // Electrolyte Concentrations (mg) linked to muscle recovery & sweat loss
  const sodiumMgPerL = Math.round(
    (avgMuscleReadiness < 65 ? 920 : 720) *
      (ambientClimate === 'hot' ? 1.25 : ambientClimate === 'warm' ? 1.1 : 1.0)
  );
  const potassiumMg = Math.round(
    (avgMuscleReadiness < 65 ? 460 : 340) * recoveryDeficitFactor
  );
  const magnesiumMg = avgMuscleReadiness < 65 ? 450 : avgMuscleReadiness < 80 ? 380 : 320;
  const calciumMg = avgMuscleReadiness < 65 ? 280 : 220;

  const intakeProgressPct = Math.min(
    100,
    Math.round((loggedIntakeMl / Math.max(1, totalDailyTargetMl)) * 100)
  );

  return (
    <div className="space-y-4">
      {/* Top Row: Climate Slicer + Direct Link Between Muscle Readiness & Training Prescription */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-[#E6DFD1]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#0B5D46] font-bold font-mono-num">
              جاهزية العضلات: {avgMuscleReadiness}%
            </span>
            <span className="text-[#7A7264]">·</span>
            <span className="text-[#14241F] font-semibold">
              الحصة الموصى بها: {record.trainingSessionTitle} ({durationMins} د)
            </span>
            <span className="text-[#7A7264]">·</span>
            <span className="font-mono-num font-bold text-[#1E4E68]">
              هدف الإماهة اليومي: {(totalDailyTargetMl / 1000).toFixed(2)} لتر ({totalDailyTargetMl}{' '}
              مل)
            </span>
          </div>
          <p className="text-xs text-[#5E5A50] leading-relaxed">
            العضلة الأكثر حاجة لتعويض السوائل والشوارد اليوم:{' '}
            <strong className="text-[#B91C1C]">{mostStrainedMuscle.name}</strong> (جاهزية{' '}
            {mostStrainedMuscle.readiness}%) — {record.trainingPrescription.hydrationElectrolyteNote}
          </p>
        </div>

        {/* Climate / Ambient Temperature Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EAE4D7] rounded-lg shrink-0 self-start lg:self-center">
          {[
            { id: 'temperate', label: 'معتدل (20–24°C)' },
            { id: 'warm', label: 'دافئ (25–31°C)' },
            { id: 'hot', label: 'حار جداً (32–40°C)' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setAmbientClimate(c.id as 'temperate' | 'warm' | 'hot')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                ambientClimate === c.id
                  ? 'bg-[#0B5D46] text-white'
                  : 'text-[#5E5A50] hover:text-[#14241F]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Middle Grid: 3-Phase Fluid Timing Protocol + 4 Essential Muscle Electrolytes */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        {/* Left/Right 5 Cols: 3-Phase Peri-Workout Hydration Timing */}
        <div className="xl:col-span-5 bg-[#FAF7F0] rounded-xl border border-[#DFD8C8] p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-[#E6DFD1] pb-2 mb-3">
              <h4 className="text-xs font-bold text-[#14241F]">
                جدول توزيع السوائل المرتبط بالحصة التدريبية ({durationMins} دقيقة)
              </h4>
              <span className="text-[11px] font-mono-num text-[#1E4E68] font-bold">
                انحراف الحرارة: {record.skinTempDelta > 0 ? '+' : ''}
                {record.skinTempDelta}°C
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FDFCF9] border border-[#E6DFD1] flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[#14241F]">1. الإماهة التمهيدية (قبل التمرين بـ 90 د)</div>
                  <div className="text-[11px] text-[#5E5A50]">
                    تهيئة حجم البلازما وتروية الأوتار قبل البدء
                  </div>
                </div>
                <span className="font-mono-num font-bold text-sm text-[#1E4E68] shrink-0">
                  {preWorkoutMl} مل
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FDFCF9] border border-[#E6DFD1] flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[#14241F]">
                    2. الإماهة أثناء الحصة ({Math.round(intraWorkoutMl / Math.max(1, durationMins / 20))}{' '}
                    مل / 20 د)
                  </div>
                  <div className="text-[11px] text-[#5E5A50]">
                    حفظ نتاج القلب ومنع ارتفاع النبض الحراري ({record.trainingPrescription.targetHeartRateRange})
                  </div>
                </div>
                <span className="font-mono-num font-bold text-sm text-[#0B5D46] shrink-0">
                  {intraWorkoutMl} مل
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#EDF7F4] border border-[#B5DEC8] flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[#0B5D46]">
                    3. إماهة الاستشفاء العضلي بعد التمرين (خلال ساعتين)
                  </div>
                  <div className="text-[11px] text-[#2C3330]">
                    معدّلة بنسبة +{Math.round((recoveryDeficitFactor - 1) * 100)}% لتسريع استشفاء{' '}
                    {mostStrainedMuscle.shortTag}
                  </div>
                </div>
                <span className="font-mono-num font-bold text-sm text-[#0B5D46] shrink-0">
                  {postWorkoutRecoveryMl} مل
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Daily Hydration Tracker */}
          <div className="pt-3 border-t border-[#E6DFD1] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#14241F]">متتبع الإماهة الفعلي لليوم:</span>
              <span className="font-mono-num font-bold text-[#1E4E68]">
                {loggedIntakeMl} / {totalDailyTargetMl} مل ({intakeProgressPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#EAE4D7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1E4E68] rounded-full transition-all duration-300"
                style={{ width: `${intakeProgressPct}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setLoggedIntakeMl((prev) => Math.min(totalDailyTargetMl + 1000, prev + 250))
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold bg-[#FDFCF9] border border-[#D5CBB8] rounded-md hover:border-[#0B5D46] text-[#14241F] cursor-pointer"
                >
                  +250 مل ماء
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLoggedIntakeMl((prev) => Math.min(totalDailyTargetMl + 1000, prev + 500))
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold bg-[#0B5D46] text-white rounded-md hover:bg-[#084735] cursor-pointer"
                >
                  +500 مل محلول أملاح
                </button>
              </div>
              <button
                type="button"
                onClick={() => setLoggedIntakeMl(1500)}
                className="text-[11px] text-[#7A7264] hover:text-[#14241F] underline cursor-pointer"
              >
                إعادة ضبط
              </button>
            </div>
          </div>
        </div>

        {/* Right/Left 7 Cols: 4 Electrolytes Breakdown + Per-Muscle Recovery Link */}
        <div className="xl:col-span-7 bg-[#FAF7F0] rounded-xl border border-[#DFD8C8] p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD1] pb-2 mb-3">
              <h4 className="text-xs font-bold text-[#14241F]">
                التركيب الدقيق للأملاح المعدنية (الإلكتروليتات) وفق حالة الألياف العضلية
              </h4>
              <span className="text-[11px] font-mono-num text-[#0B5D46] font-semibold">
                ACWR {record.acwr} · إجهاد {record.sessionStrain}/21
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[#FDFCF9] border border-[#E6DFD1] space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-[#14241F]">الصوديوم (Sodium Na+)</strong>
                  <span className="font-mono-num font-bold text-[#0B5D46]">
                    {sodiumMgPerL} ملغ / لتر
                  </span>
                </div>
                <p className="text-[11px] text-[#5E5A50] leading-relaxed">
                  أساسي لنقل السيالات العصبية الحركية ومنع التشنجات في عضلة السمانة والفخذ أثناء التمرين.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#FDFCF9] border border-[#E6DFD1] space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-[#14241F]">البوتاسيوم (Potassium K+)</strong>
                  <span className="font-mono-num font-bold text-[#1E4E68]">
                    {potassiumMg} ملغ
                  </span>
                </div>
                <p className="text-[11px] text-[#5E5A50] leading-relaxed">
                  يعيد توازن السوائل داخل الخلية العضلية (Intracellular) ويسرّع تخزين الجليكوجين العضلي.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#FDFCF9] border border-[#E6DFD1] space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-[#14241F]">المغنيسيوم (Magnesium Mg2+)</strong>
                  <span className="font-mono-num font-bold text-[#B45309]">
                    {magnesiumMg} ملغ (مساءً)
                  </span>
                </div>
                <p className="text-[11px] text-[#5E5A50] leading-relaxed">
                  يفك ارتباط الجسور المستعرضة للأكتين والميوسين لإرخاء التيبس العضلي ورفع جودة النوم العميق.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#FDFCF9] border border-[#E6DFD1] space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-[#14241F]">الكالسيوم والبيكربونات (Ca2+)</strong>
                  <span className="font-mono-num font-bold text-[#14241F]">
                    {calciumMg} ملغ
                  </span>
                </div>
                <p className="text-[11px] text-[#5E5A50] leading-relaxed">
                  يعادل تراكم أيونات الهيدروجين الحمضية (Lactate Buffering) ويحمي كفاءة الانقباض.
                </p>
              </div>
            </div>
          </div>

          {/* Direct Muscle-to-Hydration Impact Table for the Top 3 Most Loaded Muscles */}
          <div className="pt-2 border-t border-[#E6DFD1]">
            <div className="text-[11px] font-bold text-[#14241F] mb-2">
              توصية الأملاح المخصصة حسب المجموعات العضلية الأعلى إجهاداً اليوم:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              {sortedByFatigue.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-lg bg-[#FDFCF9] border border-[#E6DFD1] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-[#14241F] truncate">{m.shortTag}</span>
                    <span className="font-mono-num font-bold" style={{ color: m.color }}>
                      {m.readiness}%
                    </span>
                  </div>
                  <div className="text-[#5E5A50] leading-snug">
                    {m.readiness < 60
                      ? `تعويض مكثف (${sodiumMgPerL} ملغ Na+ + ${magnesiumMg} ملغ Mg2+) لمنع التشنج الوتري.`
                      : m.readiness < 78
                      ? `محلول متوازن (${potassiumMg} ملغ K+) لتسريع استشفاء الألياف.`
                      : 'إماهة قياسية للمحافظة على مرونة الأنسجة.'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Smart Health & Coaching Advice Charts for the Comprehensive Overview Tab (اللوحة الصحية الشاملة).
 * Transforms biometric metrics into visual, interactive coaching advice charts, a 24-hour circadian
 * action timeline chart, and a Do's & Don'ts decision matrix.
 */
export const OverviewAdvisoryCharts: React.FC<{
  record: DailyBiometricRecord;
  allRecords: DailyBiometricRecord[];
}> = ({ record, allRecords }) => {
  const [selectedPillarIndex, setSelectedPillarIndex] = useState<number>(0);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(2);
  const [completedAdviceIds, setCompletedAdviceIds] = useState<Record<string, boolean>>({
    'pillar-hrv': true,
    'pillar-hydration': true,
  });

  const muscleRegions = useMemo(() => buildMuscleRegions(record), [record]);
  const avgMuscleReadiness = useMemo(
    () =>
      Math.round(
        muscleRegions.reduce((acc, m) => acc + m.readiness, 0) /
          Math.max(1, muscleRegions.length)
      ),
    [muscleRegions]
  );
  const mostStrainedMuscle = useMemo(
    () => [...muscleRegions].sort((a, b) => a.readiness - b.readiness)[0],
    [muscleRegions]
  );

  const avgRmssd =
    allRecords.reduce((acc, r) => acc + r.hrv.rmssd, 0) / Math.max(1, allRecords.length);

  // 6 Actionable Advice Pillars derived from today's biometrics
  const advicePillars = [
    {
      id: 'pillar-hrv',
      title: 'توجيه الجهاز العصبي وتقلب النبض (HRV)',
      metricBadge: `${record.hrv.rmssd} ms (المرجع ${Math.round(avgRmssd)} ms)`,
      score: Math.min(100, Math.max(25, Math.round((record.hrv.rmssd / 100) * 100))),
      priorityLevel:
        record.hrv.rmssd >= 80
          ? 'جاهزية عالية — استثمر الطاقة'
          : record.hrv.rmssd >= 65
          ? 'توازن متوسط — اضبط الإيقاع'
          : 'أولوية قصوى — تهدئة عصبية',
      color:
        record.hrv.rmssd >= 80 ? '#0B5D46' : record.hrv.rmssd >= 65 ? '#B45309' : '#B91C1C',
      adviceHeadline:
        record.hrv.rmssd >= 80
          ? 'العصب الحائر في ذروة نشاطه؛ جسمك مستعد لتحمل سرعات تنافسية عالية دون خطر إجهاد عصبي.'
          : record.hrv.rmssd >= 65
          ? 'استجابة عصبية مستقرة؛ يُنصح بالتدرج في الإحماء لمدة 15 دقيقة قبل رفع النبض.'
          : 'انخفاض واضح في HRV؛ استبدل التمارين اللاهوائية القصوى بتمارين تنفس بطيء (6 أنفاس/دقيقة) وحركة خفيفة.',
      actionStep:
        record.hrv.rmssd >= 80
          ? 'تنفيذ الحصة الرئيسية بكامل الشدة المقررة'
          : record.hrv.rmssd >= 65
          ? 'إضافة 10 دقائق تنفس حجابي قبل التمرين'
          : 'تطبيق جلسة تنفس علاجي 10 دقائق وخفض الشدة 30%',
    },
    {
      id: 'pillar-sleep-sws',
      title: 'نصيحة البناء العضلي والنوم العميق (SWS)',
      metricBadge: `${record.sleep.deepMinutes} د نوم عميق`,
      score: Math.min(100, Math.max(25, Math.round((record.sleep.deepMinutes / 130) * 100))),
      priorityLevel:
        record.sleep.deepMinutes >= 105
          ? 'بناء عضلي مثالي'
          : record.sleep.deepMinutes >= 80
          ? 'يحتاج دعم مسائي'
          : 'نقص في النوم البنائي',
      color:
        record.sleep.deepMinutes >= 105
          ? '#1E4E68'
          : record.sleep.deepMinutes >= 80
          ? '#B45309'
          : '#B91C1C',
      adviceHeadline:
        record.sleep.deepMinutes >= 105
          ? 'إفراز هرمون النمو الليلي ممتاز؛ الألياف العضلية استعادت قدرتها الانقباضية بالكامل.'
          : 'النوم العميق دون المستوى الأمثل؛ يُنصح بتبريد غرفة النوم (19°C) وتجنب الكافيين بعد الساعة 14:00.',
      actionStep:
        record.sleep.deepMinutes >= 105
          ? 'الحفاظ على موعد النوم الثابت (22:45)'
          : 'تناول 400 ملغ مغنيسيوم بيسجليسينات قبل النوم بـ 60 دقيقة',
    },
    {
      id: 'pillar-acwr',
      title: 'نصيحة تدرج الأحمال والوقاية من الإصابات (ACWR)',
      metricBadge: `ACWR ${record.acwr} (${record.acuteLoad} AU)`,
      score:
        record.acwr <= 1.2
          ? 92
          : record.acwr <= 1.3
          ? 74
          : Math.max(28, Math.round(100 - (record.acwr - 1.0) * 140)),
      priorityLevel:
        record.acwr <= 1.2
          ? 'نطاق آمن ومثالي'
          : record.acwr <= 1.3
          ? 'حد الحذر الميكانيكي'
          : 'خطر إجهاد وتري مرتفع',
      color: record.acwr <= 1.2 ? '#0B5D46' : record.acwr <= 1.3 ? '#B45309' : '#B91C1C',
      adviceHeadline:
        record.acwr <= 1.2
          ? 'نسبة الحمل الحاد إلى المزمن في المنطقة الذهبية؛ يمكنك زيادة المسافة أو الشدة بنسبة 5–8% بأمان.'
          : record.acwr <= 1.3
          ? 'الحمل التدريبي يقترب من السقف الأعلى؛ ثبّت المسافة الحالية وتجنب الجري على المنحدرات القاسية.'
          : 'تجاوز عتبة الأمان (1.30)؛ يجب خفض حجم الحصة التدريبية اليوم بنسبة 35% لحماية وتر العرقوب والركبة.',
      actionStep:
        record.acwr <= 1.2
          ? `الالتزام بمدة ${record.trainingPrescription.recommendedDurationMinutes} دقيقة ضمن نبض ${record.trainingPrescription.targetHeartRateRange}`
          : 'تخفيف الصدمات الميكانيكية والتحول إلى أرضية مرنة أو دراجة ثابتة',
    },
    {
      id: 'pillar-muscle',
      title: `نصيحة الاستشفاء العضلي الموجه (${mostStrainedMuscle.shortTag})`,
      metricBadge: `جاهزية العضلات ${avgMuscleReadiness}%`,
      score: avgMuscleReadiness,
      priorityLevel:
        avgMuscleReadiness >= 78
          ? 'مرونة عضلية ممتازة'
          : avgMuscleReadiness >= 60
          ? 'تيبس موضعي متوسط'
          : 'يتطلب تحرير لفافي فوري',
      color:
        avgMuscleReadiness >= 78
          ? '#0B5D46'
          : avgMuscleReadiness >= 60
          ? '#B45309'
          : '#B91C1C',
      adviceHeadline: `العضلة الأكثر إجهاداً اليوم هي «${mostStrainedMuscle.name}» بجاهزية ${mostStrainedMuscle.readiness}%؛ ركّز عليها في الإحماء والتهدئة.`,
      actionStep: mostStrainedMuscle.recoveryProtocol,
    },
    {
      id: 'pillar-hydration',
      title: 'نصيحة الإماهة وتعويض الأملاح المعدنية',
      metricBadge: `انحراف الحرارة ${record.skinTempDelta > 0 ? '+' : ''}${record.skinTempDelta}°C`,
      score: record.skinTempDelta <= 0.1 ? 90 : record.skinTempDelta <= 0.3 ? 72 : 52,
      priorityLevel:
        record.skinTempDelta <= 0.1 ? 'توازن سوائل مستقر' : 'يحتاج تعويض شوارد مكثف',
      color: record.skinTempDelta <= 0.1 ? '#1E4E68' : '#B45309',
      adviceHeadline: record.trainingPrescription.hydrationElectrolyteNote,
      actionStep:
        avgMuscleReadiness < 65
          ? 'شرب 600 مل محلول إلكتروليتات (900 ملغ صوديوم) قبل التمرين بـ 60 دقيقة'
          : 'شرب 500 مل ماء مع شوارد متوازنة قبل الحصة التدريبية',
    },
    {
      id: 'pillar-rhr',
      title: 'نصيحة كفاءة القلب والأكسجين (RHR & SpO2)',
      metricBadge: `${record.restingHeartRate} bpm · SpO2 ${record.spo2Percent}%`,
      score: Math.min(100, Math.max(30, Math.round(((66 - record.restingHeartRate) / 24) * 100))),
      priorityLevel:
        record.restingHeartRate <= 47
          ? 'كفاءة قلبية ممتازة'
          : record.restingHeartRate <= 51
          ? 'استجابة طبيعية'
          : 'نبض راحة مرتفع نسبياً',
      color:
        record.restingHeartRate <= 47
          ? '#0B5D46'
          : record.restingHeartRate <= 51
          ? '#B45309'
          : '#B91C1C',
      adviceHeadline:
        record.restingHeartRate <= 47
          ? 'انخفاض نبض الراحة يؤكد كفاءة حجم الضربة القلبية وزوال آثار الإجهاد الاستقلابي.'
          : 'ارتفاع طفيف في نبض الراحة الصباحي؛ راقب استجابة النبض في أول 10 دقائق من الإحماء ولا تتجاوز النطاق الموصى به.',
      actionStep: `الالتزام بنطاق النبض المستهدف: ${record.trainingPrescription.targetHeartRateRange}`,
    },
  ];

  // 24-Hour Circadian Coaching Timeline Phases
  const circadianPhases = [
    {
      time: '07:00 – 09:30',
      phaseTitle: '1. الفترة الصباحية وتنشيط الدورة الدموية',
      readinessLevel: Math.min(98, record.recoveryScore + 4),
      adviceSummary:
        record.hrv.rmssd >= 80
          ? 'ابدأ بـ 500 مل ماء مع رشة أملاح طبيعية وتعرض لضوء الشمس 10 دقائق لتثبيت الساعة البيولوجية.'
          : 'ابدأ بـ 5 دقائق تنفس بطيء (شهيق 4ث / زفير 6ث) لرفع سيادة العصب الحائر قبل الإفطار.',
      keyMetric: `HRV الصباحي: ${record.hrv.rmssd} ms · نبض الراحة: ${record.restingHeartRate} bpm`,
      color: '#0B5D46',
    },
    {
      time: '12:30 – 14:30',
      phaseTitle: '2. التجهيز الغذائي وشحن الجليكوجين',
      readinessLevel: Math.min(95, Math.max(55, record.recoveryScore)),
      adviceSummary:
        record.recoveryScore >= 75
          ? 'وجبة غنية بالكربوهيدرات المعقدة (3.5 غ/كغ) لدعم حصة التحمل والسرعة المسائية.'
          : 'وجبة متوازنة غنية بمضادات الأكسدة والبوتاسيوم وأحماض أوميغا-3 لتخفيف الالتهاب العضلي.',
      keyMetric: `المدة التدريبية المقررة اليوم: ${record.trainingPrescription.recommendedDurationMinutes} دقيقة`,
      color: '#1E4E68',
    },
    {
      time: '16:30 – 18:15',
      phaseTitle: '3. نافذة الأداء والحصة التدريبية الرئيسية',
      readinessLevel: record.recoveryScore,
      adviceSummary: `${record.trainingSessionTitle} — حافظ على النبض ضمن (${record.trainingPrescription.targetHeartRateRange}) مع إماهة منتظمة كل 20 دقيقة.`,
      keyMetric: `شدة الحصة الموصى بها · ACWR: ${record.acwr}`,
      color:
        record.recoveryStatus === 'optimal'
          ? '#0B5D46'
          : record.recoveryStatus === 'moderate'
          ? '#B45309'
          : '#B91C1C',
    },
    {
      time: '18:30 – 20:30',
      phaseTitle: '4. نافذة الاستشفاء العضلي وتعويض الشوارد',
      readinessLevel: avgMuscleReadiness,
      adviceSummary: `تطبيق بروتوكول الإطالة المتخصص لـ «${mostStrainedMuscle.name}» (${mostStrainedMuscle.recoveryProtocol}) مع تعويض السوائل والبروتين خلال 45 دقيقة.`,
      keyMetric: `أولوية العناية: ${mostStrainedMuscle.shortTag} (${mostStrainedMuscle.readiness}%)`,
      color: '#B45309',
    },
    {
      time: '21:30 – 23:00',
      phaseTitle: '5. التهدئة المسائية وتعزيز النوم العميق (SWS)',
      readinessLevel: record.sleep.efficiencyPercent,
      adviceSummary:
        'إيقاف الشاشات الساطعة، خفض حرارة الغرفة إلى 19°C، وتناول المغنيسيوم لرفع حصة النوم العميق في الدورة الأولى.',
      keyMetric: `هدف النوم: 8 ساعات (كفاءة حالية ${record.sleep.efficiencyPercent}%)`,
      color: '#1E4E68',
    },
  ];

  // Do's and Don'ts tailored to today's readiness
  const dailyDos =
    record.recoveryStatus === 'optimal'
      ? [
          `استثمار الجاهزية العالية (${record.recoveryScore}%) في تنفيذ حصة «${record.trainingSessionTitle}» بكفاءة كاملة.`,
          `الالتزام بنطاق النبض المستهدف (${record.trainingPrescription.targetHeartRateRange}) لمدة ${record.trainingPrescription.recommendedDurationMinutes} دقيقة.`,
          `التركيز على إطالة «${mostStrainedMuscle.shortTag}» لمدة 10 دقائق بعد انتهاء الحصة مباشرة.`,
          `تعويض السوائل والأملاح (${record.trainingPrescription.hydrationElectrolyteNote}).`,
        ]
      : record.recoveryStatus === 'moderate'
      ? [
          `إطالة فترة الإحماء التدريجي إلى 15 دقيقة قبل الدخول في صلب التمرين (${record.trainingSessionTitle}).`,
          `مراقبة نبض القلب بحيث لا يتجاوز سقف ${record.trainingPrescription.targetHeartRateRange}.`,
          `تطبيق جلسة تحرير لفافي وإطالة لعضلة «${mostStrainedMuscle.name}» (جاهزية ${mostStrainedMuscle.readiness}%).`,
          'النوم مبكراً قبل الساعة 22:45 لتعويض النوم العميق ورفع HRV الصباحي غداً.',
        ]
      : [
          `الاكتفاء بحصة استشفاء نشط منخفضة الشدة (${record.trainingSessionTitle}) لمدة ${record.trainingPrescription.recommendedDurationMinutes} دقيقة.`,
          `تطبيق بروتوكول العلاج الطبيعي الفوري لـ «${mostStrainedMuscle.name}» لتفادي الإصابة الوترية.`,
          'زيادة حصة المغنيسيوم (450 ملغ) والبوتاسيوم والماء لتخليص الألياف من نواتج الأيض.',
          'ممارسة 15 دقيقة من التنفس الحجابي البطيء لخفض التوتر الودي واستعادة توازن LF/HF.',
        ];

  const dailyDonts =
    record.recoveryStatus === 'optimal'
      ? [
          'تجنب تخطي التهدئة الختامية (Cool-down) حتى وإن شعرت بنشاط مرتفع بعد التمرين.',
          'تجنب رفع المسافة الأسبوعية بأكثر من 10% دفعة واحدة للحفاظ على ACWR ضمن النطاق الآمن.',
          'تجنب تأخير وجبة الاستشفاء لما بعد 60 دقيقة من انتهاء الحصة التدريبية.',
          'تجنب السهر بعد الساعة 23:15 للمحافظة على استقرار تقلب النبض (HRV).',
        ]
      : record.recoveryStatus === 'moderate'
      ? [
          'تجنب إضافة تكرارات سرعة قصوى (All-out Sprints) خارج الخطة المقررة لليوم.',
          `تجنب إهمال التيبس الموضعي في «${mostStrainedMuscle.shortTag}» أو الجري على أسطح صلبة غير مستوية.`,
          'تجنب المشروبات المنبهة بعد الساعة 14:00 لضمان عدم تأثر النوم العميق الليلة.',
          'تجنب التدريب في درجات حرارة مرتفعة دون محلول إلكتروليتات متكامل.',
        ]
      : [
          `يُحظر تماماً إجراء تمارين السرعات القصوى أو البليومترك اليوم (ACWR = ${record.acwr}).`,
          `تجنب التحميل الميكانيكي المباشر على «${mostStrainedMuscle.name}» (الجاهزية الحرجة ${mostStrainedMuscle.readiness}%).`,
          'تجنب الساونا الجافة الطويلة اليوم حتى لا يزداد إجهاد القلب والجفاف الحراري.',
          'تجنب تقليص ساعات النوم عن 8 ساعات الليلة لاستعادة توازن الجهاز العصبي المستقل.',
        ];

  const toggleAdviceCompleted = (id: string) => {
    setCompletedAdviceIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = advicePillars.filter((p) => completedAdviceIds[p.id]).length;
  const activePillar = advicePillars[selectedPillarIndex] || advicePillars[0];
  const activePhase = circadianPhases[selectedPhaseIndex] || circadianPhases[2];

  // Hexagonal Compass SVG Coordinates
  const cx = 195;
  const cy = 135;
  const maxR = 82;
  const angles = [-90, -30, 30, 90, 150, 210];
  const getPt = (angDeg: number, pct: number, rOverride?: number) => {
    const rad = (angDeg * Math.PI) / 180;
    const r = rOverride !== undefined ? rOverride : (pct / 100) * maxR;
    return {
      x: Number((cx + r * Math.cos(rad)).toFixed(1)),
      y: Number((cy + r * Math.sin(rad)).toFixed(1)),
    };
  };

  const polygonPoints = advicePillars
    .map((p, i) => {
      const pt = getPt(angles[i], p.score);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  return (
    <div className="space-y-5 w-full min-w-0">
      {/* SECTION 1: 6-PILLAR INTERACTIVE ADVICE COMPASS & ACTIONABLE COACHING BARS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* Left/Right 5 Cols: Visual Advice Compass SVG + Selected Pillar Deep Advice */}
        <div className="xl:col-span-5 min-w-0 bg-[#FAF7F0]/60 rounded-xl border border-[#E6DFD1] p-3.5 sm:p-4 flex flex-col justify-between space-y-3 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E6DFD1] pb-2">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#14241F]">
                بوصلة التوجيه الصحي والنصائح الست
              </h4>
              <p className="text-[11px] text-[#5E5A50]">
                انقر على أي محور في البوصلة لعرض النصيحة الطبية والتدريبية المباشرة
              </p>
            </div>
            <span className="font-mono-num text-xs font-bold text-[#0B5D46] shrink-0">
              {record.recoveryScore}% جاهزية
            </span>
          </div>

          {/* Stabilized Hexagonal Advice Compass SVG */}
          <div className="w-full max-w-full h-[190px] sm:h-[220px] flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 390 270"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-[185px] sm:h-[215px] max-h-[215px] block select-none overflow-hidden"
              role="img"
              aria-label="بوصلة النصائح الصحية الست"
            >
              {/* Concentric Advisory Zones */}
              {[35, 65, 95].map((lvl) => {
                const pts = angles
                  .map((a) => {
                    const p = getPt(a, lvl);
                    return `${p.x},${p.y}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={lvl}
                    points={pts}
                    fill={lvl === 95 ? '#0B5D46' : lvl === 65 ? '#B8955A' : '#B91C1C'}
                    fillOpacity={lvl === 95 ? '0.04' : lvl === 65 ? '0.05' : '0.06'}
                    stroke={lvl === 95 ? '#B5DEC8' : '#DED6C6'}
                    strokeWidth="1"
                    strokeDasharray={lvl === 95 ? undefined : '3 3'}
                  />
                );
              })}

              {/* Radial Spokes */}
              {angles.map((a, idx) => {
                const outer = getPt(a, 100);
                return (
                  <line
                    key={idx}
                    x1={cx}
                    y1={cy}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#D5CBB8"
                    strokeWidth="0.9"
                  />
                );
              })}

              {/* Today's Readiness Polygon */}
              <polygon
                points={polygonPoints}
                fill="#0B5D46"
                fillOpacity="0.24"
                stroke="#0B5D46"
                strokeWidth="2.4"
              />

              {/* Interactive Nodes around Compass */}
              {advicePillars.map((p, i) => {
                const pt = getPt(angles[i], p.score);
                const lbl = getPt(angles[i], 100, i === 0 || i === 3 ? maxR + 30 : maxR + 48);
                const isSelected = selectedPillarIndex === i;
                const shortTitles = [
                  'العصب الحائر HRV',
                  'النوم العميق SWS',
                  'أمان الحمل ACWR',
                  'استشفاء العضلات',
                  'توازن الإماهة',
                  'كفاءة النبض RHR',
                ];
                return (
                  <g
                    key={p.id}
                    onClick={() => setSelectedPillarIndex(i)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? '6' : '4.5'}
                      fill={p.color}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <rect
                      x={lbl.x - 48}
                      y={lbl.y - 14}
                      width="96"
                      height="28"
                      rx="6"
                      fill={isSelected ? '#14241F' : '#FDFCF9'}
                      stroke={isSelected ? '#D4B886' : '#D5CBB8'}
                      strokeWidth={isSelected ? '1.5' : '1'}
                    />
                    <text
                      x={lbl.x}
                      y={lbl.y - 2}
                      textAnchor="middle"
                      fill={isSelected ? '#FAF7F0' : '#14241F'}
                      fontSize="9.5"
                      fontWeight="700"
                    >
                      {shortTitles[i]}
                    </text>
                    <text
                      x={lbl.x}
                      y={lbl.y + 10}
                      textAnchor="middle"
                      fill={isSelected ? '#D4B886' : p.color}
                      fontSize="9"
                      fontWeight="700"
                    >
                      {p.score}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Active Pillar Coaching Prescription */}
          <div className="pt-3 border-t border-[#E6DFD1] space-y-1.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <strong className="text-[#14241F]">{activePillar.title}</strong>
              <span
                className="text-[11px] font-bold"
                style={{ color: activePillar.color }}
              >
                {activePillar.priorityLevel}
              </span>
            </div>
            <p className="text-[#3E3B34] leading-relaxed">{activePillar.adviceHeadline}</p>
            <div className="text-[11px] text-[#0B5D46] font-bold">
              الإجراء الموصى به: {activePillar.actionStep}
            </div>
          </div>
        </div>

        {/* Right/Left 7 Cols: Interactive Priority Advice Bars & Action Checklist */}
        <div className="xl:col-span-7 min-w-0 bg-[#FAF7F0]/60 rounded-xl border border-[#E6DFD1] p-3.5 sm:p-4 flex flex-col justify-between space-y-3 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD1] pb-2">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#14241F]">
                مخطط التوصيات التنفيذية حسب كل مؤشر حيوي
              </h4>
              <p className="text-[11px] text-[#5E5A50]">
                تحويل قراءات اليوم إلى خطوات عملية واضحة لتحسين الأداء الرياضي وتسريع الاستشفاء
              </p>
            </div>
            <span className="text-xs font-mono-num text-[#5E5A50]">
              تم تطبيق <strong className="text-[#0B5D46]">{completedCount}/6</strong> نصائح
            </span>
          </div>

          <div className="divide-y divide-[#E6DFD1]">
            {advicePillars.map((pillar, idx) => {
              const isSelected = selectedPillarIndex === idx;
              const isDone = !!completedAdviceIds[pillar.id];
              return (
                <div
                  key={pillar.id}
                  onClick={() => setSelectedPillarIndex(idx)}
                  className={`py-2.5 px-2 transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#FDFCF9]' : 'hover:bg-[#FDFCF9]/60'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <strong className="text-[#14241F] truncate">{pillar.title}</strong>
                      <span className="text-[11px] font-mono-num text-[#7A7264] hidden sm:inline">
                        · {pillar.metricBadge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: pillar.color }}
                      >
                        {pillar.priorityLevel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAdviceCompleted(pillar.id);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          isDone
                            ? 'bg-[#0B5D46] text-white'
                            : 'bg-[#EAE4D7] text-[#14241F] hover:bg-[#D5CBB8]'
                        }`}
                      >
                        {isDone ? 'مطبّقة' : 'تطبيق'}
                      </button>
                    </div>
                  </div>

                  {/* Visual Advice Progress Bar */}
                  <div className="w-full h-1.5 bg-[#EAE4D7] rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pillar.score}%`,
                        backgroundColor: pillar.color,
                      }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                    <span className="text-[#3E3B34] leading-snug">{pillar.adviceHeadline}</span>
                    <span className="font-semibold text-[#0B5D46] shrink-0">
                      {pillar.actionStep}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: 24-HOUR CIRCADIAN COACHING & RECOVERY ADVICE TIMELINE CHART */}
      <div className="bg-[#FAF7F0]/60 rounded-xl border border-[#E6DFD1] p-3.5 sm:p-4 space-y-3.5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6DFD1] pb-2.5">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#14241F]">
              المخطط الزمني للتوجيه اليومي على مدار 24 ساعة
            </h4>
            <p className="text-[11px] text-[#5E5A50]">
              توزيع النصائح الفسيولوجية والتدريبية من الاستيقاظ حتى النوم العميق ({record.date})
            </p>
          </div>
          <span className="text-xs font-mono-num text-[#0B5D46] font-bold">
            المرحلة المحددة: {activePhase.time}
          </span>
        </div>

        {/* Stabilized SVG 24-Hour Advice Curve */}
        <div className="w-full max-w-full h-[140px] sm:h-[165px] flex items-center justify-center bg-[#FDFCF9] rounded-lg border border-[#E6DFD1] p-1.5 overflow-hidden">
          <svg
            viewBox="0 0 600 155"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-[130px] sm:h-[155px] max-h-[155px] block select-none overflow-hidden"
            role="img"
            aria-label="المخطط الزمني لنصائح اليوم"
          >
            <defs>
              <linearGradient id="adviceTimelineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B5D46" stopOpacity="0.25" />
                <stop offset="95%" stopColor="#0B5D46" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal reference lines */}
            {[35, 75, 115].map((y) => (
              <line
                key={y}
                x1="40"
                y1={y}
                x2="560"
                y2={y}
                stroke="#E5DEC9"
                strokeDasharray="3 3"
              />
            ))}

            {/* Smooth Circadian Area & Curve connecting the 5 phases */}
            {(() => {
              const xs = [75, 185, 300, 415, 525];
              const ys = circadianPhases.map(
                (ph) => 122 - ((ph.readinessLevel - 30) / 70) * 82
              );
              const pts = xs.map((x, idx) => `${x},${ys[idx].toFixed(1)}`).join(' L ');
              const areaPath = `M ${xs[0]},125 L ${pts} L ${xs[xs.length - 1]},125 Z`;
              const linePath = `M ${pts}`;

              return (
                <>
                  <path d={areaPath} fill="url(#adviceTimelineGrad)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#0B5D46"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  {circadianPhases.map((ph, idx) => {
                    const isSel = selectedPhaseIndex === idx;
                    const x = xs[idx];
                    const y = ys[idx];
                    return (
                      <g
                        key={ph.time}
                        onClick={() => setSelectedPhaseIndex(idx)}
                        className="cursor-pointer"
                      >
                        <line
                          x1={x}
                          y1={y}
                          x2={x}
                          y2={125}
                          stroke={isSel ? ph.color : '#D5CBB8'}
                          strokeWidth={isSel ? '2' : '1'}
                          strokeDasharray="2 2"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r={isSel ? '7' : '5'}
                          fill={ph.color}
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y={y - 11}
                          textAnchor="middle"
                          fill={isSel ? '#14241F' : '#5E5A50'}
                          fontSize="9.5"
                          fontWeight="700"
                        >
                          {ph.readinessLevel}%
                        </text>
                        <text
                          x={x}
                          y="143"
                          textAnchor="middle"
                          fill={isSel ? '#0B5D46' : '#5E5A50'}
                          fontSize="9.5"
                          fontWeight={isSel ? '700' : '500'}
                        >
                          {ph.time}
                        </text>
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>

        {/* 5 Interactive Phase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {circadianPhases.map((ph, idx) => {
            const isSel = selectedPhaseIndex === idx;
            return (
              <div
                key={ph.time}
                onClick={() => setSelectedPhaseIndex(idx)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSel
                    ? 'bg-[#FDFCF9] border-[#0B5D46]'
                    : 'bg-[#FDFCF9]/70 border-[#E6DFD1] hover:border-[#B8955A]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="font-mono-num text-[11px] font-bold"
                      style={{ color: ph.color }}
                    >
                      {ph.time}
                    </span>
                    <span className="text-[11px] font-mono-num text-[#14241F] font-semibold">
                      {ph.readinessLevel}%
                    </span>
                  </div>
                  <div className="font-bold text-[#14241F] leading-snug">{ph.phaseTitle}</div>
                  <p className="text-[11px] text-[#5E5A50] leading-relaxed">{ph.adviceSummary}</p>
                </div>
                <div className="text-[10px] font-mono-num text-[#0B5D46] pt-1.5 border-t border-[#E6DFD1]">
                  {ph.keyMetric}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: DO'S & DON'TS DECISION MATRIX FOR TODAY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch text-xs">
        <div className="bg-[#FAF7F0]/60 border border-[#E6DFD1] rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#E6DFD1] pb-2">
            <div className="flex items-center gap-2 font-bold text-[#0B5D46] text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>ما يُنصح بتطبيقه اليوم لتعزيز الأداء والاستشفاء</span>
            </div>
            <span className="text-[11px] font-mono-num font-bold text-[#0B5D46]">4 توصيات</span>
          </div>
          <ul className="divide-y divide-[#E6DFD1]">
            {dailyDos.map((item, i) => (
              <li
                key={i}
                className="py-2 flex items-start gap-2.5 text-[#14241F] leading-relaxed"
              >
                <span className="font-mono-num text-xs font-bold text-[#0B5D46] shrink-0">
                  0{i + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#FAF7F0]/60 border border-[#E6DFD1] rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#E6DFD1] pb-2">
            <div className="flex items-center gap-2 font-bold text-[#B91C1C] text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>ما يجب تجنبه اليوم للوقاية من الإصابات والإجهاد الزائد</span>
            </div>
            <span className="text-[11px] font-mono-num font-bold text-[#B91C1C]">4 محاذير</span>
          </div>
          <ul className="divide-y divide-[#E6DFD1]">
            {dailyDonts.map((item, i) => (
              <li
                key={i}
                className="py-2 flex items-start gap-2.5 text-[#14241F] leading-relaxed"
              >
                <span className="font-mono-num text-xs font-bold text-[#B91C1C] shrink-0">
                  0{i + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};



