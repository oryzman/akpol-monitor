export type ExerciseId =
  | "running"
  | "pullup"
  | "pushup"
  | "situp"
  | "shuttle";

export type TrainingLog = {
  id: string;
  date: string;
  exercise: string;
  target: number;
  actual: number;
  unit: string;
  rpe?: number;
  status: string;
  note?: string;
};

export type ExerciseProfile = {
  id: ExerciseId;
  name: string;
  baseline?: number;
  finalTarget: number;
  unit: string;
  lowerIsBetter?: boolean;
  step: number;
};

export const EXERCISE_PROFILES: ExerciseProfile[] = [
  {
    id: "running",
    name: "Lari 12 Menit",
    baseline: 2600,
    finalTarget: 3200,
    unit: "meter",
    step: 50,
  },
  {
    id: "pullup",
    name: "Pull Up",
    finalTarget: 18,
    unit: "reps",
    step: 1,
  },
  {
    id: "pushup",
    name: "Push Up",
    finalTarget: 43,
    unit: "reps",
    step: 1,
  },
  {
    id: "situp",
    name: "Sit Up",
    finalTarget: 43,
    unit: "reps",
    step: 1,
  },
  {
    id: "shuttle",
    name: "Shuttle Run",
    finalTarget: 16,
    unit: "detik",
    lowerIsBetter: true,
    step: 0.5,
  },
];

export function getProfile(
  exerciseName: string
): ExerciseProfile | undefined {
  return EXERCISE_PROFILES.find(
    (profile) =>
      profile.name.toLowerCase() ===
      exerciseName.toLowerCase()
  );
}

function getSortedLogs(
  logs: TrainingLog[],
  exerciseName: string
): TrainingLog[] {
  return logs
    .filter(
      (log) =>
        log.exercise === exerciseName &&
        Number.isFinite(log.actual)
    )
    .sort((a, b) => {
      const dateCompare =
        b.date.localeCompare(a.date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return b.id.localeCompare(a.id);
    });
}

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    max,
    Math.max(min, value)
  );
}

function roundToStep(
  value: number,
  step: number
): number {
  return Math.round(value / step) * step;
}

/* =========================================================
   PROGRESS PERCENTAGE
========================================================= */

export function getProgressPercentage(
  actual: number,
  target: number,
  lowerIsBetter = false
): number {
  if (
    !Number.isFinite(actual) ||
    !Number.isFinite(target) ||
    actual <= 0 ||
    target <= 0
  ) {
    return 0;
  }

  const rawPercentage =
    lowerIsBetter
      ? (target / actual) * 100
      : (actual / target) * 100;

  if (!Number.isFinite(rawPercentage)) {
    return 0;
  }

  return Math.round(
    clamp(rawPercentage, 0, 100)
  );
}

/* =========================================================
   RUNNING CAPACITY
========================================================= */

export function getRunningCapacity(
  logs: TrainingLog[]
): number {
  const running = getSortedLogs(
    logs,
    "Lari 12 Menit"
  );

  const baseline = 2600;
  const finalTarget = 3200;

  const qualifying =
    running.filter(
      (log) =>
        log.actual > baseline &&
        (log.rpe ?? 10) <= 7
    );

  if (qualifying.length < 2) {
    return baseline;
  }

  const recentQualifying =
    qualifying[0];

  return clamp(
    roundToStep(
      recentQualifying.actual,
      50
    ),
    baseline,
    finalTarget
  );
}

/* =========================================================
   ADAPTIVE TARGET
========================================================= */

export type AdaptiveSource =
  | "baseline"
  | "history"
  | "conservative"
  | "final"
  | "manual";

export type AdaptiveTarget = {
  target: number | null;
  unit: string;
  source: AdaptiveSource;
  label: string;
  reason: string;
  canProgress: boolean;
  confidence:
    | "low"
    | "medium"
    | "high";
  nextAction:
    | "hold"
    | "increase"
    | "decrease"
    | "baseline"
    | "final";
};

