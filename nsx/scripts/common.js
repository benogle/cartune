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
  }
}
