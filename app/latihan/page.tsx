"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Exercise = {
  id: string;
  name: string;
  unit: string;
  target: number;
  description: string;
  icon: string;
  color: string;
};

type Log = {
  id: string;
  date: string;
  exercise: string;
  value: number;
  rpe: number;
};

const EXERCISES: Exercise[] = [
  {
    id: "running",
    name: "LARI 12 MENIT",
    unit: "meter",
    target: 3200,
    description: "Jarak maksimal dalam 12 menit",
    icon: "RUN",
    color: "#ff7a18",
  },
  {
    id: "pullup",
    name: "PULL-UP",
    unit: "reps",
    target: 18,
    description: "Jumlah repetisi pull-up",
    icon: "PULL",
    color: "#ff9a42",
  },
  {
    id: "pushup",
    name: "PUSH-UP",
    unit: "reps",
    target: 43,
    description: "Jumlah repetisi push-up",
    icon: "PUSH",
    color: "#43d17c",
  },
  {
    id: "situp",
    name: "SIT-UP",
    unit: "reps",
    target: 43,
    description: "Jumlah repetisi sit-up",
    icon: "CORE",
    color: "#f5c451",
  },
  {
    id: "shuttle",
    name: "SHUTTLE RUN",
    unit: "detik",
    target: 16,
    description: "Waktu terbaik shuttle run",
    icon: "SPD",
    color: "#ff5d5d",
  },
];

const STORAGE_KEY = "akpol-training-logs";

