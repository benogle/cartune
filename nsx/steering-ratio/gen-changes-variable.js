// How to run this. At project root
// node nsx/steering-ratio/gen-changes.js <newRatioOnCenter>
//
// e.g.
// node nsx/steering-ratio/gen-changes-variable.js 48.1

const {interpolate} = require('../scripts/common')

const newGain = parseFloat(process.argv[2])

const totalLinearTravel = 120.5
const currentLockToLock = 3.25
const currentRackPositions = [
  {deg: 0, travel: 0, gain: 40},
  {deg: 180, travel: 20, gain: 40},
  {deg: 360, travel: 38, gain: 36},
  {deg: 585, travel: 60.25, gain: 35}
]

const inputAngles = [
  15, 30, 45, 60, 90, 120, 180, 225, 270, 360, 540
]

const ratioCenter = 18.2
const ratioEnd = 20.8
// const ratioCenter = 20.8
// const ratioEnd = 18.2

function round (val, places) {
  return +(Math.round(val + "e+" + places)  + "e-" + places);
}

function getNewAngle (angle, newGain) {
  const oldAnglesToTravel = currentRackPositions.map(({deg, travel}) => [deg, travel])
  const oldTravel = interpolate(angle, oldAnglesToTravel)
  return oldTravel / newGain * 360
}

function getRadius (gain) {
  return gain / (2 * Math.PI)
}

function getNewTorqueFactor (angle, newGain) {
  // https://www.linearmotiontips.com/how-to-size-a-rack-and-pinion-drive/
  // T = Fr * radius; force is the same for a given input
  // Algebra to get the radius(new) / radius(current)
  // Though it turns out this is effectively `newGain / currentGain` cause the radius junk cancels
  const oldDegToGain = currentRackPositions.map(({deg, gain}) => [deg, gain])
  const oldGain = interpolate(angle, oldDegToGain)
  const currentRadius = getRadius(oldGain)
  const newRadius = getRadius(newGain)
  return newRadius / currentRadius
}

function getTorqueChangePercent (angle, newGain) {
  const factor = getNewTorqueFactor(angle, newGain)
  return (factor - 1) * 100
}

function getNewRatio (newGain) {
  const oldDegToGain = currentRackPositions.map(({deg, gain}) => [deg, gain])
  const oldCenterGain = interpolate(0, oldDegToGain)
  const oldEndGain = interpolate(currentLockToLock / 2 * 360, oldDegToGain)

  const center = round(ratioCenter * (oldCenterGain / newGain), 1)
  const end = round(ratioEnd * (oldEndGain / newGain), 1)
  return { center, end }
}

function generateDifferences (newGain) {
  const lockToLock = round(totalLinearTravel / newGain, 2)

  const ratio = getNewRatio(newGain)
  console.log(`Ratio: center ${ratio.center}:1 - end ${ratio.end}:1`)
  console.log(`LTL: ${lockToLock} (current ${round(currentLockToLock, 2)})`)

  console.log('Angles:')
  for (let angle of inputAngles) {
    console.log(
      angle,
      '->',
      round(getNewAngle(angle, newGain), 1),
      `${round(getTorqueChangePercent(angle, newGain), 1)}%`
    )
  }
}

generateDifferences(newGain)
