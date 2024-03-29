// This script will convert a table of ohm -> temp values to a table of voltage
// -> temp values with the voltage intervals of your choice.
//
// Use a filename from ohms-table/ dir as the first argument
//
// $ node nsx/sensors/temp-volts-table.js rife-iat-lo-at

const path = require('path')
const yargs = require('yargs')
const { round, interpolate } = require('../scripts/common')

const argv = yargs
  .usage('Usage: $0 ohms-scale')
  .demandCommand(1).argv
const [ohmsScale] = argv._

const sensorOhmsToTemp = require(path.join(__dirname, 'ohms-scales', ohmsScale+'.js'))

// Voltage columns are from AEM ECUs
const ecuVoltageColumns = [
  0,
  0.16,
  0.31,
  0.47,
  0.62,
  0.78,
  0.94,
  1.09,
  1.25,
  1.40,
  1.56,
  1.72,
  1.87,
  2.03,
  2.18,
  2.34,
  2.50,
  2.65,
  2.81,
  2.96,
  3.12,
  3.28,
  3.43,
  3.59,
  3.74,
  3.90,
  4.06,
  4.21,
  4.37,
  4.52,
  4.68,
  4.84,
  4.99
]
const refVoltage = 5

const internalPullupResistorValue = 100000 // 100k builtin
const pullupResistorValue = 2200 // 100k builtin
// const pullupResistorValue = 2275 // 2.2 * 1000 // measured
// const pullupResistorValue = 2.2 * 1000 // 2.2 * 1000

// Measured pullup resistor: ~2275 ohms. within 2% of 2.2k rating
//
// I hooked up a measured 1k resistor to the IAT connector, it flickered between
// 1.544v and 1.512v
//
// measuredV = refVoltage * ohms / (ohms + pullupResistorValue)
// pullupResistorValue = (refVoltage * ohms / measuredV) - ohms
//
// 1.544v (125; 2238), 1.528v (126; 2272), 1.512v (127; 2306)

function getIdealExternalPullup (desiredResistance, internalPullupResistorValue) {
  return 1/(1/desiredResistance - 1/internalPullupResistorValue)
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

console.log(`Ideal internal resistor to reach 2200:`, getIdealExternalPullup(2200, internalPullupResistorValue))
console.log(`Ideal internal resistor to reach 1000:`, getIdealExternalPullup(1000, internalPullupResistorValue))

// # Some output
//
// Rife sensor
//
// The max temp on the ECU is only 261, so everything after .78:244deg is
// technically wrong, but set so I can see there is a change. Anything logged
// over 244 or 248 is HOT
//
// [
//   [ 0, 335 ],       table: 261 (max)
//   [ 0.16, 335 ],    table: 261 (max)
//   [ 0.31, 323.95 ], table: 257
//   [ 0.47, 286.68 ], table: 253
//   [ 0.62, 263.27 ], table: 248
//   [ 0.78, 244.3 ],
//   [ 0.94, 229.09 ],
//   [ 1.09, 217.05 ],
//   [ 1.25, 205.79 ],
//   [ 1.4, 196.35 ],
//   [ 1.56, 187.2 ],
//   [ 1.72, 178.85 ],
//   [ 1.87, 171.56 ],
//   [ 2.03, 164.09 ],
//   [ 2.18, 157.46 ],
//   [ 2.34, 150.67 ],
//   [ 2.5, 144.02 ],
//   [ 2.65, 138 ],
//   [ 2.81, 131.59 ],
//   [ 2.96, 125.64 ],
//   [ 3.12, 119.26 ],
//   [ 3.28, 112.83 ],
//   [ 3.43, 106.62 ],
//   [ 3.59, 99.91 ],
//   [ 3.74, 93.17 ],
//   [ 3.9, 85.67 ],
//   [ 4.06, 77.69 ],
//   [ 4.21, 69.23 ],
//   [ 4.37, 59.06 ],
//   [ 4.52, 47.79 ],
//   [ 4.68, 32.49 ],
//   [ 4.84, 8.89 ],
//   [ 4.99, -10 ]
// ]

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
