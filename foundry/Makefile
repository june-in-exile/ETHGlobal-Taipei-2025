include .env

MY_PRIVATE_KEY := $(TENANT_A_PRIVATE_KEY)

# -----------------------skip this section--------------------------

# fork:
# 	anvil --fork-url $(ARB_SEPOLIA_RPC_URL)

# deploy_lease_to_forked_arb_sepolia:
# 	@forge build
# 	@forge script \
#     	--broadcast \
# 		--rpc-url $(ANVIL_RPC_URL) \
#     	--private-key $(ANVIL_ALICE_PRIVATE_KEY) \
#     	script/Lease.s.sol:LeaseScript

# deploy_leaseNotary_to_arb_sepolia:
# 	@forge build
# 	@forge script \
# 		--broadcast \
# 		--verify \
# 		--rpc-url $(ARB_SEPOLIA_RPC_URL) \
# 		--etherscan-api-key $(ARBSCAN_API_KEY) \
# 		--private-key $(MY_PRIVATE_KEY) \
# 		script/LeaseNotary.s.sol:LeaseNotaryScript

# set_expiration:
# 	cast rpc evm_setNextBlockTimestamp 1759248000
# 	cast rpc evm_mine

# mine:
# 	cast rpc evm_mine

# auto_mine:
# 	cast rpc evm_setAutomine true

# -----------------------skip this section--------------------------

deploy_l2leaseNotary_to_arb_sepolia:
	@forge build
	@forge script \
		--broadcast \
		--verify \
		--rpc-url $(ARB_SEPOLIA_RPC_URL) \
		--etherscan-api-key $(ARBSCAN_API_KEY) \
		--private-key $(MY_PRIVATE_KEY) \
		script/L2LeaseNotary.s.sol:L2LeaseNotaryScript

# update L2LEASE_NOTARY_ADDRESS in .env

update_constructor_args:
	@echo $(L2LEASE_NOTARY_ADDRESS) 1 > constructor-args.txt

mint:
	cast send --from $(LANDLORD) --private-key $(LANDLORD_PRIVATE_KEY) $(L2LEASE_NOTARY_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
	"mint(string)" \
	"新竹市東區大學路1006號"
	
check_lease_1:
	cast call $(L2LEASE_NOTARY_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
	"leases(uint256)(address)" \
	1

# update LEASE_ADDRESS in .env

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
		1 12 2

A_applyToRent:
	cast send --from $(TENANT_A) --private-key $(TENANT_A_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 2
	cast send --from $(TENANT_A) --private-key $(TENANT_A_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"applyToRent()"

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
		"applyToRent()" 
	cast send --from $(TENANT_B) --private-key $(TENANT_B_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 2
	cast send --from $(TENANT_B) --private-key $(TENANT_B_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"applyToRent()" 
	cast send --from $(TENANT_C) --private-key $(TENANT_C_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 2
	cast send --from $(TENANT_C) --private-key $(TENANT_C_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"applyToRent()" 
	cast send --from $(TENANT_D) --private-key $(TENANT_D_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 2
	cast send --from $(TENANT_D) --private-key $(TENANT_D_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"applyToRent()" 
	cast send --from $(TENANT_E) --private-key $(TENANT_E_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 2
	cast send --from $(TENANT_E) --private-key $(TENANT_E_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"applyToRent()" 

# lease_check_USDC
# 10

approveTenant_A:
	cast send --from $(LANDLORD) --private-key $(LANDLORD_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approveTenant(address)" \
		$(TENANT_A)

# lease_check_USDC
# 2

A_canUse:
	cast call --from $(LANDLORD) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"canUse(string)" \
		"新竹市東區大學路1006號"

# failed currently, but it should work after bug fixed

# after 12 seconds... (assuming 1 second = 30 days IRL)

landlord_checkDebt:
	cast call --from $(LANDLORD) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"checkDebt()"
# 12, the debt of current tenant

A_checkDebt:
	cast call --from $(TENANT_A) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"checkDebt()"
# 12, the debt of A

B_checkDebt:
	cast call --from $(TENANT_B) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"checkDebt()"
# 0, the debt of B

A_payRent:
	cast send --from $(TENANT_A) --private-key $(TENANT_A_PRIVATE_KEY) $(ARB_SEPOLIA_USDC) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"approve(address,uint256)" \
		$(LEASE_ADDRESS) 3
	cast send --from $(TENANT_A) --private-key $(TENANT_A_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"payRent(uint256)" \
		3
		
# A_checkDebt
# 9, the debt of A

canReclaim:
	cast call --from $(LANDLORD) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"canReclaim()"
# true

landlord_checkAgreement:
	cast call --from $(LANDLORD) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"checkAgreement()"

A_checkAgreement:
	cast call --from $(TENANT_A) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"checkAgreement()"

B_checkAgreement:
	cast call --from $(TENANT_B) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"checkAgreement()"
# fails. only the landlord and tenant are allowed to check

reclaimHouse:
	cast send --from $(LANDLORD) --private-key $(LANDLORD_PRIVATE_KEY) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"reclaimHouse()"

# landlord_checkAgreement
# 0x0000...0000. the agreement is cleared

# A_checkAgreement
# fails. A is not tenant anymore

# (you can start from setRentalTerms again)
