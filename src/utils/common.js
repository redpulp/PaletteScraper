function valToHex(c) {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

exports.rgbToHex = (r, g, b) =>  `#${valToHex(r)}${valToHex(g)}${valToHex(b)}`

//Sleep function that can be awaited
exports.delay = function (time) {
  return new Promise(resolve => setTimeout(resolve, time))
}
