"use client";

import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Add a loading state to prevent redirection mismatch

  useEffect(() => {
    function redirectUser(user: User | null, router: any) {
      if (loading) return; // Prevent redirect until loading is complete
      if (!user) {
        router.push("/login");
      } else if (user?.is_customer) {
        router.push("/customer");
      } else if (!user?.is_customer) {
        router.push("/employee");
      }
    }

    // Set loading to false after the initial render
    setLoading(false);
    redirectUser(user, router);
  }, [user, loading, router]);

  interface User {
    user_id: number;
    customer_id: number;
    full_name: string;
    email: string;
    address: string;
    is_customer: boolean;
    password: string; // Hashed password
    registration_date: string; // ISO date string
    ssn: string;
  }

  return null; // You can render a loading spinner or null while the redirect logic runs
}
