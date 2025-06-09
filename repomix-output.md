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
vercel.json
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

## File: vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

## File: .gitignore
```
node_modules
package-lock.json
.env
```

## File: middleware/authMiddleware.js
```javascript
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
  try {
    console.log("Auth middleware - Starting authentication check");

    // Check if user is already set by global middleware
    if (req.user) {
      console.log(
        "Auth middleware - User already authenticated:",
        req.user.firstName,
        req.user.type
      );
      return next();
    }

    // Get token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth middleware - No valid authorization header");
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("Auth middleware - No token provided");
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      console.log("Auth middleware - Token decoded:", decoded);

      // Find the user by id
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        console.log("Auth middleware - User not found for ID:", decoded.id);
        return res.status(401).json({
          success: false,
          message: "User not found. Please login again.",
        });
      }

      // Add user to request object
      req.user = user;
      console.log(
        "Auth middleware - User authenticated:",
        user.firstName,
        user.type
      );
      next();
    } catch (jwtError) {
      console.error("Auth middleware - JWT verification error:", jwtError);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }
  } catch (error) {
    console.error("Auth middleware - General error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
      error: error.message,
    });
  }
};

export const adminMiddleware = async (req, res, next) => {
  try {
    console.log("Admin middleware - Checking admin access");

    // Ensure user is authenticated first
    if (!req.user) {
      // Run auth middleware first
      return authMiddleware(req, res, () => {
        if (req.user && req.user.type === "admin") {
          console.log("Admin middleware - Admin access granted");
          next();
        } else {
          console.log("Admin middleware - Admin access denied");
          return res.status(403).json({
            success: false,
            message: "Admin access required",
          });
        }
      });
    }

    // Check if user is admin
    if (req.user.type === "admin") {
      console.log("Admin middleware - Admin access granted");
      next();
    } else {
      console.log("Admin middleware - Admin access denied");
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }
  } catch (error) {
    console.error("Admin middleware - Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in admin authentication",
      error: error.message,
    });
  }
};
```

## File: models/user.js
```javascript
// models/user.js
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
  // Add approval status
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  approvedAt: { type: Date },
});

const User = mongoose.model("user", userSchema);

export default User;
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

## File: routes/userRoute.js
```javascript
// routes/userRoute.js
import express from "express";
import {
  createUser,
  getSingleUser,
  deleteUser,
  loginUser,
  getAllUsers,
  approveUser,
  getPendingUsers,
} from "../controllers/userControllers.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/", createUser);
userRouter.post("/login", loginUser);

// Protected routes
userRouter.get("/", authMiddleware, getAllUsers);
userRouter.get("/:id", getSingleUser);
userRouter.delete("/:id", deleteUser);

// Admin approval routes - FIXED: Correct route order and parameters
userRouter.get("/admin/pending", authMiddleware, getPendingUsers);
userRouter.put("/admin/approve/:userId", authMiddleware, approveUser);
userRouter.put("/approve/:id", authMiddleware, adminMiddleware, approveUser); // FIXED: This matches frontend call

export default userRouter;
```

## File: controllers/userControllers.js
```javascript
// controllers/userControllers.js
import { response } from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

// Create user function (auto-pending for non-admins)
export async function createUser(req, res) {
  const user = req.body;

  const password = req.body.password;
  const saltRounds = 10;
  const passwordHash = bcrypt.hashSync(password, saltRounds);

  user.password = passwordHash;

  // Set approval status based on user type
  if (user.type === "admin") {
    user.approvalStatus = "approved"; // Admins are auto-approved
  } else {
    user.approvalStatus = "pending"; // Farmers and buyers need approval
  }

  const newUser = new User(user);

  try {
    await newUser.save();
    console.log("User created successfully");

    if (user.type === "admin") {
      res.status(200).json({
        message: "Admin user created and approved successfully",
      });
    } else {
      res.status(200).json({
        message: "User created successfully. Awaiting admin approval.",
      });
    }
  } catch (error) {
    console.log("User creation failed");
    res.status(400).json({
      message: "User creation failed",
      error: error,
    });
  }
}

// Updated login function with approval check
export async function loginUser(req, res) {
  const credentials = req.body;

  try {
    const user = await User.findOne({
      email: credentials.email,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = bcrypt.compareSync(credentials.password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Check approval status
    if (user.approvalStatus === "pending") {
      return res.status(403).json({
        message:
          "Your account is pending admin approval. Please wait for approval.",
      });
    }

    if (user.approvalStatus === "rejected") {
      return res.status(403).json({
        message: "Your account has been rejected. Please contact admin.",
      });
    }

    const payload = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      type: user.type,
    };

    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "48h" });
    return res.status(200).json({
      message: "Login successful",
      user: user,
      token: token,
    });
  } catch (error) {
    res.status(400).json({
      message: "Login error",
      error: error,
    });
  }
}

