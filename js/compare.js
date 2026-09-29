// ==========================================
// COMPARISON MODULE
// ==========================================


// ==========================================
// GET ELEMENTS
// ==========================================

const compareBtn =
    document.getElementById("compare-btn");

const comparisonTableBody =
    document.getElementById(
        "comparison-table-body"
    );


// ==========================================
// COMPARE BUTTON
// ==========================================

compareBtn.addEventListener(
    "click",
    compareAlgorithms
);


// ==========================================
// MAIN COMPARISON FUNCTION
// ==========================================

function compareAlgorithms() {

    // ======================================
    // GET SELECTED ALGORITHMS
    // ======================================

    const selectedAlgorithms =
        Array.from(
            document.querySelectorAll(
                '.checkbox-grid input[type="checkbox"]:checked'
            )
        ).map(
            checkbox => checkbox.value
        );


    // ======================================
    // AT LEAST TWO ALGORITHMS
    // ======================================

    if (
        selectedAlgorithms.length < 2
    ) {

        alert(
            "Please select at least two algorithms."
        );

        return;
    }


    // ======================================
    // GET PROCESS INPUT
    // ======================================

    const processes =
        getProcessesFromTable();


    if (
        !processes ||
        processes.length === 0
    ) {

        alert(
            "Please enter valid process information."
        );

        return;
    }


    // ======================================
    // GET TIME QUANTUM
    // ======================================

    const quantum =
        parseInt(
            quantumInput.value
        );


    // ======================================
    // ROUND ROBIN VALIDATION
    // ======================================

    if (
        selectedAlgorithms.includes("RR") &&
        (!quantum || quantum <= 0)
    ) {

        alert(
            "Please enter a valid Time Quantum for Round Robin."
        );

        return;
    }


    // ======================================
    // STORE RESULTS
    // ======================================

    const results = [];


    // ======================================
    // RUN SELECTED ALGORITHMS
    // ======================================

    selectedAlgorithms.forEach(
        algorithm => {

            let result = null;


            // ==================================
            // FCFS
            // ==================================

            if (
                algorithm === "FCFS"
            ) {

                result =
                    fcfs(
                        cloneProcesses(processes)
                    );

            }


            // ==================================
            // SJF
            // ==================================

            else if (
                algorithm === "SJF"
            ) {

                result =
                    sjf(
                        cloneProcesses(processes)
                    );

            }


            // ==================================
            // SRTF
            // ==================================

            else if (
                algorithm === "SRTF"
            ) {

                result =
                    srtf(
                        cloneProcesses(processes)
                    );

            }


            // ==================================
            // PRIORITY
            // ==================================

            else if (
                algorithm === "PRIORITY"
            ) {

                result =
                    priorityScheduling(
                        cloneProcesses(processes)
                    );

            }


            // ==================================
            // ROUND ROBIN
            // ==================================

            else if (
                algorithm === "RR"
            ) {

                result =
                    roundRobin(
                        cloneProcesses(processes),
                        quantum
                    );

            }


            // ==================================
            // STORE RESULT
            // ==================================

            if (result) {

                results.push({

                    algorithm:
                        algorithm,

                    result:
                        result

                });

            }

        }
    );


    // ======================================
    // CHECK RESULTS
    // ======================================

    if (
        results.length < 2
    ) {

        alert(
            "Unable to generate comparison results."
        );

        return;
    }


    // ======================================
    // DISPLAY COMPARISON TABLE
    // ======================================

    displayComparisonTable(
        results
    );


    // ======================================
    // DISPLAY GANTT CHARTS
    // ======================================

    displayComparisonGantt(
        results
    );

}


// ==========================================
// CLONE PROCESS DATA
// ==========================================

function cloneProcesses(
    processes
) {

    return processes.map(
        process => ({
            ...process
        })
    );

}


// ==========================================
// ALGORITHM DISPLAY NAME
// ==========================================

function getComparisonName(
    algorithm
) {

    switch (algorithm) {

        case "FCFS":

            return "FCFS";


        case "SJF":

            return "SJF";


        case "SRTF":

            return "SRTF";


        case "PRIORITY":

            return "Priority Scheduling";


        case "RR":

            return "Round Robin";


        default:

            return algorithm;

    }

}


// ==========================================
// DISPLAY COMPARISON TABLE
// ==========================================

