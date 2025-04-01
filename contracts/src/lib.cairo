// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts for Cairo ^1.0.0

#[derive(Serde, Drop, Debug)]
pub struct CompleteClaimData {
    pub identifier: u256,  // Claim identifier.
    pub byte_identifier: ByteArray,  // Byte array representation of the identifier.
    pub owner: ByteArray,  // Owner of the claim.
    pub epoch: ByteArray,  // Epoch associated with the claim.
    pub timestamp_s: ByteArray,  // Timestamp of the claim.
}


#[derive(Serde, Drop, Debug)]
pub struct ClaimInfo {
    pub provider: ByteArray,  // Provider of the claim.
    pub parameters: ByteArray,  // Claim parameters.
    pub context: ByteArray,  // Context of the claim.
}

#[derive(Serde, Drop, Debug)]
pub struct SignedClaim {
    pub claim: CompleteClaimData,  // Complete claim data.
    pub signatures: Array<ReclaimSignature>,  // Array of signatures.
}

#[derive(Serde, Drop, Debug)]
pub struct ReclaimSignature {
    pub r: u256,  // 'r' value of the signature.
    pub s: u256,  // 's' value of the signature.
    pub v: u32,  // 'v' value of the signature.
}


#[derive(Serde, Drop, Debug)]
pub struct Proof {
    pub id: felt252,  // Proof identifier.
    pub claim_info: ClaimInfo,  // Information about the claim.
    pub signed_claim: SignedClaim,  // Signed claim details.
}

#[starknet::interface]
pub trait IReclaim<TContractState> {
    fn verify_proof(ref self: TContractState ,proof: Proof);
}

#[starknet::contract]
mod DevToken {
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use super::IReclaim;
    use core::starknet::{get_caller_address, ContractAddress};
    use super::Proof;
    use super::{ IReclaimDispatcher, IReclaimDispatcherTrait};


    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    // External
    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;

    // Internal
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.erc20.initializer("DevToken", "DTK");
    }

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn mint(ref self: ContractState, reclaim_verifier: ContractAddress, proof: Proof) {
            let reclaim_verifier_dispatcher = IReclaimDispatcher { contract_address: reclaim_verifier };
            reclaim_verifier_dispatcher.verify_proof(proof);  // Just call verify_proof, it will revert if invalid
            let caller = get_caller_address();
            let amount = 1000000000000000000000000; // 1 million
            self.erc20.mint(caller, amount);
        }
    }
}
