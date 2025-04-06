include .env

MY_WALLET := $(TENANT_A)
MY_PRIVATE_KEY := $(TENANT_A_PRIVATE_KEY)
ANVIL_RPC_URL := 127.0.0.1:8545
# ARB_SEPOLIA_RPC_URL := 127.0.0.1:8545

# -----------------------skip this section--------------------------

fork:
	anvil --fork-url $(ARB_SEPOLIA_RPC_URL) --chain-id 421614

deploy_l2LeaseNotary_to_forked_arb_sepolia:
	@forge build
	@forge script \
    	--broadcast \
		--fork-url $(ANVIL_RPC_URL) \
    	--private-key $(MY_PRIVATE_KEY) \
    	script/L2LeaseNotary.s.sol:L2LeaseNotaryScript

# deploy_lease_to_arb_sepolia:
# 	@forge build
# 	@forge script \
# 		--broadcast \
# 		--verify \
# 		--rpc-url $(ARB_SEPOLIA_RPC_URL) \
# 		--etherscan-api-key $(ARBSCAN_API_KEY) \
# 		--private-key $(MY_PRIVATE_KEY) \
# 		script/Lease.s.sol:LeaseScript

# set_expiration:
# 	cast rpc evm_setNextBlockTimestamp 1759248000
# 	cast rpc evm_mine

# mine:
# 	cast rpc evm_mine

# auto_mine:
# 	cast rpc evm_setAutomine true

deploy_l2LeaseNotary_to_pol_amoy:
	@forge build
	@forge script \
		--broadcast \
		--verify \
		--rpc-url $(POL_AMOY_RPC_URL) \
		--etherscan-api-key $(POLSCAN_API_KEY) \
		--private-key $(MY_PRIVATE_KEY) \
		script/L2LeaseNotary.s.sol:L2LeaseNotaryScript

deploy_l2LeaseNotary_to_base_sepolia:
	@forge build
	@forge script \
		--broadcast \
		--verify \
		--rpc-url $(BASE_SEPOLIA_RPC_URL) \
		--etherscan-api-key $(BASESCAN_API_KEY) \
		--private-key $(MY_PRIVATE_KEY) \
		script/L2LeaseNotary.s.sol:L2LeaseNotaryScript


# -----------------------skip this section--------------------------

deploy_l2LeaseNotary_to_arb_sepolia:
	@forge build
	@forge script \
		--broadcast \
		--verify \
		--rpc-url $(ARB_SEPOLIA_RPC_URL) \
		--etherscan-api-key $(ARBSCAN_API_KEY) \
		--private-key $(MY_PRIVATE_KEY) \
		script/L2LeaseNotary.s.sol:L2LeaseNotaryScript

# update L2LEASE_NOTARY_ADDRESS in .env

addRegistrar:
	cast send --from $(MY_WALLET) --private-key $(MY_PRIVATE_KEY) $(L2REGISTRY_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"addRegistrar(address)" \
		$(L2LEASE_NOTARY_ADDRESS)

update_constructor_args:
	@echo $(L2LEASE_NOTARY_ADDRESS) 1 > constructor-args.txt

mint:
	cast send --from $(LANDLORD) --private-key $(LANDLORD_PRIVATE_KEY) $(L2LEASE_NOTARY_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
	"mint(string)" \
	"新竹市東區大學路2號"
	
findLease:
	cast call $(L2LEASE_NOTARY_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
	"findLease(string)(address)" \
	"新竹市東區大學路2號"

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
	cast call --from $(TENANT_A) $(L2LEASE_NOTARY_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"canUse(string)" \
		"新竹市東區大學路1號"

syncUser:
	cast call --from $(LANDLORD) $(L2LEASE_NOTARY_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
		"syncUser(uint256)" \
		1

# getUserInfo:
# 	cast call --from $(LANDLORD) $(LEASE_ADDRESS) --rpc-url $(ARB_SEPOLIA_RPC_URL) \
# 		"getUserInfo()"

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
