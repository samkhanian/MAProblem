/**
 * کلاس شبیه‌ساز برای نمایش دینامیکی حرکت افراد
 * انیمیشن صاف و حرکت مداوم
 */

class Simulator {
    constructor(type) {
        this.type = type; // 'missionaries' یا 'all'
        this.isRunning = false;
        this.isPaused = false;
        this.currentPathIndex = 0;
        this.path = [];
        this.speed = 1;
        this.animationFrameId = null;
        this.startAnimationTime = 0;
        this.animationDuration = 2000; // 2 ثانیه برای هر حرکت
        this.currentState = null;
        this.nextState = null;
        this.isAnimating = false;
    }

    /**
     * شروع شبیه‌سازی
     */
    start() {
        if (this.path.length === 0) return;

        this.isRunning = true;
        this.isPaused = false;
        this.currentPathIndex = 0;
        this.startAnimationTime = 0;
        this.animate();
    }

    /**
     * توقف موقت
     */
    pause() {
        this.isPaused = true;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    /**
     * ادامه
     */
    resume() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            this.animate();
        }
    }

    /**
     * بازنشانی
     */
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentPathIndex = 0;
        this.isAnimating = false;
        this.startAnimationTime = 0;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.path.length > 0) {
            this.currentState = this.path[0];
            this.render();
            this.updateSteps();
        }
    }

    /**
     * یک گام جلو برو
     */
    step() {
        if (this.path.length > 0 && this.currentPathIndex < this.path.length - 1) {
            this.currentPathIndex++;
            this.currentState = this.path[this.currentPathIndex];
            this.render();
        }
    }

    /**
     * انیمیشن حرکت
     */
    animate() {
        if (!this.isRunning || this.isPaused || this.currentPathIndex >= this.path.length - 1) {
            return;
        }

        const now = performance.now();

        if (this.startAnimationTime === 0) {
            this.startAnimationTime = now;
            this.currentState = this.path[this.currentPathIndex];
            this.nextState = this.path[this.currentPathIndex + 1];
            this.isAnimating = true;
        }

        const elapsed = now - this.startAnimationTime;
        const duration = this.animationDuration / this.speed;
        const progress = Math.min(elapsed / duration, 1);

        // نمایش حالت انتقالی
        this.renderTransition(progress);

        if (progress === 1) {
            this.currentPathIndex++;
            this.currentState = this.path[this.currentPathIndex];
            this.updateSteps();
            this.updateCurrentStateItem();
            this.startAnimationTime = 0;
            this.isAnimating = false;

            if (this.currentPathIndex >= this.path.length - 1) {
                this.isRunning = false;
                this.render();
                return;
            }
        }

        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    /**
     * رندر حالت انتقالی
     */
    renderTransition(progress) {
        if (!this.currentState || !this.nextState) return;

        const riverWidth = 320; // عرض رودخانه تقریبی
        const boatWidth = 120;
        const leftX = 20;
        const rightX = riverWidth - boatWidth - 20;

        // موقعیت قایق
        let boatX;
        if (this.currentState.boat === 0) {
            // حرکت از چپ به راست
            boatX = leftX + (rightX - leftX) * progress;
        } else {
            // حرکت از راست به چپ
            boatX = rightX - (rightX - leftX) * progress;
        }

        // تعیین افراد در قایق
        let boatMissionaries = 0;
        let boatCannibals = 0;
        let displayLeftM = this.currentState.leftM;
        let displayLeftA = this.currentState.leftA;

        if (this.currentState.boat === 0) {
            // قایق از چپ به راست می‌رود
            const movedM = this.currentState.leftM - this.nextState.leftM;
            const movedA = this.currentState.leftA - this.nextState.leftA;

            if (progress < 0.5) {
                // نیمه اول: افراد از ساحل به قایق
                boatMissionaries = Math.round(movedM * (progress / 0.5));
                boatCannibals = Math.round(movedA * (progress / 0.5));
                displayLeftM = this.currentState.leftM - boatMissionaries;
                displayLeftA = this.currentState.leftA - boatCannibals;
            } else {
                // نیمه دوم: قایق فقط حرکت می‌کند
                boatMissionaries = movedM;
                boatCannibals = movedA;
                displayLeftM = this.nextState.leftM;
                displayLeftA = this.nextState.leftA;
            }
        } else {
            // قایق از راست به چپ می‌رود
            const rightM_curr = (this.type === 'missionaries' ? 3 : 3) - this.currentState.leftM;
            const rightM_next = (this.type === 'missionaries' ? 3 : 3) - this.nextState.leftM;
            const rightA_curr = (this.type === 'missionaries' ? 0 : 3) - this.currentState.leftA;
            const rightA_next = (this.type === 'missionaries' ? 0 : 3) - this.nextState.leftA;

            const movedM = rightM_curr - rightM_next;
            const movedA = rightA_curr - rightA_next;

            if (progress < 0.5) {
                // نیمه اول: افراد از ساحل راست به قایق
                boatMissionaries = Math.round(movedM * (progress / 0.5));
                boatCannibals = Math.round(movedA * (progress / 0.5));
                displayLeftM = this.currentState.leftM;
                displayLeftA = this.currentState.leftA;
            } else {
                // نیمه دوم: قایق حرکت می‌کند و افراد وارد ساحل چپ می‌شوند
                boatMissionaries = 0;
                boatCannibals = 0;
                displayLeftM = this.nextState.leftM;
                displayLeftA = this.nextState.leftA;
            }
        }

        this.renderWithBoat({
            leftM: displayLeftM,
            leftA: displayLeftA,
            boat: this.currentState.boat,
            boatX: Math.round(boatX),
            boatMissionaries: boatMissionaries,
            boatCannibals: boatCannibals
        });
    }

    /**
     * رندر با نمایش افراد در قایق
     */
    renderWithBoat(state) {
        const id = this.type === 'missionaries' ? 'm' : 'a';

        // نمایش ساحل چپ
        const leftShore = document.getElementById(`left-shore-${id}`);
        if (leftShore) {
            leftShore.innerHTML = this.renderPeople(state.leftM, 'missionary', 'shore') +
                this.renderPeople(state.leftA, 'cannibal', 'shore');
        }

        // نمایش ساحل راست
        const rightM = (this.type === 'missionaries' ? 3 : 3) - state.leftM;
        const rightA = (this.type === 'missionaries' ? 0 : 3) - state.leftA;
        const rightShore = document.getElementById(`right-shore-${id}`);
        if (rightShore) {
            rightShore.innerHTML = this.renderPeople(rightM, 'missionary', 'shore') +
                this.renderPeople(rightA, 'cannibal', 'shore');
        }

        // نمایش قایق
        const boat = document.getElementById(`boat-${id}`);
        if (boat) {
            let boatContent = '⛵';
            if (state.boatMissionaries > 0 || state.boatCannibals > 0) {
                boatContent = this.renderPeople(state.boatMissionaries, 'missionary', 'boat') +
                    this.renderPeople(state.boatCannibals, 'cannibal', 'boat');
            }
            boat.innerHTML = boatContent;
            boat.style.left = state.boatX + 'px';
            boat.style.right = 'auto';
        }
    }

    /**
     * نمایش عادی (بدون انیمیشن)
     */
    render() {
        if (!this.currentState) return;

        const id = this.type === 'missionaries' ? 'm' : 'a';

        // نمایش ساحل چپ
        const leftShore = document.getElementById(`left-shore-${id}`);
        if (leftShore) {
            leftShore.innerHTML = this.renderPeople(this.currentState.leftM, 'missionary', 'shore') +
                this.renderPeople(this.currentState.leftA, 'cannibal', 'shore');
        }

        // نمایش ساحل راست
        const rightM = (this.type === 'missionaries' ? 3 : 3) - this.currentState.leftM;
        const rightA = (this.type === 'missionaries' ? 0 : 3) - this.currentState.leftA;
        const rightShore = document.getElementById(`right-shore-${id}`);
        if (rightShore) {
            rightShore.innerHTML = this.renderPeople(rightM, 'missionary', 'shore') +
                this.renderPeople(rightA, 'cannibal', 'shore');
        }

        // نمایش موقعیت قایق
        const boat = document.getElementById(`boat-${id}`);
        if (boat) {
            boat.style.left = this.currentState.boat === 0 ? '20px' : 'auto';
            boat.style.right = this.currentState.boat === 1 ? '20px' : 'auto';
            boat.innerHTML = '⛵';
        }
    }

    /**
     * ایجاد عنصر‌های افراد
     */
    renderPeople(count, type, location = 'shore') {
        let html = '';
        const icon = type === 'missionary' ? 'M' : 'A';

        if (location === 'boat') {
            // افراد در قایق (اندازه کوچک‌تر)
            for (let i = 0; i < count; i++) {
                html += `<div class="person ${type}" style="font-size: 8px; width: 18px; height: 18px; margin: 1px; border: none;">${icon}</div>`;
            }
        } else {
            // افراد در ساحل (اندازه عادی)
            for (let i = 0; i < count; i++) {
                html += `<div class="person ${type}" style="font-size: 12px; width: 30px; height: 30px; margin: 3px;">${icon}</div>`;
            }
        }
        return html;
    }

    /**
     * تنظیم سرعت
     */
    setSpeed(speed) {
        this.speed = Math.max(0.5, Math.min(3, speed));
    }

    /**
     * بارگذاری مسیر
     */
    loadPath(path) {
        this.path = path;
        this.currentPathIndex = 0;
        if (path.length > 0) {
            this.currentState = path[0];
            this.isAnimating = false;
            this.startAnimationTime = 0;
            this.render();
            this.updateSteps();
        }
    }

    /**
     * نمایش لیست حالات
     */
    displayPath() {
        const id = this.type === 'missionaries' ? 'm' : 'a';
        const pathElement = document.getElementById(`path-${id}`);
        if (!pathElement) return;

        pathElement.innerHTML = '';
        this.path.forEach((state, index) => {
            const div = document.createElement('div');
            div.className = 'state-item';
            div.id = `state-item-${id}-${index}`;
            if (index === this.currentPathIndex) {
                div.classList.add('current');
            }

            const stateText = this.type === 'missionaries' ?
                `گام ${index}: ${state.leftM}M | قایق: ${state.boat === 0 ? 'چپ' : 'راست'}` :
                `گام ${index}: ${state.leftM}M, ${state.leftA}A | قایق: ${state.boat === 0 ? 'چپ' : 'راست'}`;

            div.textContent = stateText;
            div.onclick = () => this.jumpToState(index);
            pathElement.appendChild(div);
        });
    }

    /**
     * به‌روزرسانی کلاس state item فعلی
     */
    updateCurrentStateItem() {
        const id = this.type === 'missionaries' ? 'm' : 'a';
        const pathElement = document.getElementById(`path-${id}`);
        if (!pathElement) return;

        // حذف کلاس current از تمام items
        document.querySelectorAll(`#path-${id} .state-item`).forEach(item => {
            item.classList.remove('current');
        });

        // افزودن کلاس current به item فعلی
        const currentItem = document.getElementById(`state-item-${id}-${this.currentPathIndex}`);
        if (currentItem) {
            currentItem.classList.add('current');
            currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * پرش به یک حالت خاص
     */
    jumpToState(index) {
        if (index >= 0 && index < this.path.length) {
            this.pause();
            this.currentPathIndex = index;
            this.currentState = this.path[index];
            this.render();
            this.updateSteps();
            this.updateCurrentStateItem();
        }
    }

    /**
     * به‌روزرسانی شمارنده مراحل
     */
    updateSteps() {
        const id = this.type === 'missionaries' ? 'm' : 'a';
        const stepsElement = document.getElementById(`steps-${id}`);
        if (stepsElement) {
            stepsElement.textContent = this.currentPathIndex;
        }
    }

    /**
     * به‌روزرسانی وضعیت
     */
    updateStatus(status) {
        const id = this.type === 'missionaries' ? 'm' : 'a';
        const statusElement = document.getElementById(`status-${id}`);
        if (statusElement) {
            statusElement.className = `status ${status}`;
            const messages = {
                idle: 'آماده برای شروع',
                running: 'در حال اجرا...',
                complete: '✓ مسئله حل شد!',
                invalid: 'خطا: راه حل پیدا نشد'
            };
            statusElement.textContent = messages[status] || '';
        }
    }
}