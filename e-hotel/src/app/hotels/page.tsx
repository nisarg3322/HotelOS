// "use client"; // For Next.js 13+ App Router

// import { useUser } from "context/UserContext";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";

// interface Hotel {
//   hotel_id: number;
//   hotel_name: string;
//   category: number;
//   street_address: string;
//   city: string;
//   state: string;
//   postal_code: string;
//   phone_number: string;
//   email: string;
//   chain_name: string;
// }

// export default function Hotels() {
//   const router = useRouter();
//   const [hotels, setHotels] = useState<Hotel[]>([]);
//   const [loading, setLoading] = useState(true); // Set loading to true initially
//   const [chain_id, setChainId] = useState<number | null>(null);
//   const [newHotel, setNewHotel] = useState({
//     name: "",
//     category: 1,
//     address: {
//       street_address: "",
//       city: "",
//       state: "",
//       postal_code: "",
//     },
//     phone_number: "",
//     email: "",
//   });
//   const { user } = useUser();

//   const fetchHotels = async () => {
//     setLoading(true);
//     try {
//       const hotel = await fetch(
//         `http://localhost:3000/hotels/` + user?.hotel_id
//       );
//       const hotelData = await hotel.json();

//       const res = await fetch(
//         `http://localhost:3000/hotels/chain/` + hotelData?.chain_id
//       );
//       const result = await res.json();

//       setHotels(Array.isArray(result) ? result : [result]);
//       setChainId(hotelData?.chain_id);
//     } catch (error) {
//       console.error("Error fetching hotels:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleHotelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     if (name in newHotel.address) {
//       setNewHotel((prev) => ({
//         ...prev,
//         address: {
//           ...prev.address,
//           [name]: value,
//         },
//       }));
//     } else {
//       setNewHotel((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };

//   const handleHotelSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const response = await fetch("http://localhost:3000/hotels/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: newHotel.name,
//           address: newHotel.address,
//           email: newHotel.email,
//           phone_number: newHotel.phone_number,
//           category: newHotel.category,
//           chain_id,
//         }),
//       });
//       const result = await response.json();
//       if (response.ok) {
//         setHotels((prev) => [...prev, result]);
//         document.getElementById("my_modal_1")?.close();
//       } else {
//         console.error("Error creating hotel:", result.error);
//       }
//     } catch (error) {
//       console.error("Error creating hotel:", error);
//     }
//   };
//   // Fetch hotels as soon as the component is mounted
//   useEffect(() => {
//     fetchHotels();
//   }, []); // Empty dependency array means this runs only once on mount

//   return (
//     <div
//       data-theme="dark"
//       className="min-h-screen w-full flex flex-col items-center p-8"
//     >
//       <h1 className="text-4xl font-bold mb-6">🏨 Hotels</h1>

//       {loading && <span className="loading loading-spinner loading-lg"></span>}
//       <button
//         className="btn btn-primary mb-6"
//         onClick={() => document.getElementById("my_modal_1")?.showModal()}
//       >
//         Add New Hotel
//       </button>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
//         {hotels.length > 0 && !loading
//           ? hotels.map((hotel) => (
//               <div key={hotel.hotel_id} className="card bg-base-100 shadow-xl">
//                 <div className="card-body">
//                   <h2 className="card-title">{hotel.hotel_name}</h2>
//                   <p className="text-gray-600">
//                     ⭐ {hotel.category}-Star Hotel
//                   </p>
//                   <p>
//                     <span className="font-semibold">📍 Address:</span>{" "}
//                     {hotel.street_address}, {hotel.city}, {hotel.state}{" "}
//                     {hotel.postal_code}
//                   </p>
//                   <p>
//                     <span className="font-semibold">📞 Phone:</span>{" "}
//                     {hotel.phone_number}
//                   </p>
//                   <p>
//                     <span className="font-semibold">📧 Email:</span>{" "}
//                     {hotel.email}
//                   </p>
//                   <p>
//                     <span className="font-semibold">🏬 Chain:</span>{" "}
//                     {hotel.chain_name}
//                   </p>
//                   <div className="card-actions justify-end">
//                     <button className="btn btn-secondary">View Details</button>
//                   </div>
//                 </div>
//               </div>
//             ))
//           : !loading && (
//               <p className="text-gray-500 text-lg">No hotels available.</p>
//             )}
//       </div>
//       {/* Modal for Adding New Hotel */}
//       <dialog id="my_modal_1" className="modal">
//         <div className="modal-box">
//           <h3 className="font-bold text-lg">Add New Hotel</h3>
//           <form onSubmit={handleHotelSubmit}>
//             <div className="form-control mb-4">
//               <label className="label">
//                 <span className="label-text">Hotel Name</span>
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 value={newHotel.name}
//                 onChange={handleHotelChange}
//                 className="input input-bordered"
//                 required
//               />
//             </div>

//             <div className="form-control mb-4">
//               <label className="label">
//                 <span className="label-text">Category</span>
//               </label>
//               <input
//                 type="number"
//                 name="category"
//                 value={newHotel.category}
//                 onChange={handleHotelChange}
//                 className="input input-bordered"
//                 required
//               />
//             </div>

