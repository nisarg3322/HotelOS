"use client";

import Link from "next/link";
import { useUser } from "../../../context/UserContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
const Navbar = () => {
  const { user, logout } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [router, user]);

  return (
    <nav className="bg-base-200 shadow-md p-4 sticky top-0 z-50 w-full ">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-secondary">
          e-Hotels
        </Link>
        <div className="flex space-x-4">
          <Link href="/hotels" className="btn btn-ghost">
            Hotels
          </Link>
          <Link href="/customer" className="btn btn-ghost">
            Search Rooms
          </Link>
          {user ? (
            <>
              <Link href="/profile" className="btn btn-ghost">
                Profile
              </Link>
              <button className="btn btn-ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary">
                Login
              </Link>
              <Link href="/signup" className="btn btn-secondary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
