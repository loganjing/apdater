var h = require('snabbdom/h')
var toHTML = require('snabbdom-to-html')

var output = toHTML(
  h('div', { style: { color: 'red' } }, 'The quick brown fox jumps')
)

console.log(output);