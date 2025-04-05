# Lease Notary

## Background

In Taiwan, the rental housing market commonly faces the following issues:

Scammers posing as landlords

Tenants who default on rent and cannot be evicted.

Tenants with bad habits or landlords with bad tempers

To address these problems, we are moving traditional paper-based rental contracts onto the blockchain. First, by combining RWA policies with transparent on-chain mechanisms, we can prevent scammers who falsely claim to be landlords from succeeding.

Second, since smart contracts are enforced automatically without lengthy manual review, and by linking NFTs to NFC smart locks, we can prevent tenants who default on rent from exploiting legal loopholes to occupy properties unlawfully.

For the third problem, through the issuance of reputation tokens and peer review mechanisms, tokens can be awarded to tenants who pay rent on time and landlords who maintain their properties well. This incentivizes both parties to act responsibly in order to protect their reputations.

Through these various mechanisms, Lease Notary aims to grow into a fair, transparent, and user-friendly rental system that solves longstanding problems in Taiwan’s rental housing market.

## Architecture

The system architecture can be broadly divided into two parts: the frontend and the on-chain code. The frontend includes interfaces for both (potential) tenants and landlords. On the blockchain, the core component is the LeaseNotary contract ([L2LeaseNotary.sol](./foundry/src/implementations/L2LeaseNotary.sol)), which is responsible for deploying individual Lease contracts ([Lease.sol](./foundry/src/implementations/Lease.sol)). It’s important to note that LeaseNotary is actually an ERC-4907 contract (i.e., an ERC-721 contract with built-in rental functionality).

When a landlord passes the RWA verification and obtains ownership of a specific property, they can use the frontend to mint a LeaseNotary NFT. During the minting process, the landlord must input the house address as a parameter, thereby conceptually binding the property to the NFT. The specific implementation details will need to be refined based on future legal regulations.

Additionally, each time an NFT is minted, a corresponding Lease contract is also generated. This contract is also bound to the house address. However, this time the binding is done using the ENS mechanism, allowing a house address to be used to look up its associated Lease contract.

## How to use

### Frontend

...

### Foundry

If you want to interact directly with blockchain, you can follow the steps in `./foundry/Makefile`. The L2 we use here is arbitrum sepolia, but it should be workding fine on any L2 supported by [Durin](https://durin.dev/).

We've also deployed a L2LeaseNotary on [Polygon PoS Amoy](https://amoy.polygonscan.com/address/0x3b5a46cfaba5d9e814264d11db1b0aa884dc9ff4); however the Durin deployment function of L2Registry on Polygon kept failing. Thus, the L2LeaseNotary has not been added to ENS L2Registry. The `mint` function can still work, but the line for registering ENS is slashed.



