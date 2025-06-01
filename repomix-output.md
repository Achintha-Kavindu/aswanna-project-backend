This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
.gitignore
.repomixignore
controllers/galleryItemControllers.js
controllers/offersControllers.js
controllers/userControllers.js
index.js
middleware/authMiddleware.js
models/galleryItem.js
models/offer.js
models/user.js
package.json
repomix.config.json
routes/galleryItemRoute.js
routes/offerRoute.js
routes/userRoute.js
```

# Files

## File: .repomixignore
```
# Add patterns to ignore here, one per line
# Example:
# *.log
# tmp/
```

## File: repomix.config.json
```json
{
  "$schema": "https://repomix.com/schemas/latest/schema.json",
  "input": {
    "maxFileSize": 52428800
  },
  "output": {
    "filePath": "repomix-output.md",
    "style": "markdown",
    "parsableStyle": false,
    "fileSummary": true,
    "directoryStructure": true,
    "files": true,
    "removeComments": false,
    "removeEmptyLines": false,
    "compress": false,
    "topFilesLength": 5,
    "showLineNumbers": false,
    "copyToClipboard": false,
    "git": {
      "sortByChanges": true,
      "sortByChangesMaxCommits": 100,
      "includeDiffs": false
    }
  },
  "include": [],
  "ignore": {
    "useGitignore": true,
    "useDefaultPatterns": true,
    "customPatterns": []
  },
  "security": {
    "enableSecurityCheck": true
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
```

## File: middleware/authMiddleware.js
```javascript
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;

    // Check if auth header exists and has the right format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      // Verify the token (you'll need to set JWT_SECRET in your environment variables)
      const decoded = jwt.verify(token, process.env.JWT_KEY);

      // Find the user by id
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Optional: middleware specifically for checking admin access
export const adminMiddleware = async (req, res, next) => {
  try {
    // Call the auth middleware first to set the user
    authMiddleware(req, res, () => {
      // Check if user is admin
      if (req.user && req.user.type === "admin") {
        next();
      } else {
        return res.status(403).json({ message: "Admin access required" });
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
```

## File: models/user.js
```javascript
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  location: { type: String, required: true },
  img: {
    type: String,
    default:
      "data:image/png;base64,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",
  },
  phone: { type: Number },
  type: { type: String, required: true, default: "buyer" },
  emailVerified: { type: Boolean, required: true, default: false },
});

const User = mongoose.model("user", userSchema);

export default User;
```

## File: routes/userRoute.js
```javascript
import express from "express";
import {
  createUser,
  getSingleUser,
  deleteUser,
  loginUser,
  getAllUsers,
} from "../controllers/userControllers.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get("/:id", getSingleUser);
userRouter.delete("/:id", deleteUser);
userRouter.post("/login", loginUser);
userRouter.get("/", getAllUsers);

export default userRouter;
```

## File: .gitignore
```
node_modules
package-lock.json
.env
```

## File: controllers/offersControllers.js
```javascript
import Offer from "../models/offer.js";

// Create offer
export async function createOffer(req, res) {
  const user = req.user;

  if (!user) {
    return res.status(403).json({ message: "Please login to create an offer" });
  }

  if (user.type !== "farmer") {
    return res
      .status(403)
      .json({ message: "You are not authorized to create an offer" });
  }

  const offerData = {
    ...req.body,
    userId: user._id,
    status: "pending",
  };

  try {
    const newOffer = new Offer(offerData);
    await newOffer.save();

    res.status(200).json({
      message: "Offer submitted for approval",
      itemId: newOffer.itemId, // Return the generated numeric ID
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    res.status(500).json({
      message: "Offer creation failed",
      error: error.message,
    });
  }
}

// Admin Approval Function
export async function approveOffer(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can approve items" });
  }

  const { id } = req.params;

  try {
    const updatedItem = await Offer.findOneAndUpdate(
      { itemId: id }, // Using itemId instead of _id
      { status: "approved" },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({
      message: "Offer approved",
      offer: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve item",
      error: error.message,
    });
  }
}

// Admin Delete Function
export async function deleteOffer(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can delete items" });
  }

  const { id } = req.params;

  try {
    const deletedItem = await Offer.findOneAndDelete({ itemId: id });

    if (!deletedItem) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({
      message: "Offer deleted",
      deletedItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete item",
      error: error.message,
    });
  }
}

// Show only approved offers to users
export async function getApprovedOffers(req, res) {
  try {
    const offers = await Offer.find({ status: "approved" });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch offers",
      error: error.message,
    });
  }
}

// Get pending offers for admin review
export async function getPendingOffers(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admins can view pending items" });
  }

  try {
    const pendingOffers = await Offer.find({ status: "pending" });
    res.status(200).json(pendingOffers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pending offers",
      error: error.message,
    });
  }
}

// Get offer by ID (using itemId)
export async function getOffer(req, res) {
  const { id } = req.params;

  try {
    const offer = await Offer.findOne({ itemId: id });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({
      message: "Offer found successfully",
      offer: offer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching offer",
      error: error.message,
    });
  }
}

// Update offer
export async function updateOffer(req, res) {
  const user = req.user;
  if (!user) {
    return res.status(403).json({ message: "Please login to update an offer" });
  }

  const { id } = req.params;

  try {
    const existingOffer = await Offer.findOne({ itemId: id });

    if (!existingOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const isOwner = existingOffer.userId.toString() === user._id.toString();

    if (user.type !== "admin" && !isOwner) {
      return res.status(403).json({
        message: "You are not authorized to update this offer",
      });
    }

    let updateData = { ...req.body };

    if (user.type === "farmer") {
      updateData.status = "pending";
    }

    const updatedOffer = await Offer.findOneAndUpdate(
      { itemId: id },
      updateData,
      { new: true }
    );

    res.status(200).json({
      message:
        user.type === "farmer"
          ? "Offer updated and submitted for approval"
          : "Offer updated successfully",
      offer: updatedOffer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update offer",
      error: error.message,
    });
  }
}

// Get all offers (admin only)
export async function getAllOffers(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({
      message: "Only admins can access all offers",
    });
  }

  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const offers = await Offer.find(filter);
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch offers",
      error: error.message,
    });
  }
}

