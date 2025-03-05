"use client";

import { useParams } from "next/navigation";

export default function Rooms() {
  const { id } = useParams();
  return (
    <div>
      <h1>Room ID: {id}</h1>
    </div>
  );
}
