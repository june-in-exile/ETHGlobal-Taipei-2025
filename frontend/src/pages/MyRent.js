import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Header from '@/components/Header';
import { useWeb3, chainId2Name } from '@/utils/web3Context';
import L2LeaseNotaryABI from '../abi/L2LeaseNotary.json';
import LeaseABI from '../abi/Lease.json';
import houses from '../data/houses.js';

const MyRent = () => {
  const router = useRouter();
  const { web3, account, isConnected, chainId, connectWallet } = useWeb3();
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedLease, setSelectedLease] = useState(null);
  
  useEffect(() => {
    if (isConnected && web3) {
      loadMyApplications();
    } else {
      setLoading(false);
    }
  }, [isConnected, web3, account]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Convert BigInt to Number if necessary before multiplying
    const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : Number(timestamp);
    const date = new Date(timestampNum * 1000);
    return date.toLocaleDateString();
  };

  const formatPrice = (wei) => {
    if (!web3 || !wei) return '0';
    // Convert BigInt to String if necessary before using web3.utils.fromWei
    const weiStr = typeof wei === 'bigint' ? wei.toString() : wei.toString();
    // Convert from mwei (1e6) for USDC decimals
    return parseFloat(web3.utils.fromWei(weiStr, 'mwei')).toFixed(2);
  };
  
  const loadMyApplications = async () => {
    setLoading(true);
    try {
      // Get the L2LeaseNotary contract
      const notaryContract = new web3.eth.Contract(
        L2LeaseNotaryABI,
        process.env.NEXT_PUBLIC_POL_L2LEASE_NOTARY_ADDRESS
      );
      
      // Get the total number of tokens
      const tokenIdCounter = await notaryContract.methods.tokenIdCounter().call();
      
      // For each token, check if it has a lease and if we have applied to it
      const applications = [];
      
      for (let i = 1; i <= tokenIdCounter; i++) {
        // Get the lease address for this token
        const leaseAddress = await notaryContract.methods.leases(i).call();
        
        if (leaseAddress && leaseAddress !== '0x0000000000000000000000000000000000000000') {
          // Create lease contract instance
          const leaseContract = new web3.eth.Contract(LeaseABI, leaseAddress);
          
          try {
            // Get the past events from this lease
            const events = await leaseContract.getPastEvents('ApplicationSubmitted', {
              fromBlock: 0,
              toBlock: 'latest'
            });
            
            // Filter for events where the applicant is the current user
            const myEvents = events.filter(event => 
              event.returnValues.applicant.toLowerCase() === account.toLowerCase()
            );
            
            if (myEvents.length > 0) {
              // Get house address and other details
              const houseAddr = await leaseContract.methods.houseAddr().call();
              const owner = await leaseContract.methods.owner().call();
              const monthlyRent = await leaseContract.methods.monthlyRent().call();
              const durationMonths = await leaseContract.methods.durationMonths().call();
              const depositInMonths = await leaseContract.methods.depositInMonths().call();
              
              
              let isApproved = false;
              try {
                // Check if there's an active agreement
                const agreement = await leaseContract.methods.checkAgreement().call({ from: account });
                isApproved = agreement.tenant.toLowerCase() === account.toLowerCase();
              } catch (err) {
                console.log(`Error checking agreement for lease ${leaseAddress}:`, err);
              }
              
              
              // Check debt if approved
              let debt = '0';
              if (isApproved) {
                debt = await leaseContract.methods.checkDebt().call();
              }
              
              // Extract data from the event
              const eventData = myEvents[0].returnValues;
              
              applications.push({
                id: i,
                leaseAddress,
                houseAddr,
                owner,
                status: isApproved ? 'Approved' : 'Pending',
                submittedAt: myEvents[0].blockTimestamp ? new Date(Number(myEvents[0].blockTimestamp) * 1000).toLocaleDateString() : 'N/A',
                starts: eventData.starts,
                monthlyRent: eventData.monthlyRent,
                durationMonths: eventData.durationMonths,
                depositInMonths: eventData.depositInMonths,
                isApproved,
                debt,
                // Get image from houses.js by matching tokenId, or use a default image
                image: houses.find(h => h.tokenId === i)?.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
              });
            }
          } catch (err) {
            console.error(`Error getting events for lease ${leaseAddress}:`, err);
          }
        }
      }
      
      setMyApplications(applications);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayRent = async (lease) => {
    if (!lease || !web3 || !paymentAmount) return;
    
    setSelectedLease(lease);
    setProcessingPayment(true);
    
    try {
      // Create contract instances for USDC and Lease
      const leaseContract = new web3.eth.Contract(LeaseABI, lease.leaseAddress);
      
      // Convert payment amount to mwei for USDC (6 decimals)
      const paymentWei = web3.utils.toWei(paymentAmount, 'mwei');
      
      // Approve USDC for spending
      const usdcAddress = await leaseContract.methods.USDC().call();
      const usdcContract = new web3.eth.Contract([
        {
          "type": "function",
          "name": "approve",
          "inputs": [
            {"name": "spender", "type": "address"},
            {"name": "amount", "type": "uint256"}
          ],
          "outputs": [{"name": "", "type": "bool"}],
          "stateMutability": "nonpayable"
        }
      ], usdcAddress);
      
      // First approve USDC spending
      await usdcContract.methods.approve(lease.leaseAddress, paymentWei).send({ from: account });
      
      // Then pay the rent
      const tx = await leaseContract.methods.payRent(paymentWei).send({ from: account });
      
      alert('Rent payment processed successfully!');
      
      // Reload applications to update the data
      loadMyApplications();
    } catch (err) {
      console.error('Error paying rent:', err);
      alert(`Error paying rent: ${err.message}`);
    } finally {
      setProcessingPayment(false);
      setSelectedLease(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Rental Applications</h1>
          {!isConnected && (
            <button 
              onClick={connectWallet}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Connect Wallet to View
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {!myApplications.length && isConnected ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No Applications Found</h3>
                <p className="mt-2 text-gray-600">You haven&apos;t applied to rent any properties yet.</p>
                <button 
                  onClick={() => router.push('/MapView')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Properties
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {myApplications.map((application) => (
                  <div key={application.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex">
                        {/* Property Image */}
                        <div className="w-1/4 relative h-48 mr-6">
                          <Image
                            src={application.image}
                            alt="Property"
                            fill
                            className="object-cover rounded-lg"
                            unoptimized
                          />
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium text-white ${application.isApproved ? 'bg-green-600' : 'bg-yellow-500'}`}>
                            {application.status}
                          </div>
                        </div>
                        
                        {/* Property Details */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Property in {application.houseAddr}
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Lease Address</p>
                              <a 
                                href={`https://${chainId === 1 ? '' : 'sepolia.'}arbiscan.io/address/${application.leaseAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-mono text-blue-600 hover:underline truncate block"
                              >
                                {application.leaseAddress}
                              </a>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Landlord</p>
                              <p className="text-sm font-mono text-gray-800 truncate">
                                {application.owner}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Monthly Rent</p>
                              <p className="text-sm font-medium text-gray-800">
                                {formatPrice(application.monthlyRent)} USDC
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Security Deposit</p>
                              <p className="text-sm font-medium text-gray-800">
                                {formatPrice(BigInt(application.monthlyRent) * BigInt(application.depositInMonths || 1))} USDC ({application.depositInMonths} months)
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Lease Duration</p>
                              <p className="text-sm font-medium text-gray-800">
                                {application.durationMonths} months
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Start Date</p>
                              <p className="text-sm font-medium text-gray-800">
                                {formatDate(application.starts)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Pay Rent Section */}
                          {application.isApproved && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-md font-semibold text-gray-900">Current Balance</h4>
                                  <p className={`text-sm font-medium ${Number(application.debt) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {Number(application.debt) > 0 
                                      ? `You owe: ${formatPrice(application.debt)} USDC` 
                                      : 'No rent due at this time'}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="number"
                                    placeholder="Amount in USDC"
                                    className="border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                                    value={application.id === (selectedLease?.id || '') ? paymentAmount : ''}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    disabled={processingPayment}
                                  />
                                  <button
                                    onClick={() => handlePayRent(application)}
                                    disabled={processingPayment || !paymentAmount}
                                    className={`bg-green-600 text-white px-4 py-2 rounded-r-md text-sm font-medium ${
                                      processingPayment ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                                    }`}
                                  >
                                    {processingPayment && selectedLease?.id === application.id ? (
                                      <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing
                                      </span>
                                    ) : (
                                      'Pay Rent'
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyRent;