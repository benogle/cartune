// This script will convert a table of ohm -> temp values to a table of voltage
// -> temp values with the voltage intervals of your choice.

const { round } = require('./common')

const ecuVoltageColumns = [0, 0.16, 0.31, 0.47, 0.62, 0.78, 0.94, 1.09, 1.25, 1.40, 1.56, 1.72, 1.87, 2.03, 2.18, 2.34, 2.50, 2.65, 2.81, 2.96, 3.12, 3.28, 3.43, 3.59, 3.74, 3.90, 4.06, 4.21, 4.37, 4.52, 4.68, 4.84, 4.99]
const refVoltage = 5
const pullupResistorValue = 2275 // 2.2 * 1000

// Measured pullup resistor: ~2275 ohms. within 2% of 2.2k rating
//
// I hooked up a measured 1k resistor to the IAT connector, it flickered between
// 1.544v and 1.512v
//
// measuredV = refVoltage * ohms / (ohms + pullupResistorValue)
// pullupResistorValue = (refVoltage * ohms / measuredV) - ohms
//
// 1.544v (125; 2238), 1.528v (126; 2272), 1.512v (127; 2306)

// Measured on brand new Honda IAT sensor part number 37880-P05-A00
const sensorOhmsToTemp = [
  // From the internet scale
  [250000, -11],
  [12000, -4], // -4
  [6205, 32], // 0
  [3920, 50], // 10

  // From measurement
  [4100, 50],
  [3570, 55],
  [3100, 61],
  [2950, 63],
  [2880, 64],
  [2480, 71],
  [2320, 73],
  [2100, 77],
  [1965, 80],
  [1937, 81],
  [1900, 82],
  [1650, 88],
  [1400, 95],
  [1250, 100],
  [1200, 102],
  [1185, 103],
  [1060, 107],
  [1050, 108],
  [895, 115],
  [810, 120],
  [720, 126],
  [660, 130],
  [585, 136],
  [520, 142],
  [455, 149],
  [405, 155],
  [372, 160],
  [328, 167],
  [300, 172],
  [284, 175],
  [261, 180],
  [235, 186],
  [221, 190], // 14, 4: 3.5
  [210, 193], // 11, 3: 3.6
  // [200, 197], // 10, 4: 2.5
  [193, 199], // 7,  2: 3.5
  // [180, 202], // 20, 5: 4
  [175, 204], // 5,  2: 2.5
  [162, 209], // 13, 5: 2.6
  [158, 212], // 4,  3: 1.3 ohms per deg 

  // From the internet as the rest is close and I couldnt meausre over 212
  [121, 230],
  [95, 248],
  [60, 284],
]

// ohms -> temp F
// From the internet: https://www.s2ki.com/forums/s2000-engine-management-231/infinity-coolant-temp-calibration-1133402/#post23752472
// const sensorOhmsToTemp = [
//   [12000, -4], // -4
//   [6205, 32], // 0
//   [3920, 50], // 10
//   [2454, 68], // 20
//   [1604, 86], // 30
//   [1072, 104], // 40
//   [738, 122], // 50
//   [535, 140], // 60
//   [387, 158], // 70
//   [284, 176], // 80
//   [210, 194], // 90
//   [159, 212], // 100
//   [121, 230], // 110
//   [95, 248], // 120
//   [75, 266], // 130
//   [60, 284], // 140
// ]

// From infinity cal table: honda IAT 1990-2001
// const sensorOhmsToTemp = [
//   [250000, -11],
//   [21267, -4],
//   [9533, 10],
//   [6600, 21],
//   [4840, 34],
//   [3667, 45],
//   [2829, 55],
//   [2200, 66],
//   [1711, 77],
//   [1320, 90],
//   [1000, 104],
//   [733, 124],
//   [508, 149],
//   [314, 183],
//   [147, 230],
//   [0, 263],
// ]

// Infinity cal: NSX ECT
// const sensorOhmsToTemp = [
//   [250000, -9],
//   [21267, -4],
//   [9533, 14],
//   [6600, 25],
//   [4840, 36],
//   [3667, 46],
//   [2829, 57],
//   [2200, 68],
//   [1711, 79],
//   [1320, 90],
//   [1000, 104],
//   [733, 122],
//   [508, 149],
//   [314, 181],
//   [147, 226],
//   [0, 263],
// ]

// Rough; Based on the chart in the manual
// const sensorOhmsToTemp = [
//   [12000, -4],
//   [5000, 32],
//   [2000, 68],
//   [1200, 104],
//   [700, 140],
//   [400, 176],
//   [200, 212],
//   [100, 248],
//   [75, 266],
//   [60, 284],
// ]

