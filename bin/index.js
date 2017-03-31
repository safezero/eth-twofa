#!/usr/bin/env node

const commander = require('commander')
const Twofa = require('../')
const fs = require('fs')
const Amorph = require('amorph')
const amorphBase2048Plugin = require('amorph-base2048')
const colors = require('colors')

Amorph.loadPlugin(amorphBase2048Plugin)
Amorph.ready()

commander
  .option('-n, --number <n>', 'number of twofa codes to print', parseInt)
  .option('-f, --form [value]', 'output form', 'hex')
  .parse(process.argv)

const number = commander.number ? parseInt(commander.number) : 100
const digits = (number - 1).toString().length
const form = commander.form ? commander.form : 'hex'
const twofas = Array(number).fill(0).map(() => { return Twofa.generate() })
const leftPadding = Array(digits).fill(' ').join('')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version

console.log(`safezero/eth-twofa@${version}:`.magenta)

twofas.forEach((twofa, index) => {
  console.log(' ')
  console.log('n'.green, index)
  console.log('s'.green, twofa.secret.to(form))
  console.log('h'.green, twofa.hashedSecret.to(form))
  console.log('c'.green, twofa.checksum.to(form))

})
