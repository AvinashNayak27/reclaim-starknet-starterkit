# Reclaim Onchain Starter Kit - Starknet

This is a starter kit for building Web3 applications on Starknet that leverage the Reclaim Protocol for on-chain verification of off-chain data. The project demonstrates how to create an ERC20 token DevToken that lets only developers mint by verifying their Github Identity using the Reclaim Protocol.

- [Explorer Link](https://sepolia.voyager.online/token/0x016db0469987a14d7221881b7f4b78c1ea26c6b1d4d0122fc378a90474ee070d)

## Overview

This starter kit shows how to integrate Reclaim Protocol with Starknet, demonstrating:
1. A Cairo smart contract (`DevToken`) that mints ERC20 tokens based on verified Github developer identity
2. A React-based frontend application that interacts with Starknet and Reclaim JS SDK

## How it Works

- Users connect their Starknet wallet
- Verify their Github account through Reclaim Protocol
- The contract verifies the proof of Github identity
- Users receive 1,000,000 DevTokens upon successful verification
- Each Github account can only mint tokens once

## Tech Stack

- **Frontend**:
  - React
  - TypeScript
  - Vite
  - TailwindCSS
  - starknet.js
  - React Query
  - Reclaim JS SDK

- **Smart Contracts**:
  - Cairo
  - OpenZeppelin Cairo Contracts
  - Reclaim Protocol
## Getting Started

### 0. Navigate to Frontend
```bash
cd frontend
```

### 1. Install dependencies:
```bash
yarn install
```

### 2. Start the development server:
```bash
yarn dev
```

### 3. Build the project:
```bash
yarn build
```

### 4. Deploying Contracts
```bash
cd contracts
scarb build
export STARKNET_KEYSTORE=$(pwd)/keystore.json  
export STARKNET_ACCOUNT=$(pwd)/account.json   
starkli declare target/dev/hello_starknet_DevToken.contract_class.json RETURNS Class hash
starkli deploy <CLASSHASH> --network=sepolia
```
> **Note:** You need to add your own accounts. Check [this link](https://docs.starknet.io/quick-start/sepolia/#deploying_a_new_sepolia_account) for further details.

## Smart Contract

The `DevToken` contract:
- Inherits from OpenZeppelin's ERC20
- Verifies Github developer identity using the Reclaim Protocol
- Mints 1,000,000 ERC20 tokens upon successful verification
- Integrates with Reclaim's verification system
- Written in Cairo for Starknet deployment

## Frontend

The frontend application provides:
- Interface for connecting Starknet wallet
- Interface for verifying Github accounts
- Minting DevToken tokens
- Integration with Reclaim Protocol for verification

## Using this Starter Kit

This starter kit can be used as a template for building various applications on Starknet that require verified off-chain data. While this example uses Github developer verification, the same pattern can be applied to:
- Professional credentials
- Educational certificates
- Social media metrics
- Any other off-chain data supported by Reclaim Protocol

## Learn More

- [Reclaim Protocol Documentation](https://docs.reclaimprotocol.org/)