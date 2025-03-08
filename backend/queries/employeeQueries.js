const pool = require("../config/db");

// 🔹 Get All Employees
const getAllEmployees = async () => {
  try {
    const result = await pool.query("SELECT * FROM Employee");
    return result.rows;
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Get Employee by ID
const getEmployeeByUserId = async (userId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Employee WHERE user_id = $1",
      [userId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

//get all employees by hotel id
const getEmployeesByHotelId = async (hotelId) => {
  try {
    const result = await pool.query(
      `SELECT * FROM Employee WHERE hotel_id = $1`,
      [hotelId]
    );
    return result.rows;
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Create a New Employee
const createEmployee = async (
  userId,
  fullName,
  address,
  ssn,
  hotelId,
  role
) => {
  try {
    const result = await pool.query(
      `INSERT INTO Employee (full_name, address, ssn, hotel_id, role, user_id) 
       VALUES ($1, $2, $3, $4, $5 ,$6) RETURNING *`,
      [fullName, address, ssn, hotelId, role, userId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Update an Employee
const updateEmployee = async (employeeId, fullName, address, role) => {
  try {
    const result = await pool.query(
      `UPDATE Employee 
       SET full_name = $1, address = $2, role = $3
       WHERE employee_id = $4 RETURNING *`,
      [fullName, address, role, employeeId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Delete an Employee
const deleteEmployee = async (employeeId) => {
  try {
    await pool.query("DELETE FROM Employee WHERE employee_id = $1", [
      employeeId,
    ]);
    return { message: `Employee with ID ${employeeId} deleted successfully.` };
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeByUserId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByHotelId,
};