// FIXED: Approve user function with correct parameter handling
export async function approveUser(req, res) {
  try {
    const adminUser = req.user;

    if (!adminUser || adminUser.type !== "admin") {
      return res.status(403).json({
        message: "Only admins can approve users",
      });
    }

    // FIXED: Get id from params (matching the route)
    const { id, userId } = req.params;
    const targetUserId = id || userId; // Handle both parameter names

    console.log("Approving user:", targetUserId);

    // FIXED: Simple approval without requiring action in body
    const updateData = {
      approvalStatus: "approved",
      emailVerified: true, // Also set emailVerified for compatibility
      approvedBy: adminUser.id,
      approvedAt: new Date(),
    };

    const updatedUser = await User.findByIdAndUpdate(targetUserId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User approved successfully:", updatedUser.email);

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve user",
      error: error.message,
    });
  }
}

// Get pending users (admin only)
export async function getPendingUsers(req, res) {
  const adminUser = req.user;

  if (!adminUser || adminUser.type !== "admin") {
    return res.status(403).json({
      message: "Only admins can view pending users",
    });
  }

  try {
    const pendingUsers = await User.find({
      approvalStatus: "pending",
    }).select("-password");

    res.status(200).json({
      message: "Pending users retrieved successfully",
      users: pendingUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get pending users",
      error: error.message,
    });
  }
}

// Updated getAllUsers function
export async function getAllUsers(req, res) {
  const user = req.user;

  if (!user || user.type !== "admin") {
    return res.status(403).json({
      message: "Only admins can access all users",
    });
  }

  try {
    const users = await User.find({}).select("-password");

    res.status(200).json({
      success: true, // FIXED: Add success field for consistency
      message: "All users retrieved successfully",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    });
  }
}

// Other existing functions remain the same...
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
```

## File: routes/galleryItemRoute.js
```javascript
// routes/galleryItemRoute.js - Route order is critical
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

// Read - SPECIFIC routes FIRST (very important)
router.get("/approved", getApprovedGalleryItems);
router.get("/my-items", authMiddleware, getMyGalleryItems);
router.get("/pending", authMiddleware, getPendingGalleryItems);
router.get("/admin/items", authMiddleware, getAllGalleryItems); // Admin route
router.get("/category/:category", getApprovedItemsByCategory);

// Read - parameterized routes LAST
router.get("/:id", getGalleryItem);

// Update
router.put("/approve/:id", authMiddleware, approveGalleryItem);
router.put("/update/:id", authMiddleware, updateGalleryItem);

// Delete
router.delete("/delete/:id", authMiddleware, deleteGalleryItem);
router.delete("/my-items/:id", authMiddleware, deleteMyGalleryItem);

export default router;
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
import jwt from "jsonwebtoken";
import User from "./models/user.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const connectionString = process.env.MONGODB_URL;

// Global middleware for token parsing (improved)
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      console.log("Global middleware - Decoded token:", decoded);

      // Find the actual user from database
      const user = await User.findById(decoded.id).select("-password");

      if (user) {
        req.user = user;
        console.log(
          "Global middleware - User found:",
          user.firstName,
          user.type
        );
      } else {
        console.log("Global middleware - User not found in database");
      }
    } catch (error) {
      console.log(
        "Global middleware - Token verification failed:",
        error.message
      );
    }
  }

  next();
});

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.log("Database connection error:", error);
  });

app.use("/api/users", userRouter);
app.use("/api/gallery", galleryItemRouter);
app.use("/api/offers", offerRouter);

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
```

## File: models/offer.js
```javascript
// models/offer.js
import mongoose from "mongoose";

const offerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: false }, // Optional
    price: { type: String, required: true },
    condition: [{ type: String }],
    category: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    harvestDay: { type: Date, required: true },
    lastUpdated: { type: Date },
    itemId: { type: Number, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      name: { type: String },
      location: { type: String },
      phone: { type: String },
      email: { type: String },
    },

    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    previousData: { type: Object },
    updateHistory: [
      {
        updatedAt: { type: Date, default: Date.now },
        changes: { type: Object },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// FIXED: Improved pre-save hook with better error handling
offerSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    // Get the highest itemId and add 1
    const lastOffer = await this.constructor.findOne(
      {},
      {},
      { sort: { itemId: -1 } }
    );

    if (lastOffer && lastOffer.itemId) {
      this.itemId = lastOffer.itemId + 1;
    } else {
      this.itemId = 1400; // Starting number
    }

    // Double-check for uniqueness
    let attempts = 0;
    while (attempts < 10) {
      const existing = await this.constructor.findOne({ itemId: this.itemId });
      if (!existing) break;

      this.itemId += 1;
      attempts += 1;
    }

    if (attempts >= 10) {
      throw new Error("Unable to generate unique itemId after 10 attempts");
    }

    console.log("Generated offer itemId:", this.itemId);
    next();
  } catch (error) {
    console.error("Error generating offer itemId:", error);
    next(error);
  }
});

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
```

## File: routes/offerRoute.js
```javascript
// routes/offerRoute.js
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
  getOfferById,
} from "../controllers/offersControllers.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Create
router.post("/", authMiddleware, createOffer);

// Read
router.get("/approved", getApprovedOffers);
router.get("/my-offers", authMiddleware, getMyOffers);
router.get("/pending", authMiddleware, adminMiddleware, getPendingOffers);
router.get("/admin/all", authMiddleware, adminMiddleware, getAllOffers);
router.get("/category/:category", getApprovedOffersByCategory);

// Update
router.put("/approve/:id", authMiddleware, adminMiddleware, approveOffer);
router.put("/update/:id", authMiddleware, updateOffer);

// Delete routes - FIXED: Updated parameter names to match controllers
router.delete("/delete/:id", authMiddleware, adminMiddleware, deleteOffer); // Admin delete
router.delete("/my-offers/:id", authMiddleware, deleteMyOffer); // Farmer delete
router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteOffer); // Alternative admin delete
router.delete("/:id", authMiddleware, adminMiddleware, deleteOffer); // Direct delete for admin panel

// Parameterized routes (keep at end to avoid conflicts)
router.get("/:id", getOffer);
router.get("/:id", getOfferById);

export default router;
```

## File: models/galleryItem.js
```javascript
// models/galleryItem.js - Add previousData field
import e from "express";
import mongoose from "mongoose";

const galleryItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: false },
  price: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  harvestDay: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date },
  itemId: { type: Number, unique: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  owner: {
    name: { type: String },
    location: { type: String },
    phone: { type: String },
    email: { type: String },
  },

  status: { type: String, enum: ["pending", "approved"], default: "pending" },
  // Add previous data tracking
  previousData: { type: Object },
  updateHistory: [
    {
      updatedAt: { type: Date, default: Date.now },
      changes: { type: Object },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});

// Current problematic pre-save hook
galleryItemSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    // FIXED: Better itemId generation
    const lastItem = await this.constructor.findOne(
      {},
      {},
      { sort: { itemId: -1 } }
    );

    if (lastItem && lastItem.itemId) {
      this.itemId = lastItem.itemId + 1;
    } else {
      this.itemId = 1400; // Starting number
    }

    // ADDED: Double-check for uniqueness
    let attempts = 0;
    while (attempts < 10) {
      const existing = await this.constructor.findOne({ itemId: this.itemId });
      if (!existing) break;

      this.itemId += 1;
      attempts += 1;
    }

    next();
  } catch (error) {
    next(error);
  }
});

const GalleryItem = mongoose.model("GalleryItem", galleryItemSchema);
export default GalleryItem;
```

## File: controllers/galleryItemControllers.js
```javascript
import GalleryItem from "../models/galleryItem.js";
import User from "../models/user.js";

