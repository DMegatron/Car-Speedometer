let speed = 0;
let rpm = 0;
let gear = 'N';
var gsa = 0;
const maxSpeeds = {
    'R': 30,
    'N': 0,
    '1': 40,
    '2': 80,
    '3': 120,
    '4': 160,
    '5': 200,
    '6': 220
};
const maxRPM = 8000;
let accelerating = false;
let braking = false;
let interval;

const speedElem = document.querySelector('.speedometer p:nth-child(2)');
const rpmElem = document.querySelector('.rpm p:nth-child(2)');
const gearElem = document.querySelector('.gear p:nth-child(2)');
const gaugeElem = document.querySelector('.gauge');
const tachometerGaugeElem = document.querySelector('.tachometergauge');

const speedToAngle = {
    0: -34,
    10: -26,
    20: -18.5,
    30: -6.5,
    40: 5,
    50: 16.5,
    60: 28,
    70: 39.5,
    80: 51,
    90: 62.5,
    100: 74,
    110: 85.5,
    120: 97,
    130: 108.5,
    140: 120,
    150: 132,
    160: 143.5,
    170: 155.5,
    180: 167.5,
    190: 179,
    200: 191,
    210: 203,
    220: 215
};

const rpmToAngle = {
    0: -46,
    1000: -12,
    2000: 21,
    3000: 55,
    4000: 89,
    5000: 123,
    6000: 157,
    7000: 191,
    8000: 225
};

function getGaugeAngle(speed) {
    const speeds = Object.keys(speedToAngle).map(Number);
    let lowerSpeed = Math.max(...speeds.filter(s => s <= speed));
    let upperSpeed = Math.min(...speeds.filter(s => s > speed));

    if (lowerSpeed === undefined) lowerSpeed = speeds[0];
    if (upperSpeed === undefined) upperSpeed = speeds[speeds.length - 1];

    const lowerAngle = speedToAngle[lowerSpeed];
    const upperAngle = speedToAngle[upperSpeed];

    const angle = lowerAngle + ((speed - lowerSpeed) / (upperSpeed - lowerSpeed)) * (upperAngle - lowerAngle);
    return angle;
}

function getTachometerAngle(rpm) {
    const rpms = Object.keys(rpmToAngle).map(Number);
    let lowerRPM = Math.max(...rpms.filter(r => r <= rpm));
    let upperRPM = Math.min(...rpms.filter(r => r > rpm));

    if (lowerRPM === undefined) lowerRPM = rpms[0];
    if (upperRPM === undefined) upperRPM = rpms[rpms.length - 1];

    const lowerAngle = rpmToAngle[lowerRPM];
    const upperAngle = rpmToAngle[upperRPM];

    const angle = lowerAngle + ((rpm - lowerRPM) / (upperRPM - lowerRPM)) * (upperAngle - lowerAngle);
    return angle;
}

function updateDisplay() {
    if (isNaN(rpm)) {
        rpmElem.textContent = "0";
    }
    speedElem.textContent = Math.max(0, speed).toFixed(0);
    rpmElem.textContent = Math.min(Math.max(0, rpm), maxRPM).toFixed(0);
    gearElem.textContent = gear;
}

function updateGaugeAngle(speed) {
    const angle = getGaugeAngle(speed);
    gaugeElem.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
}

function updateTachometerAngle(rpm) {
    const angle = getTachometerAngle(rpm);
    tachometerGaugeElem.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
}

function accelerate() {
    if (gear !== 'N' && !braking) {
        let accelerationRate;
        
        if (gear === 'R') {
            accelerationRate = 0.5;
        } else {
            accelerationRate = 1.6 / parseInt(gear);
        }

        if (speed < maxSpeeds[gear]) {
            speed += accelerationRate;
            rpm = (speed / maxSpeeds[gear]) * maxRPM;
            speed = Math.min(speed, maxSpeeds[gear]);
        }
    }
    if (!gsa) {
        speed = Math.min(speed, maxSpeeds[gear]);
    }
    updateDisplay();
    updateGaugeAngle(speed);
    updateTachometerAngle(rpm);
}

