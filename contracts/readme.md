```use core::starknet::ContractAddress;

#[starknet::interface]
trait IERC20<TContractState> {
    fn name(self: @TContractState) -> felt252;

    fn symbol(self: @TContractState) -> felt252;

    fn decimals(self: @TContractState) -> u8;

    fn total_supply(self: @TContractState) -> u256;

    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;

    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> u256;

    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;

    fn transfer_from(
        ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256,
    ) -> bool;

    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
}

#[starknet::interface]
trait ITokenWrapper<TContractState> {
    fn token_name(self: @TContractState, contract_address: ContractAddress) -> felt252;

    fn transfer_token(
        ref self: TContractState,
        address: ContractAddress,
        recipient: ContractAddress,
        amount: u256,
    ) -> bool;
}

//**** Specify interface here ****//
#[starknet::contract]
mod TokenWrapper {
    use super::{IERC20Dispatcher, IERC20DispatcherTrait};
    use super::ITokenWrapper;
    use core::starknet::{get_caller_address, ContractAddress};

    #[storage]
    struct Storage {}

    #[abi(embed_v0)]
    impl TokenWrapper of ITokenWrapper<ContractState> {
        fn token_name(self: @ContractState, contract_address: ContractAddress) -> felt252 {
            IERC20Dispatcher { contract_address }.name()
        }

        fn transfer_token(
            ref self: ContractState,
            address: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) -> bool {
            let erc20_dispatcher = IERC20Dispatcher { contract_address: address };
            erc20_dispatcher.transfer_from(get_caller_address(), recipient, amount)
        }
    }
}


```