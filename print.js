const commander = require('commander')
const Twofa = require('./')
const fs = require('fs')

commander
  .option('-n, --number <n>', 'number of twofa codes to print', parseInt)
  .option('-f, --form <form>', 'output form (number/hex/hex.prefixed)', /^(number|hex|hex.prefixed)$/i)
  .parse(process.argv)

const number = commander.number ? parseInt(commander.number) : 100
const digits = (number - 1).toString().length
const form = commander.form ? commander.form : 'hex'
const twofas = Array(number).fill(0).map(() => { return Twofa.generate() })
const leftPadding = Array(digits).fill(' ').join('')
const packageJson = fs.readFileSync('./package.json')

console.log(JSON.stringify(JSON.parse(packageJson), null, 4))

twofas.forEach((twofa, index) => {
  let indexString = index.toString()
  while(indexString.length < digits) {
    indexString = ' ' + indexString
  }
  console.log('================================================================================')
  console.log(indexString,  'secret      ',  twofa.secret.to(form))
  console.log(leftPadding,  'hashedSecret',twofa.hashedSecret.to(form))
  console.log(leftPadding,  'checksum    ', twofa.checksum.to(form))

})
