let SCREENS = {
    caseSelect: 'screen-case-select',

    re1: 'screen-re1',
    re2: 'screen-re2',
};

let uiState = {
    currScreen: SCREENS.caseSelect,
};

let re1Payouts = {
    abc: {
        totalPhase1: [
            [0, 0, 12],
            [12, 24, 36],
            [36, 36, 48],
        ],
        totalPhase2: [
            [0, 0, 12],
            [0, 12, 24],
            [12, 12, 24],
        ],
    },
    cra: {
        totalPhase1: [
            [8, 8, 12, 18],
            [20, 20, 24, 30],
            [20, 20, 24, 30],
            [32, 32, 36, 42],
        ],
        totalPhase2: [
            [8, 8, 12, 18],
            [8, 8, 12, 18],
            [8, 8, 12, 18],
            [8, 8, 12, 18],
        ],
    }
};

let re2Payouts = {
    firm1: {
        totalPhase1: [
            [50, 50, 100],
            [62, 112, 162],
            [74, 174, 174],
        ],
        totalPhase2: [
            [50, 50, 100],
            [50, 100, 150],
            [50, 150, 150],
        ],
    },
    firm2: {
        totalPhase1: [
            [0, 50, 100],
            [15, 90, 165],
            [80, 130, 180],
        ],
        totalPhase2: [
            [0, 50, 100],
            [0, 75, 150],
            [50, 100, 150],
        ],
    },
    firm3: {
        totalPhase1: [
            [180, 130, 80],
            [165, 90, 15],
            [100, 50, 0],
        ],
        totalPhase2: [
            [150, 100, 50],
            [150, 75, 0],
            [100, 50, 0],
        ],
    }
};

function assembleListeners() {
    let caseSelect = document.getElementById('case-select');
    caseSelect.addEventListener('change', function (e) {
        if (caseSelect.value === "re1") {
            transitionState(SCREENS.re1);
        } else if (caseSelect.value === "re2") {
            transitionState(SCREENS.re2);
        }
    });

    for (let firm of ['abc', 'cra']) {
        let re1SelectNot1 = document.getElementById(`re1-${firm}-not-phase1-event`);
        let re1SelectNot2 = document.getElementById(`re1-${firm}-not-phase2-event`);
        let re1SelectPhase1 = document.getElementById(`re1-${firm}-phase1-event`);

        function updateTableColors(e) {
            let table = document.getElementById(`re1-${firm}-payout-table`);
            tableIter(table, function (x, y, cell) {
                if (x !== 0 && y !== 0) {
                    if ((x === re1SelectNot2.selectedIndex && re1SelectNot2.value !== 'none')
                        || (y === re1SelectNot1.selectedIndex && re1SelectNot1.value !== 'none')
                        || (y !== re1SelectPhase1.selectedIndex && re1SelectPhase1.value !== 'none')) {
                        cell.style.background = 'red'
                    } else {
                        cell.style.background = '';
                    }
                }
            });
        }

        re1SelectNot1.addEventListener('change', updateTableColors);
        re1SelectNot2.addEventListener('change', updateTableColors);
        re1SelectPhase1.addEventListener('change', updateTableColors);
        re1SelectPhase1.addEventListener('change', () => updateRe1TableValues(firm));
    }

    for (let firm of ['firm1', 'firm2']) {
        let re2SelectNot1 = document.getElementById(`re2-${firm}-not-phase1-event`);
        let re2SelectNot2 = document.getElementById(`re2-${firm}-not-phase2-event`);
        let re2SelectPhase1 = document.getElementById(`re2-${firm}-phase1-event`);

        function f(tableFirm) {
            return function updateTableColors(e) {
                let table = document.getElementById(`re2-${tableFirm}-payout-table`);
                tableIter(table, function (x, y, cell) {
                    if (x !== 0 && y !== 0) {
                        if ((x === re2SelectNot2.selectedIndex && re2SelectNot2.value !== 'none')
                            || (y === re2SelectNot1.selectedIndex && re2SelectNot1.value !== 'none')
                            || (y !== re2SelectPhase1.selectedIndex && re2SelectPhase1.value !== 'none')) {
                            cell.style.background = 'red'
                        } else {
                            cell.style.background = '';
                        }
                    }
                });
            }
        }

        for (let ifirm of firm === 'firm1' ? ['firm1'] : ['firm2', 'firm3']) {
            re2SelectNot1.addEventListener('change', f(ifirm));
            re2SelectNot2.addEventListener('change', f(ifirm));
            re2SelectPhase1.addEventListener('change', f(ifirm));
            re2SelectPhase1.addEventListener('change', () => updateRe2TableValues(ifirm));
        }
    }
}

function updateRe1TableValues(firm) {
    let table = document.getElementById(`re1-${firm}-payout-table`);
    tableIter(table, function (x, y, cell) {
        if (x !== 0 && y !== 0) {
            if (document.getElementById(`re1-${firm}-phase1-event`).value === 'none') {
                cell.innerText = re1Payouts[firm].totalPhase1[y - 1][x - 1];
            } else {
                cell.innerText = re1Payouts[firm].totalPhase2[y - 1][x - 1];
            }
        }
    });
}

function updateRe2TableValues(firm) {
    let table = document.getElementById(`re2-${firm}-payout-table`);
    tableIter(table, function (x, y, cell) {
        if (x !== 0 && y !== 0) {
            if (document.getElementById(`re2-${firm === "firm1" ? "firm1" : "firm2"}-phase1-event`).value === 'none') {
                cell.innerText = re2Payouts[firm].totalPhase1[y - 1][x - 1];
            } else {
                cell.innerText = re2Payouts[firm].totalPhase2[y - 1][x - 1];
            }
        }
    });
}

function tableIter(table, cellCallback) {
    let x = 0, y = 0;
    for (let row of table.rows) {
        for (let cell of row.cells) {
            cellCallback(x, y, cell)
            x += 1;
        }
        y += 1;
        x = 0;
    }
}

function transitionState(newState) {
    for (let sName in SCREENS) {
        let screen = document.getElementById(SCREENS[sName]);
        screen.style.display = 'none';
    }
    uiState.currScreen = newState;
    document.getElementById(uiState.currScreen).style.display = 'flex';

    if (newState === SCREENS.re1) {
        updateRe1TableValues('abc');
        updateRe1TableValues('cra');
    } else if (newState === SCREENS.re2) {
        updateRe2TableValues('firm1');
        updateRe2TableValues('firm2');
        updateRe2TableValues('firm3');
    }
}

window.onload = function () {
    assembleListeners();
    transitionState(SCREENS.caseSelect);
};