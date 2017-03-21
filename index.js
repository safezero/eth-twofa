const Amorph = require('amorph')
const arguguard = require('arguguard')
const random = require('random-amorph')
const keccak256 = require('keccak256-amorph')

function Twofa(secret) {
  arguguard('Twofa', [Amorph], arguments)
  this.secret = secret.as('array', (array) => { return array.slice(0, 16) })
  this.hashedSecret = keccak256(this.secret).as('array', (array) => { return array.slice(0, 16) })
  this.checksum = keccak256(this.hashedSecret).as('array', (array) => {
    return array.slice(0, 4)
  })
}

Twofa.generate = function generate() {
  return new Twofa(random(32))
}

module.exports = Twofa
