// ==========================================
// CPU SCHEDULING VISUALIZER
// Based on user's C++ algorithms
// ==========================================


const algorithmSelect = document.getElementById("algorithm");
const processCountInput = document.getElementById("process-count");
const quantumInput = document.getElementById("quantum");

const generateBtn = document.getElementById("generate-btn");
const runBtn = document.getElementById("run-btn");

const processTableBody =
    document.getElementById("process-table-body");

const resultTableBody =
    document.getElementById("result-table-body");

const ganttChart =
    document.getElementById("gantt-chart");

const algorithmTag =
    document.getElementById("algorithm-tag");

const avgWT =
    document.getElementById("avg-wt");

const avgTAT =
    document.getElementById("avg-tat");

const idleTimeElement =
    document.getElementById("idle-time");

const cpuUtilizationElement =
    document.getElementById("cpu-utilization");

const quantumGroup =
    document.getElementById("quantum-group");


// ==========================================
// INITIALIZE
// ==========================================

generateProcesses();


// ==========================================
// GENERATE PROCESS INPUT TABLE
// ==========================================

generateBtn.addEventListener("click", generateProcesses);


function generateProcesses() {

    const n = parseInt(processCountInput.value);

    if (!n || n < 1 || n > 10) {
        alert("Number of processes must be between 1 and 10.");
        return;
    }

    processTableBody.innerHTML = "";

    for (let i = 0; i < n; i++) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="process-name">
                P${i + 1}
            </td>

            <td>
                <input
                    type="number"
                    class="arrival-input"
                    value="${i}"
                    min="0"
                >
            </td>

            <td>
                <input
                    type="number"
                    class="burst-input"
                    value="${5 - (i % 3)}"
                    min="1"
                >
            </td>

            <td>
                <input
                    type="number"
                    class="priority-input"
                    value="${i + 1}"
                    min="1"
                >
            </td>
        `;

        processTableBody.appendChild(row);
    }

    updateInputVisibility();
}


// ==========================================
// ALGORITHM CHANGE
// ==========================================

algorithmSelect.addEventListener(
    "change",
    updateInputVisibility
);


function updateInputVisibility() {

    const algorithm =
        algorithmSelect.value;

    // Time quantum only for RR

    if (algorithm === "RR") {
        quantumGroup.style.display = "flex";
    } else {
        quantumGroup.style.display = "none";
    }

    // Priority column

    const priorityHeading =
        document.getElementById("priority-heading");

    const resultPriorityHeading =
        document.getElementById(
            "result-priority-heading"
        );

    if (algorithm === "PRIORITY") {

        priorityHeading.style.display = "";
        resultPriorityHeading.style.display = "";

    } else {

        priorityHeading.style.display = "";
        resultPriorityHeading.style.display = "";
    }
}


// ==========================================
// RUN ALGORITHM
// ==========================================

runBtn.addEventListener("click", runAlgorithm);


function runAlgorithm() {

    const processes =
        getProcessesFromTable();

    if (processes.length === 0) {
        alert("Please enter process information.");
        return;
    }

    const algorithm =
        algorithmSelect.value;

    let result;

    if (algorithm === "SJF") {

        result = sjf(processes);

    } else if (algorithm === "SRTF") {

        result = srtf(processes);

    } else if (algorithm === "PRIORITY") {

        result = priorityScheduling(processes);

    } else if (algorithm === "RR") {

        const quantum =
            parseInt(quantumInput.value);

        if (!quantum || quantum <= 0) {
            alert("Please enter a valid time quantum.");
            return;
        }

        result = roundRobin(
            processes,
            quantum
        );
    }

    displayResults(result);
}


// ==========================================
// READ INPUT TABLE
// ==========================================

function getProcessesFromTable() {

    const arrivalInputs =
        document.querySelectorAll(".arrival-input");

    const burstInputs =
        document.querySelectorAll(".burst-input");

    const priorityInputs =
        document.querySelectorAll(".priority-input");

    const processes = [];

    for (let i = 0; i < arrivalInputs.length; i++) {

        const arrival =
            parseInt(arrivalInputs[i].value);

        const burst =
            parseInt(burstInputs[i].value);

        const priority =
            parseInt(priorityInputs[i].value);

        if (
            isNaN(arrival) ||
            isNaN(burst) ||
            burst <= 0
        ) {
            alert(
                `Invalid input for P${i + 1}`
            );

            return [];
        }

        processes.push({

            pid: i + 1,

            AT: arrival,

            BT: burst,

            BT1: burst,

            Priority:
                isNaN(priority)
                    ? 0
                    : priority
        });
    }

    return processes;
}


// ==========================================
// SJF
// ==========================================

function sjf(processes) {

    const p =
        processes.map(process => ({
            ...process,
            completed: false
        }));

    let currentTime = 0;

    let completedCount = 0;

    const gantt = [];

    let idleTime = 0;


    while (completedCount < p.length) {

        let workingProcess = -1;

        let minBurst = Infinity;


        // Find shortest burst time

        for (let i = 0; i < p.length; i++) {

            if (
                !p[i].completed &&
                p[i].AT <= currentTime
            ) {

                if (
                    p[i].BT < minBurst
                ) {

                    minBurst = p[i].BT;

                    workingProcess = i;
                }
            }
        }


        // No process has arrived

        if (workingProcess === -1) {

            currentTime++;

            idleTime++;

            continue;
        }


        // Execute completely

        const start =
            currentTime;

        currentTime +=
            p[workingProcess].BT;

        const end =
            currentTime;


        gantt.push({

            pid:
                p[workingProcess].pid,

            start: start,

            end: end
        });


        // Completion Time

        p[workingProcess].CT =
            currentTime;


        // Turnaround Time

        p[workingProcess].TAT =
            p[workingProcess].CT -
            p[workingProcess].AT;


        // Waiting Time

        p[workingProcess].WT =
            p[workingProcess].TAT -
            p[workingProcess].BT1;


        p[workingProcess].completed =
            true;

        completedCount++;
    }


    return {
        processes: p,
        gantt: gantt,
        idleTime: idleTime
    };
}


// ==========================================
// SRTF
// ==========================================

function srtf(processes) {

    const p =
        processes.map(process => ({
            ...process,

            RT: process.BT
        }));


    let currentTime = 0;

    let completed = 0;

    let idleTime = 0;

    const gantt = [];

    let previousProcess = null;

    let segmentStart = 0;


    while (completed < p.length) {

        let workingProcess = -1;

        let minRemaining = Infinity;


        // Find shortest remaining time

        for (let i = 0; i < p.length; i++) {

            if (
                p[i].AT <= currentTime &&
                p[i].RT > 0
            ) {

                if (
                    p[i].RT <
                    minRemaining
                ) {

                    minRemaining =
                        p[i].RT;

                    workingProcess = i;
                }
            }
        }


        // CPU idle

        if (workingProcess === -1) {

            if (previousProcess !== null) {

                gantt.push({

                    pid: previousProcess,

                    start: segmentStart,

                    end: currentTime
                });

                previousProcess = null;
            }

            currentTime++;

            idleTime++;

            continue;
        }


        const currentPid =
            p[workingProcess].pid;


        // Start new Gantt block

        if (
            previousProcess !==
            currentPid
        ) {

            if (
                previousProcess !== null
            ) {

                gantt.push({

                    pid: previousProcess,

                    start: segmentStart,

                    end: currentTime
                });
            }

            previousProcess =
                currentPid;

            segmentStart =
                currentTime;
        }


        // Execute 1 unit

        p[workingProcess].RT--;

        currentTime++;


        // Process completed

        if (
            p[workingProcess].RT === 0
        ) {

            p[workingProcess].CT =
                currentTime;

            p[workingProcess].TAT =
                p[workingProcess].CT -
                p[workingProcess].AT;

            p[workingProcess].WT =
                p[workingProcess].TAT -
                p[workingProcess].BT1;

            completed++;
        }
    }


    // Last Gantt block

    if (previousProcess !== null) {

        gantt.push({

            pid: previousProcess,

            start: segmentStart,

            end: currentTime
        });
    }


    return {

        processes: p,

        gantt: gantt,

        idleTime: idleTime
    };
}


// ==========================================
// PRIORITY SCHEDULING
// ==========================================

function priorityScheduling(processes) {

    const p =
        processes.map(process => ({
            ...process,

            completed: false
        }));


    let currentTime = 0;

    let completedCount = 0;

    let idleTime = 0;

    const gantt = [];


    while (
        completedCount <
        p.length
    ) {

        let workingProcess = -1;


        // Find highest priority
        // Smaller priority number = higher priority

        for (
            let i = 0;
            i < p.length;
            i++
        ) {

            if (
                !p[i].completed &&
                p[i].AT <= currentTime
            ) {

                if (
                    workingProcess === -1 ||
                    p[i].Priority <
                    p[workingProcess].Priority
                ) {

                    workingProcess = i;
                }
            }
        }


        // No process arrived

        if (workingProcess === -1) {

            currentTime++;

            idleTime++;

            continue;
        }


        // Execute completely

        const start =
            currentTime;

        currentTime +=
            p[workingProcess].BT;

        const end =
            currentTime;


        gantt.push({

            pid:
                p[workingProcess].pid,

            start: start,

            end: end
        });


        // CT

        p[workingProcess].CT =
            currentTime;


        // TAT

        p[workingProcess].TAT =
            p[workingProcess].CT -
            p[workingProcess].AT;


        // WT

        p[workingProcess].WT =
            p[workingProcess].TAT -
            p[workingProcess].BT1;


        p[workingProcess].completed =
            true;

        completedCount++;
    }


    return {

        processes: p,

        gantt: gantt,

        idleTime: idleTime
    };
}


// ==========================================
// ROUND ROBIN
// ==========================================

function roundRobin(
    processes,
    timeQuantum
) {

    const p =
        processes.map(process => ({
            ...process
        }));


    const queue = [];

    const queueInsert =
        new Array(p.length).fill(false);


    let currentTime = 0;

    const gantt = [];

    let idleTime = 0;


    // ======================================
    // Same logic as your C++ code
    // Insert processes according to AT
    // ======================================

    for (let i = 0; i < p.length; i++) {

        let minArrival =
            Infinity;

        let workingMinProcess =
            -1;


        for (
            let j = 0;
            j < p.length;
            j++
        ) {

            if (
                p[j].AT < minArrival &&
                queueInsert[j] === false
            ) {

                minArrival =
                    p[j].AT;

                workingMinProcess =
                    j;
            }
        }


        if (
            workingMinProcess !== -1
        ) {

            queueInsert[
                workingMinProcess
            ] = true;

            queue.push(
                workingMinProcess
            );
        }
    }


    // ======================================
    // Round Robin Execution
    // ======================================

    while (queue.length > 0) {

        const workingProcess =
            queue.shift();


        // Execute quantum

        if (
            p[workingProcess].BT >=
            timeQuantum
        ) {

            const start =
                currentTime;

            currentTime +=
                timeQuantum;

            const end =
                currentTime;


            gantt.push({

                pid:
                    p[workingProcess].pid,

                start: start,

                end: end
            });


            p[workingProcess].BT -=
                timeQuantum;


            if (
                p[workingProcess].BT > 0
            ) {

                queue.push(
                    workingProcess
                );

            } else {

                p[workingProcess].CT =
                    currentTime;

                p[workingProcess].TAT =
                    p[workingProcess].CT -
                    p[workingProcess].AT;

                p[workingProcess].WT =
                    p[workingProcess].TAT -
                    p[workingProcess].BT1;
            }

        } else {

            // Remaining burst time

            const start =
                currentTime;

            currentTime +=
                p[workingProcess].BT;

            const end =
                currentTime;


            gantt.push({

                pid:
                    p[workingProcess].pid,

                start: start,

                end: end
            });


            p[workingProcess].BT = 0;


            p[workingProcess].CT =
                currentTime;

            p[workingProcess].TAT =
                p[workingProcess].CT -
                p[workingProcess].AT;

            p[workingProcess].WT =
                p[workingProcess].TAT -
                p[workingProcess].BT1;
        }
    }


    return {

        processes: p,

        gantt: gantt,

        idleTime: idleTime
    };
}


// ==========================================
// DISPLAY RESULTS
// ==========================================

function displayResults(result) {

    const processes =
        result.processes;


    // ======================================
    // GANTT CHART
    // ======================================

    ganttChart.innerHTML = "";

    result.gantt.forEach(
        (block, index) => {

            const div =
                document.createElement("div");

            div.className =
                "gantt-block";

            div.style.flex =
                `${block.end - block.start}`;

            div.innerHTML = `

                <strong>
                    P${block.pid}
                </strong>

                <span>
                    ${block.start} – ${block.end}
                </span>

            `;

            ganttChart.appendChild(div);
        }
    );


    // ======================================
    // RESULT TABLE
    // ======================================

    resultTableBody.innerHTML = "";


    processes.forEach(process => {

        const row =
            document.createElement("tr");


        const priorityCell =
            algorithmSelect.value === "PRIORITY"

                ? `<td>${process.Priority}</td>`

                : `<td>-</td>`;


        row.innerHTML = `

            <td class="process-name">
                P${process.pid}
            </td>

            <td>
                ${process.AT}
            </td>

            <td>
                ${process.BT1}
            </td>

            ${priorityCell}

            <td>
                ${process.CT}
            </td>

            <td>
                ${process.TAT}
            </td>

            <td>
                ${process.WT}
            </td>
        `;


        resultTableBody.appendChild(row);
    });


    // ======================================
    // AVERAGES
    // ======================================

    let totalWT = 0;

    let totalTAT = 0;


    processes.forEach(process => {

        totalWT += process.WT;

        totalTAT += process.TAT;
    });


    const averageWT =
        totalWT / processes.length;

    const averageTAT =
        totalTAT / processes.length;


    avgWT.textContent =
        averageWT.toFixed(2);

    avgTAT.textContent =
        averageTAT.toFixed(2);


    // ======================================
    // IDLE TIME
    // ======================================

    idleTimeElement.textContent =
        result.idleTime;


    // ======================================
    // CPU UTILIZATION
    // ======================================

    const lastCompletion =
        Math.max(
            ...processes.map(
                process => process.CT
            )
        );


    const utilization =
        lastCompletion > 0

            ? (
                (
                    lastCompletion -
                    result.idleTime
                )
                /
                lastCompletion
            ) * 100

            : 0;


    cpuUtilizationElement.textContent =
        utilization.toFixed(2) + "%";


    // ======================================
    // ALGORITHM NAME
    // ======================================

    algorithmTag.textContent =
        algorithmSelect.options[
            algorithmSelect.selectedIndex
        ].text;
}


//mobile menu
const mobileMenu = document.querySelector(".mobile-menu");
const navLinks = document.querySelector(".nav-links");

mobileMenu.addEventListener("click", () => {
    navLinks.classList.toggle("show");
});