import React from "react";

interface NewHotel {
  name: string;
  category: number;
  address: {
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
  };
  phone_number: string;
  email: string;
}

const AddHotelModal: React.FC<{
  newHotel: NewHotel;
  handleHotelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleHotelSubmit: (e: React.FormEvent) => void;
}> = ({ newHotel, handleHotelChange, handleHotelSubmit }) => {
  return (
    <dialog id="my_modal_1" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Add New Hotel</h3>
        <form onSubmit={handleHotelSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Hotel Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={newHotel.name}
              onChange={handleHotelChange}
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
              value={newHotel.category}
              onChange={handleHotelChange}
              className="input input-bordered"
              required
            />
          </div>

          {/* Address Fields */}
          {["street_address", "city", "state", "postal_code"].map((field) => (
            <div key={field} className="form-control mb-4">
              <label className="label">
                <span className="label-text">
                  {field.replace("_", " ").toUpperCase()}
                </span>
              </label>
              <input
                type="text"
                name={field}
                value={newHotel.address[field as keyof typeof newHotel.address]}
                onChange={handleHotelChange}
                className="input input-bordered"
                required
              />
            </div>
          ))}

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Phone Number</span>
            </label>
            <input
              type="text"
              name="phone_number"
              value={newHotel.phone_number}
              onChange={handleHotelChange}
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
              value={newHotel.email}
              onChange={handleHotelChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="modal-action">
            <button type="submit" className="btn btn-success">
              Add Hotel
            </button>
            <button
              type="button"
              className="btn"
              onClick={() =>
                (
                  document.getElementById("my_modal_1") as HTMLDialogElement
                )?.close()
              }
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default AddHotelModal;