//             {/* Address Fields */}
//             <div className="form-control mb-4">
//               <label className="label">
//                 <span className="label-text">Street Address</span>
//               </label>
//               <input
//                 type="text"
//                 name="street_address"
//                 value={newHotel.address.street_address}
//                 onChange={handleHotelChange}
//                 className="input input-bordered"
//                 required
//               />
//             </div>

//             <div className="form-control mb-4">
//               <label className="label">
//                 <span className="label-text">City</span>
//               </label>
//               <input
//                 type="text"
//                 name="city"
//                 value={newHotel.address.city}
//                 onChange={handleHotelChange}
//                 className="input input-bordered"
//                 required
//               />
//             </div>

//             <div className="form-control mb-4">
//               <label className="label">
//                 <span className="label-text">State</span>
//               </label>
//               <input
//                 type="text"
//                 name="state"
//                 value={newHotel.address.state}
//                 onChange={handleHotelChange}
//                 className="input input-bordered"
//                 required
//               />
//             </div>

//             <div className="form-control mb-4">
//               <label className="label">
//                 <span className="label-text">Postal Code</span>
//               </label>
//               <input
//                 type="text"
//                 name="postal_code"
//                 value={newHotel.address.postal_code}
//                 onChange={handleHotelChange}
//                 className="input input-bordered"
//                 required
//               />
//             </div>

//             <div className="form-control mb-4">
//               <label className="label">
//                 <span className="label-text">Phone Number</span>
//               </label>
//               <input
//                 type="text"
//                 name="phone_number"
//                 value={newHotel.phone_number}
//                 onChange={handleHotelChange}
//                 className="input input-bordered"
//                 required
//               />
//             </div>

//             <div className="form-control mb-4">
//               <label className="label">
//                 <span className="label-text">Email</span>
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={newHotel.email}
//                 onChange={handleHotelChange}
//                 className="input input-bordered"
//                 required
//               />
//             </div>

//             <div className="modal-action">
//               <button type="submit" className="btn btn-primary">
//                 Add Hotel
//               </button>
//               <button
//                 type="button"
//                 className="btn"
//                 onClick={() => document.getElementById("my_modal_1")?.close()}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </dialog>
//     </div>
//   );
// }

"use client";
import { useUser } from "context/UserContext";
import { useState, useEffect } from "react";
import HotelCard from "./components/HotelCard";
import AddHotelModal from "./components/AddHotelModal";

export interface Hotel {
  hotel_id: number;
  hotel_name: string;
  category: number;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  phone_number: string;
  email: string;
  chain_name: string;
}

const Hotels: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [chain_id, setChainId] = useState<number | null>(null);
  const [chainName, setChainName] = useState<string | null>(null);
  const [newHotel, setNewHotel] = useState({
    name: "",
    category: 1,
    address: {
      street_address: "",
      city: "",
      state: "",
      postal_code: "",
    },
    phone_number: "",
    email: "",
  });

  const { user } = useUser();

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const hotelResponse = await fetch(
        `http://localhost:3000/hotels/` + user?.hotel_id
      );
      const hotelData = await hotelResponse.json();

      const res = await fetch(
        `http://localhost:3000/hotels/chain/` + hotelData?.chain_id
      );
      const result = await res.json();

      setHotels(Array.isArray(result) ? result : [result]);
      setChainId(hotelData?.chain_id);
      setChainName(hotelData?.chain_name);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHotelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in newHotel.address) {
      setNewHotel((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    } else {
      setNewHotel((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleHotelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/hotels/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newHotel.name,
          address: newHotel.address,
          email: newHotel.email,
          phone_number: newHotel.phone_number,
          category: newHotel.category,
          chain_id,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setHotels((prev) => [...prev, result]);
        (document.getElementById("my_modal_1") as HTMLDialogElement)?.close();
      } else {
        console.error("Error creating hotel:", result.error);
      }
    } catch (error) {
      console.error("Error creating hotel:", error);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  return (
    <div
      data-theme="dark"
      className="min-h-screen w-full flex flex-col items-center p-8"
    >
      <h1 className="text-4xl font-bold mb-6">
        🏨 Hotels (Chain: {chainName})
      </h1>
      {loading && <span className="loading loading-spinner loading-lg"></span>}
      <button
        className="btn btn-primary mb-6"
        onClick={() =>
          (
            document.getElementById("my_modal_1") as HTMLDialogElement
          )?.showModal()
        }
      >
        Add New Hotel
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {hotels.length > 0 && !loading
          ? hotels.map((hotel) => (
              <HotelCard key={hotel.hotel_id} hotel={hotel} />
            ))
          : !loading && (
              <p className="text-gray-500 text-lg">No hotels available.</p>
            )}
      </div>

      <AddHotelModal
        newHotel={newHotel}
        handleHotelChange={handleHotelChange}
        handleHotelSubmit={handleHotelSubmit}
      />
    </div>
  );
};

export default Hotels;
