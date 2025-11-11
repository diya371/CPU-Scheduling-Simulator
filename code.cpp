#include <bits/stdc++.h>
using namespace std;

struct Process {
    int pid;
    int arrival;
    int burst;
    int start = 0;
    int finish = 0;
    int waiting = 0;
    int turnaround = 0;
    int priority = 0;
};
static bool cmp(const Process &a, const Process &b) {
    if (a.arrival == b.arrival) return a.pid < b.pid;
    return a.arrival < b.arrival;
}
vector<Process> read_processes(int n) {
    vector<Process> processes(n);
    for (int i = 0; i < n; ++i) {
        cout << "Arrival for Process " << i + 1 << ": ";
        cin >> processes[i].arrival;
        cout << "Burst for Process " << i + 1 << ": ";
        cin >> processes[i].burst;
        processes[i].pid = i + 1;
    }
    return processes;
}
vector<vector<int>> run_RR(vector<Process> &processes, int quantum) {
    sort(processes.begin(), processes.end(), cmp);
    queue<int> ready;
    vector<vector<int>> timeline;
    int current_time = 0, completed = 0, n = processes.size();
    vector<int> remaining(n);

    for (int i = 0; i < n; i++) remaining[i] = processes[i].burst;
    int i = 0;
    if (!processes.empty() && processes[0].arrival <= current_time) ready.push(0);
    else if (!processes.empty()) current_time = processes[0].arrival, ready.push(0), i++;

    while (completed < n) {
        if (ready.empty()) {
            if (i < n) {
                current_time = max(current_time, processes[i].arrival);
                ready.push(i++);
            }
            continue;
        }

        int idx = ready.front(); ready.pop();
        if (processes[idx].start == 0 && remaining[idx] == processes[idx].burst)
            processes[idx].start = current_time;

        int exec_time = min(quantum, remaining[idx]);
        timeline.push_back({current_time, current_time + exec_time, processes[idx].pid});
        current_time += exec_time;
        remaining[idx] -= exec_time;

        while (i < n && processes[i].arrival <= current_time) ready.push(i++);

        if (remaining[idx] > 0) ready.push(idx);
        else {
            completed++;
            processes[idx].finish = current_time;
            processes[idx].turnaround = processes[idx].finish - processes[idx].arrival;
            processes[idx].waiting = processes[idx].turnaround - processes[idx].burst;
        }
    }

    return timeline;
}

void print_processes(const vector<Process> &processes) {
    cout << "\nPID\tArrival\tBurst\n";
    for (size_t i = 0; i < processes.size(); ++i) {
        cout << processes[i].pid << '\t'
             << processes[i].arrival << '\t'
             << processes[i].burst << '\n';
    }
}


vector<vector<int>> run_FCFS(vector<Process> &processes) {
    sort(processes.begin(), processes.end(), cmp);
    int current_time = 0;
    vector<vector<int>> timeline;

    for (size_t i = 0; i < processes.size(); ++i) {
        if (current_time < processes[i].arrival) current_time = processes[i].arrival;
        processes[i].start = current_time;
        processes[i].finish = processes[i].start + processes[i].burst;
        processes[i].turnaround = processes[i].finish - processes[i].arrival;
        processes[i].waiting = processes[i].turnaround - processes[i].burst;
        timeline.push_back({processes[i].start, processes[i].finish, processes[i].pid});
        current_time = processes[i].finish;
    }
    return timeline;
}
void print_computed_processes(const vector<Process> &processes) {
    cout << "\nPID\tAT\tBT\tST\tCT\tTAT\tWT\n";
    for (const auto &p : processes) {
        cout << p.pid << '\t'
             << p.arrival << '\t'
             << p.burst << '\t'
             << p.start << '\t'
             << p.finish << '\t'
             << p.turnaround << '\t'
             << p.waiting << '\n';
    }
}
vector<vector<int>> run_SJF(vector<Process> &processes) {
    sort(processes.begin(), processes.end(), cmp);

    int current_time = 0;
    size_t i = 0;
    using T = pair<pair<int,int>, size_t>;
    priority_queue<T, vector<T>, greater<T>> minheap;
    vector<vector<int>> timeline;

    while (i < processes.size() || !minheap.empty()) {
        while (i < processes.size() && processes[i].arrival <= current_time) {
            minheap.push({{processes[i].burst, processes[i].pid}, i});
            ++i;
        }
        if (minheap.empty()) {
    
            current_time = processes[i].arrival;
            continue;
        }
        auto top = minheap.top(); minheap.pop();
        size_t idx = top.second;

        processes[idx].start = current_time;
        processes[idx].finish = processes[idx].start + processes[idx].burst;
        processes[idx].turnaround = processes[idx].finish - processes[idx].arrival;
        processes[idx].waiting = processes[idx].turnaround - processes[idx].burst;
        timeline.push_back({processes[idx].start, processes[idx].finish, processes[idx].pid});
        current_time = processes[idx].finish;
    }
    return timeline;
}

void print_gantt_chart(const vector<vector<int>> &timeline) {
    if (timeline.empty()) {
        cout << "\nGantt Chart: (empty)\n";
        return;
    }

    cout << "\nGantt Chart:\n|";
    for (size_t i = 0; i < timeline.size(); ++i) {
        int p = timeline[i][2];
        cout << " P" << p << " |";
    }
    cout << '\n';

    cout << timeline[0][0];
    for (size_t i = 0; i < timeline.size(); ++i) {
        int s = timeline[i][0];
        int f = timeline[i][1];
        int p = timeline[i][2];
        cout << string(4 + (int)to_string(p).length(), ' ');
        cout << f;
    }
    cout << '\n';
}

int main() {
    int n;
    cout << "number of processes: ";
    cin >> n;
    if (n <= 0) return 1;
    

    vector<Process> processes = read_processes(n);
    print_processes(processes);

    int choice;
    cout << "\nChoose scheduling algorithm:\n1. FCFS\n2. SJF (non-preemptive)\nEnter choice: ";
    cin >> choice;

    vector<vector<int>> timeline;
    if (choice == 1) timeline = run_FCFS(processes);
    else if (choice == 2) timeline = run_SJF(processes);
    else if (choice == 3) {
        int quantum;
        cout << "Enter time quantum: ";
        cin >> quantum;
        timeline = run_RR(processes, quantum);
    }
    else {
        cout << "Invalid choice \n";
        timeline = run_FCFS(processes);
    }


    print_computed_processes(processes);
    print_gantt_chart(timeline);

    
}
