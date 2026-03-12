import { useState } from "react";
import { RadialBarChart, RadialBar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const API_URL = "https://credit-risk-api-2-xsnv.onrender.com/predict"; // 🔁 Replace with your Render/HF URL

const FIELD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080c10;
    --surface: #0d1117;
    --surface2: #161b22;
    --border: #21262d;
    --accent: #f0b429;
    --accent2: #e05c3a;
    --good: #3fb950;
    --bad: #f85149;
    --text: #e6edf3;
    --muted: #7d8590;
    --font-display: 'Syne', sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-display); }

  .app {
    min-height: 100vh;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(240,180,41,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(224,92,58,0.05) 0%, transparent 60%);
  }

  .header {
    border-bottom: 1px solid var(--border);
    padding: 20px 48px;
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(13,17,23,0.8);
    backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .logo-mark {
    width: 36px; height: 36px;
    background: var(--accent);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 800; color: #000;
    flex-shrink: 0;
  }

  .header-title { font-size: 17px; font-weight: 700; letter-spacing: -0.3px; }
  .header-sub { font-size: 12px; color: var(--muted); font-family: var(--font-mono); margin-top: 1px; }

  .header-badge {
    margin-left: auto;
    padding: 4px 12px;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--muted);
    display: flex; align-items: center; gap: 6px;
  }

  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--good); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .main { max-width: 1200px; margin: 0 auto; padding: 48px 24px; display: grid; grid-template-columns: 1fr 420px; gap: 32px; }

  @media (max-width: 900px) { .main { grid-template-columns: 1fr; } }

  .section-label {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--accent);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 20px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 28px;
  }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .field { display: flex; flex-direction: column; gap: 6px; }
  .field.full { grid-column: 1 / -1; }

  .field label {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--muted);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .field input, .field select {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 14px;
    color: var(--text);
    font-family: var(--font-display);
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
    -webkit-appearance: none;
  }

  .field input:focus, .field select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(240,180,41,0.1);
  }

  .field select { cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237d8590' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }

  .job-selector { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }

  .job-btn {
    padding: 8px 4px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface2);
    color: var(--muted);
    font-size: 11px;
    font-family: var(--font-mono);
    text-align: center;
    cursor: pointer;
    transition: all 0.15s;
    line-height: 1.3;
  }

  .job-btn:hover { border-color: var(--accent); color: var(--text); }
  .job-btn.active { border-color: var(--accent); background: rgba(240,180,41,0.1); color: var(--accent); }

  .submit-btn {
    width: 100%;
    margin-top: 24px;
    padding: 14px;
    background: var(--accent);
    color: #000;
    border: none;
    border-radius: 8px;
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.3px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .submit-btn:hover { background: #f5c842; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(240,180,41,0.25); }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(0,0,0,0.2);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block; margin-right: 8px; vertical-align: middle;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Results Panel */
  .results-panel { display: flex; flex-direction: column; gap: 20px; }

  .verdict-card {
    border-radius: 12px;
    padding: 28px;
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
    transition: all 0.4s;
  }

  .verdict-card.good { background: linear-gradient(135deg, rgba(63,185,80,0.08) 0%, var(--surface) 60%); border-color: rgba(63,185,80,0.3); }
  .verdict-card.bad  { background: linear-gradient(135deg, rgba(248,81,73,0.08) 0%, var(--surface) 60%); border-color: rgba(248,81,73,0.3); }
  .verdict-card.idle { background: var(--surface); }

  .verdict-label {
    font-size: 10px;
    font-family: var(--font-mono);
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 12px;
  }

  .verdict-text {
    font-size: 42px;
    font-weight: 800;
    letter-spacing: -2px;
    line-height: 1;
    margin-bottom: 8px;
  }

  .verdict-text.good { color: var(--good); }
  .verdict-text.bad  { color: var(--bad); }
  .verdict-text.idle { color: var(--border); }

  .verdict-sub { font-size: 13px; color: var(--muted); font-family: var(--font-mono); }

  .confidence-bar-wrap { margin-top: 20px; }
  .confidence-bar-label { display: flex; justify-content: space-between; font-size: 12px; font-family: var(--font-mono); color: var(--muted); margin-bottom: 8px; }
  .confidence-bar-track { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .confidence-bar-fill { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.16,1,0.3,1); }
  .confidence-bar-fill.good { background: var(--good); }
  .confidence-bar-fill.bad  { background: var(--bad); }

  .chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
  .chart-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .chart-sub { font-size: 11px; color: var(--muted); font-family: var(--font-mono); margin-bottom: 20px; }

  .prob-bars { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
  .prob-row { display: flex; flex-direction: column; gap: 6px; }
  .prob-row-header { display: flex; justify-content: space-between; align-items: center; }
  .prob-name { font-size: 12px; font-family: var(--font-mono); color: var(--text); display: flex; align-items: center; gap: 8px; }
  .prob-dot { width: 8px; height: 8px; border-radius: 50%; }
  .prob-pct { font-size: 14px; font-weight: 700; font-family: var(--font-mono); }
  .prob-track { height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
  .prob-fill { height: 100%; border-radius: 4px; transition: width 0.9s cubic-bezier(0.16,1,0.3,1); }

  .idle-placeholder {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 48px 24px; gap: 12px; color: var(--muted); text-align: center;
  }

  .idle-icon { font-size: 40px; opacity: 0.3; }
  .idle-text { font-size: 13px; font-family: var(--font-mono); line-height: 1.6; }

  .error-banner {
    background: rgba(248,81,73,0.08);
    border: 1px solid rgba(248,81,73,0.3);
    border-radius: 8px;
    padding: 14px 16px;
    font-size: 13px;
    font-family: var(--font-mono);
    color: var(--bad);
    display: flex; align-items: flex-start; gap: 10px;
  }

  .gauge-wrap { display: flex; justify-content: center; align-items: center; position: relative; height: 160px; }
  .gauge-center { position: absolute; text-align: center; }
  .gauge-pct { font-size: 28px; font-weight: 800; font-family: var(--font-mono); }
  .gauge-lbl { font-size: 10px; font-family: var(--font-mono); color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }
`;

const jobLabels = ["Unskilled\nNon-Res.", "Unskilled\nResident", "Skilled", "Highly\nSkilled"];

const defaultForm = {
  age: 35, sex: "male", job: 2, housing: "own",
  "Saving accounts": "little", "Checking account": "moderate",
  "Credit amount": 5000, duration: 24, purpose: "car (new)",
};

export default function CreditRiskUI() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: +form.age, job: +form.job, "Credit amount": +form["Credit amount"], duration: +form.duration }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Prediction failed"); }
      setResult(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const verdict = result?.prediction;
  const confidence = result ? Math.round(result.confidence * 100) : 0;
  const goodPct = result ? Math.round(result.good_probability * 100) : 0;
  const badPct  = result ? Math.round(result.bad_probability  * 100) : 0;

  const gaugeData = result ? [{ value: confidence, fill: verdict === "good" ? "#3fb950" : "#f85149" }, { value: 100 - confidence, fill: "#21262d" }] : [{ value: 100, fill: "#21262d" }];

  return (
    <>
      <style>{FIELD_STYLES}</style>
      <div className="app">

        {/* Header */}
        <header className="header">
          <div className="logo-mark">CR</div>
          <div>
            <div className="header-title">Credit Risk Analyzer</div>
            <div className="header-sub">German Credit Dataset · Logistic Regression Pipeline</div>
          </div>
          <div className="header-badge">
            <span className="dot" />
            API CONNECTED
          </div>
        </header>

        <div className="main">

          {/* ── LEFT: Form ────────────────────────────────────── */}
          <div>
            <div className="section-label">Applicant Details</div>
            <div className="card">
              <div className="form-grid">

                {/* Age */}
                <div className="field">
                  <label>Age (years)</label>
                  <input type="number" min={18} max={100} value={form.age} onChange={e => set("age", e.target.value)} />
                </div>

                {/* Sex */}
                <div className="field">
                  <label>Gender</label>
                  <select value={form.sex} onChange={e => set("sex", e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                {/* Job */}
                <div className="field full">
                  <label>Job Level</label>
                  <div className="job-selector">
                    {jobLabels.map((lbl, i) => (
                      <button key={i} className={`job-btn ${form.job === i ? "active" : ""}`} onClick={() => set("job", i)}>
                        <div style={{ fontSize: 16, marginBottom: 3 }}>{i}</div>
                        <div style={{ whiteSpace: "pre-line" }}>{lbl}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Housing */}
                <div className="field">
                  <label>Housing</label>
                  <select value={form.housing} onChange={e => set("housing", e.target.value)}>
                    {["free", "own", "rent"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                {/* Purpose */}
                <div className="field">
                  <label>Loan Purpose</label>
                  <select value={form.purpose} onChange={e => set("purpose", e.target.value)}>
                    {["car (new)","car (used)","furniture/equipment","radio/TV","domestic appliances","repairs","education","vacation/others","retraining","business"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                {/* Saving accounts */}
                <div className="field">
                  <label>Saving Accounts</label>
                  <select value={form["Saving accounts"]} onChange={e => set("Saving accounts", e.target.value)}>
                    {["Unknown","little","moderate","quite rich","rich"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                {/* Checking account */}
                <div className="field">
                  <label>Checking Account</label>
                  <select value={form["Checking account"]} onChange={e => set("Checking account", e.target.value)}>
                    {["little","moderate","rich","no data"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                {/* Credit amount */}
                <div className="field">
                  <label>Loan Amount (DM)</label>
                  <input type="number" min={250} max={50000} step={50} value={form["Credit amount"]} onChange={e => set("Credit amount", e.target.value)} />
                </div>

                {/* Duration */}
                <div className="field">
                  <label>Duration (months)</label>
                  <input type="number" min={1} max={72} value={form.duration} onChange={e => set("duration", e.target.value)} />
                </div>

              </div>

              {error && (
                <div className="error-banner" style={{ marginTop: 20 }}>
                  <span>⚠</span><span>{error}</span>
                </div>
              )}

              <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner" />Analyzing…</> : "Analyze Credit Risk →"}
              </button>
            </div>
          </div>

          {/* ── RIGHT: Results ────────────────────────────────── */}
          <div className="results-panel">
            <div className="section-label">Risk Assessment</div>

            {/* Verdict card */}
            <div className={`verdict-card ${verdict || "idle"}`}>
              <div className="verdict-label">PREDICTION RESULT</div>
              <div className={`verdict-text ${verdict || "idle"}`}>
                {verdict ? verdict.toUpperCase() : "——"}
              </div>
              <div className="verdict-sub">
                {verdict ? `Credit risk classified as ${verdict}` : "Submit form to analyze"}
              </div>
              {result && (
                <div className="confidence-bar-wrap">
                  <div className="confidence-bar-label">
                    <span>Confidence</span>
                    <span style={{ color: verdict === "good" ? "var(--good)" : "var(--bad)", fontWeight: 600 }}>{confidence}%</span>
                  </div>
                  <div className="confidence-bar-track">
                    <div className={`confidence-bar-fill ${verdict}`} style={{ width: `${confidence}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Gauge */}
            <div className="chart-card">
              <div className="chart-title">Confidence Gauge</div>
              <div className="chart-sub">Model certainty for predicted class</div>
              <div className="gauge-wrap">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={gaugeData} cx="50%" cy="80%" startAngle={180} endAngle={0} innerRadius={55} outerRadius={75} dataKey="value" strokeWidth={0}>
                      {gaugeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="gauge-center" style={{ bottom: 16 }}>
                  <div className="gauge-pct" style={{ color: verdict === "good" ? "var(--good)" : verdict === "bad" ? "var(--bad)" : "var(--muted)" }}>
                    {result ? `${confidence}%` : "—"}
                  </div>
                  <div className="gauge-lbl">confidence</div>
                </div>
              </div>
            </div>

            {/* Probability breakdown */}
            <div className="chart-card">
              <div className="chart-title">Probability Breakdown</div>
              <div className="chart-sub">Scores for each class</div>

              {result ? (
                <div className="prob-bars">
                  {[
                    { label: "Good Credit", pct: goodPct, color: "#3fb950" },
                    { label: "Bad Credit",  pct: badPct,  color: "#f85149" },
                  ].map(({ label, pct, color }) => (
                    <div key={label} className="prob-row">
                      <div className="prob-row-header">
                        <div className="prob-name">
                          <div className="prob-dot" style={{ background: color }} />
                          {label}
                        </div>
                        <div className="prob-pct" style={{ color }}>{pct}%</div>
                      </div>
                      <div className="prob-track">
                        <div className="prob-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="idle-placeholder">
                  <div className="idle-icon">◎</div>
                  <div className="idle-text">Fill in applicant details<br />and click Analyze to see<br />probability scores</div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
