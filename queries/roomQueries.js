const pool = require("../config/db");

const getAllRooms = async () => {
  try {
    const result = await pool.query(
      `SELECT r.room_id, r.price, r.amenities, r.capacity, r.view, r.is_extendable, r.problems, 
              h.hotel_id, h.name AS hotel_name, hc.chain_id, hc.name AS chain_name, 
              a.street_address, a.city, a.state, a.postal_code
       FROM Room r
       INNER JOIN Hotel h ON r.hotel_id = h.hotel_id
       INNER JOIN HotelChain hc ON h.chain_id = hc.chain_id
       INNER JOIN Address a ON h.address_id = a.address_id`
    );
    return result.rows;
  } catch (err) {
    console.error(err.message);
  }
};
const getRoomsByHotelId = async (hotelId) => {
  try {
    const result = await pool.query(
      `SELECT r.room_id, r.price, r.amenities, r.capacity, r.view, r.is_extendable, r.problems
       FROM Room r
       WHERE r.hotel_id = $1`,
      [hotelId]
    );
    return result.rows;
  } catch (err) {
    console.error(err.message);
  }
};

const getRoomById = async (roomId) => {
  try {
    const result = await pool.query(
      `SELECT r.room_id, r.price, r.amenities, r.capacity, r.view, r.is_extendable, r.problems, 
              h.hotel_id, h.name AS hotel_name, hc.chain_id, hc.name AS chain_name, 
              a.street_address, a.city, a.state, a.postal_code
       FROM Room r
       INNER JOIN Hotel h ON r.hotel_id = h.hotel_id
       INNER JOIN HotelChain hc ON h.chain_id = hc.chain_id
       INNER JOIN Address a ON h.address_id = a.address_id
       WHERE r.room_id = $1`,
      [roomId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

const createRoom = async (
  hotelId,
  price,
  amenities,
  capacity,
  view,
  isExtendable,
  problems
) => {
  try {
    const result = await pool.query(
      `INSERT INTO Room (hotel_id, price, amenities, capacity, view, is_extendable, problems) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [hotelId, price, amenities, capacity, view, isExtendable, problems]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

const updateRoom = async (
  roomId,
  price,
  amenities,
  capacity,
  view,
  isExtendable,
  problems
) => {
  try {
    const result = await pool.query(
      `UPDATE Room 
       SET price = $1, amenities = $2, capacity = $3, view = $4, is_extendable = $5, problems = $6
       WHERE room_id = $7 RETURNING *`,
      [price, amenities, capacity, view, isExtendable, problems, roomId]
    );
    return result.rows[0];
  } catch (err) {
    console.error(err.message);
  }
};

const deleteRoom = async (roomId) => {
  try {
    await pool.query("DELETE FROM Room WHERE room_id = $1", [roomId]);
    return { message: `Room with ID ${roomId} deleted successfully.` };
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  getAllRooms,
  getRoomsByHotelId,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
