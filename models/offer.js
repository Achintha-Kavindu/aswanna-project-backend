// models/offer.js
import mongoose from "mongoose";

const offerSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: String, required: true },
  condition: [{ type: String }],
  location: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved"], default: "pending" },
});

const Offer = mongoose.model("offers", offerSchema);

export default Offer;
