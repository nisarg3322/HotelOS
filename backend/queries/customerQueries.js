const pool = require("../config/db");

// 🔹 Get All Customers
const getAllCustomers = async () => {
  try {
    const result = await pool.query("SELECT * FROM Customer");
    return result.rows;
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Get Customer by ID
const getCustomerByUserId = async (userId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Customer WHERE user_id = $1",
      [userId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Create a New Customer
const createCustomer = async (fullName, address, SSN, userId) => {
  try {
    const result = await pool.query(
      `INSERT INTO Customer (full_name, address, ssn, user_id) 
       VALUES ($1, $2, $3,$4) RETURNING *`,
      [fullName, address, SSN, userId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Update a Customer by ID
const updateCustomer = async (customerId, fullName, address, ssn) => {
  try {
    const result = await pool.query(
      `UPDATE Customer 
       SET full_name = $1, address = $2 , ssn = $4
       WHERE customer_id = $3 RETURNING *`,
      [fullName, address, customerId, ssn]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Delete a Customer by ID
const deleteCustomer = async (customerId) => {
  try {
    await pool.query("DELETE FROM Customer WHERE customer_id = $1", [
      customerId,
    ]);
    return { message: `Customer with ID ${customerId} deleted successfully.` };
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerByUserId,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
