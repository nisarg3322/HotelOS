"use client";

import { useUser } from "context/UserContext";
import { useState } from "react";
import { API_URL } from "utils/config";

interface BookingModalProps {
  roomId: number;
  price: number;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  onClose: () => void;
  refreshRooms: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  roomId,
  price,
  startDate,
  endDate,
  isOpen = false,
  onClose,
  refreshRooms,
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  if (!isOpen) return null;

  const totalCost =
    ((new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 3600 * 24)) *
    price;

  const handleBooking = async () => {
    setLoading(true);
    console.log(user.customer_id);
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          check_in_date: startDate,
          check_out_date: endDate,
          room_id: roomId,
          customer_id: user.customer_id,
          total_cost: totalCost,
        }),
      });

      if (!response.ok) throw new Error("Booking failed");

      refreshRooms();
      onClose();
    } catch (error) {
      console.error("Error booking room:", error);
      alert("Failed to book room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog id="booking_modal" className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Confirm Booking</h3>
        <p className="py-4">
          Room ID: <strong>{roomId}</strong> <br />
          Price: <strong>${price}/night</strong> <br />
          Total Cost: <strong>${totalCost}</strong> <br />
          Dates:{" "}
          <strong>
            {startDate} to {endDate}
          </strong>
        </p>
        <div className="modal-action">
          <button
            className="btn btn-success"
            onClick={handleBooking}
            disabled={loading} // Disable button when loading
          >
            {loading ? (
              <span className="loading loading-spinner"></span> // Daisy UI loading spinner
            ) : (
              "Confirm"
            )}
          </button>
          <button
            className="btn btn-error"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default BookingModal;
