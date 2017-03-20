pragma solidity ^0.4.8;

contract Twofa {
  bytes32 public hashedSecret;

  function Twofa(bytes32 _hashedSecret, bytes4 checksum) {
    if (bytes4(sha3(_hashedSecret)) != checksum) {
      throw;
    }
    hashedSecret = _hashedSecret;
  }

  modifier twofa(bytes32 secret, bytes32 _hashedSecret, bytes4 checksum) {
    if (sha3(secret) != hashedSecret) {
      throw;
    }
    if (bytes4(sha3(_hashedSecret)) != checksum) {
      throw;
    }
    hashedSecret = _hashedSecret;
    _;
  }
}
