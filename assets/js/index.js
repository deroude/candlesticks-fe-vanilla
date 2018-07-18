const API_ROOT = "http://localhost:3001";
const SVG_NS = "http://www.w3.org/2000/svg"

let pollInterval = 2000;
let windowSize = 20;
let candlestickWindow = [];

const low = (d) => d.data.reduce((p, c) => p.value < c.value ? p : c, { type: 1, value: 100 }).value;
const high = (d) => d.data.reduce((p, c) => p.value > c.value ? p : c, { type: 1, value: 0 }).value - low(d);

const clear = (node) => {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

const addCandlestickNode = (parent, d, i) => {
    let candleStick = document.createElementNS(SVG_NS, "rect");
    candleStick.setAttributeNS(null, "x", 30 * (i + 1));
    candleStick.setAttributeNS(null, "y", 40 + 2 * d.low);
    candleStick.setAttributeNS(null, "width", 20);
    candleStick.setAttributeNS(null, "height", 40 + 2 * d.high);
    candleStick.setAttributeNS(null, "class", "stick");
    parent.appendChild(candleStick);
    let text = document.createElementNS(SVG_NS, "text");
    text.setAttributeNS(null, "x", 30 * (i + 1));
    text.setAttributeNS(null, "y", 300);
    text.setAttributeNS(null, "class", "label");
    text.setAttributeNS(null, "transform", 'rotate(60,' + (30 * (i + 1)) + ',300)');
    text.textContent = new Date(d.date).toISOString().slice(11,19);
    parent.appendChild(text);
}

const refresh = () => {
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
            let svgG = document.getElementById("candlesticks");
            clear(svgG);
            for (var i = 0; i < candlestickWindow.length; i++) {
                addCandlestickNode(svgG,candlestickWindow[i],i);
            }
        });
    setTimeout(refresh, pollInterval);
}

const setParams = () => {
    let newPollInterval = Number(document.getElementById("pollInterval").value);
    if (newPollInterval < 10000 && newPollInterval > 100) pollInterval = newPollInterval;
    let newWindowSize = Number(document.getElementById("windowSize").value);
    if (newWindowSize < 10000 && newWindowSize > 100) windowSize = newWindowSize;
}

document.addEventListener("DOMContentLoaded", (ev) => refresh());