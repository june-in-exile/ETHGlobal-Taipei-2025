import { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Head from 'next/head';
import { useWeb3 } from '@/utils/web3Context';
import L2LeaseNotaryABI from '../abi/L2LeaseNotary';
import Web3 from 'web3';
// Simple mint functionality for hackathon demo

const PostProperty = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    lease: '12 months',
    available: 'Now',
    description: '',
    amenities: [],
    images: []
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const [mintError, setMintError] = useState('');
  const [mintResult, setMintResult] = useState(null);
  
  // Get web3 context
  const { web3, account, isConnected, chainId, connectWallet } = useWeb3();

  const amenityOptions = [
    'Wifi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating',
    'Dedicated workspace', 'Free parking', 'Gym', 'Pool', 'Hot tub',
    'Dishwasher', 'Balcony', 'Garden', 'Pet friendly', 'Doorman',
    'Elevator', 'Fireplace', 'Cable TV', 'Utilities Included'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAmenityToggle = (amenity) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(a => a !== amenity)
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      });
    }
  };
  const getLeaseContract = async (address) => {
      if (!isConnected || !web3) return null;
    
      const contract = new web3.eth.Contract(L2LeaseNotaryABI, process.env.NEXT_PUBLIC_POL_L2LEASE_NOTARY_ADDRESS);
    
      return new Promise((resolve, reject) => {
        let found = false;
        const subscription = contract.events.HouseMinted({
          fromBlock: 0
        })
        subscription.on('data', async (event) => {
          const { houseAddr, tokenId } = event.returnValues;
          if (houseAddr.toLowerCase() === address.toLowerCase()) {
            found = true;
            try {
              const lease = await contract.methods.leases(tokenId).call();
              resolve(lease);
            } catch (error) {
              console.error('Error calling leases:', error);
              resolve(null);
            }
            subscription.unsubscribe();
          }
        })
    
        setTimeout(() => {
          if (!found) {
            subscription.unsubscribe();
            resolve(null);
          }
        }, 3000);
      });
    };
  
  
  // Handle NFT minting - simplified for hackathon demo
  const handleMintNFT = async (address) => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    
    if (!address.trim()) {
      setMintError('Please enter a valid property address');
      return;
    }
    
    setMintLoading(true);
    setMintError('');
    
    try {
      // Check if NFT already exists for this address
      const leaseAddress = await getLeaseContract(address);
      if (leaseAddress) {
        setMintResult({
          leaseAddress: leaseAddress
        });
        setMintLoading(false);
        return;
      } else {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(L2LeaseNotaryABI, process.env.NEXT_PUBLIC_POL_L2LEASE_NOTARY_ADDRESS);  
        const result = await contract.methods.mint(address).send({ from: account });
        const leaseAddress = await getLeaseContract(address);
        
        // Set mint result to show success message with lease address
        setMintResult({
          transactionHash: result.transactionHash,
          leaseAddress: leaseAddress
        });
      }
      setMintLoading(false);
    } catch (error) {
      console.error('Error minting property NFT:', error);
      setMintError(error.message || 'Error minting property NFT');
      setMintLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/MapView');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('Property data submitted:', formData);
    
    // Show success message
    setShowSuccess(true);
    
    // Redirect after a delay to show the success message
    setTimeout(() => {
      router.push('/MapView');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Post Your Property | HomeSeeker</title>
        <meta name="description" content="List your property on HomeSeeker" />
      </Head>
      <Header />
      
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-100 p-2">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-center text-gray-900">Property Listed Successfully!</h3>
            <p className="mt-2 text-sm text-center text-gray-500">Your property has been submitted and will be visible on the map shortly.</p>
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600">
                Redirecting to Map View...
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">List Your Property</h1>
            <p className="mt-1 text-sm text-gray-600">Fill out the form below to list your property on HomeSeeker</p>
          </div>
          <button 
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Basic Information */}
              <div className="sm:col-span-6">
                <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">Property Details</h2>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., 123 Main St, San Francisco, CA"
                    className="mt-1 block flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleMintNFT(formData.location)}
                    disabled={!formData.location || mintLoading || !isConnected}
                    className="mt-1 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {mintLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Minting...
                      </>
                    ) : "Mint NFT"}
                  </button>
                </div>
                {mintError && (
                  <p className="mt-2 text-sm text-red-600">{mintError}</p>
                )}
                {mintResult && (
                  <div className="mt-3 p-3 border rounded-md bg-green-50 border-green-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          {mintResult.transactionHash ? "Property NFT minted successfully!" : "Property NFT already exists!"}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="mt-2 pl-8">
                      {mintResult.transactionHash && (
                        <div className="flex items-center text-sm text-green-700 mb-2">
                          <span>Transaction: </span>
                          <a 
                            href={`https://${chainId === '0x1' ? '' : 'sepolia.'}arbiscan.io/tx/${mintResult.transactionHash}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 underline hover:text-green-900"
                          >
                            View on explorer
                          </a>
                        </div>
                      )}
                      
                      {mintResult.leaseAddress && (
                        <div className="text-sm text-green-700">
                          <div className="flex items-center">
                            <span className="font-medium">Lease Contract:</span>
                            <div className="ml-1 flex items-center">
                              <a
                                href={`https://${chainId === '0x1' ? '' : 'sepolia.'}arbiscan.io/address/${mintResult.leaseAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-green-900"
                                title={mintResult.leaseAddress}
                              >
                                {mintResult.leaseAddress.substring(0, 6)}...{mintResult.leaseAddress.substring(mintResult.leaseAddress.length - 4)}
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(mintResult.leaseAddress);
                                }}
                                className="ml-2 text-green-600 hover:text-green-800 active:text-green-300"
                                title="Copy to clipboard"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Property Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Modern Apartment in Downtown"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Monthly Rent (USDC)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="price"
                    id="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 2000"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md py-2 px-3"
                    required
                  />
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                  Bedrooms
                </label>
                <select
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select</option>
                  <option value="Studio">Studio</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4 Bedrooms</option>
                  <option value="5+">5+ Bedrooms</option>
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                  Bathrooms
                </label>
                <select
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select</option>
                  <option value="1">1 Bathroom</option>
                  <option value="1.5">1.5 Bathrooms</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="2.5">2.5 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="3+">3+ Bathrooms</option>
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="sqft" className="block text-sm font-medium text-gray-700">
                  Square Footage
                </label>
                <input
                  type="number"
                  name="sqft"
                  id="sqft"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  placeholder="e.g., 850"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="lease" className="block text-sm font-medium text-gray-700">
                  Lease Term
                </label>
                <select
                  id="lease"
                  name="lease"
                  value={formData.lease}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="Month-to-month">Month-to-month</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="available" className="block text-sm font-medium text-gray-700">
                  Available From
                </label>
                <select
                  id="available"
                  name="available"
                  value={formData.available}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="Now">Now</option>
                  <option value="Next week">Next week</option>
                  <option value="Next month">Next month</option>
                  <option value="In 2 months">In 2 months</option>
                  <option value="In 3 months">In 3 months</option>
                </select>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your property..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              {/* Amenities */}
              <div className="sm:col-span-6">
                <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">Amenities</h2>
                <div className="mt-1 grid grid-cols-2 gap-y-2 gap-x-4 sm:grid-cols-3 md:grid-cols-4">
                  {amenityOptions.map((amenity) => (
                    <div key={amenity} className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`amenity-${amenity}`}
                          name={`amenity-${amenity}`}
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`amenity-${amenity}`} className="font-medium text-gray-700">
                          {amenity}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Photos */}
              <div className="sm:col-span-6">
                <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">Photos</h2>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload files</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">(Note: In this demo, file upload is simulated)</p>
              </div>
              
              {/* Property Preview */}
              <div className="sm:col-span-6">
                <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">Property Preview</h2>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-800 mb-2">This is how your property will appear on the map:</div>
                  <div className="bg-white shadow rounded-lg p-4 flex items-start">
                    <div className="h-20 w-20 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{formData.title || 'Your Property Title'}</div>
                      <div className="text-gray-600 text-sm">{formData.location || 'Property Location'}</div>
                      <div className="flex mt-2 space-x-2">
                        <span className="inline-block text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                          {formData.bedrooms ? `${formData.bedrooms} Bed` : 'Bedrooms'}
                        </span>
                        <span className="inline-block text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                          {formData.sqft ? `${formData.sqft} sq ft` : 'Square Footage'}
                        </span>
                        <span className="inline-block text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold">
                          {formData.price || '0'} USDC/mo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  List Property
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostProperty;