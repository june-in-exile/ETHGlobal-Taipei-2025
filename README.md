# Lease Notary

## Description

In Taiwan, the rental housing market commonly faces the following issues:

1. Scammers posing as landlords
2. Tenants who default on rent and cannot be evicted
3. Tenants with bad habits or landlords with bad tempers

Many of these problems arise because both tenants and landlords tend to avoid the hassle—or have privacy concerns—when it comes to notarizing rental contracts in court. To address these issues, we are transitioning traditional paper-based rental agreements onto the blockchain. Our goal is to preserve the key characteristics of paper contracts—each lease should belong exclusively to the signing tenant and landlord, and not be accessible by anyone else. At the same time, we want to ensure that the contract remains enforceable if anything goes wrong.

To achieve this, we transform each rental agreement into a smart contract on the blockchain and introduce the role of a "Lease Notary." This notary acts as a neutral party that automatically intervenes to protect one side’s interests if the contract is violated or abused. For example, by combining Real World Asset (RWA) verification policies with transparent on-chain mechanisms, we can prevent scammers from falsely posing as landlords.

For the second problem, since smart contracts are enforced automatically without the need for time-consuming manual reviews, and by integrating NFTs with NFC smart locks, we can prevent defaulting tenants from exploiting legal loopholes to occupy a property unlawfully.

To tackle the third issue, we plan to introduce an ERC-20 token that represents user reputation. Through a peer review system and token issuance, tenants who pay rent on time and landlords who maintain their properties well can earn reputation tokens. This incentivizes both parties to act responsibly in order to maintain and protect their reputations.

The system architecture is broadly divided into two parts: the frontend and the on-chain code. The frontend includes interfaces for both tenants and landlords, as well as an interactive map that helps users locate properties. Although this part is not directly related to Web3, we have designed it to be as smooth and intuitive as possible to lower the entry barrier for users new to blockchain.

On the blockchain side, the core component is the LeaseNotary contract, which is responsible for deploying individual Lease contracts. Once a landlord passes RWA verification and is confirmed to own a particular property, they can mint a LeaseNotary NFT via the frontend. During the minting process, the landlord inputs the property's physical address as a parameter, conceptually binding the property to the NFT. The precise implementation details may be adjusted according to future legal regulations.

Additionally, each time a LeaseNotary NFT is minted, a corresponding Lease contract is generated. This contract is also bound to the property address. However, this binding is done using the ENS (Ethereum Name Service) mechanism, allowing people to look up a property's associated Lease contract using its address.

Through these various mechanisms, Lease Notary aims to evolve into a fair, transparent, and user-friendly rental system that addresses longstanding issues in Taiwan’s housing rental market.

## How it's made

For the on-chain design, a simple approach would be to store all data in a single contract. While this is technically feasible, it sacrifices the one-to-one nature of rental agreements.

Instead, we treat each lease as an independent smart contract. These lease contracts are automatically deployed on Arbitrum/Polygon when a landlord mints a House NFT via the Lease Notary. Note that we actually name the lease notary contract L2LeaseNotary rather than LeaseNotary, because we’ve integrated it with the L2Registrar component from the ENS's Durin architecture.

Moreover, each lease contract is automatically assigned an ENS name upon deployment to make future lookups easier. This ENS domain corresponds to the physical address of the property referred to by the House NFT. For example, "新竹市東區大學路1001號.leasenotary.eth" would be the ENS for a specific Lease contract.

The landlord can set the rental terms on the Lease contract. Interested tenants can submit applications by depositing a security deposit directly into the contract. The landlord can ultimately approve only one tenant, and the deposits from the other applicants will be refunded.

It’s important to note that L2LeaseNotary is actually an ERC-4907 contract (i.e., an ERC-721 contract with built-in rental functionality). This allows the landlord to designate the tenant as the "user" of the NFT, instead of transferring ownership.

During the lease period, each time the tenant scans their NFC keycard, it queries the Lease Notary to check if they are the current NFT user. At that moment, Lease Notary syncs with the lease contract to confirm who holds the NFT usage rights.

Through this system, we preserve the structure and intent of traditional paper lease agreements on-chain—while also achieving automatic enforcement, as if the contract were notarized.

## How to use

### Frontend

![flowchart](resources/flow.png)

[live demo](https://ethglobal-2025-taipei-frontend-anl4g3dem-jayisakings-projects.vercel.app/)


### Foundry

If you want to interact directly with blockchain, you can follow the steps in `./foundry/Makefile`. The L2 we use here is arbitrum sepolia, but it should be workding fine on any L2 supported by [Durin](https://durin.dev/).

We've also deployed a L2LeaseNotary on [Polygon PoS Amoy](https://amoy.polygonscan.com/address/0x3b5a46cfaba5d9e814264d11db1b0aa884dc9ff4); however the Durin deployment function of L2Registry on Polygon kept failing. Thus, the L2LeaseNotary has not been added to ENS L2Registry. The `mint` function can still work, but the line for registering ENS is slashed.



