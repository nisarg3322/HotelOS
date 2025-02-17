const pool = require("../config/db");

// 🔹 Get All Hotel Chains
const getAllHotelChains = async () => {
  try {
    const result = await pool.query(
      "SELECT hc.chain_id, hc.name, hc.number_of_hotels, hc.email, hc.phone_number, a.street_address, a.city ,a.state ,a.postal_code \n" +
        "FROM HotelChain hc \n" +
        " inner join address a \n" +
        "on hc.central_office_address_id = a.address_id"
    );
    return result.rows;
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Get Hotel Chain by ID
const getHotelChainById = async (hotelChainId) => {
  try {
    const result = await pool.query(
      "SELECT hc.chain_id, hc.name, hc.number_of_hotels, hc.email, hc.phone_number, a.street_address, a.city ,a.state ,a.postal_code \n" +
        "FROM HotelChain hc \n" +
        " inner join address a \n" +
        "on hc.central_office_address_id = a.address_id and hc.chain_id = $1",
      [hotelChainId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Create a New Hotel Chain
const createHotelChain = async (name, address, email, phoneNumber) => {
  try {
    const newAddress = await pool.query(
      ` INSERT INTO Address (street_address, city, state, postal_code) Values ($1, $2, $3, $4) RETURNING address_id`,
      [address.street_address, address.city, address.state, address.postal_code]
    );
    const address_id = newAddress.rows[0]?.address_id;
    const result = await pool.query(
      `INSERT INTO HotelChain (name, central_office_address_id, email, phone_number) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, address_id, email, phoneNumber]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Update a Hotel Chain by ID
const updateHotelChain = async (chainId, name, address, email, phoneNumber) => {
  try {
    // Update Address
    await pool.query(
      `UPDATE Address a
       SET street_address = $2, city = $3, state = $4, postal_code = $5
       FROM HotelChain hc
       WHERE hc.chain_id = $1 AND hc.central_office_address_id = a.address_id`,
      [
        chainId,
        address.street_address,
        address.city,
        address.state,
        address.postal_code,
      ]
    );

    const result = await pool.query(
      `UPDATE HotelChain hc
       SET name = $1, email = $2, phone_number = $3
       WHERE hc.chain_id = $4 RETURNING *`,
      [name, email, phoneNumber, chainId]
    );

    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

// 🔹 Delete a Hotel Chain by ID
const deleteHotelChain = async (hotelChainId) => {
  try {
    await pool.query("DELETE FROM HotelChain WHERE chain_id = $1", [
      hotelChainId,
    ]);
    return {
      message: `Hotel Chain with ID ${hotelChainId} deleted successfully.`,
    };
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  getAllHotelChains,
  getHotelChainById,
  createHotelChain,
  updateHotelChain,
  deleteHotelChain,
};
