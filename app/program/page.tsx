"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getCurrentWeek,
  getTodayTraining,
} from "../../data/program-akpol";

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const DAY_KEYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const PROGRAM_DAY_KEYS: DayKey[] = [
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "monday",
  "tuesday",
];

const DAY_LABELS: Record<DayKey, string> = {
  monday: "MON",
  tuesday: "TUE",
  wednesday: "WED",
  thursday: "THU",
  friday: "FRI",
  saturday: "SAT",
  sunday: "SUN",
};

const PROGRAM_START = new Date(2026, 8, 30);

function dateOnly(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);

  result.setDate(
    result.getDate() + amount
  );

  return result;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
}

function getWeekStart(week: number) {
  return addDays(
    PROGRAM_START,
    (week - 1) * 7
  );
}

/*
 * Program dimulai Rabu, 30 September 2026.
 *
 * Jadi urutan tanggal program:
 * WED → THU → FRI → SAT → SUN → MON → TUE
 *
 * Ini hanya memperbaiki pemetaan tanggal.
 * DAY_KEYS tetap dipakai untuk mengambil session
 * dari data program karena object days menggunakan
 * nama hari normal Senin–Minggu.
 */
function getDayDate(
  week: number,
  day: DayKey
) {
  const programIndex =
    PROGRAM_DAY_KEYS.indexOf(day);

  return addDays(
    getWeekStart(week),
    programIndex
  );
}

function isToday(date: Date) {
  return (
    dateOnly(date).getTime() ===
    dateOnly(new Date()).getTime()
  );
}

function isPast(date: Date) {
  return (
    dateOnly(date).getTime() <
    dateOnly(new Date()).getTime()
  );
}

function isRestDay(session: string) {
  return /rest|recovery|mobility/i.test(
    session
  );
}

export default function ProgramPage() {
  const today = useMemo(
    () => new Date(),
    []
  );

  const todayTraining = useMemo(
    () => getTodayTraining(today),
    [today]
  );

  const currentWeek = useMemo(
    () => getCurrentWeek(today),
    [today]
  );

  const [selectedWeek, setSelectedWeek] =
    useState(
      currentWeek?.week ?? 1
    );

  const selectedProgram = useMemo(
    () =>
      getCurrentWeek(
        getWeekStart(selectedWeek)
      ),
    [selectedWeek]
  );

  const programProgress = useMemo(() => {
    const start = dateOnly(
      PROGRAM_START
    );

    const end = addDays(
      start,
      22 * 7 - 1
    );

    const current = dateOnly(today);

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
  }, [today]);

  return (
    <main className="page-shell">

      {/* HERO */}

      <section className="hero program-hero">
        <div>
          <Link
            href="/"
            className="back-link"
          >
            ← Dashboard
          </Link>

          <p className="eyebrow">
            AKPOL WEEKLY TRAINING PROGRAM
          </p>

          <h1>
            PROGRAM
            <br />
            <span>
              COMMAND TIMELINE
            </span>
          </h1>

          <p className="hero-text">
            Pantau perjalanan program
            latihan 22 minggu, dari fase
            adaptasi hingga final test.
          </p>
        </div>

        <div className="hero-badge">
          <strong>WEEK</strong>

          <span>
            {currentWeek?.week ?? "-"}
          </span>
        </div>
      </section>

      {/* CURRENT PROGRAM */}

      {currentWeek && (
        <section className="program-current-card">
          <div>
            <p className="eyebrow">
              CURRENT PROGRAM
            </p>

            <h2>
              {currentWeek.focus}
            </h2>

            <p>
              Week {currentWeek.week} ·{" "}
              {currentWeek.phase}
            </p>
          </div>

          <div className="current-week-date">
            {currentWeek.dateRange}
          </div>
        </section>
      )}

      {/* TODAY */}

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
              {todayTraining?.day ?? "-"}
            </span>
          </div>

          {todayTraining ? (
            <>
              <div className="training-meta">
                <span>
                  WEEK {todayTraining.week}
                </span>

                <span>
                  {todayTraining.phase}
                </span>

                <span>
                  {todayTraining.focus}
                </span>
              </div>

              <h3>
                {todayTraining.focus}
              </h3>

              <div className="session-box">
                {todayTraining.session}
              </div>
            </>
          ) : (
            <p className="adaptive-reason">
              Program hari ini berada di
              luar periode latihan.
            </p>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">
                PROGRAM STATUS
              </p>

              <h2>
                Training Timeline
              </h2>
            </div>

            <span className="status-dot progress" />
          </div>

          <p className="adaptive-reason">
            Program berlangsung selama
            22 minggu, dimulai pada
            30 September 2026 dan
            berakhir pada final test.
          </p>

          <div className="action-box">
            <span>
              FINAL TARGET
            </span>

            <p>
              12-minute run 3.200 m ·
              Pull-up 18 · Push-up 43 ·
              Sit-up 43 · Shuttle 16 sec
            </p>
          </div>
        </div>

      </section>

      {/* WEEK SELECTOR */}

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">
              WEEK SELECTOR
            </p>

            <h2>
              Pilih Minggu Program
            </h2>
          </div>

          <span className="date-badge">
            WEEK {selectedWeek}
          </span>
        </div>

        <div className="week-selector">
          {Array.from(
            { length: 22 },
            (_, index) => {
              const weekNumber =
                index + 1;

              const program =
                getCurrentWeek(
                  getWeekStart(
                    weekNumber
                  )
                );

              const active =
                weekNumber ===
                selectedWeek;

              const current =
                weekNumber ===
                currentWeek?.week;

              return (
                <button
                  key={weekNumber}
                  type="button"
                  className={[
                    "week-button",
                    active
                      ? "active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    setSelectedWeek(
                      weekNumber
                    )
                  }
                >
                  <span>
                    {weekNumber}
                  </span>

                  <small>
                    {current
                      ? "CURRENT"
                      : program?.phase ??
                        "PROGRAM"}
                  </small>
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* SELECTED WEEK */}

      {selectedProgram && (
        <section className="program-detail">

          <div className="program-detail-header">
            <div>
              <p className="eyebrow">
                SELECTED PROGRAM
              </p>

              <h2>
                Week {selectedProgram.week}
              </h2>

              <p>
                {selectedProgram.phase} ·{" "}
                {selectedProgram.focus}
              </p>
            </div>

            <div className="program-date">
              {selectedProgram.dateRange}
            </div>
          </div>

          <div className="daily-program-grid">
            {DAY_KEYS.map((day) => {
              const session =
                selectedProgram.days[day];

              /*
               * FIX UTAMA:
               * session tetap mengambil data
               * berdasarkan key Senin–Minggu,
               * tetapi tanggal program mengikuti
               * titik mulai Rabu, 30 September 2026.
               */
              const dayDate =
                getDayDate(
                  selectedProgram.week,
                  day
                );

              const today =
                isToday(dayDate);

              const past =
                isPast(dayDate);

              const rest =
                isRestDay(session);

              let status =
                "UPCOMING";

              if (today) {
                status = "CURRENT";
              } else if (past) {
                status = "PAST";
              }

              return (
                <article
                  key={day}
                  className={[
                    "day-card",
                    rest
                      ? "rest-day"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="day-card-top">
                    <span>
                      {DAY_LABELS[day]}
                    </span>

                    <strong>
                      {formatDate(
                        dayDate
                      )}
                    </strong>
                  </div>

                  <div className="day-status">
                    {status}
                  </div>

                  <p>
                    {session}
                  </p>
                </article>
              );
            })}
          </div>

        </section>
      )}

      {/* PROGRAM TIMELINE */}

      <section className="panel progress-panel">

        <div className="panel-header">
          <div>
            <p className="eyebrow">
              CURRENT POSITION
            </p>

            <h2>
              Program Timeline
            </h2>
          </div>

          <span className="target-number">
            {programProgress}%
          </span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width:
                `${programProgress}%`,
            }}
          />
        </div>

        <div className="progress-labels">
          <span>
            Start{" "}
            <strong>
              30 Sep 2026
            </strong>
          </span>

          <span>
            Final{" "}
            <strong>
              02 Mar 2027
            </strong>
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "14px",
            marginTop: "22px",
          }}
        >

          <div
            style={{
              minWidth: 0,
              padding: "16px",
              border:
                "1px solid var(--border)",
              borderRadius: "10px",
              background:
                "rgba(255, 255, 255, 0.025)",
            }}
          >
            <span
              style={{
                display: "block",
                marginBottom: "7px",
                color: "var(--muted)",
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing:
                  "0.12em",
              }}
            >
              CURRENT PHASE
            </span>

            <strong
              style={{
                display: "block",
                color: "#e8eaf0",
                fontSize: "15px",
                lineHeight: 1.4,
              }}
            >
              {currentWeek?.phase ??
                "-"}
            </strong>
          </div>

          <div
            style={{
              minWidth: 0,
              padding: "16px",
              border:
                "1px solid var(--border)",
              borderRadius: "10px",
              background:
                "rgba(255, 255, 255, 0.025)",
            }}
          >
            <span
              style={{
                display: "block",
                marginBottom: "7px",
                color: "var(--muted)",
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing:
                  "0.12em",
              }}
            >
              CURRENT FOCUS
            </span>

            <strong
              style={{
                display: "block",
                color: "#e8eaf0",
                fontSize: "15px",
                lineHeight: 1.4,
              }}
            >
              {currentWeek?.focus ??
                "-"}
            </strong>
          </div>

        </div>

      </section>

      {/* ROADMAP */}

      <section className="panel">

        <div className="panel-header">
          <div>
            <p className="eyebrow">
              ROADMAP
            </p>

            <h2>
              22 Week Structure
            </h2>
          </div>
        </div>

        <div className="phase-grid">

          {[
            {
              number: "01",
              title: "Adaptasi",
              weeks: "Week 1–3",
              start: 1,
            },
            {
              number: "02",
              title: "Base",
              weeks: "Week 4–7",
              start: 4,
            },
            {
              number: "03",
              title: "Build",
              weeks: "Week 8–17",
              start: 8,
            },
            {
              number: "04",
              title: "Deload",
              weeks: "Week 18",
              start: 18,
            },
            {
              number: "05",
              title: "Peak",
              weeks: "Week 19–21",
              start: 19,
            },
            {
              number: "06",
              title: "Final",
              weeks: "Week 22",
              start: 22,
            },
          ].map((phase) => (
            <button
              key={phase.number}
              type="button"
              className="phase-card"
              onClick={() =>
                setSelectedWeek(
                  phase.start
                )
              }
            >
              <span className="phase-number">
                {phase.number}
              </span>

              <div>
                <strong>
                  {phase.title}
                </strong>

                <span>
                  {phase.weeks}
                </span>
              </div>

              <span className="phase-arrow">
                →
              </span>
            </button>
          ))}

        </div>

      </section>

      {/* FINAL TARGET */}

      <section className="panel progress-panel">

        <div className="panel-header">
          <div>
            <p className="eyebrow">
              FINAL TARGET
            </p>

            <h2>
              AKPOL Physical Target
            </h2>
          </div>
        </div>

        <div className="performance-values">

          <div>
            <span>
              12-MINUTE RUN
            </span>

            <strong>
              3.200 m
            </strong>
          </div>

          <div>
            <span>
              PULL-UP
            </span>

            <strong>
              18 reps
            </strong>
          </div>

          <div>
            <span>
              PUSH-UP
            </span>

            <strong>
              43 reps
            </strong>
          </div>

          <div>
            <span>
              SIT-UP
            </span>

            <strong>
              43 reps
            </strong>
          </div>

          <div>
            <span>
              SHUTTLE
            </span>

            <strong>
              16 sec
            </strong>
          </div>

        </div>

      </section>

      {/* QUICK LINKS */}

      <section className="quick-links">

        <Link
          href="/latihan"
          className="quick-card"
        >
          <span>01</span>

          <strong>
            CATAT LATIHAN
          </strong>

          <p>
            Masukkan hasil aktual dan RPE.
          </p>
        </Link>

        <Link
          href="/progress"
          className="quick-card"
        >
          <span>02</span>

          <strong>
            PROGRESS
          </strong>

          <p>
            Lihat perkembangan fisik.
          </p>
        </Link>

        <Link
          href="/"
          className="quick-card"
        >
          <span>03</span>

          <strong>
            DASHBOARD
          </strong>

          <p>
            Kembali ke command center.
          </p>
        </Link>

      </section>

      <footer className="dashboard-footer">
        AKPOL MONITOR · 22 WEEK TRAINING SYSTEM
      </footer>

    </main>
  );
}