// Get my offers
export async function getMyOffers(req, res) {
  const user = req.user;
  if (!user) {
    return res
      .status(403)
      .json({ message: "Please login to access your offers" });
  }

  try {
    const myOffers = await Offer.find({ userId: user._id });
    res.status(200).json({
      message: "Your offers retrieved successfully",
      offers: myOffers,
    });
  } catch (error) {
    console.error("Error fetching user offers:", error);
    res.status(500).json({
      message: "Failed to retrieve your offers",
      error: error.message,
    });
  }
}

// Get approved offers by category (public)
export async function getApprovedOffersByCategory(req, res) {
  const { category } = req.params;

  try {
    const offers = await Offer.find({
      status: "approved",
      category: category.toLowerCase(),
    });

    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch offers by category",
      error: error.message,
    });
  }
}

// Farmer can delete their own offers
export async function deleteMyOffer(req, res) {
  const user = req.user;

  if (!user) {
    return res.status(403).json({ message: "Please login to delete offers" });
  }

  const { id } = req.params;

  try {
    const offer = await Offer.findOne({ itemId: id });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Check ownership
    if (
      offer.userId.toString() !== user._id.toString() &&
      user.type !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own offers" });
    }

    const deletedOffer = await Offer.findOneAndDelete({ itemId: id });

    res.status(200).json({
      message: "Offer deleted successfully",
      deletedOffer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete offer",
      error: error.message,
    });
  }
}
```

## File: controllers/userControllers.js
```javascript
import { response } from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

