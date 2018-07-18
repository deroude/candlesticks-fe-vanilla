const SVG_NS = "http://www.w3.org/2000/svg";
/**
 * Remove all children from a node
 * @param {Node} node 
 */
const clear = (node) => {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

/**
 * 
 * @param {Node} parent the parent node
 * @param {DataBatch} d the data point to represent 
 * @param {number} i the index (order) of the data point
 * @param {DataBatch=>number} highFn function to calculate the high point
 * @param {DataBatch=>number} lowFn function to calculate the low point
 * @param {DataBatch=>string} labelFn function to render the X axis label
 * @param {DataBatch=>string} detailFn function to render the hover detail
 * @callback clickFn function to be called with the DataBatch argument, when a candlestick is clicked
 */
const addCandlestickNode = (parent, d, i, highFn, lowFn, labelFn, detailFn, clickFn) => {
    //Rectangle with the candlestick body
    let candleStick = document.createElementNS(SVG_NS, "rect");
    candleStick.setAttributeNS(null, "x", 30 * (i + 1));
    candleStick.setAttributeNS(null, "y", 40 + 2 * lowFn(d));
    candleStick.setAttributeNS(null, "width", 20);
    candleStick.setAttributeNS(null, "height", 40 + 2 * highFn(d));
    candleStick.setAttributeNS(null, "class", "stick");
    candleStick.setAttributeNS(null, "id", "stick" + i);
    candleStick.addEventListener("click", ev => clickFn(d));
    //Transition to be executed on hover, changes candlestick color
    let colorTransition = document.createElementNS(SVG_NS, "set");
    colorTransition.setAttributeNS(null, "attributeName", "fill");
    colorTransition.setAttributeNS(null, "from", "#E3AE57");
    colorTransition.setAttributeNS(null, "to", "#DC3D24");
    colorTransition.setAttributeNS(null, "begin", "mouseover");
    colorTransition.setAttributeNS(null, "end", "mouseleave");
    candleStick.appendChild(colorTransition);
    parent.appendChild(candleStick);
    //X axis text
    let text = document.createElementNS(SVG_NS, "text");
    text.setAttributeNS(null, "x", 30 * (i + 1));
    text.setAttributeNS(null, "y", 300);
    text.setAttributeNS(null, "class", "label");
    text.setAttributeNS(null, "transform", 'rotate(60,' + (30 * (i + 1)) + ',300)');
    text.textContent = labelFn(d);
    parent.appendChild(text);
    //Text and rectangle background of the hover detail
    let hint = document.createElementNS(SVG_NS, "g");
    hint.setAttributeNS(null, "id", "hint");
    hint.setAttributeNS(null, "visibility", "hidden");
    //the transition depends on the corresponding candlestick
    let transition = document.createElementNS(SVG_NS, "set");
    transition.setAttributeNS(null, "attributeName", "visibility");
    transition.setAttributeNS(null, "from", "hidden");
    transition.setAttributeNS(null, "to", "visible");
    transition.setAttributeNS(null, "begin", "stick" + i + ".mouseover");
    transition.setAttributeNS(null, "end", "stick" + i + ".mouseleave");
    hint.appendChild(transition);
    let hintText = document.createElementNS(SVG_NS, "text");
    hintText.setAttributeNS(null, "x", 20 + 30 * (i + 1));
    hintText.setAttributeNS(null, "y", 15);
    hintText.setAttributeNS(null, "id", "hint-text");
    hintText.textContent = detailFn(d);
    let hintRect = document.createElementNS(SVG_NS, "rect");
    hintRect.setAttributeNS(null, "x", 30 * (i + 1));
    hintRect.setAttributeNS(null, "y", -10);
    hintRect.setAttributeNS(null, "width", 400);
    hintRect.setAttributeNS(null, "height", 40);
    hintRect.setAttributeNS(null, "id", "hint-rect");
    hint.appendChild(hintRect);
    hint.appendChild(hintText);
    parent.appendChild(hint);
}

/**
 * The function that creates a new Candlestick Chart. Returns an object containing the provided options, to preserve chaining.
 * @param {Node} parent the parent node
 * @param {DataBatch} d the data point to represent 
 * @param {number} i the index (order) of the data point
 * @param {DataBatch=>number} highFn function to calculate the high point
 * @param {DataBatch=>number} lowFn function to calculate the low point
 * @param {DataBatch=>string} labelFn function to render the X axis label
 * @param {DataBatch=>string} detailFn function to render the hover detail
 * @callback clickFn function to be called with the DataBatch argument, when a candlestick is clicked
 * 
 */
export const createChart = (elSelector, highFn, lowFn, labelFn, detailFn, clickFn) => {
    document.querySelector(elSelector).innerHTML = `<svg id="candlestick-chart" preserveAspectRatio='xMinYMax meet' viewBox='0 -100 960 550'>
        <marker id='arrow' viewBox='0 0 10 10' refX='5' refY='5' stroke='white' fill='white' markerWidth='6' markerHeight='6' orient='auto-start-reverse'>
            <path d='M 0 0 L 10 5 L 0 10 z' />
        </marker>
        <polyline points='10,10 10,290 940,290' fill='none' stroke='white' stroke-width='2' marker-start='url(#arrow)'
            marker-end='url(#arrow)' />
            <g id='candlesticks'></g>
    </svg>`;
    return { highFn, lowFn, labelFn, detailFn, clickFn };
}

/**
 * The function that is called to update the data in the candlestick chart.
 * Called with the new data set and the options retunrned by the {createChart} function.
 */
export const updateChart = (data, { highFn, lowFn, labelFn, detailFn, clickFn }) => {
    let svg = document.querySelector("#candlestick-chart");
    svg.setAttributeNS(null, "viewBox", "0 -100 " + (30 * data.length + 50) + " 550")
    let axes = document.querySelector("#candlestick-chart polyline");
    axes.setAttributeNS(null, "points", "10,10 10,290 " + (30 * data.length + 30) + ",290");
    let svgG = document.getElementById("candlesticks");
    clear(svgG);
    for (var i = 0; i < data.length; i++) {
        addCandlestickNode(svgG, data[i], i, highFn, lowFn, labelFn, detailFn, clickFn);
    }
}