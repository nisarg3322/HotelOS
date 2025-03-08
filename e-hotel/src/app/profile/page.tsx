"use client";

import { useState, useEffect } from "react";
import { useUser } from "context/UserContext"; // Your custom hook to get the user

const ProfilePage = () => {
  const { user } = useUser();
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [ssn, setSsn] = useState("");
  const [role, setRole] = useState("");
  const [hotelId, setHotelId] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setAddress(user.address);
      setSsn(user.ssn);
      if (!user.is_customer) {
        setRole(user.role);
        setHotelId(user.hotel_id);
      }
    }
  }, [user]);
  const api = `http://localhost:3000/${
    user?.is_customer ? "customers" : "employees"
  }/${user?.is_customer ? user?.customer_id : user?.employee_id}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData = {
      full_name: fullName,
      address,
      ssn,
      ...(!user.is_customer && { role, hotel_id: hotelId }), // Only include role for employees
    };

    try {
      const response = await fetch(api, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "An error occurred while updating.");
        return;
      }

      alert("Profile updated successfully!");
    } catch (err) {
      setError("An error occurred while updating.");
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Update Profile</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">SSN</label>
          <input
            type="text"
            value={ssn}
            onChange={(e) => setSsn(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Only show role input for employees */}
        {!user?.is_customer && (
          <>
            <div className="form-control">
              <label className="label">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">Hotel ID</label>
              <input
                type="number"
                value={hotelId}
                onChange={(e) => setHotelId(Number(e.target.value))}
                className="input input-bordered w-full"
              />
            </div>
          </>
        )}

        <div className="form-control">
          <button type="submit" className="btn btn-primary w-full">
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
