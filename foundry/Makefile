include .env

.PHONY: deploy fork_arb_sepolia deploy_to_forked_arb_sepolia deploy_to_arb_sepolia

MY_PRIVATE_KEY := $(TENANT_A_PRIVATE_KEY)
ANVIL_RPC_URL := http://localhost:8545
ANVIL_ALICE_ADDRESS := 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
ANVIL_ALICE_PRIVATE_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# forked ?= false

# deploy:
# 	@echo "Deploying with forked=$(forked)"
# 	@if [ "$(forked)" = "true" ]; then \
# 		$(MAKE) deploy_to_forked_arb_sepolia; \
# 	else \
# 		$(MAKE) deploy_to_arb_sepolia; \
# 	fi

fork:
	anvil --fork-url $(ARB_SEPOLIA_RPC_URL) --chain-id 31337

deploy_leaseNotary_to_forked_arb_sepolia:
	@forge build
	@forge script \
    	--broadcast \
		--rpc-url $(ANVIL_RPC_URL) \
    	--private-key $(ANVIL_ALICE_PRIVATE_KEY) \
    	script/LeaseNotary.s.sol:LeaseNotaryScript

# deploy_lease_to_forked_arb_sepolia:
# 	@forge build
# 	@forge script \
#     	--broadcast \
# 		--rpc-url $(ANVIL_RPC_URL) \
#     	--private-key $(ANVIL_ALICE_PRIVATE_KEY) \
#     	script/Lease.s.sol:LeaseScript

# deploy_lease_to_arb_sepolia:
# 	@forge build
# 	@forge script \
# 		--broadcast \
# 		--verify \
# 		--rpc-url $(ARB_SEPOLIA_RPC_URL) \
# 		--etherscan-api-key $(ARBSCAN_API_KEY) \
# 		--private-key $(MY_PRIVATE_KEY) \
# 		script/Lease.s.sol:LeaseScript

deploy_leaseNotary_to_arb_sepolia:
	@forge build
	@forge script \
		--broadcast \
		--verify \
		--rpc-url $(ARB_SEPOLIA_RPC_URL) \
		--etherscan-api-key $(ARBSCAN_API_KEY) \
		--private-key $(MY_PRIVATE_KEY) \
		script/LeaseNotary.s.sol:LeaseNotaryScript

