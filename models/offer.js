import mongoose from "mongoose";

const offerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: String, required: true },
    condition: [{ type: String }], // Preserved from original offer schema
    category: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    harvestDay: { type: Date, required: true }, // Added from gallery schema
    itemId: { type: Number, unique: true }, // Added numeric ID system
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Changed to singular "User" to match gallery
      required: true, // Made required like in gallery
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Keeps automatic createdAt/updatedAt
  }
);

// Add the same ID generation middleware as gallery
offerSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const count = await this.constructor.countDocuments();
    this.itemId = 1400 + count + 1;
    next();
  } catch (error) {
    next(error);
  }
});

// Changed model name to singular "Offer" (more conventional)
const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
