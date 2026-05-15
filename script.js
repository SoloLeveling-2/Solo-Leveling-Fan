const STORAGE_KEY = 'solo-leveling-hunter-tracker-v2';
const PROMOTION_TARGET = 200;

const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"][data-xp]'));
const completionRate = document.querySelector('#completionRate');
const xpEarned = document.querySelector('#xpEarned');
const dailyFill = document.querySelector('#dailyFill');
const promotionFill = document.querySelector('#promotionFill');
const promotionXp = document.querySelector('#promotionXp');
const completedCount = document.querySelector('#completedCount');
const remainingCount = document.querySelector('#remainingCount');
const streakCount = document.querySelector('#streakCount');
const questStatus = document.querySelector('#questStatus');
const rankName = document.querySelector('#rankName');
const resetQuest = document.querySelector('#resetQuest');
const dailyProgress = document.querySelector('.large-progress');
const promotionProgress = document.querySelector('.progress-track');

function loadSavedState() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
        return {};
    }
}

function saveState() {
    const checkedTasks = checkboxes
        .map((box, index) => (box.checked ? index : null))
        .filter((index) => index !== null);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ checkedTasks }));
}

function getRank(xp) {
    if (xp >= PROMOTION_TARGET) {
        return 'D-Rank Hunter';
    }

    if (xp >= 100) {
        return 'E-Rank Hunter+';
    }

    return 'E-Rank Hunter';
}

function updateDashboard() {
    const completed = checkboxes.filter((box) => box.checked);
    const percent = Math.round((completed.length / checkboxes.length) * 100);
    const xp = completed.reduce((total, box) => total + Number(box.dataset.xp), 0);
    const promotionPercent = Math.min(Math.round((xp / PROMOTION_TARGET) * 100), 100);

    completionRate.textContent = `${percent}%`;
    xpEarned.textContent = xp;
    promotionXp.textContent = xp;
    completedCount.textContent = completed.length;
    remainingCount.textContent = checkboxes.length - completed.length;
    dailyFill.style.width = `${percent}%`;
    promotionFill.style.width = `${promotionPercent}%`;
    rankName.textContent = getRank(xp);

    dailyProgress.setAttribute('aria-valuenow', percent);
    promotionProgress.setAttribute('aria-valuenow', Math.min(xp, PROMOTION_TARGET));

    if (percent === 100) {
        questStatus.textContent = 'Quest cleared';
        streakCount.textContent = '2';
    } else if (percent > 0) {
        questStatus.textContent = 'Quest in progress';
        streakCount.textContent = '1';
    } else {
        questStatus.textContent = 'Quest not started';
        streakCount.textContent = '1';
    }

    saveState();
}

function restoreChecklist() {
    const savedState = loadSavedState();
    const checkedTasks = Array.isArray(savedState.checkedTasks) ? savedState.checkedTasks : [];

    checkedTasks.forEach((index) => {
        if (checkboxes[index]) {
            checkboxes[index].checked = true;
        }
    });
}

checkboxes.forEach((box) => box.addEventListener('change', updateDashboard));

resetQuest.addEventListener('click', () => {
    checkboxes.forEach((box) => {
        box.checked = false;
    });

    updateDashboard();
});

restoreChecklist();
updateDashboard();
