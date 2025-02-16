const express = require("express");
const router = express.Router();
const { hotelChainSchema } = require("../schemas");
const {
  getAllHotelChains,
  getHotelChainById,
  createHotelChain,
  updateHotelChain,
  deleteHotelChain,
} = require("../queries/hotelChainQueries");

// ✅ Get All Hotel Chains
router.get("/", async (req, res) => {
  const chains = await getAllHotelChains();
  res.json(chains);
});

// ✅ Get a Single Hotel Chain
router.get("/:id", async (req, res) => {
  const chain = await getHotelChainById(req.params.id);
  res.json(chain);
});

// ✅ Create a Hotel Chain
router.post("/", async (req, res) => {
  const { error } = hotelChainSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { name, address, email, phoneNumber } = req.body;
  const newChain = await createHotelChain(name, address, email, phoneNumber);
  res.json(newChain);
});

// ✅ Update a Hotel Chain
router.put("/:id", async (req, res) => {
  const chain_id = req.params.id;
  const { error } = hotelChainSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { name, address, email, phoneNumber } = req.body;
  const updatedChain = await updateHotelChain(
    chain_id,
    name,
    address,
    email,
    phoneNumber
  );
  res.json(updatedChain);
});

// ✅ Delete a Hotel Chain
router.delete("/:id", async (req, res) => {
  const result = await deleteHotelChain(req.params.id);
  res.json(result);
});

module.exports = router;
