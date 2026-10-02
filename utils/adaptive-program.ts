import {
  getCurrentWeek,
  getDayKey,
  getTodayTraining,
} from "../data/program-akpol";

import {
  getAdaptiveSessionTarget,
  getProfile,
  type AdaptiveTarget,
  type TrainingLog,
} from "./adaptive-engine";

export type AdaptiveProgramDay = {
  date: string;
  week: number;
  day: string;
  phase: string;
  focus: string;
  session: string;
  isRest: boolean;
  isToday: boolean;
  isPast: boolean;
  adaptiveTarget?: AdaptiveTarget;
};

export type AdaptiveProgramContext = {
  week: number;
  dateRange: string;
  phase: string;
  focus: string;
  day: string;
  session: string;
  isRest: boolean;
  adaptiveTarget?: AdaptiveTarget;
};

const PROGRAM_START = new Date(
  2026,
  8,
  30
);

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function toDateOnly(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function dateKey(date: Date) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(
  date: Date,
  amount: number
) {
  const result = new Date(date);

  result.setDate(
    result.getDate() + amount
  );

  return result;
}

function isRestSession(
  session: string
) {
  return /rest|recovery|mobility/i.test(
    session
  );
}

function getWeekStart(
  week: number
) {
  return addDays(
    PROGRAM_START,
    (week - 1) * 7
  );
}

function getDayDate(
  week: number,
  dayIndex: number
) {
  return addDays(
    getWeekStart(week),
    dayIndex
  );
}

function getLogsForExercise(
  logs: TrainingLog[],
  exerciseName: string
) {
  return logs.filter(
    (log) =>
      log.exercise ===
      exerciseName
  );
}

/* =========================================
   DETECT EXERCISE FROM PROGRAM SESSION
========================================= */

function detectExercise(
  session: string
) {
  const text =
    session.toLowerCase();

  if (
    text.includes("12-min") ||
    text.includes("3200") ||
    text.includes("3.200") ||
    text.includes("run") ||
    text.includes("running") ||
    text.includes("pace") ||
    text.includes("interval")
  ) {
    return "running";
  }

  if (
    text.includes("pull-up") ||
    text.includes("pullup") ||
    text.includes("pull up")
  ) {
    return "pullup";
  }

  if (
    text.includes("push-up") ||
    text.includes("pushup") ||
    text.includes("push up")
  ) {
    return "pushup";
  }

  if (
    text.includes("sit-up") ||
    text.includes("situp") ||
    text.includes("sit up")
  ) {
    return "situp";
  }

  if (
    text.includes("shuttle")
  ) {
    return "shuttle";
  }

  return undefined;
}

/* =========================================
   ADAPTIVE TARGET
========================================= */

export function getAdaptiveTargetForDay(
  session: string,
  logs: TrainingLog[]
): AdaptiveTarget | undefined {
  if (
    !session ||
    isRestSession(session)
  ) {
    return undefined;
  }

  const exerciseId =
    detectExercise(session);

  if (!exerciseId) {
    return undefined;
  }

  const profile =
    getProfile(exerciseId);

  if (!profile) {
    return undefined;
  }

  const exerciseLogs =
    getLogsForExercise(
      logs,
      profile.name
    );

  return getAdaptiveSessionTarget(
  exerciseId,
  exerciseLogs
);
}

/* =========================================
   TODAY CONTEXT
========================================= */

export function getAdaptiveProgramContext(
  date = new Date(),
  logs: TrainingLog[] = []
): AdaptiveProgramContext | undefined {
  const week =
    getCurrentWeek(date);

  if (!week) {
    return undefined;
  }

  const day =
    getDayKey(date);

  const session =
    week.days[day];

  const adaptiveTarget =
    getAdaptiveTargetForDay(
      session,
      logs
    );

  return {
    week: week.week,
    dateRange:
      week.dateRange,
    phase: week.phase,
    focus: week.focus,
    day,
    session,
    isRest:
      isRestSession(session),
    adaptiveTarget,
  };
}

/* =========================================
   FULL WEEK
========================================= */

export function getAdaptiveWeek(
  weekNumber: number,
  logs: TrainingLog[] = [],
  today = new Date()
): AdaptiveProgramDay[] {
  const weekStart =
    getWeekStart(weekNumber);

  const week =
    getCurrentWeek(
      weekStart
    );

  if (!week) {
    return [];
  }

  return DAY_KEYS.map(
    (day, index) => {
      const date =
        getDayDate(
          weekNumber,
          index
        );

      const session =
        week.days[day];

      const adaptiveTarget =
        getAdaptiveTargetForDay(
          session,
          logs
        );

      const current =
        toDateOnly(today);

      const dateOnlyValue =
        toDateOnly(date);

      return {
        date: dateKey(date),

        week: week.week,

        day,

        phase: week.phase,

        focus: week.focus,

        session,

        isRest:
          isRestSession(
            session
          ),

        isToday:
          dateOnlyValue.getTime() ===
          current.getTime(),

        isPast:
          dateOnlyValue.getTime() <
          current.getTime(),

        adaptiveTarget,
      };
    }
  );
}

/* =========================================
   TODAY ADAPTIVE PROGRAM
========================================= */

export function getTodayAdaptiveProgram(
  logs: TrainingLog[] = [],
  date = new Date()
) {
  const context =
    getAdaptiveProgramContext(
      date,
      logs
    );

  if (!context) {
    return undefined;
  }

  return {
    ...context,

    date: dateKey(date),

    isToday: true,
  };
}

/* =========================================
   SESSION STATUS
========================================= */

export function getSessionStatus(
  item: AdaptiveProgramDay
) {
  if (item.isToday) {
    return "current";
  }

  if (item.isPast) {
    return "past";
  }

  return "upcoming";
}

/* =========================================
   PROGRAM TIME PROGRESS
========================================= */

export function getProgramTimeProgress(
  date = new Date()
) {
  const start =
    toDateOnly(
      PROGRAM_START
    );

  const end =
    addDays(
      start,
      22 * 7 - 1
    );

  const current =
    toDateOnly(date);

  if (current <= start) {
    return 0;
  }

  if (current >= end) {
    return 100;
  }

  const total =
    end.getTime() -
    start.getTime();

  const elapsed =
    current.getTime() -
    start.getTime();

  return Math.round(
    (elapsed / total) * 100
  );
}

/* =========================================
   CURRENT PHASE
========================================= */

export function getAdaptivePhase(
  date = new Date()
) {
  const week =
    getCurrentWeek(date);

  if (!week) {
    return undefined;
  }

  return {
    week: week.week,

    phase: week.phase,

    focus: week.focus,

    dateRange:
      week.dateRange,
  };
}

/* =========================================
   PROGRAM MESSAGE
========================================= */

export function getAdaptiveProgramMessage(
  date = new Date(),
  logs: TrainingLog[] = []
) {
  const context =
    getAdaptiveProgramContext(
      date,
      logs
    );

  if (!context) {
    return {
      status: "outside",

      title:
        "PROGRAM TIDAK AKTIF",

      message:
        "Tanggal berada di luar rentang program AKPOL.",
    };
  }

  if (context.isRest) {
    return {
      status: "recovery",

      title:
        "RECOVERY DAY",

      message:
        "Hari ini merupakan bagian pemulihan dari program. Jangan menambah beban latihan untuk mengganti sesi yang terlewat.",
    };
  }

  if (
    !context.adaptiveTarget
  ) {
    return {
      status: "normal",

      title:
        "PROGRAM AKTIF",

      message:
        "Ikuti sesi sesuai program dan catat hasil latihan serta RPE.",
    };
  }

  const target =
    context.adaptiveTarget;

  if (target.canProgress) {
    return {
      status: "progress",

      title:
        "ADAPTIVE TARGET AKTIF",

      message:
        target.reason,

      target:
        target.target,

      nextAction:
        target.nextAction,
    };
  }

  return {
    status: "observe",

    title:
      "TARGET DIPERTAHANKAN",

    message:
      target.reason,

    target:
      target.target,

    nextAction:
      target.nextAction,
  };
}

/* =========================================
   TODAY ADAPTIVE SESSION
========================================= */

export function getTodayAdaptiveSession(
  logs: TrainingLog[] = []
) {
  const today =
    new Date();

  const original =
    getTodayTraining(
      today
    );

  const adaptive =
    getTodayAdaptiveProgram(
      logs,
      today
    );

  if (
    !original ||
    !adaptive
  ) {
    return undefined;
  }

  return {
    ...original,

    date: dateKey(today),

    isRest:
      adaptive.isRest,

    adaptiveTarget:
      adaptive.adaptiveTarget,
  };
}