const pool = require("../config/db");

// 🔹 Get All Hotels (with Address)
const getHotels = async () => {
  try {
    const result = await pool.query(
      `SELECT h.hotel_id, h.name AS hotel_name, h.category, h.email, h.phone_number, 
              hc.chain_id, hc.name AS chain_name,
              a.street_address, a.city, a.state, a.postal_code
       FROM Hotel h
       INNER JOIN HotelChain hc ON h.chain_id = hc.chain_id
       INNER JOIN Address a ON h.address_id = a.address_id`
    );
    return result.rows;
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Get Hotel by ID (with Address)
const getHotelById = async (hotelId) => {
  try {
    const result = await pool.query(
      `SELECT h.hotel_id, h.name AS hotel_name, h.category, h.email, h.phone_number, 
              hc.chain_id, hc.name AS chain_name,
              a.street_address, a.city, a.state, a.postal_code
       FROM Hotel h
       INNER JOIN HotelChain hc ON h.chain_id = hc.chain_id
       INNER JOIN Address a ON h.address_id = a.address_id
       WHERE h.hotel_id = $1`,
      [hotelId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Create a New Hotel (Insert Address First)
const createHotel = async (
  chain_id,
  name,
  address,
  email,
  phoneNumber,
  category
) => {
  try {
    const newAddress = await pool.query(
      `INSERT INTO Address (street_address, city, state, postal_code) 
       VALUES ($1, $2, $3, $4) RETURNING address_id`,
      [address.street_address, address.city, address.state, address.postal_code]
    );

    const address_id = newAddress.rows[0]?.address_id;
    const result = await pool.query(
      `INSERT INTO Hotel (chain_id, name, address_id, email, phone_number, category) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [chain_id, name, address_id, email, phoneNumber, category]
    );

    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

const getHotelsByChainId = async (chainId) => {
  try {
    const result = await pool.query(
      `SELECT h.hotel_id, h.name AS hotel_name, h.category, h.email, h.phone_number, 
              hc.chain_id, hc.name AS chain_name,
              a.street_address, a.city, a.state, a.postal_code
       FROM Hotel h
       INNER JOIN HotelChain hc ON h.chain_id = hc.chain_id
       INNER JOIN Address a ON h.address_id = a.address_id
       WHERE h.chain_id = $1`,
      [chainId]
    );
    return result.rows;
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Update a Hotel (Address & Hotel Details)
const updateHotel = async (
  hotelId,
  name,
  address,
  email,
  phoneNumber,
  category
) => {
  try {
    // Update Address
    await pool.query(
      `UPDATE Address 
       SET street_address = $2, city = $3, state = $4, postal_code = $5
       WHERE address_id = (SELECT address_id FROM Hotel WHERE hotel_id = $1)`,
      [
        hotelId,
        address.street_address,
        address.city,
        address.state,
        address.postal_code,
      ]
    );

    // Update Hotel Details
    const result = await pool.query(
      `UPDATE Hotel 
       SET name = $1, email = $2, phone_number = $3, category = $4
       WHERE hotel_id = $5 RETURNING *`,
      [name, email, phoneNumber, category, hotelId]
    );

    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Delete a Hotel
const deleteHotel = async (hotelId) => {
  try {
    const result = await pool.query("DELETE FROM Hotel WHERE hotel_id = $1", [
      hotelId,
    ]);
    return result.rowCount > 0
      ? { message: `Hotel with ID ${hotelId} deleted successfully.` }
      : null;
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  getHotels,
  getHotelById,
  getHotelsByChainId,
  createHotel,
  updateHotel,
  deleteHotel,
};
