const pool = require("../config/db");

// 🔹 Get All Managers
const getAllManagers = async () => {
  try {
    const result = await pool.query(
      `SELECT m.manager_id, m.employee_id, m.hotel_id, e.full_name, e.role
       FROM Manager m
       JOIN Employee e ON m.employee_id = e.employee_id`
    );
    return result.rows;
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Get Manager by ID
const getManagerById = async (managerId) => {
  try {
    const result = await pool.query(
      `SELECT m.manager_id, m.employee_id, m.hotel_id, e.full_name, e.role
       FROM Manager m
       JOIN Employee e ON m.employee_id = e.employee_id
       WHERE m.manager_id = $1`,
      [managerId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Create a New Manager
const createManager = async (employeeId, hotelId) => {
  try {
    const result = await pool.query(
      `INSERT INTO Manager (employee_id, hotel_id) 
       VALUES ($1, $2) RETURNING *`,
      [employeeId, hotelId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Update a Manager
const updateManager = async (managerId, employeeId, hotelId) => {
  try {
    const result = await pool.query(
      `UPDATE Manager 
       SET employee_id = $1, hotel_id = $2
       WHERE manager_id = $3 RETURNING *`,
      [employeeId, hotelId, managerId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Delete a Manager
const deleteManager = async (managerId) => {
  try {
    await pool.query("DELETE FROM Manager WHERE manager_id = $1", [managerId]);
    return { message: `Manager with ID ${managerId} deleted successfully.` };
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  getAllManagers,
  getManagerById,
  createManager,
  updateManager,
  deleteManager,
};
