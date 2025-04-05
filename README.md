# Lease Notary

## Description

We transition paper-based rental agreements onto the blockchain as Lease contract. Our goal is to preserve the key characteristics of paper contracts—each lease should belong exclusively to the signing tenant and landlord, and not be accessible by anyone else. At the same time, we use a "Lease Notary" to ensure that the contract remains enforceable if anything goes wrong.

For example, we could bind Lease Notary's NFT to the NFC lock. When the unpaid rents of the tenant exceeds his deposit in the lease, the Lease Notary takes back the NFT, disqualifying the tenant.

We also plan to introduce an ERC-20 token that represents user reputation, so as to identify bad landlord and tenant in the system.


## How it's made

![flowchart](resources/flow.png)

Architecture:
- Frontend: Next.js
- Blockchain: Arbitrum / Polygon / ENS(Durin)

Main functions of [LeaseNotary](./foundry/src/implementations/L2LeaseNotary.sol) ERC4907 contract:
1. mint NFT(`$(address)`) && deploy a Lease contract && set ENS(`$(address).eth`) for the contract
2. ERC4907 allows the landlord to rent NFT to the tenant and sets an expiration
3. Sync with Lease contract to update the NFT user info

Main functions of [Lease](./foundry/src/implementations/Lease.sol)
1. The landlord can set the rental terms.
2. Interested tenants can submit applications by depositing a security deposit. 
3. The landlord approve only one tenant, and the deposits from the other applicants will be refunded.


## How to use

### [Live Demo](https://ethglobal-2025-taipei-frontend-anl4g3dem-jayisakings-projects.vercel.app/)

### Foundry

If you want to interact directly with blockchain, you can follow the steps in `./foundry/Makefile`. The L2 we use here is arbitrum sepolia, but it should be workding fine on any L2 supported by [Durin](https://durin.dev/).

We've also deployed a L2LeaseNotary on [Polygon PoS Amoy](https://amoy.polygonscan.com/address/0x3b5a46cfaba5d9e814264d11db1b0aa884dc9ff4); however the Durin deployment function of L2Registry on Polygon kept failing. Thus, the L2LeaseNotary has not been added to ENS L2Registry. The `mint` function can still work, but the line for registering ENS is slashed.