// create user function
export async function createUser(req, res) {
  const user = req.body;

  const password = req.body.password;

  const saltRounds = 10;

  const passwordHash = bcrypt.hashSync(password, saltRounds);

  user.password = passwordHash;

  const newUser = new User(user);

  try {
    await newUser.save();
    console.log("user created successfully");
    res.status(200).json({ massage: "user created successfully" });
  } catch (error) {
    console.log("user created failed");
    res.status(400).json({ massage: "user creation failed", error: error });
  }
}

// Get single user by ID
export async function getSingleUser(req, res) {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -refreshToken -__v"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("User fetch error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid user ID",
      error: error.message,
    });
  }
}

// Delete user (Admin only)
export async function deleteUser(req, res) {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("User deletion error:", error);
    res.status(400).json({
      success: false,
      message: "User deletion failed",
      error: error.message,
    });
  }
}

// login user
export async function loginUser(req, res) {
  const credentials = req.body;

  try {
    const user = await User.findOne({
      email: credentials.email,
    });

    if (!user) {
      return res.status(404).json({ massage: "user not found" });
    }

    const isMatch = bcrypt.compareSync(credentials.password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const payload = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      type: user.type,
    };

    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "48h" });
    return res
      .status(200)
      .json({ massage: "user  found", user: user, token: token });
  } catch (error) {
    res.status(400).json({ massage: "user getting error", error: error });
  }
}

// Get all users (admin only)

export async function getAllUsers(req, res) {
  const user = req.user;

  // Check if user exists and is an admin
  if (!user || user.type !== "admin") {
    return res.status(403).json({
      message: "Only admins can access all users",
    });
  }

  try {
    // Get all users from the database
    const users = await User.find({}).select("-password -img"); // Exclude passwords from the results for security

    // Return the list of users
    res.status(200).json({
      message: "All users retrieved successfully",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get users",
      error: error.message,
    });
  }
}
```

## File: models/offer.js
```javascript
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
```

## File: routes/offerRoute.js
```javascript
import express from "express";
import {
  createOffer,
  approveOffer,
  deleteOffer,
  getApprovedOffers,
  getPendingOffers,
  getOffer,
  getMyOffers,
  updateOffer,
  getAllOffers,
  getApprovedOffersByCategory,
  deleteMyOffer,
} from "../controllers/offersControllers.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/approved", getApprovedOffers);
router.get("/category/:category", getApprovedOffersByCategory);
router.get("/pending", authMiddleware, adminMiddleware, getPendingOffers);

// Protected routes requiring authentication
router.post("/", authMiddleware, createOffer);
router.get("/my-offers", authMiddleware, getMyOffers);
router.put("/update/:id", authMiddleware, updateOffer);

router.get("/:id", getOffer); // Changed from /single to use itemId

// Admin-only routes
router.get("/admin/all", authMiddleware, adminMiddleware, getAllOffers);
router.put("/approve/:id", authMiddleware, adminMiddleware, approveOffer);
router.delete("/:id", authMiddleware, adminMiddleware, deleteOffer);
router.delete("/my-offers/:id", authMiddleware, deleteMyOffer);

export default router;
```

## File: controllers/galleryItemControllers.js
```javascript
import GalleryItem from "../models/galleryItem.js";

// Create gallery item
export async function postGalleryItem(req, res) {
  const user = req.user;

  if (!user) {
    return res
      .status(403)
      .json({ message: "Please login to create a gallery item" });
  }

  if (user.type !== "farmer") {
    return res
      .status(403)
      .json({ message: "You are not authorized to create a gallery item" });
  }

  const galleryItemData = {
    ...req.body,
    userId: user._id,
    status: "pending",
  };

  try {
    const newGalleryItem = new GalleryItem(galleryItemData);
    await newGalleryItem.save();

    res.status(200).json({
      message: "Gallery item submitted for approval",
      itemId: newGalleryItem.itemId, // Return the generated ID
    });
  } catch (error) {
    console.error("Error creating gallery item:", error);
    res.status(500).json({
      message: "Gallery Item creation failed",
      error: error.message,
    });
  }
}

