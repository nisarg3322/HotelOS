"use client"; // Ensure this is a Client Component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Correct for App Router
import { useUser } from "../../../context/UserContext";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [full_name, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [ssn, setSSN] = useState("");
  const [hotel_id, setHotelId] = useState("");
  const [isCustomer, setIsCustomer] = useState<boolean | null>(null); // <-- Fix hydration issue
  const [role, setRole] = useState("");

  const router = useRouter();
  const { login, user } = useUser();

  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);

  // Fix hydration issue: Ensure `isCustomer` is only set on client
  useEffect(() => {
    setIsCustomer(true); // Default value (client-side)
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent form submission issue

    try {
      const url = isCustomer
        ? "http://localhost:3000/login/customer"
        : "http://localhost:3000/login/employee";

      type RequestBody = {
        email: string;
        password: string;
        full_name: string;
        address: string;
        ssn: string;
        hotel_id?: string;
        role?: string;
      };

      const requestBody: RequestBody = {
        email,
        password,
        full_name,
        address,
        ssn,
      };

      if (!isCustomer) {
        requestBody.hotel_id = hotel_id;
        requestBody.role = role;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to register. Please try again.");
      }

      const data = await response.json();
      const { token, user } = data;

      login(user, token);

      router.push(user.is_customer ? "/customer" : "/employee");
    } catch (err) {
      console.error("Registration Error:", err);
    }
  };

  if (isCustomer === null) return null; // Prevent hydration mismatch

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="card w-full max-w-lg bg-white shadow-xl p-6 rounded-lg">
        <h2 className="text-3xl font-bold text-center text-primary mb-6">
          Register
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input input-bordered w-full"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input input-bordered w-full"
          />

          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="input input-bordered w-full"
          />

          {/* Address */}
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="input input-bordered w-full"
          />

          {/* SSN */}
          <input
            type="text"
            placeholder="SSN"
            value={ssn}
            onChange={(e) => setSSN(e.target.value)}
            required
            className="input input-bordered w-full"
          />

          {/* Employee-Only Fields */}
          {!isCustomer && (
            <>
              <input
                type="text"
                placeholder="Hotel ID"
                value={hotel_id}
                onChange={(e) => setHotelId(e.target.value)}
                required
                className="input input-bordered w-full"
              />
              <input
                type="text"
                placeholder="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="input input-bordered w-full"
              />
            </>
          )}

          {/* Customer/Employee Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-md bg-base-100">
            <span className="text-gray-600 font-semibold">Employee</span>
            <input
              type="checkbox"
              checked={isCustomer}
              onChange={(e) => setIsCustomer(e.target.checked)}
              className="toggle toggle-primary"
            />
            <span className="text-gray-600 font-semibold">Customer</span>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-full">
            Register
          </button>
        </form>
        <button
          onClick={() => router.push("/login")}
          className="btn btn-secondary mt-4 w-full"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