export async function postGalleryItem(req, res) {
  try {
    console.log("Gallery create - Starting creation process");

    // FIXED: Get user from req.user (set by auth middleware)
    const user = req.user;
    console.log(
      "Gallery create - User from middleware:",
      user ? user.firstName : "No user"
    );

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to create a gallery item",
      });
    }

    if (user.type !== "farmer") {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to create a gallery item. Only farmers can create gallery items.",
      });
    }

    // Validation - image is optional
    const { name, price, category, location, description, harvestDay } =
      req.body;

    if (
      !name ||
      !price ||
      !category ||
      !location ||
      !description ||
      !harvestDay
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        required: [
          "name",
          "price",
          "category",
          "location",
          "description",
          "harvestDay",
        ],
      });
    }

    // FIXED: Better error handling for duplicate itemId
    const galleryItemData = {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      location: req.body.location,
      description: req.body.description,
      harvestDay: req.body.harvestDay,
      userId: user._id,
      owner: {
        name: user.firstName + " " + user.lastName,
        location: user.location,
        phone: user.phone,
        email: user.email,
      },

      // FIXED: Use user from req.user
      status: "pending",
      // FIXED: Image is optional
      image:
        req.body.image ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
    };

    console.log("Creating gallery item with data:", {
      ...galleryItemData,
      image: galleryItemData.image ? "IMAGE_PROVIDED" : "NO_IMAGE",
      userId: user._id,
    });

    const newGalleryItem = new GalleryItem(galleryItemData);
    await newGalleryItem.save();

    console.log(
      "Gallery item created successfully with itemId:",
      newGalleryItem.itemId
    );

    res.status(201).json({
      success: true,
      message: "Gallery item submitted for approval",
      itemId: newGalleryItem.itemId,
      galleryItem: newGalleryItem,
    });
  } catch (error) {
    console.error("Gallery create error:", error);

    // ADDED: Handle duplicate key error specifically
    if (error.code === 11000 && error.keyPattern && error.keyPattern.itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID conflict. Please try again.",
        error: "Duplicate itemId generated",
      });
    }

    res.status(500).json({
      success: false,
      message: "Gallery Item creation failed",
      error: error.message,
    });
  }
}

// Keep all other existing functions unchanged...
export async function approveGalleryItem(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can approve items",
      });
    }

    const { id } = req.params;

    const updatedItem = await GalleryItem.findOneAndUpdate(
      { itemId: id },
      { status: "approved" },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gallery item approved",
      galleryItem: updatedItem,
    });
  } catch (error) {
    console.error("Error approving gallery item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve item",
      error: error.message,
    });
  }
}

// Continue with all other existing functions...
export async function deleteGalleryItem(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete items",
      });
    }

    const { id } = req.params;

    const deletedItem = await GalleryItem.findOneAndDelete({ itemId: id });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gallery item deleted",
      deletedItem,
    });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  }
}

export async function getApprovedGalleryItems(req, res) {
  try {
    console.log("Fetching approved gallery items for home page");

    const approvedItems = await GalleryItem.find({ status: "approved" }).sort({
      createdAt: -1,
    });

    //console.log(`Found ${approvedItems.length} approved gallery items`);
    console.log(approvedItems);

    res.status(200).json({
      success: true,
      data: approvedItems,
      count: approvedItems.length,
    });
  } catch (error) {
    console.error("Error fetching approved gallery items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch approved gallery items",
      error: error.message,
    });
  }
}

export async function getPendingGalleryItems(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view pending items",
      });
    }

    const pendingItems = await GalleryItem.find({ status: "pending" });
    res.status(200).json({
      success: true,
      data: pendingItems,
    });
  } catch (error) {
    console.error("Error fetching pending gallery items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending items",
      error: error.message,
    });
  }
}

export async function getGalleryItem(req, res) {
  try {
    const { id } = req.params;
    const galleryItem = await GalleryItem.findOne({ itemId: id });

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gallery Item found successfully",
      galleryItem: galleryItem,
    });
  } catch (error) {
    console.error("Error fetching gallery item:", error);
    res.status(500).json({
      success: false,
      message: "Gallery Item getting error",
      error: error.message,
    });
  }
}

export async function updateGalleryItem(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to update a gallery item",
      });
    }

    const { id } = req.params;

    const existingItem = await GalleryItem.findOne({ itemId: id });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    const isOwner = existingItem.userId.toString() === user._id.toString();

    if (user.type !== "admin" && !isOwner) {
      return res.status(403).json({
        success: false,
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
      success: true,
      message:
        user.type === "farmer"
          ? "Gallery item updated and submitted for approval"
          : "Gallery item updated successfully",
      galleryItem: updatedItem,
    });
  } catch (error) {
    console.error("Error updating gallery item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update gallery item",
      error: error.message,
    });
  }
}

export async function getAllGalleryItems(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access all gallery items",
      });
    }

    const filter = req.query.status ? { status: req.query.status } : {};
    const items = await GalleryItem.find(filter);
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching all gallery items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gallery items",
      error: error.message,
    });
  }
}

export async function getMyGalleryItems(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to access your gallery items",
      });
    }

    const myItems = await GalleryItem.find({ userId: user._id });
    res.status(200).json({
      success: true,
      message: "Your gallery items retrieved successfully",
      galleryItems: myItems,
    });
  } catch (error) {
    console.error("Error fetching user gallery items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your gallery items",
      error: error.message,
    });
  }
}