// Admin Approval Function
export async function approveGalleryItem(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can approve items" });
  }

  const { id } = req.params;

  try {
    const updatedItem = await GalleryItem.findOneAndUpdate(
      { itemId: id }, // Changed to use itemId instead of _id
      { status: "approved" },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    res.status(200).json({
      message: "Gallery item approved",
      galleryItem: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve item",
      error: error.message,
    });
  }
}

// Admin Delete Function
export async function deleteGalleryItem(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({ message: "Only admins can delete items" });
  }

  const { id } = req.params;

  try {
    const deletedItem = await GalleryItem.findOneAndDelete({ itemId: id });

    if (!deletedItem) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    res.status(200).json({
      message: "Gallery item deleted",
      deletedItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete item",
      error: error.message,
    });
  }
}

// Show only approved items to users
export async function getApprovedGalleryItems(req, res) {
  try {
    const items = await GalleryItem.find({ status: "approved" });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch items",
      error: error.message,
    });
  }
}

// Get pending items for admin review
export async function getPendingGalleryItems(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admins can view pending items" });
  }

  try {
    const pendingItems = await GalleryItem.find({ status: "pending" });
    res.status(200).json(pendingItems);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pending items",
      error: error.message,
    });
  }
}

// Get gallery item by ID (updated to use itemId)
export async function getGalleryItem(req, res) {
  const { id } = req.params;

  try {
    const galleryItem = await GalleryItem.findOne({ itemId: id });

    if (!galleryItem) {
      return res.status(404).json({ message: "Gallery Item not found" });
    }

    res.status(200).json({
      message: "Gallery Item found successfully",
      galleryItem: galleryItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gallery Item getting error",
      error: error.message,
    });
  }
}

// Update gallery item
export async function updateGalleryItem(req, res) {
  const user = req.user;
  if (!user) {
    return res
      .status(403)
      .json({ message: "Please login to update a gallery item" });
  }

  const { id } = req.params;

  try {
    const existingItem = await GalleryItem.findOne({ itemId: id });

    if (!existingItem) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    const isOwner = existingItem.userId.toString() === user._id.toString();

    if (user.type !== "admin" && !isOwner) {
      return res.status(403).json({
        message: "You are not authorized to update this gallery item",
      });
    }

    let updateData = { ...req.body };

    if (user.type === "farmer") {
      updateData.status = "pending";
    }

    const updatedItem = await GalleryItem.findOneAndUpdate(
      { itemId: id },
      updateData,
      { new: true }
    );

    res.status(200).json({
      message:
        user.type === "farmer"
          ? "Gallery item updated and submitted for approval"
          : "Gallery item updated successfully",
      galleryItem: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update gallery item",
      error: error.message,
    });
  }
}

// Get all gallery items (admin only)
export async function getAllGalleryItems(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({
      message: "Only admins can access all gallery items",
    });
  }

  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const items = await GalleryItem.find(filter);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch gallery items",
      error: error.message,
    });
  }
}

// Get my gallery items
export async function getMyGalleryItems(req, res) {
  const user = req.user;
  if (!user) {
    return res
      .status(403)
      .json({ message: "Please login to access your gallery items" });
  }

  try {
    const myItems = await GalleryItem.find({ userId: user._id });
    res.status(200).json({
      message: "Your gallery items retrieved successfully",
      galleryItems: myItems,
    });
  } catch (error) {
    console.error("Error fetching user gallery items:", error);
    res.status(500).json({
      message: "Failed to retrieve your gallery items",
      error: error.message,
    });
  }
}

// Get approved items by category (public)
export async function getApprovedItemsByCategory(req, res) {
  const { category } = req.params;

  try {
    const items = await GalleryItem.find({
      status: "approved",
      category: category.toLowerCase(),
    });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch items by category",
      error: error.message,
    });
  }
}

