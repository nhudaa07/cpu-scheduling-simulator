// ==========================================
// COMPARISON MODULE
// ==========================================


// Get elements

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

    // Get selected algorithms

    const selectedAlgorithms =
        Array.from(
            document.querySelectorAll(
                '.checkbox-grid input[type="checkbox"]:checked'
            )
        ).map(
            checkbox => checkbox.value
        );


    // At least two algorithms

    if (selectedAlgorithms.length < 2) {

        alert(
            "Please select at least two algorithms."
        );

        return;
    }


    // Get process input

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


    // Time quantum

    const quantum =
        parseInt(
            quantumInput.value
        );


    // RR validation

    if (
        selectedAlgorithms.includes("RR") &&
        (!quantum || quantum <= 0)
    ) {

        alert(
            "Please enter a valid Time Quantum for Round Robin."
        );

        return;
    }


    const results = [];


    // ======================================
    // RUN SELECTED ALGORITHMS
    // ======================================

    selectedAlgorithms.forEach(
        algorithm => {

            let result;


            if (algorithm === "SJF") {

                result =
                    sjf(
                        cloneProcesses(processes)
                    );

            }


            else if (algorithm === "SRTF") {

                result =
                    srtf(
                        cloneProcesses(processes)
                    );

            }


            else if (algorithm === "PRIORITY") {

                result =
                    priorityScheduling(
                        cloneProcesses(processes)
                    );

            }


            else if (algorithm === "RR") {

                result =
                    roundRobin(
                        cloneProcesses(processes),
                        quantum
                    );

            }


            if (result) {

                results.push({
                    algorithm: algorithm,
                    result: result
                });

            }

        }
    );


    // Display comparison table

    displayComparisonTable(results);


    // Display Gantt charts

    displayComparisonGantt(results);
}


// ==========================================
// CLONE PROCESS DATA
// ==========================================

function cloneProcesses(processes) {

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

    comparisonTableBody.innerHTML = "";


    results.forEach(
        item => {

            const processes =
                item.result.processes;


            let totalWT = 0;

            let totalTAT = 0;


            // Calculate totals

            processes.forEach(
                process => {

                    totalWT +=
                        process.WT;

                    totalTAT +=
                        process.TAT;

                }
            );


            // Calculate averages

            const averageWT =
                totalWT /
                processes.length;


            const averageTAT =
                totalTAT /
                processes.length;


            // Idle time

            const idleTime =
                item.result.idleTime;


            // Create row

            const row =
                document.createElement("tr");


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

    // Remove previous comparison charts

    const oldSection =
        document.getElementById(
            "comparison-gantt-section"
        );


    if (oldSection) {
        oldSection.remove();
    }


    // Main section

    const section =
        document.createElement("div");

    section.id =
        "comparison-gantt-section";

    section.className =
        "comparison-gantt-section";


    // Heading

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
    // CREATE CHART FOR EACH ALGORITHM
    // ======================================

    results.forEach(
        item => {

            const card =
                document.createElement("div");

            card.className =
                "card comparison-gantt-card";


            // Header

            const header =
                document.createElement("div");

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


            // Wrapper

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "gantt-wrapper";


            // Chart

            const chart =
                document.createElement("div");

            chart.className =
                "gantt-chart";


            // ==================================
            // GANTT BLOCKS
            // ==================================

            item.result.gantt.forEach(
                block => {

                    const ganttBlock =
                        document.createElement(
                            "div"
                        );


                    ganttBlock.className =
                        "gantt-block";


                    const duration =
                        block.end -
                        block.start;


                    // Width based on duration

                    ganttBlock.style.flex =
                        `${duration}`;


                    ganttBlock.innerHTML = `

                        <strong>
                            P${block.pid}
                        </strong>

                        <span>
                            ${block.start}
                            –
                            ${block.end}
                        </span>

                    `;


                    chart.appendChild(
                        ganttBlock
                    );

                }
            );


            wrapper.appendChild(
                chart
            );


            card.appendChild(
                header
            );

            card.appendChild(
                wrapper
            );


            section.appendChild(
                card
            );

        }
    );


    // ======================================
    // INSERT AFTER COMPARISON TABLE
    // ======================================

    const comparisonResultCard =
        document.querySelector(
            ".comparison-section .container > .card:last-child"
        );


    if (comparisonResultCard) {

        comparisonResultCard.after(
            section
        );

    }

}