function brake() {
    if (speed > 0) {
        speed -= 5;
        if (gear === 'R') {
            rpm = (speed / maxSpeeds['R']) * maxRPM;
        } else {
            rpm = (speed / maxSpeeds[gear]) * maxRPM;
        }
        speed = Math.max(speed, 0);
        rpm = Math.min(Math.max(rpm, 0), maxRPM);
    }
    updateDisplay();
    updateGaugeAngle(speed);
    updateTachometerAngle(rpm);
}

function decelerate() {
    if (speed > 0) {
        speed -= 0.8;
        if (gear === 'R') {
            rpm = (speed / maxSpeeds['R']) * maxRPM;
        } else {
            rpm = (speed / maxSpeeds[gear]) * maxRPM;
        }
        speed = Math.max(speed, 0);
        rpm = Math.min(Math.max(rpm, 0), maxRPM);
    }
    updateDisplay();
    updateGaugeAngle(speed);
    updateTachometerAngle(rpm);
}

function gradualSpeedAdjustment() {
    gsa = 1;
    const targetSpeed = maxSpeeds[gear];
    if (gear === 'R') {
        if (speed > targetSpeed) {
            const reduceSpeed = setInterval(() => {
                speed -= 1;
                rpm = (speed / maxSpeeds['R']) * maxRPM;
                speed = Math.max(speed, 0);
                rpm = Math.min(Math.max(rpm, 0), maxRPM);
                updateDisplay();
                updateGaugeAngle(speed);
                updateTachometerAngle(rpm);
                if (speed <= targetSpeed) {
                    gsa = 0;
                    clearInterval(reduceSpeed);
                }
            }, 100);
        }
    } else {
        if (speed > targetSpeed) {
            const reduceSpeed = setInterval(() => {
                speed -= 1;
                rpm = (speed / maxSpeeds[gear]) * maxRPM;
                speed = Math.max(speed, 0);
                rpm = Math.min(Math.max(rpm, 0), maxRPM);
                updateDisplay();
                updateGaugeAngle(speed);
                updateTachometerAngle(rpm);
                if (speed <= targetSpeed) {
                    clearInterval(reduceSpeed);
                }
            }, 100);
        }
    }
}

function neutralGearBehavior() {
    const neutralDeceleration = setInterval(() => {
        if (rpm > 0) {
            rpm -= 100;
            updateDisplay();
            updateGaugeAngle(speed);
            updateTachometerAngle(rpm);
        } else {
            clearInterval(neutralDeceleration);
        }
    }, 100);
}

function upshift() {
    if (gear === 'N') {
        gear = '1';
    } else if (gear === 'R') {
        gear = 'N';
    } else if (parseInt(gear) < 6) {
        gear = (parseInt(gear) + 1).toString();
    }
    updateDisplay();
    gradualSpeedAdjustment();
}

function downshift() {
    if (gear === '1') {
        gear = 'N';
        neutralGearBehavior();
    } else if (gear === 'N') {
        gear = 'R';
    } else if (gear !== 'R' && parseInt(gear) > 1) {
        const previousGear = gear;
        gear = (parseInt(gear) - 1).toString();

        if (maxSpeeds[gear] > 0 && maxSpeeds[previousGear] > 0) {
            rpm = (speed / maxSpeeds[gear]) * maxRPM;
            const rpmAdjustment = (maxSpeeds[previousGear] / maxSpeeds[gear]);
            rpm = Math.min(rpm * rpmAdjustment, maxRPM);
        }
    }
    updateDisplay();
    gradualSpeedAdjustment();
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && !accelerating && gear !== 'N') {
        accelerating = true;
        clearInterval(interval);
        interval = setInterval(accelerate, 100);
    }
    if (e.key === 'ArrowDown' && !braking) {
        braking = true;
        clearInterval(interval);
        interval = setInterval(brake, 100);
    }
    if (e.key === 'Shift' && e.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT) {
        upshift();
    }
    if (e.key === 'Control' && e.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT) {
        downshift();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') {
        accelerating = false;
        clearInterval(interval);
        interval = setInterval(decelerate, 100);
    }
    if (e.key === 'ArrowDown') {
        braking = false;
        clearInterval(interval);
    }
});
