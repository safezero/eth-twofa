pragma solidity ^0.4.8;

contract Twofa {
  bytes16 public hashedSecret;

  function Twofa(bytes16 _hashedSecret, bytes4 checksum) {
    if (bytes4(sha3(_hashedSecret)) != checksum) {
      throw;
    }
    hashedSecret = _hashedSecret;
  }

  modifier twofa(bytes16 secret, bytes16 _hashedSecret, bytes4 checksum) {
    if (bytes16(sha3(secret)) != hashedSecret) {
      throw;
    }
    if (bytes4(sha3(_hashedSecret)) != checksum) {
      throw;
    }
    hashedSecret = _hashedSecret;
    _;
  }
}