// Will find min & max columns based on `value` at table row index 0 to linear
// interpolate values at table row index 1.
//
// Table must be sorted by index 0.
// e.g.
// value = 0.62
// table = [
//   [ 0.13, 284 ],
//   [ 0.16, 266 ],
//   [ 0.21, 248 ],
//   [ 0.26, 230 ],
//   [ 0.34, 212 ],
//   [ 0.44, 194 ],
//   [ 0.57, 176 ],
//   [ 0.75, 158 ],
//   [ 0.98, 140 ],
//   [ 1.26, 122 ],
//   [ 1.64, 104 ],
//   [ 2.11, 86 ],
//   [ 2.64, 68 ],
//   [ 3.2, 50 ],
//   [ 3.69, 32 ],
//   [ 4.23, -4 ]
// ]
// Returns 171.06
function interpolate (value, table) {
  const tableLen = table.length
  if (value <= table[0][0]) return table[0][1]
  else if (value > table[tableLen - 1][0]) return table[tableLen - 1][1]

  let minItem = null
  let maxItem = null
  for (let i = 0; i < tableLen; i++) {
    const item = table[i]
    const [refValue] = item
    if (refValue >= value) {
      maxItem = item
      minItem = table[i - 1]
      break
    }
  }

  const [minValue, minResult] = minItem
  const [maxValue, maxResult] = maxItem

  const percentOfRange = (value - minValue) / (maxValue - minValue)
  return percentOfRange * (maxResult - minResult) + minResult
}

function getSensorVoltage (ohms) {
  return refVoltage * ohms / (ohms + pullupResistorValue)
}

const sensorTable = sensorOhmsToTemp.map(([ohms, temp]) => (
  [getSensorVoltage(ohms), temp, ohms]
))
sensorTable.sort((a, b) => a[0] - b[0])

const ecuTable = ecuVoltageColumns.map((volts) => (
  [volts, round(interpolate(volts, sensorTable), 2)]
))

console.log(sensorTable)
console.log(ecuTable)
console.log(ecuTable.length)

// From measurement with 2.2k rated pullup
// [
//   [ 0, 284 ],
//   [ 0.16, 270.78 ],
//   [ 0.31, 218.06 ]
//   [ 0.47, 187.92 ],
//   [ 0.62, 169.95 ],
//   [ 0.78, 154.8 ],
//   [ 0.94, 143.12 ],
//   [ 1.09, 133.7 ],
//   [ 1.25, 125.09 ],
//   [ 1.4, 117.29 ],
//   [ 1.56, 110.29 ],
//   [ 1.72, 103.97 ],
//   [ 1.87, 97.8 ],
//   [ 2.03, 91.98 ],
//   [ 2.18, 86.72 ],
//   [ 2.34, 81.04 ],
//   [ 2.5, 75.13 ],
//   [ 2.65, 70.98 ],
//   [ 2.81, 64.93 ],
//   [ 2.96, 59.74 ],
//   [ 3.12, 54.18 ],
//   [ 3.28, 48.69 ],
//   [ 3.43, 42.75 ],
//   [ 3.59, 36.17 ],
//   [ 3.74, 28.71 ],
//   [ 3.9, 17.93 ],
//   [ 4.06, 7.15 ],
//   [ 4.21, -2.97 ],
//   [ 4.37, -5.39 ],
//   [ 4.52, -6.82 ],
//   [ 4.68, -8.35 ],
//   [ 4.84, -9.89 ],
//   [ 4.99, -11 ]
// ]

// From measurement at 2275 measured pullup
// [
//   [ 0, 284 ],
//   [ 0.16, 268.23 ],
//   [ 0.31, 215.67 ],
//   [ 0.47, 185.76 ],
//   [ 0.62, 168.06 ],
//   [ 0.78, 153.12 ],
//   [ 0.94, 141.37 ],
//   [ 1.09, 132.03 ],
//   [ 1.25, 123.4 ],
//   [ 1.4, 115.59 ],
//   [ 1.56, 108.79 ],
//   [ 1.72, 102.47 ],
//   [ 1.87, 96.32 ],
//   [ 2.03, 90.55 ],
//   [ 2.18, 85.3 ],
//   [ 2.34, 79.17 ],
//   [ 2.5, 73.79 ],
//   [ 2.65, 69.41 ],
//   [ 2.81, 63.44 ],
//   [ 2.96, 58.31 ],
//   [ 3.12, 51.99 ],
//   [ 3.28, 47.39 ],
//   [ 3.43, 41.29 ],
//   [ 3.59, 34.79 ],
//   [ 3.74, 26.62 ],
//   [ 3.9, 16.04 ],
//   [ 4.06, 5.46 ],
//   [ 4.21, -4.06 ],
//   [ 4.37, -5.55 ],
//   [ 4.52, -6.95 ],
//   [ 4.68, -8.44 ],
//   [ 4.84, -9.93 ],
//   [ 4.99, -11 ]
// ]

