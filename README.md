# Candlestick solution

## Client Side

### Usage

```
npm install
npm start
```

The application will be served at `http://localhost:3002` 

### Requirements

The interface should:
- contain the following buttons:
    - start - will start the "recording" of data
    - stop - will stop the recording of data
    - reset - will stop the recording and clear all previous saved sets of data
- contain a chart that is similar to the candlestick chart.
- Each set of data will be represented by a "candle" without the "high" and "low" lines,
where "open" and "close" points of the candle are represented by the lowest and highest value in the set of data.
- The Y axis of the chart is represented by the "volume" of the set of data
- on the Y axis of the chart, the ratio will be 1(as a value) = 2px (exp: 50 (value) = 100px (height))
So if one set of data will have the lowest number in it 50 and the highest 100, the candle will start from the position (50*2)px and will end at position (100*2)px in your chart
the height of the candlestick being of (100-50)*2 | (high-low)*2px = 100px
- Each candle stick should have the timestamp displayed in nice way, that integrates in the design.
- The X axis of the chart represents the # of the set of data (newest one will always be in the left side of the chart)
- Each new set of data will be inserted in the left side of the chart and the oldest set of data will move to the right of the chart (think of a First In First Out stack of data)
- The chart will update with each new set of data
- The page and chart should be responsive

Bonus
- The interval at which the data is coming can be changed by the user (EXP: change it to 20s or 40s)
- When hovering over a set of data the user can see the percentage of the types of data contained by the set
- When clicking on set of data, the user can see the content of the set, based on the "type" property of each "value"
- In a section called "statistics" of the interface, calculate the most common value in all of the available sets of data
- Using the delayed version of the endpoint, make sure the candlesticks are rendered in the correct order

### Implementation notes:

The page is served from a Node.js server (express.js). There is no dependency upon it though.
No additional library is brought in.
Responsivity is provided via the `<meta name="viewport" content="width=device-width, initial-scale=1">` tag, as well as via the media queries (only 2 stages) in the main stylesheet.
The pixel size requested for the value (2px for 1 unit) is relative, as the SVG will scale to provide better experience.