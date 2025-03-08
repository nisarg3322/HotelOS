"use client";

// import { useUser } from "context/UserContext";
import { useParams } from "next/navigation";

export default function Rooms() {
  const { id } = useParams();
  // const { user } = useUser();

  // const bookRoom(id, user): void{

  // }
  return (
    <div>
      <h1>Room ID: {id}</h1>
    </div>
  );
}