function displayComparisonTable(
    results
) {

    // Clear old rows

    comparisonTableBody.innerHTML =
        "";


    // ======================================
    // CREATE ROW FOR EACH ALGORITHM
    // ======================================

    results.forEach(
        item => {

            const processes =
                item.result.processes;


            // ==================================
            // TOTAL WAITING TIME
            // ==================================

            let totalWT = 0;


            // ==================================
            // TOTAL TURNAROUND TIME
            // ==================================

            let totalTAT = 0;


            // ==================================
            // CALCULATE TOTALS
            // ==================================

            processes.forEach(
                process => {

                    totalWT +=
                        Number(
                            process.WT || 0
                        );

                    totalTAT +=
                        Number(
                            process.TAT || 0
                        );

                }
            );


            // ==================================
            // CALCULATE AVERAGES
            // ==================================

            const averageWT =
                totalWT /
                processes.length;


            const averageTAT =
                totalTAT /
                processes.length;


            // ==================================
            // CPU IDLE TIME
            // ==================================

            const idleTime =
                Number(
                    item.result.idleTime || 0
                );


            // ==================================
            // CREATE TABLE ROW
            // ==================================

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td class="algorithm-name">

                    ${getComparisonName(
                        item.algorithm
                    )}

                </td>


                <td>

                    ${averageWT.toFixed(2)}

                </td>


                <td>

                    ${averageTAT.toFixed(2)}

                </td>


                <td>

                    ${idleTime}

                </td>

            `;


            // Add row

            comparisonTableBody.appendChild(
                row
            );

        }
    );

}


// ==========================================
// DISPLAY COMPARISON GANTT CHARTS
// ==========================================

function displayComparisonGantt(
    results
) {

    // ======================================
    // REMOVE OLD COMPARISON GANTT SECTION
    // ======================================

    const oldSection =
        document.getElementById(
            "comparison-gantt-section"
        );


    if (oldSection) {

        oldSection.remove();

    }


    // ======================================
    // CREATE MAIN SECTION
    // ======================================

    const section =
        document.createElement(
            "div"
        );


    section.id =
        "comparison-gantt-section";


    section.className =
        "comparison-gantt-section";


    // ======================================
    // SECTION HEADING
    // ======================================

    section.innerHTML = `

        <div class="comparison-gantt-heading">

            <span class="section-label">
                GANTT CHARTS
            </span>


            <h3>
                Algorithm Execution Comparison
            </h3>


            <p>
                Gantt charts generated using
                the same process workload.
            </p>

        </div>

    `;


    // ======================================
    // CREATE GANTT FOR EACH ALGORITHM
    // ======================================

    results.forEach(
        item => {


            // ==================================
            // CREATE CARD
            // ==================================

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card comparison-gantt-card";


            // ==================================
            // HEADER
            // ==================================

            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "comparison-gantt-title";


            header.innerHTML = `

                <div>

                    <h3>

                        ${getComparisonName(
                            item.algorithm
                        )}

                    </h3>


                    <p>
                        CPU execution timeline
                    </p>

                </div>


                <span class="algorithm-tag">

                    ${item.algorithm}

                </span>

            `;


            // ==================================
            // GANTT WRAPPER
            // ==================================

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "gantt-wrapper";


            // ==================================
            // GANTT CHART
            // ==================================

            const chart =
                document.createElement(
                    "div"
                );


            chart.className =
                "gantt-chart";


            // ==================================
            // CHECK GANTT DATA
            // ==================================

            if (
                item.result.gantt &&
                item.result.gantt.length > 0
            ) {


                // ==================================
                // CREATE EACH GANTT BLOCK
                // ==================================

                item.result.gantt.forEach(
                    block => {


                        const ganttBlock =
                            document.createElement(
                                "div"
                            );


                        ganttBlock.className =
                            "gantt-block";


                        // ==================================
                        // CALCULATE DURATION
                        // ==================================

                        const duration =
                            Number(
                                block.end
                            ) -
                            Number(
                                block.start
                            );


                        // ==================================
                        // WIDTH
                        // ==================================

                        ganttBlock.style.flex =
                            `${Math.max(
                                duration,
                                0.1
                            )}`;


                        // ==================================
                        // PROCESS NAME
                        // ==================================

                        const processName =
                            block.pid === "IDLE"
                                ? "IDLE"
                                : `P${block.pid}`;


                        // ==================================
                        // GANTT BLOCK CONTENT
                        // ==================================

                        ganttBlock.innerHTML = `

                            <strong>

                                ${processName}

                            </strong>


                            <span>

                                ${block.start}
                                –
                                ${block.end}

                            </span>

                        `;


                        // ==================================
                        // ADD BLOCK
                        // ==================================

                        chart.appendChild(
                            ganttBlock
                        );

                    }
                );

            }


            // ==================================
            // NO GANTT DATA
            // ==================================

            else {

                const emptyMessage =
                    document.createElement(
                        "div"
                    );


                emptyMessage.className =
                    "comparison-no-gantt";


                emptyMessage.textContent =
                    "No Gantt chart data available.";


                chart.appendChild(
                    emptyMessage
                );

            }


            // ==================================
            // ADD CHART TO WRAPPER
            // ==================================

            wrapper.appendChild(
                chart
            );


            // ==================================
            // ADD HEADER TO CARD
            // ==================================

            card.appendChild(
                header
            );


            // ==================================
            // ADD WRAPPER TO CARD
            // ==================================

            card.appendChild(
                wrapper
            );


            // ==================================
            // ADD CARD TO SECTION
            // ==================================

            section.appendChild(
                card
            );

        }
    );


    // ======================================
    // INSERT AFTER COMPARISON RESULT CARD
    // ======================================

    const comparisonResultCard =
        document.querySelector(
            ".comparison-section .container > .card:last-child"
        );


    if (
        comparisonResultCard
    ) {

        comparisonResultCard.after(
            section
        );

    }

}