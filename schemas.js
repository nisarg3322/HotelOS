const Joi = require("joi");

const addressSchema = Joi.object({
  street_address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  postal_code: Joi.string().required(),
});

const hotelChainSchema = Joi.object({
  name: Joi.string().required(),
  address: addressSchema.required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
});

const hotelSchema = Joi.object({
  chain_id: Joi.number().required(),
  name: Joi.string().required(),
  address: addressSchema.required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  category: Joi.number().required(),
});

const updateHotelSchema = Joi.object({
  name: Joi.string().required(),
  address: addressSchema.required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  category: Joi.number().required(),
});

const roomSchema = Joi.object({
  hotelId: Joi.number().required(),
  price: Joi.number().min(0).required(),
  amenities: Joi.string().required(),
  capacity: Joi.string().valid("single", "double").required(),
  view: Joi.string().valid("sea", "mountain").required(),
  isExtendable: Joi.boolean(),
  problems: Joi.string().required(),
});

const updateRoomSchema = Joi.object({
  price: Joi.number().min(0).required(),
  amenities: Joi.string().required(),
  capacity: Joi.string()
    .valid("single", "double", "family", "suite")
    .required(),
  view: Joi.string().valid("sea", "mountain").required(),
  isExtendable: Joi.boolean(),
  problems: Joi.string().required(),
});

module.exports = {
  addressSchema,
  hotelChainSchema,
  hotelSchema,
  updateHotelSchema,
  roomSchema,
  updateRoomSchema,
};
