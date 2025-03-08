const express = require("express");
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  getEmployeesByHotelId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../queries/employeeQueries");
const { employeeSchema } = require("../schemas");
const { updateEmployeeSchema } = require("../schemas");

// 🔹 Get All Employees
router.get("/", async (req, res) => {
  const employees = await getAllEmployees();
  res.json(employees);
});

// 🔹 Get Employee by ID
router.get("/:id", async (req, res) => {
  const employee = await getEmployeeById(req.params.id);
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  res.json(employee);
});

//get all employees by hotel id
router.get("/hotel/:hotelId", async (req, res) => {
  const employees = await getEmployeesByHotelId(req.params.hotelId);
  res.json(employees);
});

// 🔹 Update an Employee
router.put("/:id", async (req, res) => {
  const { error } = updateEmployeeSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { full_name, address, role } = req.body;
  const updatedEmployee = await updateEmployee(
    req.params.id,
    full_name,
    address,
    role
  );
  if (!updatedEmployee)
    return res.status(404).json({ message: "Employee not found" });
  res.json(updatedEmployee);
});

// 🔹 Delete an Employee
router.delete("/:id", async (req, res) => {
  const result = await deleteEmployee(req.params.id);
  res.json(result);
});

module.exports = router;
