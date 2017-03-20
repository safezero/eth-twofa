const commander = require('commander')
const Twofa = require('./')
const fs = require('fs')

commander
  .option('-n, --number <n>', 'number of twofa codes to print', parseInt)
  .parse(process.argv)

const number = commander.number ? parseInt(commander.number) : 100
const digits = (number - 1).toString().length
const form = commander.form ? commander.form : 'hex'
const twofas = Array(number).fill(0).map(() => { return Twofa.generate() })
const leftPadding = Array(digits).fill(' ').join('')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version

console.log(`eth-twofa@${version}:`)

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
