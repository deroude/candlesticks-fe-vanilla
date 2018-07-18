import { createChart, updateChart } from "./candlestick.js";
const API_ROOT = "http://localhost:3001"; //Server side REST API

let pollInterval = 2000; //Default poll
let windowSize = 20; //Default window size (i.e. how many candlesticks will be drawn)
let candlestickWindow = []; //The state of the candlestick window (i.e. the data points)
let candlestickChart = null; //The options that will initialize the candlestick chart
let started = true; //The state of the application; starts with a default true, can be toggled by buttons

/**
 * Calculates the lowest value number in the batch 
 * @param {DataBatch} d 
 */
const low = (d) => d.data.reduce((p, c) => p.value < c.value ? p : c, { type: 1, value: 100 }).value;

/**
 * Calculates the highest value number in the batch 
 * @param {DataBatch} d 
 */
const high = (d) => d.data.reduce((p, c) => p.value > c.value ? p : c, { type: 1, value: 0 }).value - low(d);

/**
 * Performs scheduled update on the data from the server
 */
const refresh = () => {
    if (started) //Once registered, we follow the schedule, but we only poll if the state is "started"
        fetch(API_ROOT + "/data")
            .then((re) => re.json())
            .then((re) => {
                re.high = high(re);
                re.low = low(re)
                candlestickWindow.unshift(re);
                if (candlestickWindow.length > windowSize) {
                    candlestickWindow.pop();
                }
                candlestickWindow.sort((a, b) => Number(b.date) - Number(a.date));
                updateChart(candlestickWindow, candlestickChart);
                document.getElementById("mostFrequentValue").innerHTML = calculateMostFrequentValue();
            });
    setTimeout(refresh, pollInterval);
}
/**
 * Fill the content table with the selected data batch
 * @param {DataBatch} d 
 */
const fillTable = (d) => {
    document.querySelector("#content thead tr:first-child th").innerHTML = new Date(d.date).toISOString(); //put the full date in the first header, with colspan 3
    for (var i = 1; i <= 3; i++) document.querySelector("#content tbody tr td:nth-child(" + i + ")").innerHTML = d.data
        .filter(it => it.type === i)
        .map(it => it.value)
        .join(", "); //Populate the [3] columns with the respective joined arrays of values
}
/**
 * Calculates the most frequent value:
 * 1. merges the 'data' arrays from each {DataBatch}
 * 2. retains only the values (while this simplifies things, it's not absolutely necessary, in case one wants to retain also the type)
 * 3. sort the Object by the value (which is now the frequency), descending, then return the 1st item.
 */
const calculateMostFrequentValue = () => {
    let frequencies = [].concat.apply([], candlestickWindow.map(c => c.data))
        .map(d => d.value)
        .reduce((acc, curr) => { acc[curr] ? acc[curr]++ : acc[curr] = 1; return acc; }, {});
    return Object.keys(frequencies).sort((k1, k2) => frequencies[k2] - frequencies[k1])[0];
}

// setting up the event listeners when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", (ev) => {
    candlestickChart = createChart("#candlesticks-wrapper",
        d => d.high, d => d.low, d => new Date(d.date).toISOString().slice(11, 19),
        d => "Desktop: " + Math.floor(d.data.filter(t => t.type === 1).length / d.data.length * 100) +
            "% Mobile: " + Math.floor(d.data.filter(t => t.type === 2).length / d.data.length * 100) +
            "% Tablet: " + Math.floor(d.data.filter(t => t.type === 3).length / d.data.length * 100) + "%",
        d => fillTable(d));
    document.getElementById("start").addEventListener("click", (ev) => {
        started = true;
    })
    document.getElementById("stop").addEventListener("click", (ev) => {
        started = false;
    })
    document.getElementById("reset").addEventListener("click", (ev) => {
        candlestickWindow = [];
        updateChart(candlestickWindow, candlestickChart);
    })
    document.getElementById("updateParams").addEventListener("click", (ev) => {
        let newPollInterval = Number(document.getElementById("pollInterval").value);
        if (newPollInterval < 10000 && newPollInterval > 100) pollInterval = newPollInterval;
        let newWindowSize = Number(document.getElementById("windowSize").value);
        if (newWindowSize < 30 && newWindowSize > 5) windowSize = newWindowSize;
    })
    refresh();
}
);