"use client"; // For Next.js 13+ App Router

import { useState, useEffect } from "react";

interface Hotel {
  hotel_id: number;
  hotel_name: string;
  category: number;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  phone_number: string;
  email: string;
  chain_name: string;
}

export default function Hotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true); // Set loading to true initially

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/hotels");
      const result = await res.json();

      setHotels(Array.isArray(result) ? result : [result]);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch hotels as soon as the component is mounted
  useEffect(() => {
    fetchHotels();
  }, []); // Empty dependency array means this runs only once on mount

  return (
    <div
      data-theme="dark"
      className="min-h-screen w-full flex flex-col items-center p-8"
    >
      <h1 className="text-4xl font-bold mb-6">🏨 Hotel Listings</h1>

      {loading && <span className="loading loading-spinner loading-lg"></span>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {hotels.length > 0 && !loading
          ? hotels.map((hotel) => (
              <div key={hotel.hotel_id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">{hotel.hotel_name}</h2>
                  <p className="text-gray-600">
                    ⭐ {hotel.category}-Star Hotel
                  </p>
                  <p>
                    <span className="font-semibold">📍 Address:</span>{" "}
                    {hotel.street_address}, {hotel.city}, {hotel.state}{" "}
                    {hotel.postal_code}
                  </p>
                  <p>
                    <span className="font-semibold">📞 Phone:</span>{" "}
                    {hotel.phone_number}
                  </p>
                  <p>
                    <span className="font-semibold">📧 Email:</span>{" "}
                    {hotel.email}
                  </p>
                  <p>
                    <span className="font-semibold">🏬 Chain:</span>{" "}
                    {hotel.chain_name}
                  </p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-secondary">View Details</button>
                  </div>
                </div>
              </div>
            ))
          : !loading && (
              <p className="text-gray-500 text-lg">No hotels available.</p>
            )}
      </div>
    </div>
  );
}