mint:
	cast send --from $(LANDLORD) --private-key $(LANDLORD_PRIVATE_KEY) $(LEASE_NOTARY_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
	"mint(string)" \
	"新竹市東區大學路1005號"
	
check_lease_1:
	cast call $(LEASE_NOTARY_ADDRESS) --rpc-url $(ANVIL_RPC_URL) \
	"leases(uint256)(address)" \
	1

verify_lease_1:
	forge verify-contract \
		--chain-id 421614 \
		--num-of-optimizations 1000000 \
		--watch \
		--constructor-args-path constructor-args.txt \
		--etherscan-api-key ${ARBSCAN_API_KEY} \
		$(LEASE_ADDRESS) \
		src/implementations/Lease.sol:Lease

setRentalTerms:
	cast send --from $(LANDLORD) --private-key $(LANDLORD_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"setRentalTerms(uint256,uint256,uint256)" \
		1 6 2

A_applyToRent:
	cast send --from $(TENANT_A) --private-key $(TENANT_A_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 2
	cast send --from $(TENANT_A) --private-key $(TENANT_A_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"applyToRent(uint256)" \
		1743786342

lease_check_USDC:
	cast balance --erc20 $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) $(LEASE_ADDRESS)
# 2

A_withdrawApplication:
	cast send --from $(TENANT_A) --private-key $(TENANT_A_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"withdrawApplication()"

# lease_check_USDC
# 0

ABCDE_applyToRent:
	cast send --from $(TENANT_A) --private-key $(TENANT_A_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 2
	cast send --from $(TENANT_A) --private-key $(TENANT_A_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"applyToRent(uint256)" \
		1743786342
	cast send --from $(TENANT_B) --private-key $(TENANT_B_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 2
	cast send --from $(TENANT_B) --private-key $(TENANT_B_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"applyToRent(uint256)" \
		1743786342
	cast send --from $(TENANT_C) --private-key $(TENANT_C_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 2
	cast send --from $(TENANT_C) --private-key $(TENANT_C_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"applyToRent(uint256)" \
		1743786342
	cast send --from $(TENANT_D) --private-key $(TENANT_D_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 2
	cast send --from $(TENANT_D) --private-key $(TENANT_D_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"applyToRent(uint256)" \
		1743786342
	cast send --from $(TENANT_E) --private-key $(TENANT_E_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 2
	cast send --from $(TENANT_E) --private-key $(TENANT_E_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"applyToRent(uint256)" \
		1743786342

# lease_check_USDC
# 10

approveTenant_B:
	cast send --from $(LANDLORD) --private-key $(LANDLORD_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approveTenant(address)" \
		$(TENANT_B)

# lease_check_USDC
# 2

B_payRent:
	cast send --from $(TENANT_B) --private-key $(TENANT_B_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 4
	cast send --from $(TENANT_B) --private-key $(TENANT_B_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"payRent(uint256)" \
		4






nftMint:
	cast send --from $(LANDLORD) --private-key $(LANDLORD_PRIVATE_KEY) $(CONTRACT) \
	"nftMint(string)" \
	"新竹市東區大學路1001號"

balanceOf:
	cast call ${CONTRACT} "balanceOf(address)(uint256)" $(LANDLORD)

house:
	cast call ${CONTRACT} "house(uint256)(string)" 1

setLease: # 2025/4/3 00:00
	cast send --from $(LANDLORD) --private-key $(LANDLORD_PRIVATE_KEY) $(CONTRACT) \
	"setLease(uint256,address,uint256,uint256,uint256,uint256)" \
	1 $(TENANT) 1743609600 1 6 2

# This lease should start from 2025/4/4 00:00

approve_2_USDC:
	cast send --from $(TENANT) --private-key $(TENANT_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) \
	"approve(address,uint256)" \
	$(CONTRACT) 2
	
approveLease:
	cast send --from $(TENANT) --private-key $(TENANT_PRIVATE_KEY) $(CONTRACT) \
	"approveLease(uint256)" \
	1

executeLease:
	cast send --from $(LANDLORD) --private-key $(LANDLORD_PRIVATE_KEY) $(CONTRACT) \
	"executeLease(uint256)" \
	1

# check_USDC

current_tenantOf:
	cast call ${CONTRACT} "tenantOf(uint256)(address)" 1

# 0x0000000000000000000000000000000000000000

before_start_tenantOf:
	cast call ${CONTRACT} "tenantOf(uint256,uint256)(address)" 1 1743695999

# 0x0000000000000000000000000000000000000000

at_start_tenantOf:
	cast call ${CONTRACT} "tenantOf(uint256,uint256)(address)" 1 1743696000

# 0xF85d255D10EbA7Ec5a12724D134420A3C2b8EA3a

at_expiration_tenantOf:
	cast call ${CONTRACT} "tenantOf(uint256,uint256)(address)" 1 1759248000

# 0xF85d255D10EbA7Ec5a12724D134420A3C2b8EA3a

after_expiration_tenantOf:
	cast call ${CONTRACT} "tenantOf(uint256,uint256)(address)" 1 1759248001

# 0x0000000000000000000000000000000000000000

set_April4:
	cast rpc evm_setNextBlockTimestamp 1743696000
	cast rpc evm_mine

tenant_checkDebt:
	cast call --from ${TENANT} ${CONTRACT} "checkDebt(uint256)(uint256)" 1

# 1

approve_1_USDC:
	cast send --from $(TENANT) --private-key $(TENANT_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) \
	"approve(address,uint256)" \
	$(CONTRACT) 1

pay:
	cast send --from $(TENANT) --private-key $(TENANT_PRIVATE_KEY) $(CONTRACT) \
	"pay(uint256,uint256)" \
	1 1

# tenant_checkDebt
# 0

set_June8: # 2025/6/8 00:00
	cast rpc evm_setNextBlockTimestamp 1749312000
	cast rpc evm_mine

landlord_checkDebt:
	cast call --from ${LANDLORD} ${CONTRACT} "checkDebt(uint256)(uint256)" 1
# 2

reclaimable:
	cast call --from ${LANDLORD} ${CONTRACT} "reclaimable(uint256)(bool)" 1

# false

reclaim:
	cast send --from $(LANDLORD) --private-key $(LANDLORD_PRIVATE_KEY) $(CONTRACT) \
	"reclaim(uint256)" \
	1

# revert

set_July4: # 2025/7/4 00:00
	cast rpc evm_setNextBlockTimestamp 1751558400
	cast rpc evm_mine

# landlord_checkDebt
# 3

# reclaimable
# true

# reclaim

# tenant_checkDebt
# 1

landlord_check_USDC:
	cast balance --erc20 $(ARB_SEPOLIA_USDC) $(LANDLORD)


set_expiration:
	cast rpc evm_setNextBlockTimestamp 1759248000
	cast rpc evm_mine

approve_6_USDC:
	cast send --from $(TENANT) --private-key $(TENANT_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) \
	"approve(address,uint256)" \
	$(CONTRACT) 6

pay_6:
	cast send --from $(TENANT) --private-key $(TENANT_PRIVATE_KEY) $(CONTRACT) \
	"pay(uint256,uint256)" \
	1 6

tenant_refund:
	cast send --from $(TENANT) --private-key $(TENANT_PRIVATE_KEY) $(CONTRACT) \
	"refund(uint256)" \
	1

getLease:
	cast call --from ${LANDLORD} $(CONTRACT) "getLease(uint256)" 1

commentToHouse:
	cast send --from $(TENANT) --private-key $(TENANT_PRIVATE_KEY) $(CONTRACT) \
	"commentToHouse(uint256,string)" \
	1 "Great house!!!"

tenant_comment:
	cast send --from $(TENANT) --private-key $(TENANT_PRIVATE_KEY) $(CONTRACT) \
	"comment(uint256,string)" \
	1 "Great landlord!!!"

landlord_comment:
	cast send --from $(LANDLORD) --private-key $(LANDLORD_PRIVATE_KEY) $(CONTRACT) \
	"comment(uint256,string)" \
	1 "Great tenant!!!"


mine:
	cast rpc evm_mine

auto_mine:
	cast rpc evm_setAutomine true