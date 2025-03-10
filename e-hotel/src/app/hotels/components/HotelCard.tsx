import React, { useState } from "react";
import RoomCreateModal from "./RoomCreateModal";
import HotelEditModal from "./HotelEditModal";
import { Hotel } from "../page";

const HotelCard: React.FC<{ hotel: Hotel }> = ({ hotel }) => {
  const [isRoomModalOpen, setRoomModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [hotelData, setHotelData] = useState(hotel);
  const handleHotelUpdated = (updatedHotel: Hotel) => {
    setHotelData(updatedHotel);
  };
  return (
    <div key={hotelData.hotel_id} className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{hotelData.hotel_name}</h2>
        <p className="text-gray-600">⭐ {hotelData.category}-Star Hotel</p>
        <p>
          <span className="font-semibold">📍 Address:</span>{" "}
          {hotelData.street_address}, {hotelData.city}, {hotelData.state}{" "}
          {hotelData.postal_code}
        </p>
        <p>
          <span className="font-semibold">📞 Phone:</span>{" "}
          {hotelData.phone_number}
        </p>
        <p>
          <span className="font-semibold">📧 Email:</span> {hotelData.email}
        </p>
        <p>
          <span className="font-semibold">🏬 Chain:</span>{" "}
          {hotelData.chain_name}
        </p>
        <div className="card-actions justify-end">
          <button
            className="btn btn-info"
            onClick={() => setEditModalOpen(true)}
          >
            Edit Hotel
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setRoomModalOpen(true)}
          >
            Add Room
          </button>
        </div>
      </div>
      {isEditModalOpen && (
        <HotelEditModal
          hotel={hotelData}
          closeModal={() => setEditModalOpen(false)}
          onHotelUpdated={handleHotelUpdated}
        />
      )}
      {isRoomModalOpen && (
        <RoomCreateModal
          hotelId={hotelData.hotel_id}
          closeModal={() => setRoomModalOpen(false)}
        />
      )}
    </div>
  );
};

export default HotelCard;
