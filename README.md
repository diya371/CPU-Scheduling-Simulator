# CPU Scheduling Simulator (C++)

A command-line simulator that implements classic CPU scheduling algorithms:
- **First-Come First-Serve (FCFS)**
- **Shortest Job First (SJF)** — Non-preemptive
- **Round Robin (RR)** — Preemptive

---

## 🚀 Features
- Calculates:
  - Start Time (ST)
  - Completion Time (CT)
  - Turnaround Time (TAT)
  - Waiting Time (WT)
- Prints Gantt Chart timeline
- Supports variable CPU idle times
- Works for any number of processes
- Option to choose between scheduling algorithms

---

## 🧠 Algorithms Implemented
| Algorithm | Type | Description |
|------------|------|-------------|
| **FCFS** | Non-preemptive | Executes in order of arrival time |
| **SJF** | Non-preemptive | Chooses the shortest available burst time next |
| **RR** | Preemptive | Cyclic execution using a fixed time quantum |

---

## 🧩 Example Run

### Input
number of processes: 3
Arrival for Process 1: 0
Burst for Process 1: 5
Arrival for Process 2: 1
Burst for Process 2: 4
Arrival for Process 3: 2
Burst for Process 3: 2
Choose scheduling algorithm:

FCFS

SJF (non-preemptive)

Round Robin
Enter choice: 3
Enter time quantum: 2
### Output
PID AT BT ST CT TAT WT
1 0 5 0 11 11 6
2 1 4 2 10 9 5
3 2 2 4 6 4 2

Gantt Chart:
| P1 | P2 | P3 | P1 | P2 | P1 |
0 2 4 6 8 10 11

---

## 🧮 Metrics
Formulas used:
- **Turnaround Time (TAT)** = `Completion Time - Arrival Time`
- **Waiting Time (WT)** = `Turnaround Time - Burst Time`
- **Average WT / TAT** computed across all processes

---
## Author
Diya Hansaria
## ⚙️ How to Run
### Using g++
```bash
g++ -std=c++17 cpu_scheduler.cpp -o cpu_scheduler
./cpu_scheduler

