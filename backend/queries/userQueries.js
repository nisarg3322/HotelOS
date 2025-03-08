const pool = require("../config/db");

const getAllUsers = async () => {
  try {
    const result = await pool.query("SELECT * FROM Users");
    return result.rows;
  } catch (err) {
    console.error(err.message);
  }
};

const searchUserByEmail = async (email) => {
  try {
    const result = await pool.query("SELECT * FROM Users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

const createUser = async (email, password, isCustomer) => {
  try {
    const result = await pool.query(
      `INSERT INTO Users (email, password, is_customer) 
       VALUES ($1, $2, $3) RETURNING *`,
      [email, password, isCustomer]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

const updateUser = async (userId, email, password, role) => {
  try {
    const result = await pool.query(
      `UPDATE Users 
         SET email = $1, password = $2, role = $3
         WHERE user_id = $4 RETURNING *`,
      [email, password, role, userId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

const deleteUser = async (userId) => {
  try {
    await pool.query("DELETE FROM Users WHERE user_id = $1", [userId]);
    return { message: `User with ID ${userId} deleted successfully.` };
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUserByEmail,
};