// With 6205 ohms at 32F; from internet
// [
//   [0, 284],
//   [0.16, 268.71],
//   [0.31, 218.37],
//   [0.47, 189.46],
//   [0.62, 171.06],
//   [0.78, 155.49],
//   [0.94, 142.98],
//   [1.09, 132.75],
//   [1.25, 122.39],
//   [1.4, 115.22],
//   [1.56, 107.68],
//   [1.72, 100.87],
//   [1.87, 95.12],
//   [2.03, 89],
//   [2.18, 83.56],
//   [2.34, 78.1],
//   [2.5, 72.65],
//   [2.65, 67.57],
//   [2.81, 62.48],
//   [2.96, 57.71],
//   [3.12, 52.63],
//   [3.28, 47.15],
//   [3.43, 41.62],
//   [3.59, 35.73],
//   [3.74, 28.71],
//   [3.9, 17.93],
//   [4.06, 7.15],
//   [4.21, -2.97],
//   [4.37, -4],
//   [4.52, -4],
//   [4.68, -4],
//   [4.84, -4],
//   [4.99, -4]
// ]

// 90-2001 honda sensor infinity cals
// [
//   [0, 263],
//   [0.16, 246.14],
//   [0.31, 230.33],
//   [0.47, 206.32],
//   [0.62, 183.68],
//   [0.78, 166.13],
//   [0.94, 148.84],
//   [1.09, 136.8],
//   [1.25, 123.97],
//   [1.4, 114.39],
//   [1.56, 104.16],
//   [1.72, 96.94],
//   [1.87, 90.22],
//   [2.03, 83.55],
//   [2.18, 77.31],
//   [2.34, 71.63],
//   [2.5, 66],
//   [2.65, 60.72],
//   [2.81, 55.09],
//   [2.96, 50.28],
//   [3.12, 45.16],
//   [3.28, 39.55],
//   [3.43, 34.26],
//   [3.59, 27.66],
//   [3.74, 21.42],
//   [3.9, 15.72],
//   [4.06, 10.09],
//   [4.21, 5.59],
//   [4.37, 0.82],
//   [4.52, -3.66],
//   [4.68, -6.45],
//   [4.84, -9.08],
//   [4.99, -11]
// ]

// 94-97 NSX ECT infinity
// [
//   [ 0, 263 ],
//   [ 0.16, 244.1 ],
//   [ 0.31, 226.37 ],
//   [ 0.47, 203.33 ],
//   [ 0.62, 181.65 ],
//   [ 0.78, 165.13 ],
//   [ 0.94, 148.82 ],
//   [ 1.09, 135.83 ],
//   [ 1.25, 121.98 ],
//   [ 1.4, 113.35 ],
//   [ 1.56, 104.14 ],
//   [ 1.72, 96.94 ],
//   [ 1.87, 90.22 ],
//   [ 2.03, 84.54 ],
//   [ 2.18, 79.26 ],
//   [ 2.34, 73.63 ],
//   [ 2.5, 68 ],
//   [ 2.65, 62.72 ],
//   [ 2.81, 57.09 ],
//   [ 2.96, 51.81 ],
//   [ 3.12, 46.18 ],
//   [ 3.28, 41.04 ],
//   [ 3.43, 36.24 ],
//   [ 3.59, 30.63 ],
//   [ 3.74, 25.35 ],
//   [ 3.9, 19.72 ],
//   [ 4.06, 14.09 ],
//   [ 4.21, 8.34 ],
//   [ 4.37, 2.19 ],
//   [ 4.52, -3.57 ],
//   [ 4.68, -5.75 ],
//   [ 4.84, -7.63 ],
//   [ 4.99, -9 ]
// ]

// With 5k ohms at 32f
// [
//   [0, 284],
//   [0.16, 268.71],
//   [0.31, 231.27],
//   [0.47, 206.55],
//   [0.62, 191.24],
//   [0.78, 175.11],
//   [0.94, 161.95],
//   [1.09, 149.62],
//   [1.25, 137.22],
//   [1.4, 127.54],
//   [1.56, 117.21],
//   [1.72, 106.89],
//   [1.87, 97.85],
//   [2.03, 88.5],
//   [2.18, 79.74],
//   [2.34, 70.39],
//   [2.5, 64.07],
//   [2.65, 59.12],
//   [2.81, 53.85],
//   [2.96, 48.9],
//   [3.12, 43.62],
//   [3.28, 38.34],
//   [3.43, 33.39],
//   [3.59, 26.37],
//   [3.74, 19.2],
//   [3.9, 11.55],
//   [4.06, 3.9],
//   [4.21, -3.27],
//   [4.37, -4],
//   [4.52, -4],
//   [4.68, -4],
//   [4.84, -4],
//   [4.99, -4]
// ]
