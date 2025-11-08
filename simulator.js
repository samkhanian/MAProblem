class Simulator {
    constructor() {
        this.animationInProgress = false;
    }

    render() {
        this.renderShores();
        this.renderBoat();
        this.updateMoveButtons();
        document.getElementById('steps').textContent = `تعداد حرکات: ${solver.steps}`;

        if (solver.currentState.isGoal()) {
            if (!document.getElementById('status').textContent.includes('✅')) {
                document.getElementById('status').textContent = '✅ مسئله حل شد!';
                document.getElementById('status').className = 'status success';
            }
        }
    }

    renderShores() {
        const leftShore = document.getElementById('leftShore');
        const rightShore = document.getElementById('rightShore');
        
        leftShore.innerHTML = '';
        rightShore.innerHTML = '';

        // Left shore
        for (let i = 0; i < solver.currentState.leftM; i++) {
            const person = document.createElement('div');
            person.className = 'person missionary';
            person.textContent = 'K';
            leftShore.appendChild(person);
        }
        
        for (let i = 0; i < solver.currentState.leftC; i++) {
            const person = document.createElement('div');
            person.className = 'person cannibal';
            person.textContent = 'A';
            leftShore.appendChild(person);
        }

        // Right shore
        const rightM = solver.currentState.getRightM();
        const rightC = solver.currentState.getRightC();
        
        for (let i = 0; i < rightM; i++) {
            const person = document.createElement('div');
            person.className = 'person missionary';
            person.textContent = 'K';
            rightShore.appendChild(person);
        }
        
        for (let i = 0; i < rightC; i++) {
            const person = document.createElement('div');
            person.className = 'person cannibal';
            person.textContent = 'A';
            rightShore.appendChild(person);
        }
    }

    renderBoat() {
        const boatContainer = document.getElementById('boatContainer');
        const river = document.getElementById('river');
        const riverWidth = river.offsetWidth;
        
        // Position boat based on boatPos
        if (solver.currentState.boatPos === 0) {
            boatContainer.style.left = '0';
        } else {
            boatContainer.style.left = (riverWidth - 200) + 'px';
        }

        // Boat people are determined by the move description in the solution
        // For now, show empty boat (in real scenario we'd track boat passengers)
        const boatPeople = document.getElementById('boatPeople');
        boatPeople.innerHTML = '';
    }

    updateMoveButtons() {
        const moveButtons = document.getElementById('moveButtons');
        moveButtons.innerHTML = '';

        const nextStates = solver.currentState.getNextStates();
        
        if (nextStates.length === 0) {
            moveButtons.innerHTML = '<p style="grid-column: 1/-1; color: red;">حرکتی معتبر نیست!</p>';
            return;
        }

        nextStates.forEach(({ state, move }) => {
            const button = document.createElement('button');
            button.className = 'move-button';
            button.textContent = move;
            button.onclick = () => {
                solver.makeMove(state, move);
            };
            moveButtons.appendChild(button);
        });
    }
}

const simulator = new Simulator();
simulator.render();