export function getAdaptiveSessionTarget(
  exerciseName: string,
  logs: TrainingLog[]
): AdaptiveTarget {
  const profile =
    getProfile(exerciseName);

  if (!profile) {
    return {
      target: null,
      unit: "",
      source: "manual",
      label: "Target program",
      reason:
        "Profil latihan belum dikenali.",
      canProgress: false,
      confidence: "low",
      nextAction: "hold",
    };
  }

  const history =
    getSortedLogs(
      logs,
      exerciseName
    );

  /* =====================================================
     RUNNING
  ===================================================== */

  if (profile.id === "running") {
    const capacity =
      getRunningCapacity(logs);

    const recent =
      history.slice(0, 3);

    const latest = recent[0];

    const hardCount =
      recent.filter(
        (log) =>
          (log.rpe ?? 0) >= 8
      ).length;

    const controlledCount =
      recent.filter(
        (log) =>
          log.actual >= capacity &&
          (log.rpe ?? 10) <= 7
      ).length;

    let target = capacity;

    let source: AdaptiveSource =
      "baseline";

    let reason =
      `Kapasitas acuan resmi saat ini ${capacity.toLocaleString(
        "id-ID"
      )} m.`;

    let canProgress = false;

    let confidence:
      | "low"
      | "medium"
      | "high" = "low";

    let nextAction:
      | "hold"
      | "increase"
      | "decrease"
      | "baseline"
      | "final" = "baseline";

    if (hardCount >= 2) {
      target = Math.max(
        2600,
        capacity - 100
      );

      source = "conservative";

      reason =
        "Beberapa sesi terakhir terasa berat. Target sementara diturunkan agar progres tetap terkendali.";

      confidence = "high";
      nextAction = "decrease";
    } else if (
      latest &&
      latest.actual >= capacity &&
      (latest.rpe ?? 10) <= 5 &&
      capacity < 3200
    ) {
      target = Math.min(
        3200,
        capacity + 50
      );

      source = "history";

      reason =
        "Hasil terakhir mencapai kapasitas dengan RPE rendah. Target sesi dinaikkan kecil +50 m.";

      canProgress = true;
      confidence = "medium";
      nextAction = "increase";
    } else if (
      controlledCount >= 2 &&
      capacity < 3200
    ) {
      target = Math.min(
        3200,
        capacity + 100
      );

      source = "history";

      reason =
        "Minimal dua sesi mencapai kapasitas dengan RPE terkendali. Target sesi dinaikkan bertahap +100 m.";

      canProgress = true;
      confidence = "high";
      nextAction = "increase";
    } else if (
      latest &&
      latest.actual > capacity &&
      (latest.rpe ?? 10) <= 7 &&
      capacity < 3200
    ) {
      target = Math.min(
        3200,
        capacity + 50
      );

      source = "history";

      reason =
        "Ada tanda progres pada hasil terakhir. Kenaikan dibatasi +50 m sambil menunggu konfirmasi.";

      canProgress = true;
      confidence = "medium";
      nextAction = "increase";
    }

    if (target >= 3200) {
      target = 3200;
      source = "final";
      nextAction = "final";
      confidence = "high";

      reason =
        "Target akhir program 3.200 m telah menjadi batas target sesi.";
    }

    return {
      target,
      unit: profile.unit,
      source,
      label: "Target sesi adaptif",
      reason,
      canProgress,
      confidence,
      nextAction,
    };
  }

  /* =====================================================
     NON-RUNNING
  ===================================================== */

  if (history.length === 0) {
    return {
      target: null,
      unit: profile.unit,
      source: "manual",
      label: "Baseline belum tersedia",
      reason:
        `Masukkan hasil awal ${profile.name} terlebih dahulu. Target akhir program adalah ${profile.finalTarget} ${profile.unit}.`,
      canProgress: false,
      confidence: "low",
      nextAction: "baseline",
    };
  }

  const recent =
    history.slice(0, 3);

  const latest = recent[0];

  const hardCount =
    recent.filter(
      (log) =>
        (log.rpe ?? 0) >= 8
    ).length;

  const easyGoodCount =
    recent.filter((log) => {
      const reached =
        profile.lowerIsBetter
          ? log.actual <= log.target
          : log.actual >= log.target;

      return (
        reached &&
        (log.rpe ?? 10) <= 7
      );
    }).length;

  let target =
    latest.target ||
    latest.actual;

  let source: AdaptiveSource =
    "history";

  let nextAction:
    | "hold"
    | "increase"
    | "decrease"
    | "baseline"
    | "final" = "hold";

  let confidence:
    | "low"
    | "medium"
    | "high" = "medium";

  let reason =
    "Target mengikuti hasil terakhir sampai ada cukup data untuk melakukan progres.";

  if (hardCount >= 2) {
    target = profile.lowerIsBetter
      ? target + profile.step
      : Math.max(
          1,
          target - profile.step
        );

    source = "conservative";
    nextAction = "decrease";
    confidence = "high";

    reason =
      "Beberapa sesi terakhir terasa berat. Target ditahan atau diturunkan sementara.";
  } else if (easyGoodCount >= 2) {
    target = profile.lowerIsBetter
      ? target - profile.step
      : target + profile.step;

    nextAction = "increase";
    confidence = "high";

    reason =
      "Beberapa sesi tercapai dengan RPE terkendali. Target dinaikkan secara bertahap.";
  } else if (
    latest &&
    (profile.lowerIsBetter
      ? latest.actual <=
        latest.target
      : latest.actual >=
        latest.target) &&
    (latest.rpe ?? 10) <= 7
  ) {
    target = profile.lowerIsBetter
      ? target - profile.step
      : target + profile.step;

    nextAction = "increase";
    confidence = "medium";

    reason =
      "Hasil terakhir mencapai target dengan beban terkendali. Kenaikan kecil diperbolehkan.";
  }

  if (profile.lowerIsBetter) {
    target = Math.max(
      profile.finalTarget,
      target
    );
  } else {
    target = Math.min(
      profile.finalTarget,
      target
    );

    target = Math.max(
      1,
      target
    );
  }

  target = roundToStep(
    target,
    profile.step
  );

  const isFinal =
    profile.lowerIsBetter
      ? target <=
        profile.finalTarget
      : target >=
        profile.finalTarget;

  if (isFinal) {
    target =
      profile.finalTarget;

    source = "final";
    nextAction = "final";
    confidence = "high";

    reason =
      `Target akhir ${profile.finalTarget} ${profile.unit} telah menjadi batas target sesi.`;
  }

  return {
    target,
    unit: profile.unit,
    source,
    label: "Target sesi adaptif",
    reason,
    canProgress:
      nextAction === "increase",
    confidence,
    nextAction,
  };
}