export async function getApprovedItemsByCategory(req, res) {
  try {
    const { category } = req.params;

    const items = await GalleryItem.find({
      status: "approved",
      category: category.toLowerCase(),
    });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching items by category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch items by category",
      error: error.message,
    });
  }
}

export async function deleteMyGalleryItem(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to delete items",
      });
    }

    const { id } = req.params;
    const item = await GalleryItem.findOne({ itemId: id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Check ownership
    if (
      item.userId.toString() !== user._id.toString() &&
      user.type !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own items",
      });
    }

    const deletedItem = await GalleryItem.findOneAndDelete({ itemId: id });

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      deletedItem,
    });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  }
}
```

## File: controllers/offersControllers.js
```javascript
import Offer from "../models/offer.js";
import User from "../models/user.js";

export async function createOffer(req, res) {
  try {
    console.log("Offer create - Starting creation process");
    const user = req.user;

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to create an offer",
      });
    }

    if (user.type !== "farmer") {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to create an offer. Only farmers can create offers.",
      });
    }

    // Validation - image is optional
    const { name, price, category, location, description, harvestDay } =
      req.body;

    if (
      !name ||
      !price ||
      !category ||
      !location ||
      !description ||
      !harvestDay
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        required: [
          "name",
          "price",
          "category",
          "location",
          "description",
          "harvestDay",
        ],
      });
    }

    // Create offer data
    const offerData = {
      name,
      price,
      category,
      location,
      description,
      harvestDay,
      condition: req.body.condition || [],
      userId: user._id,
      owner: {
        name: user.firstName + " " + user.lastName,
        location: user.location,
        phone: user.phone,
        email: user.email,
      },
      status: "pending",
      // Image is optional - set default if not provided
      image:
        req.body.image ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
    };

    console.log("Creating offer with data:", {
      ...offerData,
      image: offerData.image ? "IMAGE_PROVIDED" : "NO_IMAGE",
    });

    // Create and save the offer
    const newOffer = new Offer(offerData);
    await newOffer.save();

    console.log("Offer created successfully with itemId:", newOffer.itemId);

    res.status(201).json({
      success: true,
      message: "Offer submitted for approval",
      itemId: newOffer.itemId,
      offer: newOffer,
    });
  } catch (error) {
    console.error("Offer create - Error:", error);

    // Handle duplicate key error specifically
    if (error.code === 11000 && error.keyPattern && error.keyPattern.itemId) {
      return res.status(400).json({
        success: false,
        message: "Offer ID conflict. Please try again.",
        error: "Duplicate itemId generated",
      });
    }

    res.status(500).json({
      success: false,
      message: "Offer creation failed",
      error: error.message,
    });
  }
}

export async function approveOffer(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can approve items",
      });
    }

    const { id } = req.params;

    const updatedItem = await Offer.findOneAndUpdate(
      { itemId: id },
      { status: "approved" },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Offer approved",
      offer: updatedItem,
    });
  } catch (error) {
    console.error("Error approving offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve item",
      error: error.message,
    });
  }
}

export async function deleteOffer(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete items",
      });
    }

    const { id } = req.params;
    console.log("Admin deleting offer with id:", id);

    // SIMPLE FIX: Only search by itemId (numeric)
    const deletedItem = await Offer.findOneAndDelete({ itemId: parseInt(id) });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    console.log("Offer deleted successfully:", deletedItem.itemId);

    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
      deletedItem,
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
      error: error.message,
    });
  }
}

export async function getApprovedOffers(req, res) {
  try {
    console.log("Fetching approved offers for home page");

    const approvedOffers = await Offer.find({ status: "approved" }).sort({
      createdAt: -1,
    });

    console.log(`Found ${approvedOffers.length} approved offers`);

    res.status(200).json({
      success: true,
      data: approvedOffers,
      count: approvedOffers.length,
    });
  } catch (error) {
    console.error("Error fetching approved offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch approved offers",
      error: error.message,
    });
  }
}

export async function getPendingOffers(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view pending items",
      });
    }

    const pendingOffers = await Offer.find({ status: "pending" });
    res.status(200).json({
      success: true,
      data: pendingOffers,
    });
  } catch (error) {
    console.error("Error fetching pending offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending offers",
      error: error.message,
    });
  }
}

