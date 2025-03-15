"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../context/UserContext";
import { API_URL } from "utils/config";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useUser();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Invalid email or password");

      const { user, token } = await response.json();
      login(user, token);

      console.log(user);
      // Redirect based on user role
      router.push(user.is_customer ? "/customer" : "/employee");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="card w-full max-w-md bg-white shadow-lg p-6 rounded-lg">
        <h2 className="text-3xl font-bold text-center text-primary mb-6">
          Login
        </h2>

        {/* Error Message */}
        {error && <div className="alert alert-error p-3 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input input-bordered w-full"
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input input-bordered w-full"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <button
          onClick={() => router.push("/signup")}
          className="btn btn-secondary mt-4 w-full"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
