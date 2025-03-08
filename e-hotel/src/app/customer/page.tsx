"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../context/UserContext";

const CustomerLandingPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [state, setState] = useState("");
  const [chainId, setChainId] = useState("");
  const [category, setCategory] = useState("");
  const [minRooms, setMinRooms] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const { user } = useUser();
  console.log(user);
  interface Hotel {
    name: string;
    hotel_chain: string;
    category: number;
    address: {
      street_address: string;
      city: string;
      state: string;
    };
    rooms: {
      room_id: number;
      price: number;
      capacity: string;
      view: string;
      amenities: string;
    }[];
  }

  const [hotels, setHotels] = useState<{ hotels: Hotel[] }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (startDate && endDate) {
        try {
          const response = await fetch(
            "http://localhost:3000/rooms/available-rooms",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                startDate,
                endDate,
                capacity,
                state,
                chainId,
                category,
                minRooms,
                maxPrice,
              }),
            }
          );

          if (!response.ok) throw new Error("Failed to fetch rooms");

          const data = await response.json();
          setHotels(data);
        } catch (error) {
          console.error("Error fetching rooms:", error);
        }
      }
    };

    fetchData();
  }, [
    startDate,
    endDate,
    capacity,
    state,
    chainId,
    category,
    minRooms,
    maxPrice,
  ]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Find Available Rooms</h1>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input input-bordered w-full"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="input input-bordered w-full"
        />

        <select
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="">Capacity</option>
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="family">Family</option>
          <option value="suite">Suite</option>
        </select>

        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="input input-bordered w-full"
        />

        <input
          type="number"
          placeholder="Hotel Chain ID"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
          className="input input-bordered w-full"
        />

        <input
          type="number"
          placeholder="Category (1-5)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input input-bordered w-full"
        />

        <input
          type="number"
          placeholder="Min Rooms"
          value={minRooms}
          onChange={(e) => setMinRooms(e.target.value)}
          className="input input-bordered w-full"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      {/* Display Available Hotels and Rooms */}
      {hotels.length > 0 ? (
        hotels.map((hotelObj, index) => (
          <div key={index} className="card bg-base-100 shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold">
              {hotelObj.hotels[0].name}
            </h2>
            <p className="text-gray-500">
              {hotelObj.hotels[0].hotel_chain} - {hotelObj.hotels[0].category}{" "}
              ⭐
            </p>
            <p className="text-gray-500">
              {hotelObj.hotels[0].address.street_address},{" "}
              {hotelObj.hotels[0].address.city},{" "}
              {hotelObj.hotels[0].address.state}
            </p>

            {/* Rooms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {hotelObj.hotels[0].rooms.map((room) => (
                <div
                  key={room.room_id}
                  className="card bg-gray-100 p-4 shadow-md"
                >
                  <h3 className="text-lg font-semibold">Room {room.room_id}</h3>
                  <p>
                    Price:{" "}
                    <span className="font-bold">${room.price}/night</span>
                  </p>
                  <p>Capacity: {room.capacity}</p>
                  <p>View: {room.view}</p>
                  <p>Amenities: {room.amenities}</p>

                  <button
                    className="btn btn-primary mt-2 w-full"
                    onClick={() => router.push("/rooms/" + room.room_id)}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>No rooms available. Try adjusting filters.</p>
      )}
    </div>
  );
};

export default CustomerLandingPage;
