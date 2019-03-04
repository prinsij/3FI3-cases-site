let SCREENS = {
    caseSelect: 'screen-case-select',

    re1: 'screen-re1',
    re2: 'screen-re2',
    bo2: 'screen-bo2',
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

let bo2Rates = {
    period1: 1.04,
    period2: [1.08, 1.10, 1.12],
    period3: [1.14, 1.16, 1.18],
};

function assembleListeners() {
    let caseSelect = document.getElementById('case-select');
    caseSelect.addEventListener('change', function (e) {
        if (caseSelect.value === "re1") {
            transitionState(SCREENS.re1);
        } else if (caseSelect.value === "re2") {
            transitionState(SCREENS.re2);
        } else if (caseSelect.value === "bo2") {
            transitionState(SCREENS.bo2);
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

    {
        let bo2NotP2Select = document.getElementById('bo2-not-period2-rate');
        let bo2NotP3Select = document.getElementById('bo2-not-period3-rate');
        let bo2P2Select = document.getElementById('bo2-period2-rate');
        let bo2P3Select = document.getElementById('bo2-period3-rate');
        let bo2YearSelect = document.getElementById('bo2-year-select');

        function updateAll(e) {
            let currYear = bo2YearSelect.selectedIndex;
            let notP2Rate = bo2NotP2Select.selectedIndex - 1;
            let notP3Rate = bo2NotP3Select.selectedIndex - 1;
            let p2Rate = bo2P2Select.selectedIndex - 1;
            let p3Rate = bo2P3Select.selectedIndex - 1;

            let p2Rates = [0,1,2];
            let p3Rates = [0,1,2];
            if (notP2Rate >= 0) {
                p2Rates.splice(notP2Rate, 1);
            }
            if (notP3Rate >= 0) {
                p3Rates.splice(notP3Rate, 1);
            }
            if (p2Rate >= 0) {
                p2Rates = [p2Rate];
            }
            if (p3Rate >= 0) {
                p3Rates = [p3Rate];
            }

            updateBo2Zc2Values(currYear, p2Rates);
            updateBo2Zc3Values(currYear, p2Rates, p3Rates);
            updateBo2CouponValues(currYear, p2Rates, p3Rates);
            updateBo2Zc1Values(currYear);
        }

        bo2YearSelect.addEventListener('change', updateAll);
        bo2NotP2Select.addEventListener('change', updateAll);
        bo2NotP3Select.addEventListener('change', updateAll);
        bo2P2Select.addEventListener('change', updateAll);
        bo2P3Select.addEventListener('change', updateAll);
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

function updateBo2Zc1Values(year) {
    let ele = document.getElementById('bo2-zc1-price');
    ele.style.display = year === 0 ? 'block' : 'none';
}

function updateBo2Zc2Values(year, p2Rates) {
    let table = document.getElementById('bo2-zc2-price');
    table.style.display = year > 1 ? 'none' : 'table';
    let r = 0;
    for (let row of table.rows) {
        let ans = year == 0 ? 100 / (bo2Rates.period1 * bo2Rates.period2[r])
                            : 100 / bo2Rates.period2[r];
        row.cells[1].innerText = Number(ans).toFixed(3);
        row.cells[1].style.background = p2Rates.indexOf(r) < 0 ? 'red' : '';
        r += 1;
    }
}

function updateBo2Zc3Values(year, p2Rates, p3Rates) {
    let table = document.getElementById('bo2-zc3-price');
    for (let r = 1; r < table.rows.length; r++) {
        for (let c = 1; c < table.rows[r].cells.length; c++) {
            let ans = year == 0 ? 100 / (bo2Rates.period1 * bo2Rates.period2[r-1] * bo2Rates.period3[c-1])
                    : year == 1 ? 100 / (bo2Rates.period2[r-1] * bo2Rates.period3[c-1])
                                : 100 / bo2Rates.period3[c-1];
            table.rows[r].cells[c].innerText = Number(ans).toFixed(3);
            table.rows[r].cells[c].style.background = ''
            if (p3Rates.indexOf(c-1) < 0 || p2Rates.indexOf(r-1) < 0) {
                table.rows[r].cells[c].style.background = 'red';
            }
        }
    }
}

function updateBo2CouponValues(year, p2Rates, p3Rates) {
    let table = document.getElementById('bo2-coupon-price');
    for (let r = 1; r < table.rows.length; r++) {
        for (let c = 1; c < table.rows[r].cells.length; c++) {
            let face = year == 0 ? 110 / (bo2Rates.period1 * bo2Rates.period2[r-1] * bo2Rates.period3[c-1])
                     : year == 1 ? 110 / (bo2Rates.period2[r-1] * bo2Rates.period3[c-1])
                                 : 110 / bo2Rates.period3[c-1];
            let coupon1 = year == 0 ? 10 / bo2Rates.period1
                                    : 0;
            let coupon2 = year == 0 ? 10 / (bo2Rates.period1 * bo2Rates.period2[r-1]) 
                        : year == 1 ? 10 / (bo2Rates.period2[r-1])
                                    : 0;
            table.rows[r].cells[c].innerText = Number(face+coupon1+coupon2).toFixed(3);
            table.rows[r].cells[c].style.background = ''
            if (p3Rates.indexOf(c-1) < 0 || p2Rates.indexOf(r-1) < 0) {
                table.rows[r].cells[c].style.background = 'red';
            }
        }
    }
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
    } else if (newState === SCREENS.bo2) {
        updateBo2Zc2Values(0, [...Array(3).keys()]);
        updateBo2Zc3Values(0, [...Array(3).keys()], [...Array(3).keys()]);
        updateBo2CouponValues(0, [...Array(3).keys()], [...Array(3).keys()]);
        updateBo2Zc1Values(0);
    }
}

window.onload = function () {
    assembleListeners();
    transitionState(SCREENS.caseSelect);
};
