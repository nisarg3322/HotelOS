import { useState } from "react";
import { API_URL } from "utils/config";

interface Room {
  room_id: number;
  price: number;
  capacity: string;
  view: string;
  amenities: string;
  is_extendable: boolean;
  problems: string;
}

interface EditRoomModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onRoomUpdated: () => void;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({
  room,
  isOpen,
  onClose,
  onRoomUpdated,
}) => {
  const [updatedRoom, setUpdatedRoom] = useState({ ...room });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setUpdatedRoom((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { room_id, ...roomData } = updatedRoom;
      const response = await fetch(`${API_URL}/rooms/${room_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) throw new Error("Update failed");

      onRoomUpdated(); // Trigger refresh
      onClose(); // Close modal
    } catch (error) {
      console.error("Error updating room:", error);
      alert("Failed to update room");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <h2 className="font-bold text-lg mb-4">Edit Room</h2>
        <div className="form-control mb-4">
          <label className="label">Price</label>
          <input
            type="number"
            name="price"
            value={updatedRoom.price}
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
            value={updatedRoom.amenities}
            onChange={handleChange}
            className="input input-bordered"
            required
          />
        </div>
        <div className="form-control mb-4">
          <label className="label">Capacity</label>
          <select
            name="capacity"
            value={updatedRoom.capacity}
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
            value={updatedRoom.view}
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
              checked={updatedRoom.is_extendable}
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
            value={updatedRoom.problems}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>
        <div className="modal-action">
          <button
            className="btn btn-primary"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button className="btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default EditRoomModal;
