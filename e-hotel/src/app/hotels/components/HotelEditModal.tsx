import React, { useState } from "react";
import { Hotel } from "../page";
import { API_URL } from "utils/config";

interface HotelEditModalProps {
  hotel: Hotel;
  closeModal: () => void;
  onHotelUpdated: (updatedHotel: Hotel) => void;
}

const HotelEditModal: React.FC<HotelEditModalProps> = ({
  hotel,
  closeModal,
  onHotelUpdated,
}) => {
  const [updatedHotel, setUpdatedHotel] = useState({
    name: hotel.hotel_name,
    category: hotel.category,
    address: {
      street_address: hotel.street_address,
      city: hotel.city,
      state: hotel.state,
      postal_code: hotel.postal_code,
    },
    phone_number: hotel.phone_number,
    email: hotel.email,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name in updatedHotel.address) {
      setUpdatedHotel((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setUpdatedHotel((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/hotels/${hotel.hotel_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedHotel),
      });

      const result = await response.json();

      if (response.ok) {
        onHotelUpdated(result);
        closeModal();
      } else {
        console.error("Error updating hotel:", result.error);
      }
    } catch (error) {
      console.error("Error updating hotel:", error);
    }
  };

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Edit Hotel</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Hotel Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={updatedHotel.name}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <input
              type="number"
              name="category"
              value={updatedHotel.category}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          {/* Address Fields */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Street Address</span>
            </label>
            <input
              type="text"
              name="street_address"
              value={updatedHotel.address.street_address}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">City</span>
            </label>
            <input
              type="text"
              name="city"
              value={updatedHotel.address.city}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">State</span>
            </label>
            <input
              type="text"
              name="state"
              value={updatedHotel.address.state}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Postal Code</span>
            </label>
            <input
              type="text"
              name="postal_code"
              value={updatedHotel.address.postal_code}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Phone Number</span>
            </label>
            <input
              type="text"
              name="phone_number"
              value={updatedHotel.phone_number}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={updatedHotel.email}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="modal-action">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button type="button" className="btn" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default HotelEditModal;
