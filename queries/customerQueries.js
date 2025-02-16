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
const getCustomerById = async (customerId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Customer WHERE customer_id = $1",
      [customerId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Create a New Customer
const createCustomer = async (fullName, address, SSN) => {
  try {
    const result = await pool.query(
      `INSERT INTO Customer (full_name, address, SSN) 
       VALUES ($1, $2, $3) RETURNING *`,
      [fullName, address, SSN]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Update a Customer by ID
const updateCustomer = async (customerId, fullName, address) => {
  try {
    const result = await pool.query(
      `UPDATE Customer 
       SET full_name = $1, address = $2 
       WHERE customer_id = $3 RETURNING *`,
      [fullName, address, customerId]
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
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
