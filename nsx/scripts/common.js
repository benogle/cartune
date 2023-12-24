module.exports = {
  round (val, places) {
    return +(Math.round(val + "e+" + places)  + "e-" + places);
  },

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
  interpolate (value, table) {
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
  },

  // const xScale = [1000, 2000, 3000, 4000]
  // const yScale = [2, 4, 6, 8]
  //
  // `table` is an array of rows
  // const table = [
  //   [10, 20, 30, 40],
  //   [50, 60, 70, 80],
  //   [90, 100, 110, 120],
  //   [130, 140, 150, 160],
  // ]
  interpolate2D (x, y, {xScale, yScale, values}) {
    function findCell (value, scale) {
      const scaleLen = scale.length
      let minItem = null
      let maxItem = null
      for (let i = 0; i < scaleLen; i++) {
        const refValue = scale[i]
        if (refValue >= value) {
          const indexMin = Math.max(i - 1, 0)
          return {
            indexMin,
            scaleMin: scale[indexMin],
            indexMax: i,
            scaleMax: scale[i]
          }
        }
      }

      const index = scaleLen - 1
      return {
        indexMin: index,
        scaleMin: scale[index],
        indexMax: index,
        scaleMax: scale[index]
      }
    }

    function interpolate ({
      scaleValue,
      minScaleValue,
      maxScaleValue,
      minTableValue,
      maxTableValue,
    }) {
      if (scaleValue <= minScaleValue) return minTableValue
      if (scaleValue >= maxScaleValue) return maxTableValue
      const percentOfRange = (scaleValue - minScaleValue) / (maxScaleValue - minScaleValue)
      return percentOfRange * (maxTableValue - minTableValue) + minTableValue
    }

    const xCell = findCell(x, xScale)
    const yCell = findCell(y, yScale)
    const rowMin = values[yCell.indexMin]
    const rowMax = values[yCell.indexMax]

    const topLeftTableValue = values[yCell.indexMin][xCell.indexMin]
    const topRightTableValue = values[yCell.indexMin][xCell.indexMax]
    const bottomLeftTableValue = values[yCell.indexMax][xCell.indexMin]
    const bottomRightTableValue = values[yCell.indexMax][xCell.indexMax]

    const leftTableValue = interpolate({
      scaleValue: y,
      minScaleValue: yCell.scaleMin,
      maxScaleValue: yCell.scaleMax,
      minTableValue: topLeftTableValue,
      maxTableValue: bottomLeftTableValue,
    })
    const rightTableValue = interpolate({
      scaleValue: y,
      minScaleValue: yCell.scaleMin,
      maxScaleValue: yCell.scaleMax,
      minTableValue: topRightTableValue,
      maxTableValue: bottomRightTableValue,
    })

    return interpolate({
      scaleValue: x,
      minScaleValue: xCell.scaleMin,
      maxScaleValue: xCell.scaleMax,
      minTableValue: leftTableValue,
      maxTableValue: rightTableValue,
    })
  }
}
