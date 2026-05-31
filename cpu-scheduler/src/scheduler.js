export function runFCFS(processes) {
  const procs = processes
    .map(p => ({ ...p }))
    .sort((a, b) => a.arrival !== b.arrival ? a.arrival - b.arrival : a.pid - b.pid);

  let currentTime = 0;
  const timeline = [];

  for (const p of procs) {
    if (currentTime < p.arrival) currentTime = p.arrival;
    p.start = currentTime;
    p.finish = p.start + p.burst;
    p.turnaround = p.finish - p.arrival;
    p.waiting = p.turnaround - p.burst;
    timeline.push({ start: p.start, end: p.finish, pid: p.pid });
    currentTime = p.finish;
  }

  return { procs, timeline };
}

export function runSJF(processes) {
  const procs = processes
    .map(p => ({ ...p }))
    .sort((a, b) => a.arrival !== b.arrival ? a.arrival - b.arrival : a.pid - b.pid);

  let currentTime = 0;
  let i = 0;
  const ready = [];
  const done = [];
  const timeline = [];

  while (i < procs.length || ready.length > 0) {
    while (i < procs.length && procs[i].arrival <= currentTime) {
      ready.push(procs[i++]);
    }

    if (ready.length === 0) {
      currentTime = procs[i].arrival;
      continue;
    }

    ready.sort((a, b) => a.burst !== b.burst ? a.burst - b.burst : a.pid - b.pid);
    const p = ready.shift();
    p.start = currentTime;
    p.finish = p.start + p.burst;
    p.turnaround = p.finish - p.arrival;
    p.waiting = p.turnaround - p.burst;
    timeline.push({ start: p.start, end: p.finish, pid: p.pid });
    currentTime = p.finish;
    done.push(p);
  }

  return { procs: done, timeline };
}

export function runRR(processes, quantum) {
  const procs = processes
    .map(p => ({ ...p }))
    .sort((a, b) => a.arrival !== b.arrival ? a.arrival - b.arrival : a.pid - b.pid);

  const remaining = procs.map(p => p.burst);
  const started = procs.map(() => false);
  const queue = [];
  const timeline = [];
  let currentTime = 0;
  let completed = 0;
  let i = 0;

  if (procs.length > 0 && procs[0].arrival <= currentTime) {
    queue.push(0);
    i = 1;
  } else if (procs.length > 0) {
    currentTime = procs[0].arrival;
    queue.push(0);
    i = 1;
  }

  while (completed < procs.length) {
    if (queue.length === 0) {
      if (i < procs.length) {
        currentTime = procs[i].arrival;
        queue.push(i++);
      }
      continue;
    }

    const idx = queue.shift();

    if (!started[idx]) {
      procs[idx].start = currentTime;
      started[idx] = true;
    }

    const execTime = Math.min(quantum, remaining[idx]);
    timeline.push({ start: currentTime, end: currentTime + execTime, pid: procs[idx].pid });
    currentTime += execTime;
    remaining[idx] -= execTime;

    while (i < procs.length && procs[i].arrival <= currentTime) {
      queue.push(i++);
    }

    if (remaining[idx] > 0) {
      queue.push(idx);
    } else {
      completed++;
      procs[idx].finish = currentTime;
      procs[idx].turnaround = procs[idx].finish - procs[idx].arrival;
      procs[idx].waiting = procs[idx].turnaround - procs[idx].burst;
    }
  }

  return { procs, timeline };
}

export function averages(procs) {
  const n = procs.length;
  const avgTAT = procs.reduce((s, p) => s + p.turnaround, 0) / n;
  const avgWT = procs.reduce((s, p) => s + p.waiting, 0) / n;
  return { avgTAT: avgTAT.toFixed(2), avgWT: avgWT.toFixed(2) };
}
