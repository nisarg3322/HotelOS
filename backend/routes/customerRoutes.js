const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../queries/customerQueries");

// 🔹 Get All Customers
router.get("/", async (req, res) => {
  const customers = await getAllCustomers();
  res.json(customers);
});

// 🔹 Get Customer by ID
router.get("/:id", async (req, res) => {
  const customer = await getCustomerById(req.params.id);
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  res.json(customer);
});

// 🔹 Create a New Customer
router.post("/", async (req, res) => {
  const { full_name, address, SSN } = req.body;
  if (!full_name || !SSN) {
    return res.status(400).json({ message: "Full name and SSN are required" });
  }
  const newCustomer = await createCustomer(full_name, address, SSN);
  res.status(201).json(newCustomer);
});

// 🔹 Update a Customer
router.put("/:id", async (req, res) => {
  const { full_name, address, ssn } = req.body;
  const updatedCustomer = await updateCustomer(
    req.params.id,
    full_name,
    address,
    ssn
  );
  if (!updatedCustomer)
    return res.status(404).json({ message: "Customer not found" });
  res.json(updatedCustomer);
});

// 🔹 Delete a Customer
router.delete("/:id", async (req, res) => {
  const result = await deleteCustomer(req.params.id);
  res.json(result);
});

module.exports = router;
