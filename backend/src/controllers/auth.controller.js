import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { generateTokenAndSetCookie } from "../helper/authHelper.js";
import { comparePassword, hashPassword } from "../helper/authHelper.js";
import { handle200, handle201 } from "../helper/successHandler.js";
import { formatMongooseError, handle400 } from "../helper/errorHandler.js";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";


export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return handle400(res, "All fields are required");
    }

    if (password.length < 6) {
      return handle400(res, "Password must be at least 6 characters");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return handle400(res, "Invalid email format");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handle400(res, "Email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    
    // generateTokenAndSetCookie(savedUser._id, res);

    const responseData = {
      _id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
    };

    try {
      await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    return handle201(res, responseData, "User registered successfully");

  } catch (error) {
    console.error("Error in signup controller:", error);
    return formatMongooseError(res, error);
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return handle400(res, "Email and password are required");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return handle400(res, "Invalid credentials");
    }

    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      return handle400(res, "Invalid credentials");
    }

    generateTokenAndSetCookie(user._id, res);

    const responseData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    };

    return handle200(res, responseData, "Logged in successfully");

  } catch (error) {
    console.error("Error in login controller:", error);
    return formatMongooseError(res, error);
  }
};


export const logout = (_, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    secure: process.env.NODE_ENV !== "development",
  });
  return handle200(res, null, "Logged out successfully");
};


export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    let updatedData = {};

    if (profilePic === null || profilePic === "") {
      // Clear profile pic
      updatedData = { profilePic: "" };
    } else if (profilePic) {
      // Upload new pic
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updatedData = { profilePic: uploadResponse.secure_url };
    } else {
      return handle400(res, "Profile pic data or clear command is required");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatedData,
      { new: true }
    ).select("-password");

    return handle200(res, updatedUser, "Profile updated successfully");

  } catch (error) {
    console.error("Error in update profile:", error);
    return formatMongooseError(res, error);
  }
};


export const checkAuth = (req, res) => {
  try {
    return handle200(res, req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    return formatMongooseError(res, error);
  }
};
