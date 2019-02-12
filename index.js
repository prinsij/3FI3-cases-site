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

        function update3rd(e) {
            if (re1SelectNot1.value !== 'none' && re1SelectNot2.value !== 'none') {
                re1SelectPhase1.disabled = false;
            }
        }

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

        re1SelectNot1.addEventListener('change', update3rd);
        re1SelectNot2.addEventListener('change', update3rd);
        re1SelectNot1.addEventListener('change', updateTableColors);
        re1SelectNot2.addEventListener('change', updateTableColors);
        re1SelectPhase1.addEventListener('change', updateTableColors);
        re1SelectPhase1.addEventListener('change', () => updateRe1TableValues(firm));
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
    assembleListeners();
    for (let sName in SCREENS) {
        let screen = document.getElementById(SCREENS[sName]);
        screen.style.display = 'none';
    }
    uiState.currScreen = newState;
    document.getElementById(uiState.currScreen).style.display = 'flex';

    if (uiState.currScreen === SCREENS.re1) {
        document.getElementById('re1-abc-phase1-event').disabled = true;
        document.getElementById('re1-cra-phase1-event').disabled = true;
        updateRe1TableValues('abc');
        updateRe1TableValues('cra');
    }
}

window.onload = function () {
    transitionState(SCREENS.caseSelect);
};