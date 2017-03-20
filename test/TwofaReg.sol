pragma solidity ^0.4.8;

import "Twofa.sol";

contract TwofaReg is Twofa {
  uint256 public value;

  function TwofaReg(bytes32 _hashedSecret, bytes4 checksum) Twofa(_hashedSecret, checksum) {}

  function setValue(
    bytes32 secret, bytes32 _hashedSecret, bytes4 checksum,
    uint256 _value
  ) twofa(secret, _hashedSecret, checksum) {
    value = _value;
  }
}
