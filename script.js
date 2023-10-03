let beats = [];
let lastBeatTime = null;

const maxRecordsLength = 150;

function recordBeat(event) {
    event.preventDefault();
    let heart = document.getElementById('heart');
    heart.classList.add('beat');
    setTimeout(() => heart.classList.remove('beat'), 100);  // Reset animation

    let currentTime = new Date().getTime();
    if (lastBeatTime !== null) {
        let interval = currentTime - lastBeatTime;  // Milliseconds between beats
        beats.push(60000 / interval);  // Convert to beats per minute
    }
    lastBeatTime = currentTime;

    updateResults();
}

function updateResults() {
    let total = beats.reduce((sum, beat) => sum + beat, 0);
    if (beats.length < 1) return;
    let averageAll = total / beats.length;
    let lastFive = beats.slice(-5);
    let totalLastFive = lastFive.reduce((sum, beat) => sum + beat, 0);
    let averageLastFive = totalLastFive / lastFive.length;

    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        Среднее за все время: <b>${averageAll.toFixed(0)}</b> уд/мин<br>
        Среднее за последние 5 ударов: <b>${averageLastFive.toFixed(0)}</b> уд/мин
    `;

    updateChart();
}

let heartRateChart = null;

function createChart() {
    const ctx = document.getElementById('heartRateChart').getContext('2d');
    heartRateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: maxRecordsLength }, (_, i) => i + 1),
            datasets: [
                {
                    label: 'Среднее значение',
                    data: [],
                    borderColor: 'rgb(30,67,138)',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'Среднее за последние 5 ударов',
                    data: [],
                    borderColor: 'rgb(255,26,43)',
                    borderWidth: 3,
                    fill: false,
                    pointRadius: 0
                }, {
                    label: 'Удары',
                    data: [],
                    borderColor: 'rgb(215,158,158)',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Удары'
                    }
                },
                y: {
                    min: 100,
                    max: 200,
                    title: {
                        display: true,
                        text: 'ЧСС (уд/мин)'
                    }
                }
            },
            plugins: {
                legend: {
                    onClick: null,
                }
            }
        }
    });
}

function updateChart() {
    if (!heartRateChart) {
        createChart();
    }

    const averageAll = beats.length ? beats.reduce((sum, beat) => sum + beat, 0) / beats.length : null;
    const lastFive = beats.slice(-5);
    const averageLastFive = lastFive.length ? lastFive.reduce((sum, beat) => sum + beat, 0) / lastFive.length : null;

    heartRateChart.data.datasets[0].data.push(averageAll);
    heartRateChart.data.datasets[1].data.push(averageLastFive);
    heartRateChart.data.datasets[2].data.push(beats.at(-1));

    // Если количество точек превышает maxRecordsLength, удалите первую точку из каждого набора данных и массива меток.
    if (heartRateChart.data.datasets[0].data.length > maxRecordsLength) {
        heartRateChart.data.labels.shift();
        const lastValue = heartRateChart.data.labels.at(-1);
        heartRateChart.data.labels.push(lastValue+1);
        heartRateChart.data.datasets.forEach(dataset => {
            dataset.data.shift();
        });
    }

    heartRateChart.update();
}
