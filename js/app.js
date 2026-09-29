// ==========================================
// CPU SCHEDULING VISUALIZER
// ==========================================


// ==========================================
// DOM ELEMENTS
// ==========================================

const algorithmSelect =
    document.getElementById("algorithm");

const processCountInput =
    document.getElementById("process-count");

const quantumInput =
    document.getElementById("quantum");

const generateBtn =
    document.getElementById("generate-btn");

const runBtn =
    document.getElementById("run-btn");

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

generateBtn.addEventListener(
    "click",
    generateProcesses
);


function generateProcesses() {

    const n =
        parseInt(processCountInput.value);

    if (!n || n < 1 || n > 10) {

        alert(
            "Number of processes must be between 1 and 10."
        );

        return;
    }

    processTableBody.innerHTML = "";

    for (let i = 0; i < n; i++) {

        const row =
            document.createElement("tr");

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
        document.getElementById(
            "priority-heading"
        );

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

runBtn.addEventListener(
    "click",
    runAlgorithm
);


function runAlgorithm() {

    const processes =
        getProcessesFromTable();

    if (processes.length === 0) {

        alert(
            "Please enter process information."
        );

        return;
    }

    const algorithm =
        algorithmSelect.value;

    let result;


    // ======================================
    // FCFS
    // ======================================

    if (algorithm === "FCFS") {

        result =
            fcfs(processes);

    }

    // ======================================
    // SJF
    // ======================================

    else if (algorithm === "SJF") {

        result =
            sjf(processes);

    }

    // ======================================
    // SRTF
    // ======================================

    else if (algorithm === "SRTF") {

        result =
            srtf(processes);

    }

    // ======================================
    // PRIORITY
    // ======================================

    else if (algorithm === "PRIORITY") {

        result =
            priorityScheduling(processes);

    }

    // ======================================
    // ROUND ROBIN
    // ======================================

    else if (algorithm === "RR") {

        const quantum =
            parseInt(quantumInput.value);

        if (!quantum || quantum <= 0) {

            alert(
                "Please enter a valid time quantum."
            );

            return;
        }

        result =
            roundRobin(
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
        document.querySelectorAll(
            ".arrival-input"
        );

    const burstInputs =
        document.querySelectorAll(
            ".burst-input"
        );

    const priorityInputs =
        document.querySelectorAll(
            ".priority-input"
        );

    const processes = [];


    for (
        let i = 0;
        i < arrivalInputs.length;
        i++
    ) {

        const arrival =
            parseInt(
                arrivalInputs[i].value
            );

        const burst =
            parseInt(
                burstInputs[i].value
            );

        const priority =
            parseInt(
                priorityInputs[i].value
            );


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
// FCFS
// ==========================================

function fcfs(processes) {

    const p =
        processes.map(process => ({
            ...process,
            completed: false
        }));

    let currentTime = 0;

    let completedCount = 0;

    let idleTime = 0;

    const gantt = [];


    // FCFS:
    // First Come First Serve
    // Process with smaller Arrival Time executes first

    const sortedProcesses =
        [...p].sort(
            (a, b) =>
                a.AT - b.AT ||
                a.pid - b.pid
        );


    while (
        completedCount <
        sortedProcesses.length
    ) {

        const process =
            sortedProcesses[
                completedCount
            ];


        // ==================================
        // CPU IDLE
        // ==================================

        if (
            currentTime <
            process.AT
        ) {

            gantt.push({

                pid: "IDLE",

                start: currentTime,

                end: process.AT
            });


            idleTime +=
                process.AT -
                currentTime;


            currentTime =
                process.AT;
        }


        // ==================================
        // EXECUTE PROCESS
        // ==================================

        const start =
            currentTime;


        currentTime +=
            process.BT;


        const end =
            currentTime;


        gantt.push({

            pid:
                process.pid,

            start:
                start,

            end:
                end
        });


        // ==================================
        // COMPLETION TIME
        // ==================================

        process.CT =
            currentTime;


        // ==================================
        // TURNAROUND TIME
        // ==================================

        process.TAT =
            process.CT -
            process.AT;


        // ==================================
        // WAITING TIME
        // ==================================

        process.WT =
            process.TAT -
            process.BT1;


        process.completed =
            true;


        completedCount++;
    }


    // Keep result table in P1, P2, P3 order

    sortedProcesses.sort(
        (a, b) =>
            a.pid - b.pid
    );


    return {

        processes:
            sortedProcesses,

        gantt:
            gantt,

        idleTime:
            idleTime
    };
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


    while (
        completedCount < p.length
    ) {

        let workingProcess = -1;

        let minBurst = Infinity;


        // Find shortest burst among arrived processes

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
                    p[i].BT < minBurst
                ) {

                    minBurst =
                        p[i].BT;

                    workingProcess = i;
                }
            }
        }


        // ======================================
        // CPU IDLE
        // ======================================

        if (
            workingProcess === -1
        ) {

            let nextArrival =
                Infinity;


            for (
                let i = 0;
                i < p.length;
                i++
            ) {

                if (
                    !p[i].completed &&
                    p[i].AT > currentTime
                ) {

                    nextArrival =
                        Math.min(
                            nextArrival,
                            p[i].AT
                        );
                }
            }


            if (
                nextArrival !== Infinity
            ) {

                gantt.push({

                    pid: "IDLE",

                    start: currentTime,

                    end: nextArrival
                });


                idleTime +=
                    nextArrival -
                    currentTime;


                currentTime =
                    nextArrival;

            } else {

                currentTime++;

                idleTime++;
            }


            continue;
        }


        // ======================================
        // EXECUTE PROCESS
        // ======================================

        const start =
            currentTime;


        currentTime +=
            p[workingProcess].BT;


        const end =
            currentTime;


        gantt.push({

            pid:
                p[workingProcess].pid,

            start:
                start,

            end:
                end
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

        processes:
            p,

        gantt:
            gantt,

        idleTime:
            idleTime
    };
}


// ==========================================
// SRTF
// ==========================================

function srtf(processes) {

    const p =
        processes.map(process => ({

            ...process,

            RT:
                process.BT
        }));


    let currentTime = 0;

    let completed = 0;

    let idleTime = 0;

    const gantt = [];

    let previousProcess = null;

    let segmentStart = 0;


    while (
        completed < p.length
    ) {

        let workingProcess = -1;

        let minRemaining = Infinity;


        // Find shortest remaining time

        for (
            let i = 0;
            i < p.length;
            i++
        ) {

            if (
                p[i].AT <= currentTime &&
                p[i].RT > 0
            ) {

                if (
                    p[i].RT < minRemaining
                ) {

                    minRemaining =
                        p[i].RT;

                    workingProcess = i;
                }
            }
        }


        // ======================================
        // CPU IDLE
        // ======================================

        if (
            workingProcess === -1
        ) {

            // Close previous process block

            if (
                previousProcess !== null
            ) {

                gantt.push({

                    pid:
                        previousProcess,

                    start:
                        segmentStart,

                    end:
                        currentTime
                });


                previousProcess = null;
            }


            // Find next arrival

            let nextArrival =
                Infinity;


            for (
                let i = 0;
                i < p.length;
                i++
            ) {

                if (
                    p[i].RT > 0 &&
                    p[i].AT > currentTime
                ) {

                    nextArrival =
                        Math.min(
                            nextArrival,
                            p[i].AT
                        );
                }
            }


            if (
                nextArrival !== Infinity
            ) {

                gantt.push({

                    pid: "IDLE",

                    start:
                        currentTime,

                    end:
                        nextArrival
                });


                idleTime +=
                    nextArrival -
                    currentTime;


                currentTime =
                    nextArrival;

            } else {

                currentTime++;

                idleTime++;
            }


            continue;
        }


        const currentPid =
            p[workingProcess].pid;


        // ======================================
        // START NEW GANTT BLOCK
        // ======================================

        if (
            previousProcess !== currentPid
        ) {

            if (
                previousProcess !== null
            ) {

                gantt.push({

                    pid:
                        previousProcess,

                    start:
                        segmentStart,

                    end:
                        currentTime
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


        // ======================================
        // PROCESS COMPLETED
        // ======================================

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


    // ======================================
    // LAST GANTT BLOCK
    // ======================================

    if (
        previousProcess !== null
    ) {

        gantt.push({

            pid:
                previousProcess,

            start:
                segmentStart,

            end:
                currentTime
        });
    }


    return {

        processes:
            p,

        gantt:
            gantt,

        idleTime:
            idleTime
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
        completedCount < p.length
    ) {

        let workingProcess = -1;


        // Find highest priority
        // Smaller number = higher priority

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


        // ======================================
        // CPU IDLE
        // ======================================

        if (
            workingProcess === -1
        ) {

            let nextArrival =
                Infinity;


            for (
                let i = 0;
                i < p.length;
                i++
            ) {

                if (
                    !p[i].completed &&
                    p[i].AT > currentTime
                ) {

                    nextArrival =
                        Math.min(
                            nextArrival,
                            p[i].AT
                        );
                }
            }


            if (
                nextArrival !== Infinity
            ) {

                gantt.push({

                    pid: "IDLE",

                    start:
                        currentTime,

                    end:
                        nextArrival
                });


                idleTime +=
                    nextArrival -
                    currentTime;


                currentTime =
                    nextArrival;

            } else {

                currentTime++;

                idleTime++;
            }


            continue;
        }


        // ======================================
        // EXECUTE PROCESS
        // ======================================

        const start =
            currentTime;


        currentTime +=
            p[workingProcess].BT;


        const end =
            currentTime;


        gantt.push({

            pid:
                p[workingProcess].pid,

            start:
                start,

            end:
                end
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

        processes:
            p,

        gantt:
            gantt,

        idleTime:
            idleTime
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

            ...process,

            remainingTime:
                process.BT,

            completed: false
        }));


    const queue = [];

    const inQueue =
        new Array(p.length)
            .fill(false);


    let currentTime = 0;

    let completedCount = 0;

    let idleTime = 0;

    const gantt = [];


    // ======================================
    // SORT BY ARRIVAL TIME
    // ======================================

    const sortedIndexes =
        p.map(
            (process, index) =>
                index
        ).sort(
            (a, b) =>
                p[a].AT -
                p[b].AT ||
                a - b
        );


    let nextArrivalIndex = 0;


    // ======================================
    // MAIN LOOP
    // ======================================

    while (
        completedCount < p.length
    ) {


        // ==================================
        // ADD ARRIVED PROCESSES
        // ==================================

        while (
            nextArrivalIndex <
                sortedIndexes.length &&

            p[
                sortedIndexes[
                    nextArrivalIndex
                ]
            ].AT <= currentTime
        ) {

            const index =
                sortedIndexes[
                    nextArrivalIndex
                ];


            if (
                !inQueue[index] &&
                !p[index].completed
            ) {

                queue.push(index);

                inQueue[index] =
                    true;
            }


            nextArrivalIndex++;
        }


        // ==================================
        // CPU IDLE
        // ==================================

        if (
            queue.length === 0
        ) {

            if (
                nextArrivalIndex <
                sortedIndexes.length
            ) {

                const nextIndex =
                    sortedIndexes[
                        nextArrivalIndex
                    ];

                const nextArrivalTime =
                    p[nextIndex].AT;


                if (
                    currentTime <
                    nextArrivalTime
                ) {

                    gantt.push({

                        pid: "IDLE",

                        start:
                            currentTime,

                        end:
                            nextArrivalTime
                    });


                    idleTime +=
                        nextArrivalTime -
                        currentTime;


                    currentTime =
                        nextArrivalTime;
                }


                continue;
            }
        }


        // ==================================
        // TAKE PROCESS FROM QUEUE
        // ==================================

        const workingProcess =
            queue.shift();


        inQueue[workingProcess] =
            false;


        if (
            p[workingProcess].completed
        ) {

            continue;
        }


        const start =
            currentTime;


        // ==================================
        // EXECUTE FOR TIME QUANTUM
        // ==================================

        const executionTime =
            Math.min(
                timeQuantum,
                p[workingProcess]
                    .remainingTime
            );


        currentTime +=
            executionTime;


        const end =
            currentTime;


        // Add process Gantt block

        gantt.push({

            pid:
                p[workingProcess].pid,

            start:
                start,

            end:
                end
        });


        // Reduce remaining time

        p[workingProcess]
            .remainingTime -=
            executionTime;


        // ==================================
        // ADD NEWLY ARRIVED PROCESSES
        // ==================================

        while (
            nextArrivalIndex <
                sortedIndexes.length &&

            p[
                sortedIndexes[
                    nextArrivalIndex
                ]
            ].AT <= currentTime
        ) {

            const index =
                sortedIndexes[
                    nextArrivalIndex
                ];


            if (
                !inQueue[index] &&
                !p[index].completed &&
                index !== workingProcess
            ) {

                queue.push(index);

                inQueue[index] =
                    true;
            }


            nextArrivalIndex++;
        }


        // ==================================
        // PROCESS COMPLETED
        // ==================================

        if (
            p[workingProcess]
                .remainingTime === 0
        ) {

            p[workingProcess]
                .completed = true;


            p[workingProcess].CT =
                currentTime;


            p[workingProcess].TAT =
                p[workingProcess].CT -
                p[workingProcess].AT;


            p[workingProcess].WT =
                p[workingProcess].TAT -
                p[workingProcess].BT1;


            completedCount++;

        } else {

            // Put process at end of queue

            queue.push(
                workingProcess
            );

            inQueue[workingProcess] =
                true;
        }
    }


    return {

        processes:
            p,

        gantt:
            gantt,

        idleTime:
            idleTime
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
        (block) => {

            const div =
                document.createElement("div");


            // ==================================
            // IDLE BLOCK
            // ==================================

            if (
                block.pid === "IDLE"
            ) {

                div.className =
                    "gantt-block idle-block";

            } else {

                div.className =
                    "gantt-block";
            }


            // Width based on execution time

            div.style.flex =
                `${block.end - block.start}`;


            // ==================================
            // GANTT CONTENT
            // ==================================

            div.innerHTML = `

                <strong>
                    ${
                        block.pid === "IDLE"
                            ? "IDLE"
                            : `P${block.pid}`
                    }
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


    processes.forEach(
        process => {

            const row =
                document.createElement("tr");


            const priorityCell =
                algorithmSelect.value ===
                "PRIORITY"

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
        }
    );


    // ======================================
    // AVERAGE WT & TAT
    // ======================================

    let totalWT = 0;

    let totalTAT = 0;


    processes.forEach(
        process => {

            totalWT +=
                process.WT;

            totalTAT +=
                process.TAT;
        }
    );


    const averageWT =
        totalWT /
        processes.length;


    const averageTAT =
        totalTAT /
        processes.length;


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
                process =>
                    process.CT
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


// ==========================================
// MOBILE MENU
// ==========================================

const mobileMenu =
    document.querySelector(
        ".mobile-menu"
    );


const navLinks =
    document.querySelector(
        ".nav-links"
    );


if (
    mobileMenu &&
    navLinks
) {

    mobileMenu.addEventListener(
        "click",
        () => {

            navLinks.classList.toggle(
                "show"
            );
        }
    );
}