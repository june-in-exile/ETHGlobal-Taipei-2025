import { useState, useEffect } from "react";
import Image from "next/image";
import { chainId2Name, useWeb3 } from "@/utils/web3Context";
import L2LeaseNotaryABI from "../abi/L2LeaseNotary";
import LeaseABI from "../abi/Lease";
const PropertyDetails = ({ property, onClose }) => {
  const { web3, account, isConnected, chainId, connectWallet } = useWeb3();

  const [activeTab, setActiveTab] = useState("details");
  const [startDate, setStartDate] = useState("");
  const [intendedStartDate, setIntendedStartDate] = useState(null);

  const [leaseAddress, setLeaseAddress] = useState(null);
  const [chainName, setChainName] = useState(null);

  useEffect(() => {
    // Set default start date to 2 weeks from now
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    const formattedDate = twoWeeksFromNow.toISOString().split("T")[0];
    setStartDate(formattedDate);
    setIntendedStartDate(Math.floor(twoWeeksFromNow.getTime() / 1000)); // UTC timestamp in seconds
  }, []);
  useEffect(
    () => {
      const loadLease = async () => {
        const contract = new web3.eth.Contract(
          L2LeaseNotaryABI,
          process.env.NEXT_PUBLIC_POL_L2LEASE_NOTARY_ADDRESS
        );
        try {
          setLeaseAddress(
            await contract.methods.leases(property.tokenId).call()
          );
          setChainName(chainId2Name[await web3.eth.getChainId()]);
        } catch (err) {
          console.error("Failed to load lease data:", err);
        }
      };

      if (property.tokenId) loadLease();
    },
    [property.tokenId]
  );

  if (!property) return null;

  const handleApply = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    const contract = new web3.eth.Contract(LeaseABI, leaseAddress);
    try {
      await contract.methods
        .applyToRent(intendedStartDate)
        .send({ from: account });
    } catch (err) {
      console.error("Failed to submit application:", err);
      alert("Failed to submit application. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {property.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Image Gallery */}
        <div className="relative h-72 w-full bg-gray-100">
          {property.images && property.images.length > 0
            ? <Image
                src={property.images[0]}
                alt={property.title}
                fill
                className="object-cover"
                unoptimized
              />
            : <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No images available</p>
              </div>}

          {/* Price tag */}
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white font-bold px-3 py-1 rounded-md shadow-md text-lg">
            {property.price} USDC{" "}
            <span className="text-sm font-normal text-blue-100">/month</span>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex space-x-2">
            {property.superhost &&
              <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3 h-3 mr-0.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified
              </div>}
            {property.new &&
              <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                New
              </div>}
          </div>

          {/* NFT badge if available */}
          <div className="absolute top-4 right-4">
            <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3 h-3 mr-0.5"
              >
                <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                <path
                  fillRule="evenodd"
                  d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z"
                  clipRule="evenodd"
                />
              </svg>
              NFT Property
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab ===
              "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              onClick={() => setActiveTab("details")}
            >
              Property Details
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab ===
              "amenities"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              onClick={() => setActiveTab("amenities")}
            >
              Amenities
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab ===
              "lease"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              onClick={() => setActiveTab("lease")}
            >
              Lease Information
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === "details" &&
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 flex items-center mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 mr-1 text-blue-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                    {property.location}
                  </p>
                </div>
                <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-amber-500 mr-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">
                    {property.rating}
                  </span>
                  <span className="text-gray-500 ml-1">
                    ({property.reviewsCount} reviews)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Property Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-blue-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm text-gray-500">Layout</div>
                        <div className="font-medium">
                          {property.layout}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-blue-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                        />
                      </svg>
                      <div>
                        <div className="text-sm text-gray-500">
                          Square Footage
                        </div>
                        <div className="font-medium">
                          {property.sqft} sq ft
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-blue-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm text-gray-500">Bedrooms</div>
                        <div className="font-medium">
                          {property.bedInfo.split("·")[0].trim()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-blue-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="font-medium">
                          {property.price} USDC/month
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-blue-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm text-gray-500">
                          Available From
                        </div>
                        <div className="font-medium">
                          {property.available}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-blue-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                        />
                      </svg>
                      <div>
                        <div className="text-sm text-gray-500">Lease Term</div>
                        <div className="font-medium">
                          {property.lease}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Property Description
                  </h4>
                  <p className="text-gray-600">
                    {property.description ||
                      "This beautiful property offers modern living in a fantastic location. Perfect for those looking for comfort and convenience."}
                  </p>

                  {/* Property Manager */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Listed By
                    </h4>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6 text-blue-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Property Manager</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <span>Verified Listing</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4 ml-1 text-blue-500"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>}

          {activeTab === "amenities" &&
            <div>
              <h4 className="font-medium text-gray-800 mb-3">All Amenities</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map(amenity =>
                  <div key={amenity} className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 mr-2 text-green-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      {amenity}
                    </span>
                  </div>
                )}
              </div>
            </div>}

          {activeTab === "lease" &&
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  Lease Information
                </h4>
                <div className="bg-gray-50 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Lease Term</p>
                      <p className="font-medium">
                        {property.lease}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available From</p>
                      <p className="font-medium">
                        {property.available}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Rent</p>
                      <p className="font-medium">
                        {property.price} USDC
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Security Deposit</p>
                      <p className="font-medium">
                        {property.price * (property.depositInMonths || 2)} USDC
                        ({property.depositInMonths || 2} months)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">
                  NFT Property Information
                </h4>
                <div className="bg-purple-50 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Lease Contract Address
                      </p>
                      <div className="flex items-center">
                        <p className="font-mono font-medium truncate text-sm">
                          <a
                            href={`https://${chainId === "0x1"
                              ? ""
                              : "sepolia."}arbiscan.io/address/${leaseAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-green-900"
                            title={leaseAddress}
                          >
                            {leaseAddress}
                          </a>
                        </p>
                        <button
                          className="ml-2 text-blue-600 hover:text-blue-800"
                          title="Copy to clipboard"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Chain</p>
                      <p className="font-medium">
                        {chainName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">
                {property.price} USDC
              </span>
              <span className="text-gray-600 ml-1">/month</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <label
                  htmlFor="start-date"
                  className="pl-2 text-xs text-gray-500 mb-1"
                >
                  Move-in Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value);
                    const timestamp = Math.floor(
                      new Date(e.target.value).getTime() / 1000
                    );
                    setIntendedStartDate(timestamp);
                  }}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition duration-200"
                onClick={() => {
                  handleApply();
                }}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
