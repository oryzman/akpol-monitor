"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  EXERCISE_PROFILES,
} from "../../utils/adaptive-engine";

type TrainingLog = {
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

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

function getBestResult(
  logs: TrainingLog[],
  lowerIsBetter = false
) {
  if (logs.length === 0) return null;

  return [...logs].sort((a, b) =>
    lowerIsBetter
      ? a.actual - b.actual
      : b.actual - a.actual
  )[0];
}

function getProgressPercentage(
  actual: number,
  target: number,
  lowerIsBetter = false
) {
  if (!actual || !target) return 0;

  if (lowerIsBetter) {
    return Math.min(
      100,
      Math.round((target / actual) * 100)
    );
  }

  return Math.min(
    100,
    Math.round((actual / target) * 100)
  );
}

function getChartPoints(
  logs: TrainingLog[],
  width = 700,
  height = 230
) {
  if (logs.length === 0) return [];

  const sorted = [...logs].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const values = sorted.map(
    (item) => item.actual
  );

  const min = Math.min(...values);
  const max = Math.max(...values);

  const range =
    max - min === 0
      ? 1
      : max - min;

  const paddingX = 35;
  const paddingY = 25;

  return sorted.map((item, index) => {
    const x =
      sorted.length === 1
        ? width / 2
        : paddingX +
          (index /
            (sorted.length - 1)) *
            (width - paddingX * 2);

    const y =
      height -
      paddingY -
      ((item.actual - min) /
        range) *
        (height - paddingY * 2);

    return {
      ...item,
      x,
      y,
    };
  });
}

function buildPath(
  points: { x: number; y: number }[]
) {
  if (points.length === 0) return "";

  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");
}

export default function ProgressPage() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [selectedExercise, setSelectedExercise] =
    useState("running");

  useEffect(() => {
    function loadLogs() {
      try {
        const raw = localStorage.getItem(
          "akpol-training-logs"
        );

        if (!raw) {
          setLogs([]);
          return;
        }

        const parsed = JSON.parse(raw);

        setLogs(
          Array.isArray(parsed)
            ? parsed
            : []
        );
      } catch {
        setLogs([]);
      }
    }

    loadLogs();

    window.addEventListener(
      "focus",
      loadLogs
    );

    window.addEventListener(
      "storage",
      loadLogs
    );

    return () => {
      window.removeEventListener(
        "focus",
        loadLogs
      );

      window.removeEventListener(
        "storage",
        loadLogs
      );
    };
  }, []);

  const exerciseData = useMemo(() => {
    return EXERCISE_PROFILES.map(
      (profile) => {
        const history = logs
          .filter(
            (log) =>
              log.exercise ===
              profile.name
          )
          .sort((a, b) =>
            b.date.localeCompare(
              a.date
            )
          );

        const latest = history[0];

        const best = getBestResult(
          history,
          profile.lowerIsBetter
        );

        const percentage = latest
          ? getProgressPercentage(
              latest.actual,
              profile.finalTarget,
              profile.lowerIsBetter
            )
          : 0;

        return {
          profile,
          history,
          latest,
          best,
          percentage,
        };
      }
    );
  }, [logs]);

  const selectedData =
    exerciseData.find(
      (item) =>
        item.profile.id ===
        selectedExercise
    ) ?? exerciseData[0];

  const selectedHistory =
    selectedData?.history ?? [];

  const chartPoints = getChartPoints(
    selectedHistory
  );

  const chartPath =
    buildPath(chartPoints);

  const totalSessions = logs.length;

  const completedSessions =
    logs.filter(
      (log) =>
        log.status === "completed"
    ).length;

  const averageRpe =
    logs.length > 0
      ? (
          logs.reduce(
            (sum, log) =>
              sum + (log.rpe ?? 0),
            0
          ) / logs.length
        ).toFixed(1)
      : "-";

  const overallProgress =
    exerciseData.length > 0
      ? Math.round(
          exerciseData.reduce(
            (sum, item) =>
              sum + item.percentage,
            0
          ) /
            exerciseData.length
        )
      : 0;

  return (
    <main className="page-shell">

      {/* HERO */}

      <section className="hero progress-hero">

        <div>

          <Link
            href="/"
            className="back-link"
          >
            ← Dashboard
          </Link>

          <p className="eyebrow">
            PERFORMANCE ANALYTICS
          </p>

          <h1>
            YOUR
            <br />
            <span>PROGRESS</span>
          </h1>

          <p className="hero-text">
            Pantau perkembangan latihan berdasarkan
            hasil yang kamu masukkan ke dalam sistem.
          </p>

        </div>

        <div className="hero-badge">
          <strong>OVERALL</strong>

          <span>
            {overallProgress}%
          </span>
        </div>

      </section>

      {/* SUMMARY */}

      <section className="stats-grid">

        <div className="stat-card">
          <span>
            TOTAL SESI
          </span>

          <strong>
            {totalSessions}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            SESI TERCAPAI
          </span>

          <strong>
            {completedSessions}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            RATA-RATA RPE
          </span>

          <strong>
            {averageRpe}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            OVERALL PROGRESS
          </span>

          <strong>
            {overallProgress}%
          </strong>
        </div>

      </section>

      {/* PERFORMANCE */}

      <section>

        <div className="section-title">

          <div>

            <p className="eyebrow">
              FITNESS METRICS
            </p>

            <h2>
              Physical Performance
            </h2>

          </div>

        </div>

        <div className="performance-grid">

          {exerciseData.map(
            ({
              profile,
              history,
              latest,
              best,
              percentage,
            }) => (

              <article
                key={profile.id}
                className="performance-card"
              >

                <div className="performance-top">

                  <div>

                    <p className="performance-category">
                      {profile.unit.toUpperCase()}
                    </p>

                    <h3>
                      {profile.name}
                    </h3>

                  </div>

                  <span className="performance-percent">
                    {percentage}%
                  </span>

                </div>

                <div className="performance-bar">

                  <div
                    style={{
                      width:
                        `${percentage}%`,
                    }}
                  />

                </div>

                <div className="performance-values">

                  <div>

                    <span>
                      TERAKHIR
                    </span>

                    <strong>
                      {latest
                        ? `${formatNumber(
                            latest.actual
                          )} ${latest.unit}`
                        : "Belum ada data"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      PERSONAL BEST
                    </span>

                    <strong>
                      {best
                        ? `${formatNumber(
                            best.actual
                          )} ${best.unit}`
                        : "-"}
                    </strong>

                  </div>

                </div>

                {latest ? (

                  <div className="performance-footer">

                    <span>
                      {history.length} sesi
                    </span>

                    <span>
                      RPE{" "}
                      {latest.rpe ?? "-"}
                    </span>

                    <span>
                      {latest.date}
                    </span>

                  </div>

                ) : (

                  <div className="performance-empty">
                    Belum ada hasil latihan.
                  </div>

                )}

              </article>

            )
          )}

        </div>

      </section>

      {/* GRAPH */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <p className="eyebrow">
              PERFORMANCE TREND
            </p>

            <h2>
              Progress Graph
            </h2>

          </div>

          {selectedData && (
            <span className="date-badge">
              {selectedHistory.length} SESI
            </span>
          )}

        </div>

        {/* EXERCISE SELECTOR */}

        <div className="graph-selector">

          {EXERCISE_PROFILES.map(
            (profile) => {

              const hasData =
                logs.some(
                  (log) =>
                    log.exercise ===
                    profile.name
                );

              return (
                <button
                  key={profile.id}
                  type="button"
                  disabled={!hasData}
                  className={
                    selectedExercise ===
                    profile.id
                      ? "graph-filter active"
                      : "graph-filter"
                  }
                  onClick={() =>
                    setSelectedExercise(
                      profile.id
                    )
                  }
                >
                  {profile.name}
                </button>
              );
            }
          )}

        </div>

        {selectedData &&
        selectedHistory.length > 0 ? (

          <div className="chart-container">

            <div className="chart-header">

              <div>

                <span>
                  LATEST
                </span>

                <strong>
                  {formatNumber(
                    selectedData.latest
                      ?.actual ?? 0
                  )}{" "}
                  {selectedData.profile.unit}
                </strong>

              </div>

              <div>

                <span>
                  PERSONAL BEST
                </span>

                <strong>
                  {selectedData.best
                    ? `${formatNumber(
                        selectedData.best.actual
                      )} ${selectedData.best.unit}`
                    : "-"}
                </strong>

              </div>

              <div>

                <span>
                  FINAL TARGET
                </span>

                <strong>
                  {formatNumber(
                    selectedData.profile
                      .finalTarget
                  )}{" "}
                  {selectedData.profile.unit}
                </strong>

              </div>

            </div>

            <div className="chart-wrapper">

              <svg
                viewBox="0 0 700 230"
                preserveAspectRatio="none"
                className="progress-chart"
              >

                {/* GRID */}

                <line
                  x1="35"
                  y1="25"
                  x2="665"
                  y2="25"
                  className="chart-grid-line"
                />

                <line
                  x1="35"
                  y1="115"
                  x2="665"
                  y2="115"
                  className="chart-grid-line"
                />

                <line
                  x1="35"
                  y1="205"
                  x2="665"
                  y2="205"
                  className="chart-grid-line"
                />

                {/* TARGET LINE */}

                <line
                  x1="35"
                  y1="25"
                  x2="665"
                  y2="25"
                  className="chart-target-line"
                />

                {/* AREA */}

                {chartPoints.length > 1 && (
                  <path
                    d={`${chartPath} L ${chartPoints[chartPoints.length - 1].x} 205 L ${chartPoints[0].x} 205 Z`}
                    className="chart-area"
                  />
                )}

                {/* MAIN LINE */}

                {chartPoints.length > 1 && (
                  <path
                    d={chartPath}
                    className="chart-line"
                  />
                )}

                {/* POINTS */}

                {chartPoints.map(
                  (point) => (

                    <g
                      key={point.id}
                    >

                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        className="chart-point"
                      />

                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="2"
                        className="chart-point-inner"
                      />

                    </g>

                  )
                )}

              </svg>

            </div>

            <div className="chart-dates">

              {chartPoints
                .slice(-6)
                .map(
                  (point) => (
                    <span
                      key={point.id}
                    >
                      {point.date}
                    </span>
                  )
                )}

            </div>

          </div>

        ) : (

          <div className="empty-state">

            <div className="empty-icon">
              +
            </div>

            <h3>
              Belum ada data grafik
            </h3>

            <p>
              Masukkan hasil latihan terlebih dahulu
              untuk melihat perkembanganmu.
            </p>

            <Link
              href="/latihan"
              className="primary-button"
            >
              CATAT LATIHAN →
            </Link>

          </div>

        )}

      </section>

      {/* PERSONAL RECORD */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <p className="eyebrow">
              PERSONAL RECORDS
            </p>

            <h2>
              Best Performance
            </h2>

          </div>

          <span className="date-badge">
            ALL TIME
          </span>

        </div>

        <div className="record-grid">

          {exerciseData.map(
            ({
              profile,
              best,
            }) => (

              <div
                key={profile.id}
                className="record-card"
              >

                <div className="record-number">
                  {best
                    ? formatNumber(
                        best.actual
                      )
                    : "--"}
                </div>

                <div className="record-info">

                  <strong>
                    {profile.name}
                  </strong>

                  <span>
                    {best
                      ? best.unit
                      : "Belum ada data"}
                  </span>

                </div>

                <div className="record-arrow">
                  ↗
                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* ACTIVITY */}

      <section className="panel activity-panel">

        <div className="panel-header">

          <div>

            <p className="eyebrow">
              TRAINING HISTORY
            </p>

            <h2>
              Aktivitas Terakhir
            </h2>

          </div>

          <span className="date-badge">
            {logs.length} RECORDS
          </span>

        </div>

        {logs.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              +
            </div>

            <h3>
              Belum ada data latihan
            </h3>

            <p>
              Mulai masukkan hasil latihan
              untuk melihat progress kamu.
            </p>

            <Link
              href="/latihan"
              className="primary-button"
            >
              CATAT LATIHAN →
            </Link>

          </div>

        ) : (

          <div className="activity-list">

            {[...logs]
              .sort((a, b) =>
                b.date.localeCompare(
                  a.date
                )
              )
              .slice(0, 10)
              .map((log) => (

                <div
                  className="activity-row"
                  key={log.id}
                >

                  <div className="activity-date">
                    {log.date}
                  </div>

                  <div className="activity-exercise">

                    <strong>
                      {log.exercise}
                    </strong>

                    <span>
                      RPE{" "}
                      {log.rpe ?? "-"}
                    </span>

                  </div>

                  <div className="activity-result">

                    <strong>
                      {formatNumber(
                        log.actual
                      )}{" "}
                      {log.unit}
                    </strong>

                    <span>
                      Target{" "}
                      {formatNumber(
                        log.target
                      )}
                    </span>

                  </div>

                  <div
                    className={
                      log.status ===
                      "completed"
                        ? "activity-status completed"
                        : "activity-status"
                    }
                  >
                    {log.status ===
                    "completed"
                      ? "TERCAPAI"
                      : "DICATAT"}
                  </div>

                </div>

              ))}

          </div>

        )}

      </section>

      {/* NAVIGATION */}

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
            Tambahkan hasil latihan baru.
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
            WEEKLY PROGRAM
          </strong>

          <p>
            Lihat jadwal 22 minggu.
          </p>

        </Link>

        <Link
          href="/"
          className="quick-card"
        >

          <span>
            03
          </span>

          <strong>
            COMMAND CENTER
          </strong>

          <p>
            Kembali ke dashboard.
          </p>

        </Link>

      </section>

      <footer className="dashboard-footer">
        AKPOL MONITOR · PERFORMANCE ANALYTICS
      </footer>

    </main>
  );
}