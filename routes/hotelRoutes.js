const express = require("express");
const router = express.Router();
const hotelQueries = require("../queries/hotelQueries");
const { hotelSchema } = require("../schemas");
const { updateHotelSchema } = require("../schemas");
// 📌 Get all hotels
router.get("/", async (req, res) => {
  try {
    const hotels = await hotelQueries.getHotels();
    res.json(hotels);
  } catch (err) {
    console.error("Error fetching hotels:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get a hotel by ID
router.get("/:id", async (req, res) => {
  try {
    const hotel = await hotelQueries.getHotelById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    console.error("Error fetching hotel:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Create a new hotel
router.post("/", async (req, res) => {
  try {
    const { error } = hotelSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { chain_id, name, address, email, phoneNumber, category } = req.body;
    const hotel = await hotelQueries.createHotel(
      chain_id,
      name,
      address,
      email,
      phoneNumber,
      category
    );
    res.status(201).json(hotel);
  } catch (err) {
    console.error("Error creating hotel:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get hotels by chain ID
router.get("/chain/:chainId", async (req, res) => {
  try {
    const hotels = await hotelQueries.getHotelsByChainId(req.params.chainId);
    res.json(hotels);
  } catch (err) {
    console.error("Error fetching hotels by chain:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Update a hotel
router.put("/:id", async (req, res) => {
  try {
    const { error } = updateHotelSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { name, address, email, phoneNumber, category } = req.body;
    const hotel = await hotelQueries.updateHotel(
      req.params.id,
      name,
      address,
      email,
      phoneNumber,
      category
    );
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    console.error("Error updating hotel:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Delete a hotel
router.delete("/:id", async (req, res) => {
  try {
    const hotel = await hotelQueries.deleteHotel(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json({ message: "Hotel deleted successfully" });
  } catch (err) {
    console.error("Error deleting hotel:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