export async function getOffer(req, res) {
  try {
    const { id } = req.params;

    // FIXED: Try both itemId and _id for better compatibility
    const offer = await Offer.findOne({
      $or: [{ itemId: id }, { _id: id }],
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Offer found successfully",
      offer: offer,
    });
  } catch (error) {
    console.error("Error fetching offer:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching offer",
      error: error.message,
    });
  }
}

export async function updateOffer(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to update an offer",
      });
    }

    const { id } = req.params;
    console.log("Updating offer with id:", id);

    // FIXED: Better query logic to handle both itemId and _id
    let existingOffer;

    // First try to find by itemId (numeric)
    if (!isNaN(id)) {
      existingOffer = await Offer.findOne({ itemId: parseInt(id) });
    }

    // If not found and id looks like ObjectId, try _id
    if (!existingOffer && id.match(/^[0-9a-fA-F]{24}$/)) {
      existingOffer = await Offer.findOne({ _id: id });
    }

    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    const isOwner = existingOffer.userId.toString() === user._id.toString();

    if (user.type !== "admin" && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this offer",
      });
    }

    let updateData = { ...req.body };

    if (user.type === "farmer") {
      updateData.status = "pending";
    }

    // Update using the same query logic
    let updatedOffer;
    if (!isNaN(id)) {
      updatedOffer = await Offer.findOneAndUpdate(
        { itemId: parseInt(id) },
        updateData,
        { new: true }
      );
    } else {
      updatedOffer = await Offer.findOneAndUpdate({ _id: id }, updateData, {
        new: true,
      });
    }

    console.log("Offer updated successfully:", updatedOffer.itemId);

    res.status(200).json({
      success: true,
      message:
        user.type === "farmer"
          ? "Offer updated and submitted for approval"
          : "Offer updated successfully",
      offer: updatedOffer,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update offer",
      error: error.message,
    });
  }
}

export async function getAllOffers(req, res) {
  try {
    const user = req.user;

    if (!user || user.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access all offers",
      });
    }

    const filter = req.query.status ? { status: req.query.status } : {};
    const offers = await Offer.find(filter);
    res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error("Error fetching all offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offers",
      error: error.message,
    });
  }
}

export async function getMyOffers(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to access your offers",
      });
    }

    const myOffers = await Offer.find({ userId: user._id });
    res.status(200).json({
      success: true,
      message: "Your offers retrieved successfully",
      offers: myOffers,
    });
  } catch (error) {
    console.error("Error fetching user offers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your offers",
      error: error.message,
    });
  }
}

export async function getApprovedOffersByCategory(req, res) {
  try {
    const { category } = req.params;

    const offers = await Offer.find({
      status: "approved",
      category: category.toLowerCase(),
    });

    res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error("Error fetching offers by category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch offers by category",
      error: error.message,
    });
  }
}

export async function deleteMyOffer(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please login to delete offers",
      });
    }

    const { id } = req.params;
    console.log("Farmer deleting own offer with id:", id);

    // FIXED: Better query logic to handle both itemId and _id
    let offer;

    // First try to find by itemId (numeric)
    if (!isNaN(id)) {
      offer = await Offer.findOne({ itemId: parseInt(id) });
    }

    // If not found and id looks like ObjectId, try _id
    if (!offer && id.match(/^[0-9a-fA-F]{24}$/)) {
      offer = await Offer.findOne({ _id: id });
    }

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // Check ownership
    if (
      offer.userId.toString() !== user._id.toString() &&
      user.type !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own offers",
      });
    }

    // Delete the offer using the same logic
    let deletedOffer;
    if (!isNaN(id)) {
      deletedOffer = await Offer.findOneAndDelete({ itemId: parseInt(id) });
    } else {
      deletedOffer = await Offer.findOneAndDelete({ _id: id });
    }

    console.log("Offer deleted successfully:", deletedOffer.itemId);

    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
      deletedOffer,
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete offer",
      error: error.message,
    });
  }
}

// Add this function to your existing offersControllers.js

export async function getOfferById(req, res) {
  try {
    const { id } = req.params;
    console.log("Getting offer by id:", id);

    // FIXED: Better query logic to handle both itemId and _id
    let offer;

    // First try to find by itemId (numeric)
    if (!isNaN(id)) {
      offer = await Offer.findOne({ itemId: parseInt(id) });
    }

    // If not found and id looks like ObjectId, try _id
    if (!offer && id.match(/^[0-9a-fA-F]{24}$/)) {
      offer = await Offer.findOne({ _id: id });
    }

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Offer found successfully",
      offer: offer,
    });
  } catch (error) {
    console.error("Error fetching offer:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching offer",
      error: error.message,
    });
  }
}
```
