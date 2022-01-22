const regression = require('regression')
const {round} = require('./common')

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
const data = [
  [ 0.47558922558922556, 290 ],
  [ 0.5338595762359784, 280 ],
  [ 0.6014729950900164, 270 ],
  [ 0.6757843925985519, 260 ],
  [ 0.7627118644067796, 250 ],
  [ 0.8606083943011167, 240 ],
  [ 0.9722742600224803, 230 ],
  [ 1.0965867828612927, 220 ],
  [ 1.2373118655932798, 210 ],
  [ 1.3950368879946344, 200 ],
  [ 1.5687839131822534, 190 ],
  [ 1.759119686463672, 180 ],
  [ 1.9675599435825106, 170 ],
  [ 2.189542483660131, 160 ],
  [ 2.4251497005988023, 150 ],
  [ 2.669629308476046, 140 ],
  [ 2.91908633372048, 130 ],
  [ 3.1680299931833673, 120 ],
  [ 3.4116430260047284, 110 ],
  [ 3.6445593241709746, 100 ],
  [ 3.861831656961355, 90 ],
  [ 4.0600681997027195, 80 ],
  [ 4.236451452517935, 70 ],
  [ 4.390001702320831, 60 ],
  [ 4.520602925437032, 50 ],
  [ 4.629374245819686, 40 ],
  [ 4.718091941363124, 30 ],
  [ 4.789025395454724, 20 ],
  [ 4.844673380629687, 10 ],
  [ 4.8875228877844625, 0 ],
]

function getError (result) {
  const errorArray = []
  const points = result.points
  for (var i = 0; i < points.length; i++) {
    const equationPoint = points[i]
    const realValue = data[i][1]
    const equationValue = equationPoint[1]
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

const polynomialResult3 = regression.polynomial(data, {order: 3})
console.log('polynomialResult3')
console.log(polynomialResult3.string)
console.log(getError(polynomialResult3))

const polynomialResult4 = regression.polynomial(data, {order: 4})
console.log('polynomialResult4')
console.log(polynomialResult4.string)
console.log(getError(polynomialResult4))

const polynomialResult5 = regression.polynomial(data, {order: 5, precision: 4})
console.log('polynomialResult5')
console.log(polynomialResult5.string)
console.log(getError(polynomialResult5))