function formatDate(date = new Date()) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function todayKey() {
  const d = new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function progressFor(
  value: number,
  target: number,
  lowerIsBetter = false
) {
  if (!value || !target) return 0;

  if (lowerIsBetter) {
    return Math.min(
      100,
      Math.max(0, (target / value) * 100)
    );
  }

  return Math.min(
    100,
    Math.max(0, (value / target) * 100)
  );
}

export default function LatihanPage() {
  const [selected, setSelected] = useState("running");
  const [value, setValue] = useState("");
  const [rpe, setRpe] = useState("6");
  const [logs, setLogs] = useState<Log[]>([]);
  const [saved, setSaved] = useState(false);

  const exercise =
    EXERCISES.find((item) => item.id === selected) ??
    EXERCISES[0];

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) return;

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setLogs(parsed);
      }
    } catch {
      setLogs([]);
    }
  }, []);

  const exerciseLogs = useMemo(() => {
    return logs
      .filter(
        (log) =>
          log.exercise === exercise.name
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  }, [logs, exercise.name]);

  const latest = exerciseLogs[0];

  const currentProgress = latest
    ? progressFor(
        latest.value,
        exercise.target,
        exercise.id === "shuttle"
      )
    : 0;

  function handleSave() {
    const numericValue = Number(value);
    const numericRpe = Number(rpe);

    if (!numericValue || numericValue <= 0) {
      return;
    }

    if (
      !numericRpe ||
      numericRpe < 1 ||
      numericRpe > 10
    ) {
      return;
    }

    const newLog: Log = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      exercise: exercise.name,
      value: numericValue,
      rpe: numericRpe,
    };

    const updated = [newLog, ...logs];

    setLogs(updated);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    setValue("");
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  function changeExercise(id: string) {
    setSelected(id);
    setValue("");
    setSaved(false);
  }

  return (
    <main className="training-page">
      <style jsx global>{`
        .training-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(255, 122, 24, 0.11),
              transparent 30%
            ),
            radial-gradient(
              circle at 10% 30%,
              rgba(255, 122, 24, 0.05),
              transparent 25%
            ),
            #060812;
          color: #f5f7fb;
          padding: 28px;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .training-shell {
          width: min(1240px, 100%);
          margin: 0 auto;
        }

        .training-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
        }

        .training-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .training-brand-mark {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              #ff9a42,
              #ff5f00
            );
          color: #090b12;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: -0.5px;
          box-shadow:
            0 0 28px rgba(255, 122, 24, 0.24);
        }

        .training-brand-title {
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .training-brand-subtitle {
          margin-top: 3px;
          color: #737b8f;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .training-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(16,19,31,0.78);
          color: #b9bfcc;
          padding: 10px 14px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .training-back:hover {
          color: white;
          border-color: rgba(255,122,24,0.35);
          transform: translateY(-1px);
        }

        .training-hero {
          position: relative;
          overflow: hidden;
          padding: 34px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          background:
            linear-gradient(
              135deg,
              rgba(255,122,24,0.11),
              rgba(16,19,31,0.96) 42%
            );
          box-shadow:
            0 20px 70px rgba(0,0,0,0.22);
          margin-bottom: 22px;
        }

        .training-hero::after {
          content: "";
          position: absolute;
          right: -100px;
          top: -120px;
          width: 330px;
          height: 330px;
          border-radius: 50%;
          border: 1px solid rgba(255,122,24,0.12);
          box-shadow:
            0 0 0 45px rgba(255,122,24,0.025),
            0 0 0 90px rgba(255,122,24,0.018);
          pointer-events: none;
        }

        .training-eyebrow {
          position: relative;
          z-index: 1;
          color: #ff9a42;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 0.2em;
          margin-bottom: 10px;
        }

        .training-title {
          position: relative;
          z-index: 1;
          margin: 0;
          font-size: clamp(32px, 5vw, 52px);
          line-height: 0.95;
          font-weight: 950;
          letter-spacing: -0.045em;
        }

        .training-title span {
          color: #ff7a18;
        }

        .training-description {
          position: relative;
          z-index: 1;
          max-width: 680px;
          margin: 16px 0 0;
          color: #858da0;
          font-size: 14px;
          line-height: 1.7;
        }

        .training-date {
          position: relative;
          z-index: 1;
          margin-top: 18px;
          display: inline-flex;
          padding: 8px 11px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.16);
          color: #9ba2b1;
          font-size: 11px;
          font-weight: 800;
        }

        .training-layout {
          display: grid;
          grid-template-columns: 1.45fr 0.8fr;
          gap: 22px;
          align-items: start;
        }

        .training-card {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          background: rgba(16,19,31,0.88);
          box-shadow:
            0 15px 50px rgba(0,0,0,0.16);
        }

        .training-card-head {
          padding: 22px 24px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .training-card-label {
          color: #6f7789;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .training-card-title {
          margin: 7px 0 0;
          font-size: 20px;
          font-weight: 900;
        }

        .exercise-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 12px;
          padding: 20px;
        }

        .exercise-button {
          position: relative;
          min-height: 108px;
          padding: 17px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.07);
          background: #0c0f19;
          color: #f5f7fb;
          text-align: left;
          cursor: pointer;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .exercise-button:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.15);
        }

        .exercise-button.active {
          background:
            linear-gradient(
              135deg,
              rgba(255,122,24,0.13),
              rgba(12,15,25,0.96)
            );
          border-color: rgba(255,122,24,0.48);
          box-shadow:
            inset 0 0 0 1px rgba(255,122,24,0.08),
            0 10px 30px rgba(255,122,24,0.07);
        }

        .exercise-icon {
          width: 38px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(255,255,255,0.055);
          color: #aeb5c3;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.06em;
          margin-bottom: 13px;
        }

        .exercise-button.active .exercise-icon {
          color: #ff9a42;
          background: rgba(255,122,24,0.1);
        }

        .exercise-name {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.03em;
        }

        .exercise-desc {
          margin-top: 5px;
          color: #697183;
          font-size: 10px;
        }

        .exercise-arrow {
          position: absolute;
          right: 16px;
          top: 17px;
          color: #4f5667;
          font-size: 14px;
        }

        .input-body {
          padding: 24px;
        }

        .selected-exercise {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 18px;
          border-radius: 16px;
          background: #0b0e17;
          border: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 22px;
        }

        .selected-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .selected-mark {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          background: rgba(255,122,24,0.1);
          color: #ff9a42;
          font-size: 9px;
          font-weight: 950;
        }

        .selected-name {
          font-size: 14px;
          font-weight: 900;
        }

        .selected-description {
          margin-top: 4px;
          color: #70788a;
          font-size: 10px;
        }

        .target-box {
          text-align: right;
        }

        .target-label {
          color: #676f80;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .target-value {
          margin-top: 3px;
          color: #ff9a42;
          font-size: 16px;
          font-weight: 950;
        }

        .input-grid {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 14px;
        }

        .field-label {
          display: block;
          margin-bottom: 8px;
          color: #8d95a5;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .training-input {
          width: 100%;
          box-sizing: border-box;
          height: 56px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 13px;
          background: #090c14;
          color: white;
          outline: none;
          padding: 0 16px;
          font-size: 18px;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .training-input:focus {
          border-color: rgba(255,122,24,0.5);
          box-shadow:
            0 0 0 3px rgba(255,122,24,0.07);
        }

        .training-select {
          appearance: none;
        }

        .save-button {
          width: 100%;
          height: 56px;
          margin-top: 18px;
          border: 0;
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              #ff9a42,
              #ff6810
            );
          color: #080a10;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.1em;
          cursor: pointer;
          box-shadow:
            0 12px 30px rgba(255,122,24,0.16);
          transition: 0.2s ease;
        }

        .save-button:hover {
          transform: translateY(-2px);
          box-shadow:
            0 16px 36px rgba(255,122,24,0.24);
        }

        .save-success {
          margin-top: 12px;
          padding: 11px 13px;
          border-radius: 11px;
          background: rgba(67,209,124,0.08);
          border: 1px solid rgba(67,209,124,0.2);
          color: #65dc91;
          font-size: 11px;
          font-weight: 800;
          text-align: center;
        }

        .side-card {
          padding: 22px;
        }

        .side-title {
          font-size: 16px;
          font-weight: 900;
        }

        .side-subtitle {
          margin-top: 5px;
          color: #6f7789;
          font-size: 10px;
          line-height: 1.5;
        }

        .progress-ring {
          margin: 26px auto 24px;
          width: 154px;
          height: 154px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            conic-gradient(
              #ff7a18 ${currentProgress}%,
              rgba(255,255,255,0.06) 0
            );
          position: relative;
        }

        .progress-ring::before {
          content: "";
          position: absolute;
          inset: 9px;
          border-radius: 50%;
          background: #10131f;
        }

        .progress-center {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .progress-number {
          font-size: 29px;
          font-weight: 950;
          letter-spacing: -0.05em;
        }

        .progress-percent {
          color: #737b8d;
          font-size: 10px;
          font-weight: 800;
        }

        .metric-list {
          display: grid;
          gap: 9px;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 13px;
          border-radius: 11px;
          background: #0b0e17;
          border: 1px solid rgba(255,255,255,0.045);
        }

        .metric-name {
          color: #737b8d;
          font-size: 10px;
          font-weight: 800;
        }

        .metric-value {
          color: #f1f3f7;
          font-size: 12px;
          font-weight: 900;
        }

        .history-card {
          margin-top: 22px;
        }

        .history-list {
          padding: 8px 20px 20px;
        }

        .history-item {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 18px;
          align-items: center;
          padding: 15px 4px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .history-item:last-child {
          border-bottom: 0;
        }

        .history-date {
          color: #697183;
          font-size: 10px;
        }

        .history-result {
          font-size: 13px;
          font-weight: 900;
        }

        .history-rpe {
          padding: 6px 9px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          color: #aeb5c3;
          font-size: 10px;
          font-weight: 900;
        }

        .empty-history {
          padding: 26px 4px 8px;
          color: #62697a;
          text-align: center;
          font-size: 11px;
        }

        .training-footer {
          margin-top: 22px;
          padding: 18px 4px 5px;
          color: #4f5667;
          font-size: 10px;
          text-align: center;
        }

        @media (max-width: 900px) {
          .training-page {
            padding: 18px;
          }

          .training-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .training-page {
            padding: 12px;
          }

          .training-topbar {
            margin-bottom: 16px;
          }

          .training-brand-title {
            font-size: 12px;
          }

          .training-back {
            font-size: 10px;
            padding: 9px 11px;
          }

          .training-hero {
            padding: 24px 20px;
            border-radius: 18px;
          }

          .training-title {
            font-size: 36px;
          }

          .exercise-grid {
            grid-template-columns: 1fr;
          }

          .input-grid {
            grid-template-columns: 1fr;
          }

          .selected-exercise {
            align-items: flex-start;
            flex-direction: column;
          }

          .target-box {
            text-align: left;
          }

          .history-item {
            grid-template-columns: 1fr auto;
          }

          .history-rpe {
            display: none;
          }
        }
      `}</style>

      <div className="training-shell">
        <header className="training-topbar">
          <div className="training-brand">
            <div className="training-brand-mark">
              AK
            </div>

            <div>
              <div className="training-brand-title">
                AKPOL MONITOR
              </div>

              <div className="training-brand-subtitle">
                Physical Training System
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="training-back"
          >
            ← DASHBOARD
          </Link>
        </header>

        <section className="training-hero">
          <div className="training-eyebrow">
            TRAINING INPUT / PERFORMANCE LOG
          </div>

          <h1 className="training-title">
            CATAT <span>LATIHAN.</span>
          </h1>

          <p className="training-description">
            Masukkan hasil latihan hari ini secara
            konsisten. Data akan tersimpan di
            perangkat dan digunakan untuk melihat
            perkembangan performa.
          </p>

          <div className="training-date">
            {formatDate()}
          </div>
        </section>

        <div className="training-layout">
          <section>
            <div className="training-card">
              <div className="training-card-head">
                <div className="training-card-label">
                  01 / PILIH LATIHAN
                </div>

                <div className="training-card-title">
                  Jenis latihan
                </div>
              </div>

              <div className="exercise-grid">
                {EXERCISES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`exercise-button ${
                      selected === item.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      changeExercise(item.id)
                    }
                  >
                    <div className="exercise-icon">
                      {item.icon}
                    </div>

                    <div className="exercise-name">
                      {item.name}
                    </div>

                    <div className="exercise-desc">
                      {item.description}
                    </div>

                    <div className="exercise-arrow">
                      →
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div
              className="training-card"
              style={{ marginTop: 22 }}
            >
              <div className="training-card-head">
                <div className="training-card-label">
                  02 / HASIL LATIHAN
                </div>

                <div className="training-card-title">
                  Input performa
                </div>
              </div>

              <div className="input-body">
                <div className="selected-exercise">
                  <div className="selected-left">
                    <div className="selected-mark">
                      {exercise.icon}
                    </div>

                    <div>
                      <div className="selected-name">
                        {exercise.name}
                      </div>

                      <div className="selected-description">
                        {exercise.description}
                      </div>
                    </div>
                  </div>

                  <div className="target-box">
                    <div className="target-label">
                      Target akhir
                    </div>

                    <div className="target-value">
                      {exercise.target}{" "}
                      {exercise.unit}
                    </div>
                  </div>
                </div>

                <div className="input-grid">
                  <div>
                    <label className="field-label">
                      Hasil latihan
                    </label>

                    <input
                      className="training-input"
                      type="number"
                      min="0"
                      step={
                        exercise.id ===
                        "running"
                          ? "50"
                          : "1"
                      }
                      value={value}
                      onChange={(event) =>
                        setValue(
                          event.target.value
                        )
                      }
                      placeholder={
                        exercise.id ===
                        "shuttle"
                          ? "contoh: 17.2"
                          : "masukkan hasil"
                      }
                    />
                  </div>

                  <div>
                    <label className="field-label">
                      RPE / 1–10
                    </label>

                    <select
                      className="training-input training-select"
                      value={rpe}
                      onChange={(event) =>
                        setRpe(
                          event.target.value
                        )
                      }
                    >
                      {Array.from(
                        { length: 10 },
                        (_, index) =>
                          index + 1
                      ).map((number) => (
                        <option
                          key={number}
                          value={number}
                        >
                          {number}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  className="save-button"
                  onClick={handleSave}
                >
                  SIMPAN HASIL LATIHAN
                </button>

                {saved && (
                  <div className="save-success">
                    ✓ HASIL LATIHAN BERHASIL
                    DISIMPAN
                  </div>
                )}
              </div>
            </div>

            <div className="training-card history-card">
              <div className="training-card-head">
                <div className="training-card-label">
                  03 / RIWAYAT
                </div>

                <div className="training-card-title">
                  Riwayat {exercise.name}
                </div>
              </div>

              <div className="history-list">
                {exerciseLogs.length === 0 ? (
                  <div className="empty-history">
                    Belum ada hasil latihan untuk
                    kategori ini.
                  </div>
                ) : (
                  exerciseLogs
                    .slice(0, 8)
                    .map((log) => (
                      <div
                        className="history-item"
                        key={log.id}
                      >
                        <div>
                          <div className="history-result">
                            {log.value}{" "}
                            {exercise.unit}
                          </div>

                          <div className="history-date">
                            {formatDate(
                              new Date(log.date)
                            )}
                          </div>
                        </div>

                        <div className="history-rpe">
                          RPE {log.rpe}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </section>

          <aside>
            <div className="training-card side-card">
              <div className="training-card-label">
                PERFORMANCE
              </div>

              <div className="side-title">
                Progress terakhir
              </div>

              <div className="side-subtitle">
                Dibandingkan dengan target akhir
                program.
              </div>

              <div className="progress-ring">
                <div className="progress-center">
                  <div className="progress-number">
                    {Math.round(
                      currentProgress
                    )}
                  </div>

                  <div className="progress-percent">
                    PERSEN
                  </div>
                </div>
              </div>

              <div className="metric-list">
                <div className="metric-row">
                  <span className="metric-name">
                    Hasil terakhir
                  </span>

                  <span className="metric-value">
                    {latest
                      ? `${latest.value} ${exercise.unit}`
                      : "—"}
                  </span>
                </div>

                <div className="metric-row">
                  <span className="metric-name">
                    Target akhir
                  </span>

                  <span className="metric-value">
                    {exercise.target}{" "}
                    {exercise.unit}
                  </span>
                </div>

                <div className="metric-row">
                  <span className="metric-name">
                    RPE terakhir
                  </span>

                  <span className="metric-value">
                    {latest
                      ? `${latest.rpe}/10`
                      : "—"}
                  </span>
                </div>

                <div className="metric-row">
                  <span className="metric-name">
                    Total pencatatan
                  </span>

                  <span className="metric-value">
                    {exerciseLogs.length}x
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="training-footer">
          AKPOL MONITOR • TRAIN SMART •
          RECORD CONSISTENTLY
        </footer>
      </div>
    </main>
  );
}