const express = require("express");
const router = express.Router();
const {
  getAllManagers,
  getManagerById,
  createManager,
  updateManager,
  deleteManager,
} = require("../queries/managerQueries");

// 🔹 Get All Managers
router.get("/", async (req, res) => {
  const managers = await getAllManagers();
  res.json(managers);
});

// 🔹 Get Manager by ID
router.get("/:id", async (req, res) => {
  const manager = await getManagerById(req.params.id);
  if (!manager) return res.status(404).json({ message: "Manager not found" });
  res.json(manager);
});

// 🔹 Create a New Manager
router.post("/", async (req, res) => {
  const { employee_id, hotel_id } = req.body;
  if (!employee_id || !hotel_id)
    return res
      .status(400)
      .json({ message: "Employee ID and Hotel ID are required" });
  const newManager = await createManager(employee_id, hotel_id);
  res.status(201).json(newManager);
});

// 🔹 Update a Manager
router.put("/:id", async (req, res) => {
  const { employee_id, hotel_id } = req.body;
  if (!employee_id || !hotel_id)
    return res
      .status(400)
      .json({ message: "Employee ID and Hotel ID are required" });
  const updatedManager = await updateManager(
    req.params.id,
    employee_id,
    hotel_id
  );
  if (!updatedManager)
    return res.status(404).json({ message: "Manager not found" });
  res.json(updatedManager);
});

// 🔹 Delete a Manager
router.delete("/:id", async (req, res) => {
  const result = await deleteManager(req.params.id);
  res.json(result);
});

module.exports = router;
