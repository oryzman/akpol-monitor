"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  EXERCISE_PROFILES,
  getRunningCapacity,
  getAdaptiveSessionTarget,
  getProfile,
  type TrainingLog,
} from "../utils/adaptive-engine";

import {
  getTodayTraining,
  getCurrentWeek,
} from "../data/program-akpol";

/* =========================================
   TYPES
========================================= */

type DashboardLog = TrainingLog & {
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

/* =========================================
   DATE
========================================= */

function localDateKey(
  date = new Date()
) {
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

/* =========================================
   FORMAT
========================================= */

function formatNumber(
  value: number
) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return String(
    Math.round(value)
  );
}

/* =========================================
   LOCAL STORAGE
========================================= */

function readTrainingLogs(): DashboardLog[] {
  try {
    const raw =
      localStorage.getItem(
        "akpol-training-logs"
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        item &&
        typeof item ===
          "object"
    );
  } catch {
    return [];
  }
}

function readChecklist(
  date: string
) {
  try {
    const raw =
      localStorage.getItem(
        `akpol-checklist-${date}`
      );

    if (!raw) {
      return false;
    }

    const parsed =
      JSON.parse(raw);

    return (
      parsed?.status ===
      "completed"
    );
  } catch {
    return false;
  }
}

/* =========================================
   ADAPTIVE DISPLAY HELPERS
========================================= */

function isRestSession(
  session: string
) {
  return /rest|recovery|mobility/i.test(
    session
  );
}

function detectExerciseId(
  session: string
) {
  const text =
    session.toLowerCase();

  if (
    text.includes("12-min") ||
    text.includes("3200") ||
    text.includes("3.200") ||
    text.includes("running") ||
    text.includes("run") ||
    text.includes("interval") ||
    text.includes("pace")
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

function getAdaptiveTargetForDashboard(
  session: string,
  logs: DashboardLog[]
) {
  if (
    !session ||
    isRestSession(session)
  ) {
    return undefined;
  }

  const exerciseId =
    detectExerciseId(
      session
    );

  if (!exerciseId) {
    return undefined;
  }

  const profile =
    getProfile(
      exerciseId
    );

  if (!profile) {
    return undefined;
  }

  const exerciseLogs =
    logs.filter(
      (log) =>
        log.exercise ===
        profile.name
    );

  return getAdaptiveSessionTarget(
    profile.name,
    exerciseLogs
  );
}

function getTargetValue(
  target: unknown
) {
  if (
    typeof target ===
      "number" &&
    Number.isFinite(target)
  ) {
    return target;
  }

  if (
    typeof target ===
      "object" &&
    target !== null &&
    "target" in target
  ) {
    const value =
      (
        target as {
          target: unknown;
        }
      ).target;

    if (
      typeof value ===
        "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    const converted =
      Number(value);

    if (
      Number.isFinite(
        converted
      )
    ) {
      return converted;
    }
  }

  return null;
}

function getTargetText(
  target: unknown,
  exerciseId?: string
) {
  const value =
    getTargetValue(target);

  if (value === null) {
    return "-";
  }

  if (
    exerciseId ===
    "running"
  ) {
    return `${formatNumber(
      value
    )} m`;
  }

  if (
    exerciseId ===
    "shuttle"
  ) {
    return `${String(
      value
    )} sec`;
  }

  return `${String(
    value
  )} reps`;
}

function getAdaptiveReason(
  target: unknown
) {
  if (
    typeof target ===
      "object" &&
    target !== null &&
    "reason" in target
  ) {
    return String(
      (
        target as {
          reason: unknown;
        }
      ).reason
    );
  }

  return "Target mengikuti perkembangan latihan saat ini.";
}

function getAdaptiveAction(
  target: unknown
) {
  if (
    typeof target ===
      "object" &&
    target !== null &&
    "nextAction" in target
  ) {
    return String(
      (
        target as {
          nextAction: unknown;
        }
      ).nextAction
    );
  }

  return "Catat hasil latihan dan RPE setelah sesi.";
}

function getAdaptiveCanProgress(
  target: unknown
) {
  if (
    typeof target ===
      "object" &&
    target !== null &&
    "canProgress" in target
  ) {
    return Boolean(
      (
        target as {
          canProgress: unknown;
        }
      ).canProgress
    );
  }

  return false;
}

/* =========================================
   ADAPTIVE MESSAGE
========================================= */

function getAdaptiveStatus(
  target: unknown,
  session: string
) {
  if (!session) {
    return {
      title:
        "PROGRAM BELUM TERSEDIA",
      status: "normal",
      reason:
        "Program latihan untuk hari ini belum tersedia.",
      action:
        "Periksa kembali program mingguan.",
    };
  }

  if (
    isRestSession(session)
  ) {
    return {
      title:
        "RECOVERY DAY",
      status: "recovery",
      reason:
        "Hari ini merupakan bagian pemulihan dari program.",
      action:
        "Fokus pada recovery dan jangan menambah beban untuk mengganti sesi.",
    };
  }

  if (!target) {
    return {
      title:
        "PROGRAM AKTIF",
      status: "normal",
      reason:
        "Belum ada data latihan yang cukup untuk membuat target adaptif.",
      action:
        "Ikuti sesi program dan catat hasil aktual serta RPE.",
    };
  }

  const progress =
    getAdaptiveCanProgress(
      target
    );

  return {
    title: progress
      ? "ADAPTIVE PROGRESS"
      : "ADAPTIVE TARGET",
    status: progress
      ? "progress"
      : "normal",
    reason:
      getAdaptiveReason(
        target
      ),
    action:
      getAdaptiveAction(
        target
      ),
  };
}

/* =========================================
   COMPONENT
========================================= */

export default function HomePage() {
  const [logs, setLogs] =
    useState<DashboardLog[]>(
      []
    );

  const [
    checklistDone,
    setChecklistDone,
  ] = useState(false);

  const todayKey =
    localDateKey();

  const todayTraining =
    useMemo(
      () =>
        getTodayTraining(
          new Date()
        ),
      []
    );

  const currentWeek =
    useMemo(
      () =>
        getCurrentWeek(
          new Date()
        ),
      []
    );

  /* =========================================
     DATA SYNC
  ========================================= */

  function refreshDashboard() {
    const nextLogs =
      readTrainingLogs();

    const nextChecklist =
      readChecklist(
        todayKey
      );

    setLogs(nextLogs);
    setChecklistDone(
      nextChecklist
    );
  }

  useEffect(() => {
    refreshDashboard();

    function handleFocus() {
      refreshDashboard();
    }

    function handleStorage() {
      refreshDashboard();
    }

    function handleVisibility() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        refreshDashboard();
      }
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [todayKey]);

  /* =========================================
     TODAY ADAPTIVE
  ========================================= */

  const todayAdaptive =
    useMemo(
      () =>
        getAdaptiveTargetForDashboard(
          todayTraining?.session ??
            "",
          logs
        ),
      [
        todayTraining,
        logs,
      ]
    );

  const adaptiveStatus =
    useMemo(
      () =>
        getAdaptiveStatus(
          todayAdaptive,
          todayTraining?.session ??
            ""
        ),
      [
        todayAdaptive,
        todayTraining,
      ]
    );

  const todayExerciseId =
    detectExerciseId(
      todayTraining?.session ??
        ""
    );

  /* =========================================
     BASIC STATS
  ========================================= */

  const totalLogs =
    logs.length;

  const completedLogs =
    logs.filter(
      (log) =>
        log.status ===
        "completed"
    ).length;

  /* =========================================
     LATEST RESULT
  ========================================= */

  const latestLog =
    logs.length > 0
      ? [...logs]
          .filter(
            (log) =>
              Number.isFinite(
                Number(
                  log.actual
                )
              )
          )
          .sort(
            (a, b) =>
              String(
                b.date
              ).localeCompare(
                String(a.date)
              )
          )[0] ?? null
      : null;

  /* =========================================
     RUNNING CAPACITY
  ========================================= */

  const runningProfile =
    EXERCISE_PROFILES.find(
      (item) =>
        item.id ===
        "running"
    );

  const runningCapacity =
    getRunningCapacity(
      logs
    );

  const runningFinalTarget =
    runningProfile?.finalTarget ??
    3200;

  const runningProgress =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (runningCapacity /
            runningFinalTarget) *
            100
        )
      )
    );

  /* =========================================
     OTHER PERFORMANCE
  ========================================= */

  const exerciseStats =
    useMemo(() => {
      const result: Record<
        string,
        {
          actual: number;
          unit: string;
          date: string;
        }
      > = {};

      for (const log of logs) {
        const actual =
          Number(log.actual);

        if (
          !Number.isFinite(
            actual
          )
        ) {
          continue;
        }

        const key =
          String(
            log.exercise
          );

        const existing =
          result[key];

        if (!existing) {
          result[key] = {
            actual,
            unit:
              String(
                log.unit ??
                  ""
              ),
            date:
              String(
                log.date
              ),
          };

          continue;
        }

        const isShuttle =
          key
            .toLowerCase()
            .includes(
              "shuttle"
            );

        if (
          isShuttle
        ) {
          if (
            actual <
            existing.actual
          ) {
            result[key] = {
              actual,
              unit:
                String(
                  log.unit ??
                    ""
                ),
              date:
                String(
                  log.date
                ),
            };
          }
        } else if (
          actual >
          existing.actual
        ) {
          result[key] = {
            actual,
            unit:
              String(
                log.unit ??
                  ""
              ),
            date:
              String(
                log.date
              ),
          };
        }
      }

      return result;
    }, [logs]);

  /* =========================================
     CHECKLIST
  ========================================= */

  const checklistText =
    checklistDone
      ? "Latihan hari ini sudah ditandai selesai."
      : "Latihan hari ini belum ditandai selesai.";

  return (
    <main className="page-shell">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="hero">

        <div>

          <p className="eyebrow">
            AKPOL PHYSICAL MONITOR
          </p>

          <h1>
            TRAINING
            <br />
            <span>
              COMMAND CENTER
            </span>
          </h1>

          <p className="hero-text">
            Monitor latihan, target adaptif,
            hasil tes, dan perkembangan menuju
            target akhir program.
          </p>

        </div>

        <div className="hero-badge">

          <strong>
            WEEK
          </strong>

          <span>
            {currentWeek?.week ??
              "-"}
          </span>

        </div>

      </section>

      {/* =====================================
          STATS
      ===================================== */}

      <section className="stats-grid">

        <div className="stat-card">

          <span>
            LATIHAN TERCATAT
          </span>

          <strong>
            {totalLogs}
          </strong>

        </div>

        <div className="stat-card">

          <span>
            HASIL TERCAPAI
          </span>

          <strong>
            {completedLogs}
          </strong>

        </div>

        <div className="stat-card">

          <span>
            KAPASITAS LARI
          </span>

          <strong>
            {formatNumber(
              runningCapacity
            )}{" "}
            m
          </strong>

        </div>

        <div className="stat-card">

          <span>
            PROGRESS LARI
          </span>

          <strong>
            {runningProgress}%
          </strong>

        </div>

      </section>

      {/* =====================================
          TODAY + ADAPTIVE ENGINE
      ===================================== */}

      <section className="dashboard-grid">

        <div className="panel today-panel">

          <div className="panel-header">

            <div>

              <p className="eyebrow">
                TODAY
              </p>

              <h2>
                Program Hari Ini
              </h2>

            </div>

            <span className="date-badge">
              {todayKey}
            </span>

          </div>

          {todayTraining ? (
            <>

              <div className="training-meta">

                <span>
                  {todayTraining.day}
                </span>

                <span>
                  WEEK{" "}
                  {todayTraining.week}
                </span>

                <span>
                  {todayTraining.phase}
                </span>

              </div>

              <h3>
                {todayTraining.focus}
              </h3>

              <div className="session-box">
                {todayTraining.session}
              </div>

              {todayAdaptive && (
                <div
                  className="action-box"
                  style={{
                    marginTop:
                      "16px",
                  }}
                >

                  <span>
                    ADAPTIVE TARGET
                  </span>

                  <p
                    style={{
                      marginBottom:
                        "6px",
                    }}
                  >
                    <strong
                      style={{
                        fontSize:
                          "22px",
                        color:
                          "var(--text)",
                      }}
                    >
                      {getTargetText(
                        todayAdaptive,
                        todayExerciseId
                      )}
                    </strong>
                  </p>

                  <p>
                    {getAdaptiveReason(
                      todayAdaptive
                    )}
                  </p>

                </div>
              )}

              <div
                className={
                  checklistDone
                    ? "checklist done"
                    : "checklist"
                }
              >

                <div>

                  <strong>
                    {checklistDone
                      ? "✓ Sudah dijalankan"
                      : "○ Belum dijalankan"}
                  </strong>

                  <p>
                    {checklistText}
                  </p>

                </div>

              </div>

            </>
          ) : (
            <p>
              Data program hari ini
              belum tersedia.
            </p>
          )}

        </div>

        <div className="panel adaptive-panel">

          <div className="panel-header">

            <div>

              <p className="eyebrow">
                ADAPTIVE ENGINE
              </p>

              <h2>
                {adaptiveStatus.title}
              </h2>

            </div>

            <span
              className={`status-dot ${adaptiveStatus.status}`}
            />

          </div>

          <p className="adaptive-reason">
            {adaptiveStatus.reason}
          </p>

          <div className="action-box">

            <span>
              NEXT ACTION
            </span>

            <p>
              {adaptiveStatus.action}
            </p>

          </div>

          {todayAdaptive && (
            <div className="latest-result">

              <span>
                TARGET SESI HARI INI
              </span>

              <strong>
                {getTargetText(
                  todayAdaptive,
                  todayExerciseId
                )}
              </strong>

              <p>
                Target dihitung berdasarkan
                data latihan yang tersimpan.
              </p>

            </div>
          )}

          {latestLog && (
            <div
              className="latest-result"
              style={{
                marginTop:
                  "12px",
              }}
            >

              <span>
                HASIL TERAKHIR
              </span>

              <strong>
                {String(
                  latestLog.exercise
                )}
              </strong>

              <p>
                {formatNumber(
                  Number(
                    latestLog.actual
                  )
                )}{" "}
                {String(
                  latestLog.unit ??
                    ""
                )}
                {" · "}
                RPE{" "}
                {latestLog.rpe ??
                  "-"}
              </p>

            </div>
          )}

        </div>

      </section>

      {/* =====================================
          RUNNING TARGET
      ===================================== */}

      <section className="panel progress-panel">

        <div className="panel-header">

          <div>

            <p className="eyebrow">
              FINAL TARGET
            </p>

            <h2>
              Target Lari 12 Menit
            </h2>

          </div>

          <strong className="target-number">
            {formatNumber(
              runningFinalTarget
            )}{" "}
            m
          </strong>

        </div>

        <div className="progress-track">

          <div
            className="progress-fill"
            style={{
              width:
                `${runningProgress}%`,
            }}
          />

        </div>

        <div className="progress-labels">

          <span>
            Kapasitas saat ini{" "}
            <strong>
              {formatNumber(
                runningCapacity
              )}{" "}
              m
            </strong>
          </span>

          <span>
            Target akhir{" "}
            <strong>
              {formatNumber(
                runningFinalTarget
              )}{" "}
              m
            </strong>
          </span>

        </div>

        <p className="small-note">
          Kapasitas awal adalah 2.600 m.
          Sistem tidak langsung menganggap satu
          hasil bagus sebagai kapasitas baru.
          Peningkatan kapasitas dilakukan setelah
          memenuhi kriteria adaptive engine.
        </p>

      </section>

      {/* =====================================
          PERFORMANCE SNAPSHOT
      ===================================== */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <p className="eyebrow">
              PERFORMANCE SNAPSHOT
            </p>

            <h2>
              Personal Records
            </h2>

          </div>

          <Link
            href="/progress"
            className="date-badge"
          >
            DETAIL →
          </Link>

        </div>

        <div className="performance-values">

          {Object.entries(
            exerciseStats
          ).map(
            ([
              exercise,
              stat,
            ]) => (
              <div
                key={exercise}
              >

                <span>
                  {exercise}
                </span>

                <strong>
                  {formatNumber(
                    stat.actual
                  )}{" "}
                  {stat.unit}
                </strong>

              </div>
            )
          )}

          {Object.keys(
            exerciseStats
          ).length === 0 && (
            <div>

              <span>
                BELUM ADA DATA
              </span>

              <strong>
                —
              </strong>

            </div>
          )}

        </div>

      </section>

      {/* =====================================
          QUICK LINKS
      ===================================== */}

      <section className="quick-links">

        <Link
          href="/latihan"
          className="quick-card"
        >

          <span>
            01
          </span>

          <strong>
            CATAT LATIHAN
          </strong>

          <p>
            Masukkan hasil aktual
            dan RPE.
          </p>

        </Link>

        <Link
          href="/program"
          className="quick-card"
        >

          <span>
            02
          </span>

          <strong>
            PROGRAM MINGGUAN
          </strong>

          <p>
            Lihat seluruh jadwal
            latihan.
          </p>

        </Link>

        <Link
          href="/progress"
          className="quick-card"
        >

          <span>
            03
          </span>

          <strong>
            PROGRESS
          </strong>

          <p>
            Lihat perkembangan
            seluruh tes.
          </p>

        </Link>

      </section>

      <footer className="dashboard-footer">
        AKPOL MONITOR · DATA TERSIMPAN DI PERANGKAT
      </footer>

    </main>
  );
}