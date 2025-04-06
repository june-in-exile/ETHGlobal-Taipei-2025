import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Head from 'next/head';
import { useWeb3 } from '@/utils/web3Context';
import L2LeaseNotaryABI from '../abi/L2LeaseNotary';
import LeaseABI from '../abi/Lease';
import houses from '../data/houses';
import Image from 'next/image';

const ManageProperties = () => {

  const { web3, account, isConnected, chainId, connectWallet } = useWeb3();

  const router = useRouter();
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProperty, setEditingProperty] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
  const [tenantAddress, setTenantAddress] = useState('');
  const [editFormData, setEditFormData] = useState({
    price: '',
    depositInMonths: '',
    minLeaseTerm: ''
  });

  useEffect(() => {
    if (isConnected && web3) {
      fetchMyProperties();
    } else {
      setLoading(false);
      setError('Please connect your wallet to view your properties');
    }
  }, [isConnected, web3, account]);

  const fetchMyProperties = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!web3 || !account) {
        throw new Error('Web3 or account not available');
      }

      const contract = new web3.eth.Contract(
        L2LeaseNotaryABI, 
        process.env.NEXT_PUBLIC_POL_L2LEASE_NOTARY_ADDRESS
      );

      // Get all the HouseMinted events
      const events = await contract.getPastEvents('HouseMinted', {
        fromBlock: 0,
        toBlock: 'latest'
      });

      // Process each event
      let userProperties = [];
      
      for (const event of events) {
        const { houseAddr, tokenId, owner } = event.returnValues;
        try {          
          // Check if this property belongs to the connected user
          if (owner.toLowerCase() === account.toLowerCase()) {
            // Get lease contract info
            const lease = await contract.methods.leases(tokenId).call();
            // Find property in houses.js data by tokenId
            const propertyData = houses.find(h => h.tokenId === parseInt(tokenId, 10));
            
            if (propertyData) {
              userProperties.push({
                ...propertyData,
                leaseAddress: lease,
                tokenId: tokenId
              });
            } else {
              // Create basic info if not in houses data
              userProperties.push({
                id: tokenId,
                tokenId: parseInt(tokenId, 10),
                title: `Property #${tokenId}`,
                address: houseAddr,
                leaseAddress: lease,
                images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2946&q=80']
              });
            }
          }
        } catch (err) {
          console.error('Error fetching lease data:', err);
        }
      }

      setMyProperties(userProperties);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Error fetching properties: ' + err.message);
      setLoading(false);
    }
  };

  const handlePostNewProperty = () => {
    router.push('/PostProperty');
  };
  
  const handleEditProperty = (property) => {
    // Extract numeric month value from lease term
    let leaseMonths = 12; // Default
    if (property.lease) {
      const match = property.lease.match(/(\d+)/);
      if (match && match[1]) {
        leaseMonths = parseInt(match[1]);
      }
    }
    setEditingProperty(property);
    setEditFormData({
      price: property.price || '',
      depositInMonths: property.depositInMonths || 2,
      minLeaseTerm: leaseMonths.toString()
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };
  
  const handleSaveRentalTerms = async () => {
    if (!editingProperty || !web3 || !editingProperty.leaseAddress) return;
    
    try {
      // Create a contract instance for the specific lease
      const leaseContract = new web3.eth.Contract(
        LeaseABI,
        editingProperty.leaseAddress
      );
      
      // Convert form values to appropriate formats for the contract
      const monthlyRent = web3.utils.toWei(editFormData.price.toString(), 'mwei'); // Convert to wei
      const durationMonths = parseInt(editFormData.minLeaseTerm) || 12; // Default to 12 if parsing fails
      const depositInMonths = parseInt(editFormData.depositInMonths);
      
      console.log(`Updating lease contract ${editingProperty.leaseAddress} with:`, {
        monthlyRent,
        durationMonths,
        depositInMonths
      });
      
      // Call the setRentalTerms function on the smart contract
      const tx = await leaseContract.methods.setRentalTerms(
        monthlyRent,
        durationMonths,
        depositInMonths
      ).send({ from: account });
      
      console.log('Transaction successful:', tx);
      
      // Update the local state after blockchain update
      const updatedProperties = myProperties.map(p => {
        if (p.id === editingProperty.id) {
          return {
            ...p,
            price: editFormData.price,
            depositInMonths: editFormData.depositInMonths,
            lease: `${durationMonths} months`
          };
        }
        return p;
      });
      
      setMyProperties(updatedProperties);
      setEditingProperty(null);
    } catch (err) {
      console.error('Error updating rental terms:', err);
      alert(`Error updating rental terms: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Manage Properties | HomeSeeker</title>
        <meta name="description" content="Manage your properties on HomeSeeker" />
      </Head>
      <Header />
      
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Your Properties</h1>
          <button 
            onClick={handlePostNewProperty}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Post New Property
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg text-gray-600">Loading your properties...</span>
          </div>
        ) : error && !isConnected ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
                <div className="mt-4">
                  <button
                    onClick={connectWallet}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
                  >
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-4">
                  <button
                    onClick={fetchMyProperties}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red active:bg-red-700 transition ease-in-out duration-150"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : myProperties.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-8 text-center">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
            <p className="mt-2 text-gray-500">You don&apos;t have any properties listed yet. Post your first property to get started.</p>
            <div className="mt-6">
              <button
                onClick={handlePostNewProperty}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Post Your First Property
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {myProperties.map(property => (
                <div key={property.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48 w-full">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                      #{property.tokenId}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
                    <p className="text-sm text-gray-500 mb-2 truncate">{property.location || "Location not specified"}</p>
                    
                    {property.price && (
                      <div className="flex items-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-blue-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{property.price} USDC /month</span>
                      </div>
                    )}
                    
                    <div className="mt-3 mb-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <div className="w-5 h-5 mr-2 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-indigo-600">
                              <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875z" />
                              <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 001.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 001.897 1.384C6.809 12.164 9.315 12.75 12 12.75z" />
                              <path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 15.914 9.315 16.5 12 16.5z" />
                              <path d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 19.664 9.315 20.25 12 20.25z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <span className="text-xs text-gray-500">Lease Address</span>
                            <a 
                              href={`https://${chainId === '0x1' ? '' : 'sepolia.'}arbiscan.io/address/${property.leaseAddress}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block font-mono text-xs bg-gray-100 p-1 rounded truncate mt-0.5 border border-gray-200 text-blue-700 hover:text-blue-900 hover:bg-gray-200 transition-colors"
                              title="View contract on Arbiscan"
                            >
                              {property.leaseAddress?.substring(0, 12)}...{property.leaseAddress?.substring(property.leaseAddress?.length - 10)}
                              <span className="inline-block ml-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 inline">
                                  <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                                </svg>
                              </span>
                            </a>
                          </div>
                        </div>
                        
                        {property.available && (
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-2 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-green-600">
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Available From</span>
                              <p className="text-sm font-medium text-gray-800 mt-0.5">{property.available}</p>
                            </div>
                          </div>
                        )}
                        
                        {property.depositInMonths && (
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-2 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-blue-600">
                                <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                                <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Security Deposit</span>
                              <p className="text-sm font-medium text-gray-800 mt-0.5">{property.depositInMonths} {property.depositInMonths === 1 ? 'month' : 'months'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        className="flex-1 text-xs py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md shadow-sm hover:shadow-md transition-shadow flex items-center justify-center"
                        onClick={() => setViewingProperty(property)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 mr-1">
                          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                          <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                        </svg>
                        View Details
                      </button>
                      <button 
                        className="flex-1 text-xs py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-md shadow-sm hover:shadow-md transition-shadow flex items-center justify-center"
                        onClick={() => handleEditProperty(property)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 mr-1">
                          <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                          <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
                        </svg>
                        Edit Property
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* View Property Details Modal */}
      {viewingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Property Details</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setViewingProperty(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="relative h-48 w-full mb-4 rounded-md overflow-hidden">
                  {viewingProperty.images && viewingProperty.images.length > 0 ? (
                    <Image
                      src={viewingProperty.images[0]}
                      alt={viewingProperty.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-lg mb-1">{viewingProperty.title}</h4>
                  <p className="text-gray-500 text-sm">{viewingProperty.location}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Price</span>
                    <span className="font-medium">{viewingProperty.price} USDC/month</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Token ID</span>
                    <span className="font-medium">#{viewingProperty.tokenId}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Deposit</span>
                    <span className="font-medium">{viewingProperty.depositInMonths} {viewingProperty.depositInMonths === 1 ? 'month' : 'months'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Lease Term</span>
                    <span className="font-medium">{viewingProperty.lease}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Available From</span>
                    <span className="font-medium">{viewingProperty.available}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Contract Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500 block">Lease Contract</span>
                      <a 
                        href={`https://${chainId === '0x1' ? '' : 'sepolia.'}arbiscan.io/address/${viewingProperty.leaseAddress}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-blue-600 hover:text-blue-800 break-all"
                      >
                        {viewingProperty.leaseAddress}
                      </a>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-semibold text-gray-800 mb-3">Landlord Actions</h4>
                
                <div className="mb-6 space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Reclaim House</h5>
                    <p className="text-xs text-gray-500 mb-2">If the lease is expired or terminated, you can reclaim your property.</p>
                    <button 
                      onClick={async () => {
                        try {
                          if (!web3 || !viewingProperty.leaseAddress) return;
                          
                          const leaseContract = new web3.eth.Contract(
                            LeaseABI,
                            viewingProperty.leaseAddress
                          );
                          
                          const tx = await leaseContract.methods.reclaimHouse().send({ from: account });
                          console.log('House reclaimed successfully:', tx);
                          alert('House reclaimed successfully!');
                          
                          // Refresh properties after reclaiming
                          await fetchMyProperties();
                          setViewingProperty(null);
                        } catch (err) {
                          console.error('Error reclaiming house:', err);
                          alert(`Error reclaiming house: ${err.message}`);
                        }
                      }}
                      className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      Reclaim House
                    </button>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Approve Tenant</h5>
                    <p className="text-xs text-gray-500 mb-2">Approve a tenant to allow them to rent this property.</p>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Tenant address (0x...)"
                        value={tenantAddress}
                        onChange={(e) => setTenantAddress(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button 
                        onClick={async () => {
                          try {
                            if (!web3 || !viewingProperty.leaseAddress || !tenantAddress) return;
                            
                            if (!web3.utils.isAddress(tenantAddress)) {
                              alert('Please enter a valid Ethereum address');
                              return;
                            }
                            
                            const leaseContract = new web3.eth.Contract(
                              LeaseABI,
                              viewingProperty.leaseAddress
                            );
                            
                            const tx = await leaseContract.methods.approveTenant(tenantAddress).send({ from: account });
                            console.log('Tenant approved successfully:', tx);
                            alert('Tenant approved successfully!');
                            setTenantAddress('');
                          } catch (err) {
                            console.error('Error approving tenant:', err);
                            alert(`Error approving tenant: ${err.message}`);
                          }
                        }}
                        className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
                        disabled={!tenantAddress}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      setViewingProperty(null);
                      setEditingProperty(viewingProperty);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Edit Rental Terms
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Property Modal */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Property</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setEditingProperty(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-500">Property: <span className="font-medium text-gray-900">{editingProperty.title}</span></p>
              <p className="text-xs text-gray-500">Token ID: #{editingProperty.tokenId}</p>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent (USDC)
                </label>
                <input
                  type="number"
                  name="price"
                  value={editFormData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter monthly rent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Security Deposit (months)
                </label>
                <select
                  name="depositInMonths"
                  value={editFormData.depositInMonths}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">0 months</option>
                  <option value="1">1 month</option>
                  <option value="2">2 months</option>
                  <option value="3">3 months</option>
                </select>
              </div>
              
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lease Term (months)
                </label>
                <select
                  name="minLeaseTerm"
                  value={editFormData.minLeaseTerm}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1">1 month</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRentalTerms}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProperties;