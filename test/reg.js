const Ultralightbeam = require('ultralightbeam')
const TestRPC = require('ethereumjs-testrpc')
const Account = require('ethereum-account-amorph')
const SolDeployTransactionRequest = require('ultralightbeam/lib/SolDeployTransactionRequest')
const SolWrapper = require('ultralightbeam/lib/SolWrapper')
const fs = require('fs')
const solc = require('solc')
const Amorph = require('amorph')
const amorphParseSolcOuput = require('amorph-parse-solc-output')
const chai = require('chai')
const chaiAmorph = require('chai-amorph')
const chaiAsPromised = require('chai-as-promised')
const keccak256 = require('keccak256-amorph')
const Twofa = require('../')
const _ = require('lodash')
const random = require('random-amorph')

chai.use(chaiAmorph)
chai.use(chaiAsPromised)
chai.should()

const owner = Account.generate()
const provider = TestRPC.provider({
  gasLimit: 4000000,
  blocktime: 2,
  accounts: [{
    balance: 1000000000,
    secretKey: owner.privateKey.to('hex.prefixed')
  }],
  locked: false
})

const ultralightbeam = new Ultralightbeam(provider, {})

const values = _.range(5).map(() => { return random(32) })
const twofas = _.range(5).map(() => { return Twofa.generate() })
const zero = new Amorph(0, 'number')

describe('twofaReg', () => {
  let twofaRegInfo
  let twofaReg

  it('should compile', () => {
    const solcOutput = solc.compile({
      sources: {
        'Twofa.sol': fs.readFileSync('./Twofa.sol', 'utf8'),
        'TwofaReg.sol': fs.readFileSync('./test/TwofaReg.sol', 'utf8')
      }
    })
    twofaRegInfo = amorphParseSolcOuput(solcOutput, Amorph)['TwofaReg.sol:TwofaReg']
  })

  it('should NOT deploy with zero hashedSecret/chekcsum', () => {
    const transactionRequest = new SolDeployTransactionRequest(
      twofaRegInfo.code, twofaRegInfo.abi, [ zero, zero ], { from: owner }
    )
    return ultralightbeam.sendTransaction(transactionRequest).getConfirmation().should.eventually.be.rejectedWith(Error)
  })

  it('should NOT deploy with bad checksum', () => {
    const transactionRequest = new SolDeployTransactionRequest(
      twofaRegInfo.code, twofaRegInfo.abi, [
        twofas[0].hashedSecret,
        twofas[1].checksum
      ], {
        from: owner
      }
    )
    return ultralightbeam.sendTransaction(transactionRequest).getConfirmation().should.eventually.be.rejectedWith(Error)
  })

  it('should deploy', () => {
    const transactionRequest = new SolDeployTransactionRequest(
      twofaRegInfo.code, twofaRegInfo.abi, [
        twofas[0].hashedSecret,
        twofas[0].checksum
      ], {
        from: owner
      }
    )
    return ultralightbeam
      .sendTransaction(transactionRequest)
      .getTransactionReceipt().then((transactionReceipt) => {
        twofaReg = new SolWrapper(
          ultralightbeam, twofaRegInfo.abi, transactionReceipt.contractAddress, { from: owner }
        )
      })
  })

  it('runcode should be correct', () => {
    return ultralightbeam.eth.getCode(twofaReg.address).should.eventually.amorphEqual(twofaRegInfo.runcode)
  })

  it('should have correct hashedSecret', () => {
    return twofaReg.fetch('hashedSecret()', []).should.eventually.amorphEqual(twofas[0].hashedSecret)
  })

  it('should have correct value (zero)', () => {
    return twofaReg.fetch('value()', []).should.eventually.amorphEqual(zero)
  })

  it('should NOT be able to set a new value with a bad secret', () => {
    return twofaReg.broadcast('setValue(bytes16,bytes16,bytes4,uint256)', [
      twofas[1].secret,
      twofas[1].hashedSecret,
      twofas[1].checksum,
      values[0]
    ], { from: owner }).getConfirmation().should.be.rejectedWith(Error)
  })

  it('should NOT be able to set a new value if you forget hashedSecret/checksum', () => {
    return twofaReg.broadcast('setValue(bytes16,bytes16,bytes4,uint256)', [
      twofas[0].secret,
      zero,
      zero,
      values[0]
    ], { from: owner }).getConfirmation().should.be.rejectedWith(Error)
  })

  it('should NOT be able to set a new value with bad checksum', () => {
    return twofaReg.broadcast('setValue(bytes16,bytes16,bytes4,uint256)', [
      twofas[0].secret,
      twofas[1].hashedSecret,
      twofas[2].checksum,
      values[0]
    ], { from: owner }).getConfirmation().should.be.rejectedWith(Error)
  })

  it('should have correct value (zero)', () => {
    return twofaReg.fetch('value()', []).should.eventually.amorphEqual(zero)
  })

  it('should be able to set a new value', () => {
    return twofaReg.broadcast('setValue(bytes16,bytes16,bytes4,uint256)', [
      twofas[0].secret,
      twofas[1].hashedSecret,
      twofas[1].checksum,
      values[0]
    ], { from: owner }).getConfirmation()
  })

  it('should have correct hashedSecret', () => {
    return twofaReg.fetch('hashedSecret()', []).should.eventually.amorphEqual(twofas[1].hashedSecret)
  })

  it('should have correct value', () => {
    return twofaReg.fetch('value()', []).should.eventually.amorphEqual(values[0])
  })

  it('should be able to set a new value (again)', () => {
    return twofaReg.broadcast('setValue(bytes16,bytes16,bytes4,uint256)', [
      twofas[1].secret,
      twofas[2].hashedSecret,
      twofas[2].checksum,
      values[1]
    ], { from: owner }).getConfirmation()
  })

  it('should have correct hashedSecret (again)', () => {
    return twofaReg.fetch('hashedSecret()', []).should.eventually.amorphEqual(twofas[2].hashedSecret)
  })

  it('should have correct value', () => {
    return twofaReg.fetch('value()', []).should.eventually.amorphEqual(values[1])
  })

})
