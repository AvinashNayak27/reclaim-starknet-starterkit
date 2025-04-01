
import { BigNumber } from "ethers";

function parseSignature(signature) {
  const rHex = "0x" + signature.slice(2, 66); // First 32 bytes (64 hex characters)
  const sHex = "0x" + signature.slice(66, 130); // Next 32 bytes (64 hex characters)
  const vHex = signature.slice(130, 132); // Last byte

  const r = rHex; // Keep r as a hexadecimal string
  const s = sHex; // Keep s as a hexadecimal string
  let v = parseInt(vHex, 16); // Convert v from hex to decimal

  // Ensure v is either 27 or 28
  if (v < 27) {
    v += 27;
  }

  return {
    r: r,
    s: s,
    v: v,
  };
}


export default function transformProof(oldProof) {
  const identifierBN = BigNumber.from(oldProof.identifier);

  const newProof = {
    proof: {
      id: 0,
      claim_info: {
        provider: oldProof.claimData.provider,
        parameters: oldProof.claimData.parameters,
        context: oldProof.claimData.context,
      },
      signed_claim: {
        claim: {
          identifier: `0x${identifierBN.toHexString().slice(2)}`,
          byte_identifier: oldProof.identifier,
          owner: oldProof.claimData.owner,
          epoch: oldProof.claimData.epoch.toString(),
          timestamp_s: oldProof.claimData.timestampS.toString(),
        },
        signatures: oldProof.signatures.map((sig) => {
          const parsedSig = parseSignature(sig);
          return {
            r: `0x${BigNumber.from(parsedSig.r).toHexString().slice(2)}`,
            s: `0x${BigNumber.from(parsedSig.s).toHexString().slice(2)}`,
            v: parsedSig.v,
          };
        }), 
      },
    },
  };

  return newProof;
}
