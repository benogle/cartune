// How to run this. At project root
// node nsx/steering-ratio/gen-changes.js <newRatioOnCenter>
//
// e.g.
// node nsx/steering-ratio/gen-changes.js 15.5

// Rack gain: 38.5mm / rev
// Half rack travel: 46.7mm (full travel is then 2x, so 93.4mm)
// Turns lock to lock: 2.426 (93.4 / 38.5)

const newRatio = parseFloat(process.argv[2])

const totalTravel = 120.5
const currentGain = 40
const currentLockToLock = totalTravel / currentGain
const inputAngles = [
  15, 30, 45, 60, 90, 100, 120, 180, 225
]

const ratioCenter = 18.2
const ratioEnd = 18.2

function round (val, places) {
  return +(Math.round(val + "e+" + places)  + "e-" + places);
}

function getNewAngle (angle, newGain) {
  // const rackMovement = angle / 360 * currentGain
  // return rackMovement / newGain * 360
  // Algebra'd down to:
  return angle * currentGain / newGain
}

function getRadius (gain) {
  return gain / (2 * Math.PI)
}

function getNewTorqueFactor (newGain) {
  // https://www.linearmotiontips.com/how-to-size-a-rack-and-pinion-drive/
  // T = Fr * radius; force is the same for a given input
  // Algebra to get the radius(new) / radius(current)
  // Though it turns out this is effectively `newGain / currentGain` cause the radius junk cancels
  const currentRadius = getRadius(currentGain)
  const newRadius = getRadius(newGain)
  return newRadius / currentRadius
}

function getTorqueChangePercent (newGain) {
  const factor = getNewTorqueFactor(newGain)
  return (factor - 1) * 100
}

function getNewRatioMeta (newGain) {
  const lockToLock = totalTravel / newGain
  const factorChange = currentGain / newGain
  const newRatioCenter = ratioCenter * factorChange
  const newRatioEnd = ratioEnd * factorChange
  return {
    torqueChangePercent: round(getTorqueChangePercent(newGain), 1),
    lockToLock: round(lockToLock, 2),
    ratioEnd: round(newRatioEnd, 1),
    ratioCenter: round(newRatioCenter, 1)
  }
}

function generateDifferences (newGain) {
  const {
    torqueChangePercent,
    lockToLock,
    ratioEnd,
    ratioCenter
  } = getNewRatioMeta(newGain)

  console.log(`Ratio: center ${ratioCenter}:1 - end ${ratioEnd}:1`)
  console.log(`Gain: ${round(newGain, 2)}mm/rev (current ${currentGain})`)
  console.log(`Torque increase: ${torqueChangePercent}%`)
  console.log(`LTL: ${lockToLock} (current ${round(currentLockToLock, 2)})`)

  console.log('Angles:')
  for (let angle of inputAngles) {
    console.log(angle, '->', round(getNewAngle(angle, newGain), 1))
  }
}

function generateDifferencesFromNewRatio (newRatioCenter) {
  const newGain = ratioCenter / newRatioCenter * currentGain
  generateDifferences(newGain)
}

generateDifferencesFromNewRatio(newRatio)
