module.exports = {
  round (val, places) {
    return +(Math.round(val + "e+" + places)  + "e-" + places);
  }
}
