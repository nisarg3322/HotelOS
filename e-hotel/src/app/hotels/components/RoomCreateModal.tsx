import { useState } from "react";
import { API_URL } from "utils/config";

const RoomCreateModal: React.FC<{
  hotelId: number;
  closeModal: () => void;
}> = ({ hotelId, closeModal }) => {
  const [roomData, setRoomData] = useState({
    price: "",
    amenities: "",
    capacity: "",
    view: "",
    is_extendable: false,
    problems: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setRoomData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotel_id: hotelId, ...roomData }),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Room added successfully!");
        closeModal();
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Add Room</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">Price</label>
            <input
              type="number"
              name="price"
              value={roomData.price}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>
          <div className="form-control mb-4">
            <label className="label">Amenities</label>
            <input
              type="text"
              name="amenities"
              value={roomData.amenities}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>
          <div className="form-control mb-4">
            <label className="label">Capacity</label>
            <select
              name="capacity"
              value={roomData.capacity}
              onChange={handleChange}
              className="select select-bordered"
              required
            >
              <option value="" disabled>
                Select capacity
              </option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="family">Family</option>
              <option value="suite">Suite</option>
            </select>
          </div>
          <div className="form-control mb-4">
            <label className="label">View</label>
            <select
              name="view"
              value={roomData.view}
              onChange={handleChange}
              className="select select-bordered"
              required
            >
              <option value="" disabled>
                Select view
              </option>
              <option value="sea">Sea</option>
              <option value="mountain">Mountain</option>
            </select>
          </div>
          <div className="form-control mb-4">
            <label className="label cursor-pointer flex items-center">
              <span className="mr-2">Is Extendable</span>
              <input
                type="checkbox"
                name="is_extendable"
                checked={roomData.is_extendable}
                onChange={handleChange}
                className="toggle"
              />
            </label>
          </div>
          <div className="form-control mb-4">
            <label className="label">Problems</label>
            <input
              type="text"
              name="problems"
              value={roomData.problems}
              onChange={handleChange}
              className="input input-bordered"
            />
          </div>
          <div className="modal-action">
            <button type="submit" className="btn btn-primary">
              Add Room
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
export default RoomCreateModal;
