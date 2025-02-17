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
const getAvailableRooms = async (
  startDate,
  endDate,
  capacity,
  state,
  chainId,
  category,
  minRooms,
  maxPrice
) => {
  try {
    const result = await pool.query(
      `SELECT json_agg(
        json_build_object(
            'hotel_id', h.hotel_id,
            'chain_id',hc.chain_id,
            'name', h.name,
            'category', h.category,
            'number_of_rooms', h.number_of_rooms,
            'hotel_chain', hc.name,
            'address', json_build_object(
                'street_address', a.street_address,
                'city', a.city,
                'state', a.state,
                'postal_code', a.postal_code
            ),
            'rooms', COALESCE(r.rooms, '[]'::json)  -- Use subquery result
        )
      ) AS hotels
      FROM Hotel h
      JOIN HotelChain hc ON h.chain_id = hc.chain_id
      JOIN Address a ON h.address_id = a.address_id
      LEFT JOIN (
        SELECT r.hotel_id, 
               json_agg(
                   json_build_object(
                       'room_id', r.room_id,
                       'price', r.price,
                       'amenities', r.amenities,
                       'capacity', r.capacity,
                       'view', r.view,
                       'is_extendable', r.is_extendable,
                       'problems', r.problems
                   )
               ) FILTER (WHERE b.booking_id IS NULL) AS rooms
        FROM Room r
        LEFT JOIN Booking b ON r.room_id = b.room_id 
            AND (
                (b.check_in_date, b.check_out_date) 
                OVERLAPS 
                (COALESCE($1::DATE,b.check_in_date), COALESCE($2::DATE,b.check_out_date))
                AND b.is_archived = FALSE
            )
        WHERE
             ($3::TEXT IS NULL OR r.capacity = $3::TEXT)  -- Room capacity filter
            AND ($4::NUMERIC  IS NULL OR r.price <= $4::NUMERIC )  -- Max price filter
        GROUP BY r.hotel_id
      ) r ON h.hotel_id = r.hotel_id
      WHERE 
        ($5::TEXT IS NULL OR a.state = $5::TEXT)      -- Filter by state
        AND ($6::INT IS NULL OR hc.chain_id = $6::INT) -- Filter by hotel chain
        AND ($7::INT IS NULL OR h.category = $7::INT) -- Filter by hotel category
        AND ($8::INT IS NULL OR h.number_of_rooms >= $8::INT)  -- Filter by min hotel room count
        AND jsonb_array_length(COALESCE(r.rooms::jsonb, '[]'::jsonb)) > 0 
      GROUP BY h.hotel_id, hc.chain_id, a.street_address, a.city, a.state, a.postal_code;`,
      [
        startDate,
        endDate,
        capacity,
        maxPrice,
        state,
        chainId,
        category,
        minRooms,
      ]
    );
    return result.rows;
  } catch (err) {
    console.error(err.message);
    throw err;
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
  getAvailableRooms,
};
