class State {
    constructor(leftM, leftC, boatPos) {
        this.leftM = leftM;      // missionaries on left shore
        this.leftC = leftC;      // cannibals on left shore
        this.boatPos = boatPos;  // 0 = at left, 1 = at right
    }

    getRightM() {
        return 3 - this.leftM;
    }

    getRightC() {
        return 3 - this.leftC;
    }

    isValid() {
        // Check left shore validity
        if (this.leftM > 0 && this.leftC > this.leftM) return false;
        
        // Check right shore validity
        const rightM = this.getRightM();
        const rightC = this.getRightC();
        if (rightM > 0 && rightC > rightM) return false;
        
        return true;
    }

    isGoal() {
        return this.leftM === 0 && this.leftC === 0 && this.boatPos === 1;
    }

    key() {
        return `${this.leftM},${this.leftC},${this.boatPos}`;
    }

    getNextStates() {
        const next = [];
        
        if (this.boatPos === 0) {
            // Boat is at left shore - move people from left to right
            // Try all combinations of 1-2 people
            
            // 1 missionary
            if (this.leftM >= 1) {
                const newState = new State(this.leftM - 1, this.leftC, 1);
                if (newState.isValid()) {
                    next.push({ state: newState, move: '1 کشیش' });
                }
            }
            
            // 2 missionaries
            if (this.leftM >= 2) {
                const newState = new State(this.leftM - 2, this.leftC, 1);
                if (newState.isValid()) {
                    next.push({ state: newState, move: '2 کشیش' });
                }
            }
            
            // 1 cannibal
            if (this.leftC >= 1) {
                const newState = new State(this.leftM, this.leftC - 1, 1);
                if (newState.isValid()) {
                    next.push({ state: newState, move: '1 آدم‌خوار' });
                }
            }
            
            // 2 cannibals
            if (this.leftC >= 2) {
                const newState = new State(this.leftM, this.leftC - 2, 1);
                if (newState.isValid()) {
                    next.push({ state: newState, move: '2 آدم‌خوار' });
                }
            }
            
            // 1 missionary + 1 cannibal
            if (this.leftM >= 1 && this.leftC >= 1) {
                const newState = new State(this.leftM - 1, this.leftC - 1, 1);
                if (newState.isValid()) {
                    next.push({ state: newState, move: '1 کشیش + 1 آدم‌خوار' });
                }
            }
        } else {
            // Boat is at right shore - move people from right to left
            const rightM = this.getRightM();
            const rightC = this.getRightC();
            
            // 1 missionary
            if (rightM >= 1) {
                const newState = new State(this.leftM + 1, this.leftC, 0);
                if (newState.isValid()) {
                    next.push({ state: newState, move: '1 کشیش (برگشت)' });
                }
            }
            
            // 2 missionaries
            if (rightM >= 2) {
                const newState = new State(this.leftM + 2, this.leftC, 0);
                if (newState.isValid()) {
                    next.push({ state: newState, move: '2 کشیش (برگشت)' });
                }
            }
            
            // 1 cannibal
            if (rightC >= 1) {
                const newState = new State(this.leftM, this.leftC + 1, 0);
                if (newState.isValid()) {
                    next.push({ state: newState, move: '1 آدم‌خوار (برگشت)' });
                }
            }
            
            // 2 cannibals
            if (rightC >= 2) {
                const newState = new State(this.leftM, this.leftC + 2, 0);
                if (newState.isValid()) {
                    next.push({ state: newState, move: '2 آدم‌خوار (برگشت)' });
                }
            }
            
            // 1 missionary + 1 cannibal
            if (rightM >= 1 && rightC >= 1) {
                const newState = new State(this.leftM + 1, this.leftC + 1, 0);
                if (newState.isValid()) {
                    next.push({ state: newState, move: '1 کشیش + 1 آدم‌خوار (برگشت)' });
                }
            }
        }
        
        return next;
    }
}

class Solver {
    constructor() {
        this.initialState = new State(3, 3, 0);
        this.goalState = new State(0, 0, 1);
        this.currentState = new State(3, 3, 0);
        this.steps = 0;
        this.solution = [];
        this.visitedStates = new Set();
    }

    findSolution() {
        const queue = [{
            state: this.initialState,
            path: []
        }];
        
        const visited = new Set();
        visited.add(this.initialState.key());
        
        while (queue.length > 0) {
            const { state, path } = queue.shift();
            
            if (state.isGoal()) {
                return path;
            }
            
            const nextStates = state.getNextStates();
            for (const { state: nextState, move } of nextStates) {
                const key = nextState.key();
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({
                        state: nextState,
                        path: [...path, { state: nextState, move }]
                    });
                }
            }
        }
        
        return null;
    }

    solve() {
        const solution = this.findSolution();
        if (solution) {
            this.solution = solution;
            console.log('Solution found with', solution.length, 'steps');
            this.autoPlaySolution();
        } else {
            document.getElementById('status').textContent = '❌ راه‌حلی یافت نشد!';
            document.getElementById('status').className = 'status error';
        }
    }

    autoPlaySolution() {
        let index = 0;
        const playStep = () => {
            if (index < this.solution.length) {
                const { state, move } = this.solution[index];
                this.currentState = state;
                this.steps = index + 1;
                simulator.render();
                index++;
                setTimeout(playStep, 1500);
            } else {
                document.getElementById('status').textContent = '✅ مسئله حل شد!';
                document.getElementById('status').className = 'status success';
            }
        };
        playStep();
    }

    reset() {
        this.currentState = new State(3, 3, 0);
        this.steps = 0;
        this.solution = [];
        document.getElementById('status').textContent = '';
        document.getElementById('status').className = 'status';
        simulator.render();
    }

    makeMove(nextState, move) {
        this.currentState = nextState;
        this.steps++;
        simulator.render();
    }
}

const solver = new Solver();