// Finds an equation that closely follows a volts -> temp scale. It will output
// several equations with the % error at each step table
//
// Usage:
// $ node nsx/sensors/temp-sensor-equation.js

const regression = require('regression')
const { round } = require('../scripts/common')

// Data: [Voltage, output (temp)]

// 2200ohm rife liquid temp
// const data = [
//   [ 0.46578730420445175, 290 ],
//   [ 0.522995522995523, 280 ],
//   [ 0.5894145950280674, 270 ],
//   [ 0.6624605678233438, 260 ],
//   [ 0.7479706223424817, 250 ],
//   [ 0.8443520967132603, 240 ],
//   [ 0.9543949981610886, 230 ],
//   [ 1.0770328102710414, 220 ],
//   [ 1.216030271757826, 210 ],
//   [ 1.3720316622691293, 200 ],
//   [ 1.5441407477222746, 190 ],
//   [ 1.732996732996733, 180 ],
//   [ 1.9401947148817802, 170 ],
//   [ 2.161290322580645, 160 ],
//   [ 2.396449704142012, 150 ],
//   [ 2.6410036457216384, 140 ],
//   [ 2.8911042944785277, 130 ],
//   [ 3.141263940520446, 120 ],
//   [ 3.3866236432971544, 110 ],
//   [ 3.621726600676607, 100 ],
//   [ 3.841495523959979, 90 ],
//   [ 4.042395751719335, 80 ],
//   [ 4.221459409724679, 70 ],
//   [ 4.3775816216827925, 60 ],
//   [ 4.510545519266708, 50 ],
//   [ 4.621407675098951, 40 ],
//   [ 4.711913678862321, 30 ],
//   [ 4.78433064073406, 20 ],
//   [ 4.841175876059429, 10 ],
//   [ 4.884967320261438, 0 ],
// ]


// 2150 ohm pullup rife liquid temp
// const data = [
//   [ 0.47558922558922556, 290 ],
//   [ 0.5338595762359784, 280 ],
//   [ 0.6014729950900164, 270 ],
//   [ 0.6757843925985519, 260 ],
//   [ 0.7627118644067796, 250 ],
//   [ 0.8606083943011167, 240 ],
//   [ 0.9722742600224803, 230 ],
//   [ 1.0965867828612927, 220 ],
//   [ 1.2373118655932798, 210 ],
//   [ 1.3950368879946344, 200 ],
//   [ 1.5687839131822534, 190 ],
//   [ 1.759119686463672, 180 ],
//   [ 1.9675599435825106, 170 ],
//   [ 2.189542483660131, 160 ],
//   [ 2.4251497005988023, 150 ],
//   [ 2.669629308476046, 140 ],
//   [ 2.91908633372048, 130 ],
//   [ 3.1680299931833673, 120 ],
//   [ 3.4116430260047284, 110 ],
//   [ 3.6445593241709746, 100 ],
//   [ 3.861831656961355, 90 ],
//   [ 4.0600681997027195, 80 ],
//   [ 4.236451452517935, 70 ],
//   [ 4.390001702320831, 60 ],
//   [ 4.520602925437032, 50 ],
//   [ 4.629374245819686, 40 ],
//   [ 4.718091941363124, 30 ],
//   [ 4.789025395454724, 20 ],
//   [ 4.844673380629687, 10 ],
//   [ 4.8875228877844625, 0 ],
// ]

// Rife lo-at air temp sensor ohms to temp
const data = [
  // [ 132, 335 ],
  // [ 157, 320 ],
  // [ 178, 309 ],
  // [ 204, 298 ],
  // [ 235, 287 ],
  // [ 271, 276 ],
  // [ 314, 265 ],
  // [ 366, 254 ],
  // [ 428, 243 ],
  // [ 503, 232 ],
  // [ 595, 221 ],
  // [ 707, 210 ],
  // [ 845, 199 ],
  // [ 1017, 188 ],
  // [ 1231, 177 ],
  // [ 1500, 166 ],
  // [ 1840, 155 ],
  // [ 2276, 144 ],
  // [ 2836, 133 ],
  // [ 3564, 122 ],
  // [ 4518, 111 ],
  // [ 5781, 100 ],
  // [ 7471, 89 ],
  // [ 9756, 78 ],
  // [ 12884, 67 ],
  // [ 17218, 56 ],
  // [ 23302, 45 ],
  // [ 31963, 34 ],
  // [ 44481, 23 ],
  // // [ 62863, 12 ],

  // [ 0.0132, 335 ],
  // [ 0.0157, 320 ],
  // [ 0.0178, 309 ],
  // [ 0.0204, 298 ],
  // [ 0.0235, 287 ],
  // [ 0.0271, 276 ],
  // [ 0.0314, 265 ],
  // [ 0.0366, 254 ],
  // [ 0.0428, 243 ],
  // [ 0.0503, 232 ],
  // [ 0.0595, 221 ],
  // [ 0.0707, 210 ],
  // [ 0.0845, 199 ],
  // [ 0.1017, 188 ],
  // [ 0.1231, 177 ],
  [ 0.1500, 166 ],
  [ 0.1840, 155 ],
  [ 0.2276, 144 ],
  [ 0.2836, 133 ],
  [ 0.3564, 122 ],
  [ 0.4518, 111 ],
  [ 0.5781, 100 ],
  [ 0.7471, 89 ],
  [ 0.9756, 78 ],
  [ 1.2884, 67 ],
  [ 1.7218, 56 ],
  [ 2.3302, 45 ],
  // [ 3.1963, 34 ],
  // [ 4.4481, 23 ],
  // [ 62.863, 12 ],


  // [0.0141, 329],
  // [0.0203, 298],
  // [0.0302, 268],
  // [0.0463, 238],
  // Below this gives an accurate result
  // [0.0738, 207],
  // [0.1231, 177],
  // [0.2160, 147],
  // [0.4022, 116],
  // [0.8026, 86],
  // [1.7373, 56],
  // [4.1418, 25],

  // Need to
  // -124.0753987844x^5 + 921.2686839571x^4 + -2118.8182289133x^3 + 1983.4728945956x^2 + -868.6808763587x + 259.9668809332

]

function getError (result) {
  const errorArray = []
  const points = result.points
  for (var i = 0; i < points.length; i++) {
    const equationPoint = points[i]
    const realValue = data[i][1]
    const equationValue = round(equationPoint[1], 0)
    const error = round((equationValue - realValue) * 100 / realValue, 2)
    errorArray.push({
      x: equationPoint[0],
      equationValue,
      realValue,
      error: error + '%'
    })
  }
  return errorArray
}

const linearResult = regression.linear(data)
console.log('linearResult')
console.log(linearResult.string)
console.log(getError(linearResult))

// const logarithmicResult = regression.logarithmic(data)
// console.log('logarithmicResult', getError(logarithmicResult))

const polynomialResult3 = regression.polynomial(data, {order: 3, precision: 10})
console.log('polynomialResult3')
console.log(polynomialResult3.string)
console.log(getError(polynomialResult3))

const polynomialResult4 = regression.polynomial(data, {order: 4, precision: 10})
console.log('polynomialResult4')
console.log(polynomialResult4.string)
console.log(getError(polynomialResult4))

const polynomialResult5 = regression.polynomial(data, {order: 5, precision: 10})
console.log('polynomialResult5')
console.log(polynomialResult5.string)
console.log(getError(polynomialResult5))
