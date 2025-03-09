"use client";

import { useState, useEffect } from "react";

interface RentRoomModalProps {
  roomId: number | null;
  price: number;
  isOpen: boolean;
  onClose: () => void;
  onRent: (
    roomId: number,
    customerId: number,
    totalCost: number,
    startDate: string,
    endDate: string
  ) => void;
}

const RentRoomModal: React.FC<RentRoomModalProps> = ({
  roomId,
  price,
  isOpen,
  onClose,
  onRent,
}) => {
  const [customerId, setCustomerId] = useState<number | "">("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number>(0);

  // Calculate total cost when startDate or endDate changes
  useEffect(() => {
    if (startDate && endDate) {
      const days =
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 3600 * 24);
      setTotalCost(days > 0 ? days * price : 0);
    }
  }, [startDate, endDate, price]);

  const handleSubmit = () => {
    if (!customerId || !startDate || !endDate || totalCost <= 0) {
      alert("Please fill in all fields correctly.");
      return;
    }
    onRent(roomId as number, Number(customerId), totalCost, startDate, endDate);
    onClose();
  };

  if (!isOpen || roomId === null) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Rent Room {roomId}</h2>

        {/* Customer ID Input */}
        <label className="block mb-2">
          Customer ID:
          <input
            type="number"
            className="input input-bordered w-full"
            value={customerId}
            onChange={(e) => setCustomerId(Number(e.target.value))}
          />
        </label>

        {/* Check-in Date */}
        <label className="block mb-2">
          Check-in Date:
          <input
            type="date"
            className="input input-bordered w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        {/* Check-out Date */}
        <label className="block mb-2">
          Check-out Date:
          <input
            type="date"
            className="input input-bordered w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        {/* Total Cost Display */}
        <p className="mt-2 font-bold">Total Cost: ${totalCost.toFixed(2)}</p>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Confirm Rent
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentRoomModal;