/* =========================================================
   EVALUATION
========================================================= */

export type AdaptiveEvaluation = {
  level:
    | "baseline"
    | "below"
    | "progress"
    | "final"
    | "observe"
    | "recovery";

  title: string;

  message: string;

  recommendation: string;

  percentage: number | null;

  referenceTarget: number | null;

  nextTarget: number | null;

  trend:
    | "up"
    | "down"
    | "stable"
    | "unknown";

  confidence:
    | "low"
    | "medium"
    | "high";
};

function getTrend(
  log: TrainingLog,
  logs: TrainingLog[],
  lowerIsBetter = false
):
  | "up"
  | "down"
  | "stable"
  | "unknown" {
  const history =
    getSortedLogs(
      logs.filter(
        (item) =>
          item.id !== log.id
      ),
      log.exercise
    );

  const previous = history[0];

  if (!previous) {
    return "unknown";
  }

  const difference =
    log.actual -
    previous.actual;

  if (
    Math.abs(difference) < 0.0001
  ) {
    return "stable";
  }

  if (lowerIsBetter) {
    return difference < 0
      ? "up"
      : "down";
  }

  return difference > 0
    ? "up"
    : "down";
}

export function evaluateLog(
  log: TrainingLog,
  logs: TrainingLog[]
): AdaptiveEvaluation {
  const profile =
    getProfile(log.exercise);

  if (!profile) {
    return {
      level: "observe",
      title: "Data tersimpan",
      message:
        "Latihan tercatat dan akan dipantau dari riwayat berikutnya.",
      recommendation:
        "Pertahankan pencatatan hasil dan RPE secara konsisten.",
      percentage: null,
      referenceTarget: null,
      nextTarget: null,
      trend: "unknown",
      confidence: "low",
    };
  }

  const previousLogs =
    logs.filter(
      (item) =>
        item.id !== log.id
    );

  const adaptive =
    getAdaptiveSessionTarget(
      log.exercise,
      previousLogs
    );

  const referenceTarget =
    adaptive.target ??
    profile.baseline ??
    null;

  const rpe =
    log.rpe ?? 7;

  const trend =
    getTrend(
      log,
      logs,
      profile.lowerIsBetter
    );

  /* =====================================================
     RUNNING
  ===================================================== */

  if (profile.id === "running") {
    const baseline = 2600;
    const finalTarget = 3200;

    if (
      log.actual >= finalTarget
    ) {
      return {
        level: "final",
        title:
          "Target akhir tercapai",
        message:
          `Hasil ${log.actual.toLocaleString(
            "id-ID"
          )} m sudah mencapai target akhir 3.200 m.`,
        recommendation:
          "Pertahankan konsistensi. Target akhir tidak dinaikkan otomatis.",
        percentage:
          getProgressPercentage(
            log.actual,
            finalTarget
          ),
        referenceTarget:
          finalTarget,
        nextTarget:
          finalTarget,
        trend,
        confidence: "high",
      };
    }

    if (rpe >= 9) {
      return {
        level: "recovery",
        title:
          "Beban sangat tinggi",
        message:
          `Hasil ${log.actual.toLocaleString(
            "id-ID"
          )} m dicapai dengan RPE ${rpe}/10.`,
        recommendation:
          "Jangan mengejar kenaikan target pada sesi berikutnya. Pertahankan atau gunakan target lebih konservatif.",
        percentage:
          getProgressPercentage(
            log.actual,
            finalTarget
          ),
        referenceTarget:
          baseline,
        nextTarget:
          adaptive.target,
        trend,
        confidence: "high",
      };
    }

    if (
      log.actual >= baseline
    ) {
      const light =
        rpe <= 5;

      return {
        level: light
          ? "progress"
          : "baseline",

        title: light
          ? "Acuan tercapai dengan beban ringan"
          : "Kapasitas awal tercapai",

        message:
          `Hasil ${log.actual.toLocaleString(
            "id-ID"
          )} m dibanding kapasitas awal 2.600 m dengan RPE ${rpe}/10.`,

        recommendation:
          light
            ? "Target sesi berikutnya boleh naik kecil +50 m sambil memantau konsistensi."
            : rpe >= 8
              ? "Pertahankan atau turunkan target sementara; jangan mengejar progres saat beban terasa tinggi."
              : "Pertahankan target dan kumpulkan hasil konsisten sebelum menaikkan kapasitas resmi.",

        percentage:
          getProgressPercentage(
            log.actual,
            finalTarget
          ),

        referenceTarget:
          baseline,

        nextTarget:
          adaptive.target,

        trend,
        confidence:
          adaptive.confidence,
      };
    }

    return {
      level: "below",

      title:
        "Di bawah kapasitas acuan",

      message:
        `Hasil ${log.actual.toLocaleString(
          "id-ID"
        )} m berada di bawah kapasitas acuan 2.600 m.`,

      recommendation:
        rpe >= 8
          ? "Jangan menaikkan beban dulu; prioritaskan pemulihan dan konsistensi."
          : "Pertahankan acuan 2.600 m dan evaluasi hasil berikutnya.",

      percentage:
        getProgressPercentage(
          log.actual,
          finalTarget
        ),

      referenceTarget:
        baseline,

      nextTarget:
        adaptive.target,

      trend,
      confidence:
        adaptive.confidence,
    };
  }

  /* =====================================================
     NON-RUNNING
  ===================================================== */

  if (
    referenceTarget === null
  ) {
    return {
      level: "observe",
      title:
        "Baseline belum tersedia",
      message:
        "Hasil sudah tersimpan, tetapi target adaptif belum dapat ditetapkan dari riwayat.",
      recommendation:
        "Gunakan hasil ini sebagai baseline awal dan catat RPE.",
      percentage: null,
      referenceTarget: null,
      nextTarget:
        adaptive.target,
      trend,
      confidence: "low",
    };
  }

  const reached =
    profile.lowerIsBetter
      ? log.actual <=
        referenceTarget
      : log.actual >=
        referenceTarget;

  if (rpe >= 9) {
    return {
      level: "recovery",

      title:
        "Beban sangat tinggi",

      message:
        `Hasil ${log.actual} ${profile.unit} tercatat dengan RPE ${rpe}/10.`,

      recommendation:
        "Jangan menaikkan target dulu. Pertahankan atau turunkan target sementara.",

      percentage:
        getProgressPercentage(
          log.actual,
          profile.finalTarget,
          profile.lowerIsBetter ?? false
        ),

      referenceTarget,

      nextTarget:
        adaptive.target,

      trend,
      confidence: "high",
    };
  }

  if (reached) {
    return {
      level:
        rpe <= 7
          ? "progress"
          : "baseline",

      title:
        rpe <= 7
          ? "Target sesi tercapai"
          : "Tercapai, tetapi terasa berat",

      message:
        `Hasil ${log.actual} ${profile.unit} dibanding target sesi ${referenceTarget} ${profile.unit}.`,

      recommendation:
        rpe >= 8
          ? "Jangan menaikkan beban dulu; prioritaskan pemulihan dan konsistensi."
          : "Pertahankan konsistensi. Jika hasil berikutnya kembali tercapai dengan RPE terkendali, target dapat dinaikkan.",

      percentage:
        getProgressPercentage(
          log.actual,
          profile.finalTarget,
          profile.lowerIsBetter ?? false
        ),

      referenceTarget,

      nextTarget:
        adaptive.target,

      trend,
      confidence:
        adaptive.confidence,
    };
  }

  return {
    level: "below",

    title:
      "Belum mencapai target sesi",

    message:
      `Hasil ${log.actual} ${profile.unit} dibanding target sesi ${referenceTarget} ${profile.unit}.`,

    recommendation:
      rpe >= 8
        ? "Jangan menaikkan beban dulu; prioritaskan pemulihan dan konsistensi."
        : "Pertahankan target sesi sampai hasil lebih konsisten.",

    percentage:
      getProgressPercentage(
        log.actual,
        profile.finalTarget,
        profile.lowerIsBetter ?? false
      ),

    referenceTarget,

    nextTarget:
      adaptive.target,

    trend,
    confidence:
      adaptive.confidence,
  };
}

/* =========================================================
   UI HELPERS
========================================================= */

export function getAdaptiveStatusLabel(
  evaluation: AdaptiveEvaluation
): string {
  switch (evaluation.level) {
    case "final":
      return "FINAL TARGET";

    case "progress":
      return "PROGRESS";

    case "baseline":
      return "BASELINE";

    case "below":
      return "BELOW TARGET";

    case "recovery":
      return "RECOVERY";

    default:
      return "OBSERVE";
  }
}

export function getAdaptiveTrendLabel(
  trend: AdaptiveEvaluation["trend"]
): string {
  switch (trend) {
    case "up":
      return "NAIK";

    case "down":
      return "TURUN";

    case "stable":
      return "STABIL";

    default:
      return "BELUM ADA PEMBANDING";
  }
}

export function getAdaptiveConfidenceLabel(
  confidence:
    AdaptiveEvaluation["confidence"]
): string {
  switch (confidence) {
    case "high":
      return "DATA KUAT";

    case "medium":
      return "DATA BERKEMBANG";

    default:
      return "DATA AWAL";
  }
}