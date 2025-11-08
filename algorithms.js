/**
 * الگوریتم های حل مسئله کشیش و آدم‌خوار
 * BFS و DFS برای یافتن کوتاه‌ترین مسیر
 */

class MissionariesAlgorithm {
    /**
     * BFS برای مسئله 3 کشیش + 1 آدم‌خوار
     */
    static solveMissionariesOnly() {
        const initialState = { leftM: 3, leftA: 1, boat: 0 }; // boat: 0=چپ, 1=راست
        const goalState = { leftM: 0, leftA: 0, boat: 1 };

        return this.bfs(initialState, goalState, 'missionaries');
    }

    /**
     * BFS برای مسئله تمام افراد (3 کشیش + 3 آدم‌خوار)
     */
    static solveAllPeople() {
        const initialState = { leftM: 3, leftA: 3, boat: 0 };
        const goalState = { leftM: 0, leftA: 0, boat: 1 };

        return this.bfs(initialState, goalState, 'all');
    }

    /**
     * DFS برای مسئله 3 کشیش + 1 آدم‌خوار
     */
    static solveMissionariesDFS() {
        const initialState = { leftM: 3, leftA: 1, boat: 0 };
        const goalState = { leftM: 0, leftA: 0, boat: 1 };

        return this.dfs(initialState, goalState, 'missionaries');
    }

    /**
     * DFS برای مسئله تمام افراد
     */
    static solveAllPeopleDFS() {
        const initialState = { leftM: 3, leftA: 3, boat: 0 };
        const goalState = { leftM: 0, leftA: 0, boat: 1 };

        return this.dfs(initialState, goalState, 'all');
    }

    /**
     * الگوریتم BFS (کوتاه‌ترین مسیر)
     */
    static bfs(start, goal, type) {
        const queue = [[start]];
        const visited = new Set([JSON.stringify(start)]);

        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];

            if (JSON.stringify(current) === JSON.stringify(goal)) {
                return path;
            }

            const nextStates = this.getNextStates(current, type);
            for (const nextState of nextStates) {
                const stateStr = JSON.stringify(nextState);
                if (!visited.has(stateStr)) {
                    visited.add(stateStr);
                    queue.push([...path, nextState]);
                }
            }
        }

        return null; // راه حل پیدا نشد
    }

    /**
     * الگوریتم DFS
     */
    static dfs(start, goal, type, visited = new Set(), path = []) {
        const current = path.length === 0 ? start : path[path.length - 1];
        const stateStr = JSON.stringify(current);

        if (visited.has(stateStr)) {
            return null;
        }

        visited.add(stateStr);
        path.push(current);

        if (JSON.stringify(current) === JSON.stringify(goal)) {
            return path;
        }

        const nextStates = this.getNextStates(current, type);
        for (const nextState of nextStates) {
            const result = this.dfs(start, goal, type, new Set(visited), [...path]);
            if (result) return result;
        }

        return null;
    }

    /**
     * دریافت حالات معتبر بعدی
     */
    static getNextStates(state, type) {
        const nextStates = [];
        const rightM = type === 'missionaries' ? 3 - state.leftM : 3 - state.leftM;
        const rightA = type === 'missionaries' ? 1 - state.leftA : 3 - state.leftA;

        // حرکت‌های ممکن: (missionaries, cannibals)
        const moves = [[1, 0], [2, 0], [1, 1], [0, 1], [0, 2]];

        if (state.boat === 0) {
            // قایق در سمت چپ - نفر از چپ به راست
            for (const [m, a] of moves) {
                if (m <= state.leftM && a <= state.leftA) {
                    const newState = {
                        leftM: state.leftM - m,
                        leftA: state.leftA - a,
                        boat: 1
                    };

                    if (this.isValidState(newState, type)) {
                        nextStates.push(newState);
                    }
                }
            }
        } else {
            // قایق در سمت راست - نفر از راست به چپ
            for (const [m, a] of moves) {
                if (m <= rightM && a <= rightA) {
                    const newState = {
                        leftM: state.leftM + m,
                        leftA: state.leftA + a,
                        boat: 0
                    };

                    if (this.isValidState(newState, type)) {
                        nextStates.push(newState);
                    }
                }
            }
        }

        return nextStates;
    }

    /**
     * بررسی معتبر بودن حالت
     * قاعده: آدم‌خوار نمی‌تواند بیشتر از کشیش باشد در هر ساحل
     */
    static isValidState(state, type) {
        if (type === 'missionaries') {
            // 3 کشیش + 1 آدم‌خوار
            if (state.leftM < 0 || state.leftM > 3 || state.leftA < 0 || state.leftA > 1) {
                return false;
            }
            
            // بررسی سمت چپ
            if (state.leftM > 0 && state.leftA > state.leftM) {
                return false;
            }

            // بررسی سمت راست
            const rightM = 3 - state.leftM;
            const rightA = 1 - state.leftA;
            if (rightM > 0 && rightA > rightM) {
                return false;
            }

            return true;
        }

        // بررسی سمت چپ
        if (state.leftM > 0 && state.leftA > state.leftM) {
            return false;
        }

        // بررسی سمت راست
        const rightM = 3 - state.leftM;
        const rightA = 3 - state.leftA;
        if (rightM > 0 && rightA > rightM) {
            return false;
        }

        return true;
    }
}