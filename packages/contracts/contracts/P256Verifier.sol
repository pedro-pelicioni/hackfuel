// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title P256Verifier
/// @notice Verifies P-256 (secp256r1) signatures using Monad's precompile at 0x0100
/// @dev This leverages Monad's native P-256 precompile for WebAuthn/Passkey verification
contract P256Verifier {
    /// @notice Address of the P-256 precompile on Monad
    address constant P256_PRECOMPILE = address(0x0100);

    /// @notice Verifies a P-256 signature
    /// @param messageHash The hash of the message that was signed
    /// @param r The r component of the signature
    /// @param s The s component of the signature
    /// @param pubKeyX The x coordinate of the public key
    /// @param pubKeyY The y coordinate of the public key
    /// @return valid Whether the signature is valid
    function verifySignature(
        bytes32 messageHash,
        bytes32 r,
        bytes32 s,
        bytes32 pubKeyX,
        bytes32 pubKeyY
    ) public view returns (bool valid) {
        bytes memory input = abi.encodePacked(messageHash, r, s, pubKeyX, pubKeyY);

        (bool success, bytes memory result) = P256_PRECOMPILE.staticcall(input);

        if (!success || result.length == 0) {
            return false;
        }

        // The precompile returns 1 for valid signatures
        valid = abi.decode(result, (uint256)) == 1;
    }

    /// @notice Verifies a WebAuthn assertion signature
    /// @param authenticatorData The authenticator data from the WebAuthn assertion
    /// @param clientDataJSON The client data JSON from the WebAuthn assertion
    /// @param r The r component of the signature
    /// @param s The s component of the signature
    /// @param pubKeyX The x coordinate of the public key
    /// @param pubKeyY The y coordinate of the public key
    function verifyWebAuthn(
        bytes calldata authenticatorData,
        bytes calldata clientDataJSON,
        bytes32 r,
        bytes32 s,
        bytes32 pubKeyX,
        bytes32 pubKeyY
    ) external view returns (bool) {
        // Reconstruct the signed message per WebAuthn spec
        bytes32 clientDataHash = sha256(clientDataJSON);
        bytes32 messageHash = sha256(abi.encodePacked(authenticatorData, clientDataHash));

        return verifySignature(messageHash, r, s, pubKeyX, pubKeyY);
    }
}
