export interface WeeklyProgram {
  week: number;
  dateRange: string;
  phase: string;
  focus: string;
  days: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export const programAkpol: WeeklyProgram[] = [
  {
    week: 1,
    dateRange: "30 Sep–06 Oct 2026",
    phase: "Adaptasi",
    focus: "Fondasi & teknik",
    days: {
      monday: "Rabu: 25–30' easy + 4×15s strides; Strength A ringan",
      tuesday: "5×2' steady / 2' jog + Strength B ringan",
      wednesday: "30' easy + mobility",
      thursday: "6×200m cepat terkontrol, 200m jalan/jog + core",
      friday: "REST",
      saturday: "20–25' easy + teknik shuttle 4×10m; strength ringan",
      sunday: "REST",
    },
  },
  {
    week: 2,
    dateRange: "07 Oct–13 Oct 2026",
    phase: "Base 1",
    focus: "Aerobic base + volume strength",
    days: {
      monday: "5–6 km easy + Strength A",
      tuesday: "6×400m @ RPE 7/10, 200m jog + Strength B",
      wednesday: "4–5 km recovery + core",
      thursday: "Tempo 15–20' @ RPE 7 + 4×10m shuttle turns",
      friday: "REST / mobility 20'",
      saturday: "4–5 km easy + Strength C + 4×15s strides",
      sunday: "REST",
    },
  },
  {
    week: 3,
    dateRange: "14 Oct–20 Oct 2026",
    phase: "Base 2",
    focus: "Interval ringan + volume",
    days: {
      monday: "5–6 km easy + Strength A",
      tuesday: "6×400m @ RPE 7/10, 200m jog + Strength B",
      wednesday: "4–5 km recovery + core",
      thursday: "Tempo 15–20' @ RPE 7 + 4×10m shuttle turns",
      friday: "REST / mobility 20'",
      saturday: "4–5 km easy + Strength C + 4×15s strides",
      sunday: "REST",
    },
  },
  {
    week: 4,
    dateRange: "21 Oct–27 Oct 2026",
    phase: "Build 1",
    focus: "Threshold + strength",
    days: {
      monday: "5–6 km easy + Strength A",
      tuesday: "6×400m @ RPE 7/10, 200m jog + Strength B",
      wednesday: "4–5 km recovery + core",
      thursday: "Tempo 15–20' @ RPE 7 + 4×10m shuttle turns",
      friday: "REST / mobility 20'",
      saturday: "4–5 km easy + Strength C + 4×15s strides",
      sunday: "REST",
    },
  },
  {
    week: 5,
    dateRange: "28 Oct–03 Nov 2026",
    phase: "Build 2",
    focus: "Interval 400–600 m",
    days: {
      monday: "5–6 km easy + Strength A",
      tuesday: "6×400m @ RPE 7/10, 200m jog + Strength B",
      wednesday: "4–5 km recovery + core",
      thursday: "Tempo 15–20' @ RPE 7 + 4×10m shuttle turns",
      friday: "REST / mobility 20'",
      saturday: "4–5 km easy + Strength C + 4×15s strides",
      sunday: "REST",
    },
  },
  {
    week: 6,
    dateRange: "04 Nov–10 Nov 2026",
    phase: "Build 3",
    focus: "Speed endurance",
    days: {
      monday: "5–7 km easy + Strength A",
      tuesday: "5×600m @ RPE 7–8, 2' jog + Strength B",
      wednesday: "4–5 km recovery + core",
      thursday: "20–25' tempo + 6×10m shuttle accelerations",
      friday: "REST",
      saturday: "5 km easy + 6×200m fast relaxed + Strength C",
      sunday: "REST",
    },
  },
  {
    week: 7,
    dateRange: "11 Nov–17 Nov 2026",
    phase: "Build 4",
    focus: "Deload + checkpoint",
    days: {
      monday: "5–7 km easy + Strength A",
      tuesday: "5×600m @ RPE 7–8, 2' jog + Strength B",
      wednesday: "4–5 km recovery + core",
      thursday: "20–25' tempo + 6×10m shuttle accelerations",
      friday: "REST",
      saturday: "5 km easy + 6×200m fast relaxed + Strength C",
      sunday: "REST",
    },
  },
  {
    week: 8,
    dateRange: "18 Nov–24 Nov 2026",
    phase: "Build 5",
    focus: "Interval 600–800 m",
    days: {
      monday: "5–7 km easy + Strength A",
      tuesday: "5×600m @ RPE 7–8, 2' jog + Strength B",
      wednesday: "4–5 km recovery + core",
      thursday: "20–25' tempo + 6×10m shuttle accelerations",
      friday: "REST",
      saturday: "5 km easy + 6×200m fast relaxed + Strength C",
      sunday: "REST",
    },
  },
  {
    week: 9,
    dateRange: "25 Nov–01 Dec 2026",
    phase: "Build 6",
    focus: "Specific AKPOL",
    days: {
      monday: "5–7 km easy + Strength A",
      tuesday: "5×600m @ RPE 7–8, 2' jog + Strength B",
      wednesday: "4–5 km recovery + core",
      thursday: "20–25' tempo + 6×10m shuttle accelerations",
      friday: "REST",
      saturday: "5 km easy + 6×200m fast relaxed + Strength C",
      sunday: "REST",
    },
  },
  {
    week: 10,
    dateRange: "02 Dec–08 Dec 2026",
    phase: "Peak Strength",
    focus: "Tes pull-up + strength",
    days: {
      monday: "5 km easy + Strength A 70%",
      tuesday: "4×400m @ RPE 7 + Strength B 70%",
      wednesday: "4 km recovery + mobility",
      thursday: "3×10m shuttle + 4×100m relaxed",
      friday: "REST",
      saturday: "Pull-up/push-up/sit-up submax test: 80% + 20' easy",
      sunday: "REST",
    },
  },
  {
    week: 11,
    dateRange: "09 Dec–15 Dec 2026",
    phase: "Checkpoint Des",
    focus: "Evaluasi target strength",
    days: {
      monday: "4–5 km easy + Strength A 60%",
      tuesday: "3×400m controlled + Strength B 60%",
      wednesday: "REST/mobility",
      thursday: "20' easy + technique",
      friday: "REST",
      saturday: "TEST DAY: pull-up max, push-up max, sit-up max, shuttle 2 attempts",
      sunday: "REST",
    },
  },
  {
    week: 12,
    dateRange: "16 Dec–22 Dec 2026",
    phase: "Base 3",
    focus: "Recovery + maintain",
    days: {
      monday: "4–5 km easy + Strength A",
      tuesday: "5×400m controlled + Strength B",
      wednesday: "4 km recovery + core",
      thursday: "15–20' tempo + shuttle technique",
      friday: "REST",
      saturday: "5–6 km easy + Strength C",
      sunday: "REST",
    },
  },
  {
    week: 13,
    dateRange: "23 Dec–29 Dec 2026",
    phase: "Base 4",
    focus: "Aerobic development",
    days: {
      monday: "4–5 km easy + Strength A",
      tuesday: "5×400m controlled + Strength B",
      wednesday: "4 km recovery + core",
      thursday: "15–20' tempo + shuttle technique",
      friday: "REST",
      saturday: "5–6 km easy + Strength C",
      sunday: "REST",
    },
  },
  {
    week: 14,
    dateRange: "30 Dec–05 Jan 2027",
    phase: "Build Jan 1",
    focus: "Progressive running",
    days: {
      monday: "6 km easy + Strength A",
      tuesday: "5×600m @ RPE 7–8 + Strength B",
      wednesday: "4–5 km recovery + core",
      thursday: "25' tempo + 6×10m shuttle",
      friday: "REST",
      saturday: "5–6 km easy + 6×200m + Strength C",
      sunday: "REST",
    },
  },
  {
    week: 15,
    dateRange: "06 Jan–12 Jan 2027",
    phase: "Build Jan 2",
    focus: "Threshold",
    days: {
      monday: "6 km easy + Strength A",
      tuesday: "5×600m @ RPE 7–8 + Strength B",
      wednesday: "4–5 km recovery + core",
      thursday: "25' tempo + 6×10m shuttle",
      friday: "REST",
      saturday: "5–6 km easy + 6×200m + Strength C",
      sunday: "REST",
    },
  },
  {
    week: 16,
    dateRange: "13 Jan–19 Jan 2027",
    phase: "Build Jan 3",
    focus: "Intervals",
    days: {
      monday: "6–7 km easy + Strength A",
      tuesday: "4×800m @ RPE 7–8, 2' jog + Strength B",
      wednesday: "4–5 km recovery + core",
      thursday: "3×8' threshold, 2' easy + shuttle",
      friday: "REST",
      saturday: "5 km easy + 8×200m fast relaxed + Strength C",
      sunday: "REST",
    },
  },
  {
    week: 17,
    dateRange: "20 Jan–26 Jan 2027",
    phase: "Build Jan 4",
    focus: "Specific 12-min",
    days: {
      monday: "6–7 km easy + Strength A",
      tuesday: "4×800m @ RPE 7–8, 2' jog + Strength B",
      wednesday: "4–5 km recovery + core",
      thursday: "3×8' threshold, 2' easy + shuttle",
      friday: "REST",
      saturday: "5 km easy + 8×200m fast relaxed + Strength C",
      sunday: "REST",
    },
  },
  {
    week: 18,
    dateRange: "27 Jan–02 Feb 2027",
    phase: "Deload",
    focus: "Taper ringan",
    days: {
      monday: "5 km easy + Strength A 70%",
      tuesday: "4×400m @ RPE 7 + Strength B 70%",
      wednesday: "4 km recovery",
      thursday: "20' easy + 4×10m shuttle",
      friday: "REST",
      saturday: "12-min controlled test, NOT all-out; strength 60%",
      sunday: "REST",
    },
  },
  {
    week: 19,
    dateRange: "03 Feb–09 Feb 2027",
    phase: "Peak Feb 1",
    focus: "Specific 3200",
    days: {
      monday: "5–6 km easy + Strength A",
      tuesday: "6×400m near target 12-min pace, 2' recovery + Strength B",
      wednesday: "4 km recovery + core",
      thursday: "3×800m @ target pace, 3' recovery + 4×10m shuttle",
      friday: "REST",
      saturday: "4–5 km easy + 6×200m fast + Strength C",
      sunday: "REST",
    },
  },
  {
    week: 20,
    dateRange: "10 Feb–16 Feb 2027",
    phase: "Peak Feb 2",
    focus: "12-min pace",
    days: {
      monday: "5–6 km easy + Strength A",
      tuesday: "6×400m near target 12-min pace, 2' recovery + Strength B",
      wednesday: "4 km recovery + core",
      thursday: "3×800m @ target pace, 3' recovery + 4×10m shuttle",
      friday: "REST",
      saturday: "4–5 km easy + 6×200m fast + Strength C",
      sunday: "REST",
    },
  },
  {
    week: 21,
    dateRange: "17 Feb–23 Feb 2027",
    phase: "Peak Feb 3",
    focus: "Sharpening",
    days: {
      monday: "4–5 km easy + Strength A 60%",
      tuesday: "4×400m target pace, full recovery",
      wednesday: "3–4 km easy + mobility",
      thursday: "4×100m relaxed + 4×10m shuttle",
      friday: "REST",
      saturday: "20–25' easy + 4 strides",
      sunday: "REST",
    },
  },
  {
    week: 22,
    dateRange: "24 Feb–02 Mar 2027",
    phase: "Final",
    focus: "Taper + test 3200",
    days: {
      monday: "4 km easy + light Strength A",
      tuesday: "3×400m target pace, full recovery",
      wednesday: "REST/mobility",
      thursday: "15–20' easy + 4×10m shuttle",
      friday: "REST",
      saturday: "FINAL 12-MIN TEST: target 3200 m; then 48–72h recovery",
      sunday: "REST",
    },
  },
];

export function getCurrentWeek(date = new Date()): WeeklyProgram | undefined {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Program dimulai 30 September 2026.
  const start = new Date(2026, 8, 30);
  const diff = Math.floor((target.getTime() - start.getTime()) / 86400000);

  if (diff < 0) return undefined;

  const weekIndex = Math.floor(diff / 7);
  return programAkpol[weekIndex];
}

export function getDayKey(date = new Date()): keyof WeeklyProgram["days"] {
  const keys: (keyof WeeklyProgram["days"])[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return keys[date.getDay()];
}

export function getTodayTraining(date = new Date()) {
  const week = getCurrentWeek(date);
  if (!week) return undefined;

  const day = getDayKey(date);

  return {
    week: week.week,
    dateRange: week.dateRange,
    phase: week.phase,
    focus: week.focus,
    day,
    session: week.days[day],
  };
}
