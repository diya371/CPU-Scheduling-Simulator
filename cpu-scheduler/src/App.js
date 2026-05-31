import { useState } from 'react';
import { runFCFS, runSJF, runRR, averages } from './scheduler';
import './index.css';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316'];
const pid_color = (pid) => COLORS[(pid - 1) % COLORS.length];

const s = {
  header: { textAlign: 'center', marginBottom: '3rem' },
  logo: { fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '1rem' },
  title: { fontFamily: 'var(--mono)', fontSize: 'clamp(1.6rem, 5vw, 2.6rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: '0.5rem' },
  subtitle: { color: 'var(--text2)', fontSize: '0.95rem' },
  card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' },
  cardTitle: { fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: '0.18em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '1.25rem' },
  row: { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' },
  label: { fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: '4px' },
  input: { background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '6px', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '0.9rem', padding: '8px 12px', width: '80px', outline: 'none' },
  pidBadge: (pid) => ({ background: pid_color(pid) + '22', border: `1px solid ${pid_color(pid)}55`, borderRadius: '6px', padding: '6px 12px', fontFamily: 'var(--mono)', fontSize: '0.85rem', color: pid_color(pid), minWidth: '42px', textAlign: 'center', fontWeight: 700 }),
  addBtn: { background: 'transparent', border: '1px dashed var(--border2)', borderRadius: '8px', color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: '0.8rem', padding: '10px 20px', cursor: 'pointer', width: '100%', marginTop: '4px', letterSpacing: '0.1em' },
  removeBtn: { background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '1.1rem', padding: '4px 8px', lineHeight: 1 },
  algoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1rem' },
  algoBtn: (active) => ({ background: active ? 'var(--accent)' : 'var(--bg3)', border: `1px solid ${active ? 'var(--accent)' : 'var(--border2)'}`, borderRadius: '8px', color: active ? '#fff' : 'var(--text2)', fontFamily: 'var(--mono)', fontSize: '0.8rem', padding: '12px 8px', cursor: 'pointer', letterSpacing: '0.05em', transition: 'all 0.15s' }),
  runBtn: { background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#fff', fontFamily: 'var(--mono)', fontSize: '0.9rem', fontWeight: 700, padding: '14px 32px', cursor: 'pointer', width: '100%', letterSpacing: '0.08em', transition: 'background 0.15s' },
  quantumRow: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '1rem' },
  sectionTitle: { fontFamily: 'var(--mono)', fontSize: '0.7rem', letterSpacing: '0.18em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '1rem' },
  ganttWrap: { overflowX: 'auto', paddingBottom: '8px' },
  ganttRow: { display: 'flex', alignItems: 'stretch', minWidth: 'max-content', height: '44px' },
  ganttBlock: (pid, width) => ({ width: `${width}px`, minWidth: '28px', background: pid_color(pid) + '33', borderLeft: `2px solid ${pid_color(pid)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '0.75rem', color: pid_color(pid), fontWeight: 700, flexShrink: 0 }),
  ganttTime: (x) => ({ position: 'absolute', left: `${x}px`, fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)', transform: 'translateX(-50%)' }),
  table: { width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: '0.82rem' },
  th: { color: 'var(--text3)', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--border)' },
  td: (hi) => ({ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid var(--border)', color: hi ? 'var(--accent)' : 'var(--text)', fontWeight: hi ? 700 : 400 }),
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  statCard: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' },
  statLabel: { fontFamily: 'var(--mono)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '8px' },
  statValue: { fontFamily: 'var(--mono)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)' },
  error: { color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: '0.8rem', marginTop: '8px' },
};

const SCALE = 28;

function GanttChart({ timeline }) {
  const totalTime = timeline[timeline.length - 1].end;
  const times = [...new Set(timeline.map(b => b.start).concat([totalTime]))];
  return (
    <div style={s.ganttWrap}>
      <div style={s.ganttRow}>
        {timeline.map((b, i) => (
          <div key={i} style={s.ganttBlock(b.pid, (b.end - b.start) * SCALE)}>P{b.pid}</div>
        ))}
      </div>
      <div style={{ position: 'relative', height: '20px', minWidth: `${totalTime * SCALE}px`, marginTop: '4px' }}>
        {times.map(t => <span key={t} style={s.ganttTime(t * SCALE)}>{t}</span>)}
      </div>
    </div>
  );
}

function ResultsTable({ procs }) {
  return (
    <table style={s.table}>
      <thead>
        <tr>{['PID','Arrival','Burst','Start','Finish','TAT','WT'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {[...procs].sort((a,b) => a.pid - b.pid).map(p => (
          <tr key={p.pid}>
            <td style={{ ...s.td(false), color: pid_color(p.pid), fontWeight: 700 }}>P{p.pid}</td>
            <td style={s.td(false)}>{p.arrival}</td>
            <td style={s.td(false)}>{p.burst}</td>
            <td style={s.td(false)}>{p.start}</td>
            <td style={s.td(false)}>{p.finish}</td>
            <td style={s.td(true)}>{p.turnaround}</td>
            <td style={s.td(true)}>{p.waiting}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function App() {
  const [processes, setProcesses] = useState([
    { pid: 1, arrival: 0, burst: 5 },
    { pid: 2, arrival: 1, burst: 3 },
    { pid: 3, arrival: 2, burst: 4 },
  ]);
  const [algo, setAlgo] = useState('FCFS');
  const [quantum, setQuantum] = useState(2);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const updateProcess = (idx, field, val) => {
    setProcesses(processes.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };

  const addProcess = () => {
    if (processes.length >= 8) return;
    setProcesses([...processes, { pid: processes.length + 1, arrival: 0, burst: 1 }]);
  };

  const removeProcess = (idx) => {
    setProcesses(processes.filter((_, i) => i !== idx).map((p, i) => ({ ...p, pid: i + 1 })));
  };

  const validate = () => {
    for (const p of processes) {
      if (isNaN(p.arrival) || p.arrival < 0) return `P${p.pid}: arrival must be >= 0`;
      if (isNaN(p.burst) || p.burst <= 0) return `P${p.pid}: burst must be > 0`;
    }
    if (algo === 'RR' && (isNaN(quantum) || quantum <= 0)) return 'Quantum must be > 0';
    return '';
  };

  const run = () => {
    const err = validate();
    if (err) { setError(err); setResult(null); return; }
    setError('');
    const input = processes.map(p => ({ ...p, arrival: Number(p.arrival), burst: Number(p.burst) }));
    let res;
    if (algo === 'FCFS') res = runFCFS(input);
    else if (algo === 'SJF') res = runSJF(input);
    else res = runRR(input, Number(quantum));
    setResult({ ...res, algo, avgStats: averages(res.procs) });
  };

  return (
    <div>
      <div style={s.header}>
        <div style={s.logo}>CPU · Scheduling · Simulator</div>
        <div style={s.title}>Process Scheduler</div>
        <div style={s.subtitle}>FCFS &nbsp;·&nbsp; SJF &nbsp;·&nbsp; Round Robin</div>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>// processes</div>
        {processes.map((p, i) => (
          <div key={p.pid} style={s.row}>
            <div style={s.pidBadge(p.pid)}>P{p.pid}</div>
            <div>
              <div style={s.label}>ARRIVAL</div>
              <input style={s.input} type="number" min="0" value={p.arrival} onChange={e => updateProcess(i, 'arrival', e.target.value)} />
            </div>
            <div>
              <div style={s.label}>BURST</div>
              <input style={s.input} type="number" min="1" value={p.burst} onChange={e => updateProcess(i, 'burst', e.target.value)} />
            </div>
            {processes.length > 1 && (
              <button style={{ ...s.removeBtn, marginTop: '18px' }} onClick={() => removeProcess(i)}>x</button>
            )}
          </div>
        ))}
        {processes.length < 8 && (
          <button style={s.addBtn} onClick={addProcess}>+ add process</button>
        )}
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>// algorithm</div>
        <div style={s.algoGrid}>
          {[['FCFS','FCFS','first come first serve'],['SJF','SJF','shortest job first'],['RR','Round Robin','preemptive · time quantum']].map(([key, label, desc]) => (
            <button key={key} style={s.algoBtn(algo === key)} onClick={() => setAlgo(key)}>
              {label}
              <div style={{ fontSize: '0.62rem', color: algo === key ? 'rgba(255,255,255,0.7)' : 'var(--text3)', marginTop: '3px', letterSpacing: 0 }}>{desc}</div>
            </button>
          ))}
        </div>
        {algo === 'RR' && (
          <div style={s.quantumRow}>
            <div style={s.label}>TIME QUANTUM</div>
            <input style={s.input} type="number" min="1" value={quantum} onChange={e => setQuantum(e.target.value)} />
          </div>
        )}
        {error && <div style={s.error}>! {error}</div>}
        <button style={{ ...s.runBtn, marginTop: '1.25rem' }} onClick={run}>RUN SIMULATION</button>
      </div>

      {result && (
        <div>
          <div style={s.card}>
            <div style={s.sectionTitle}>// gantt chart — {result.algo}{result.algo === 'RR' ? ` [q=${quantum}]` : ''}</div>
            <GanttChart timeline={result.timeline} />
          </div>
          <div style={s.card}>
            <div style={s.sectionTitle}>// process table</div>
            <ResultsTable procs={result.procs} />
          </div>
          <div style={s.card}>
            <div style={s.sectionTitle}>// averages</div>
            <div style={s.statGrid}>
              <div style={s.statCard}>
                <div style={s.statLabel}>Avg Turnaround Time</div>
                <div style={s.statValue}>{result.avgStats.avgTAT}</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statLabel}>Avg Waiting Time</div>
                <div style={{ ...s.statValue, color: 'var(--green)' }}>{result.avgStats.avgWT}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text3)', marginTop: '2rem', letterSpacing: '0.1em' }}>
        BUILT WITH C++ LOGIC · DEPLOYED ON VERCEL
      </div>
    </div>
  );
}