// Farmer can delete their own gallery items
export async function deleteMyGalleryItem(req, res) {
  const user = req.user;

  if (!user) {
    return res.status(403).json({ message: "Please login to delete items" });
  }

  const { id } = req.params;

  try {
    const item = await GalleryItem.findOne({ itemId: id });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check ownership
    if (
      item.userId.toString() !== user._id.toString() &&
      user.type !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own items" });
    }

    const deletedItem = await GalleryItem.findOneAndDelete({ itemId: id });

    res.status(200).json({
      message: "Item deleted successfully",
      deletedItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete item",
      error: error.message,
    });
  }
}
```

## File: package.json
```json
{
  "name": "aswanna-project-backend",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon index.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Achintha-Ak/aswanna-project-backend.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/Achintha-Ak/aswanna-project-backend/issues"
  },
  "homepage": "https://github.com/Achintha-Ak/aswanna-project-backend#readme",
  "description": "",
  "dependencies": {
    "bcrypt": "^6.0.0",
    "body-parser": "^2.2.0",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.14.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}
```

## File: routes/galleryItemRoute.js
```javascript
import express from "express";
import {
  postGalleryItem,
  approveGalleryItem,
  deleteGalleryItem,
  getApprovedGalleryItems,
  getPendingGalleryItems,
  getGalleryItem,
  updateGalleryItem,
  getAllGalleryItems,
  getMyGalleryItems,
  getApprovedItemsByCategory,
  deleteMyGalleryItem,
} from "../controllers/galleryItemControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create
router.post("/create", authMiddleware, postGalleryItem);

// Read - specific routes first
router.get("/category/:category", getApprovedItemsByCategory);
router.get("/my-items", authMiddleware, getMyGalleryItems);
router.get("/approved", getApprovedGalleryItems);
router.get("/pending", authMiddleware, getPendingGalleryItems);
router.get("/admin/items", authMiddleware, getAllGalleryItems);

// Read - parameterized routes after
router.get("/:id", getGalleryItem);

// Update
router.put("/approve/:id", authMiddleware, approveGalleryItem);
router.put("/update/:id", authMiddleware, updateGalleryItem);

// Delete
router.delete("/delete/:id", authMiddleware, deleteGalleryItem);
router.delete("/my-items/:id", authMiddleware, deleteMyGalleryItem);

export default router;
```

## File: models/galleryItem.js
```javascript
import mongoose from "mongoose";

const galleryItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  harvestDay: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }, // Added creation date
  itemId: { type: Number, unique: true }, // Added custom numeric ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Changed to singular "User" (common convention)
    required: true,
  },
  status: { type: String, enum: ["pending", "approved"], default: "pending" },
});

// Pre-save hook to generate custom numeric ID
galleryItemSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const count = await this.constructor.countDocuments();
    this.itemId = 1400 + count + 1;
    next();
  } catch (error) {
    next(error);
  }
});

const GalleryItem = mongoose.model("GalleryItem", galleryItemSchema);

export default GalleryItem;
```

## File: index.js
```javascript
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "./routes/userRoute.js";
import offerRouter from "./routes/offerRoute.js";
import galleryItemRouter from "./routes/galleryItemRoute.js";
import jwt, { decode } from "jsonwebtoken";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const connectionString = process.env.MONGODB_URL;

app.use((req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); //token thiyenawada balanawa

  if (token != null) {
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (decoded != null) {
        req.user = decoded;
        next();
      } else {
        next();
      }
    });
  } else {
    next();
  }
});

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("data base connected");
  })
  .catch(() => {
    console.log("data base error");
  });

app.use("/api/users", userRouter);
app.use("/api/gallery", galleryItemRouter);
app.use("/api/offers", offerRouter);

app.listen(5000, (req, res) => {
  console.log("server is runing on port 5000");
});
```
