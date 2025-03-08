"use client";

import { useState, useEffect } from "react";
import BookingModal from "./components/bookingModal";

const CustomerLandingPage = () => {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [capacity, setCapacity] = useState("");
  const [city, setCity] = useState("");
  const [chainId, setChainId] = useState("");
  const [category, setCategory] = useState("");
  const [minRooms, setMinRooms] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<{
    roomId: number;
    price: number;
  } | null>(null);
  const [triggerFetch, setTriggerFetch] = useState(0); // State to trigger re-fetch

  const [showModal, setShowModal] = useState(false);

  interface Hotel {
    name: string;
    hotel_chain: string;
    category: number;
    total_capacity: number;
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

  interface AreaCount {
    city: string;
    available_rooms: number;
  }

  const [hotels, setHotels] = useState<{ hotels: Hotel[] }[]>([]);
  const [availableRoomsPerArea, setAvailableRoomsPerArea] = useState<
    AreaCount[]
  >([]);

  useEffect(() => {
    const fetchAvailableRoomsPerArea = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/rooms/available-rooms-per-area",
          {
            method: "GET",
          }
        );
        const data = await response.json();
        setAvailableRoomsPerArea(data);
      } catch (error) {
        console.error("Error fetching available rooms per area:", error);
      }
    };

    fetchAvailableRoomsPerArea();
  }, [triggerFetch]);

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
                city,
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
    city,
    chainId,
    category,
    minRooms,
    maxPrice,
    triggerFetch,
  ]);

  useEffect(() => {});

  const refreshRooms = () => {
    setTriggerFetch((prev) => prev + 1); // Increment to trigger re-fetch
  };

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

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="">Select City</option>
          {availableRoomsPerArea.map((area) => (
            <option key={area.city} value={area.city}>
              {area.city} ({area.available_rooms} rooms)
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Hotel Chain ID"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
          className="input input-bordered w-full"
        />

        <div className="relative">
          <input
            type="number"
            placeholder="Ratings (1-5)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            ★
          </span>
        </div>

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
            <h2 className="text-2xl font-semibold flex items-center justify-between">
              {hotelObj.hotels[0].name}
              <span className="text-sm font-medium text-gray-600">
                Total Capacity: {hotelObj.hotels[0].total_capacity} guests
              </span>
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
                    onClick={() => {
                      setSelectedRoom({
                        roomId: room.room_id,
                        price: room.price,
                      });
                      setShowModal(true);
                    }}
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

      {/* Use BookingModal Component */}
      {selectedRoom && (
        <BookingModal
          roomId={selectedRoom.roomId}
          price={selectedRoom.price}
          startDate={startDate}
          endDate={endDate}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          refreshRooms={refreshRooms}
        />
      )}
    </div>
  );
};

export default CustomerLandingPage;
