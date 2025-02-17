const express = require("express");
const router = express.Router();
const roomQueries = require("../queries/roomQueries");
const { roomSchema } = require("../schemas");
const { updateRoomSchema } = require("../schemas");

router.post("/available-rooms", async (req, res) => {
  const {
    startDate,
    endDate,
    capacity,
    state,
    chainId,
    category,
    minRooms,
    maxPrice,
  } = req.body;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "startDate and endDate are required" });
  }

  try {
    const rooms = await roomQueries.getAvailableRooms(
      startDate,
      endDate,
      capacity || null,
      state || null,
      chainId || null,
      category || null,
      minRooms || null,
      maxPrice || null
    );
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await roomQueries.getAllRooms();
    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get a room by ID
router.get("/:id", async (req, res) => {
  try {
    const room = await roomQueries.getRoomById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    console.error("Error fetching room:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get rooms by hotel ID
router.get("/hotel/:hotelId", async (req, res) => {
  try {
    const rooms = await roomQueries.getRoomsByHotelId(req.params.hotelId);
    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms by hotel:", err.message);
    res.status(500).json({ error: err.message });
  }
});

//get rooms based on filters

// 📌 Create a new room
router.post("/", async (req, res) => {
  try {
    const { error } = roomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const {
      hotel_id,
      price,
      amenities,
      capacity,
      view,
      is_extendable,
      problems,
    } = req.body;
    const room = await roomQueries.createRoom(
      hotel_id,
      price,
      amenities,
      capacity,
      view,
      is_extendable,
      problems
    );
    res.status(201).json(room);
  } catch (err) {
    console.error("Error creating room:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Update a room
router.put("/:id", async (req, res) => {
  try {
    const { error } = updateRoomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { price, amenities, capacity, view, is_extendable, problems } =
      req.body;
    const room = await roomQueries.updateRoom(
      req.params.id,
      price,
      amenities,
      capacity,
      view,
      is_extendable,
      problems
    );
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    console.error("Error updating room:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const room = await roomQueries.deleteRoom(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    console.error("Error deleting room:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
