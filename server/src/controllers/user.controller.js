import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { getIO } from "../sockets/socket.js";

const generateRefreshTokenAndAccessToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const accessToken = jwt.sign(
    { _id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    },
  );

  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    },
  );

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password, phoneno } = req.body;

  if (!password) throw new ApiError(404, "password is required");

  if (phoneno && phoneno.length !== 10) {
    throw new ApiError(404, "invalid phone number");
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new ApiError(409, "user with username already exists");
  }

  const localAvatarPath = req.file ? req.file.path : null;
  const avatar = localAvatarPath
    ? await uploadToCloudinary(localAvatarPath)
    : null;

  const user = await User.create({
    fullname,
    email,
    username,
    password,
    avatar: avatar?.secure_url || "",
  });

  if (!user) {
    throw new ApiError(500, "error while registering user");
  }

  const registeredUser = await User.findById(user._id).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, registeredUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { password, username } = req.body;

  if (!password) throw new ApiError(404, "password is required");
  if (!username) throw new ApiError(404, "username is required");

  const user = await User.findOne({ username });
  if (!user) throw new ApiError(404, "user not found");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateRefreshTokenAndAccessToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // 🔥 USER ONLINE EMIT
  const io = getIO();
  io.emit("user_online", {
    userId: user._id.toString(),
  });

  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, user: loggedInUser },
        "user logged in successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id?.toString() || req.params.id;
  if (!userId) throw new ApiError(400, "userId is required");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "user not found");

  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  // 🔥 USER OFFLINE EMIT
  const io = getIO();
  io.emit("user_offline", {
    userId: userId.toString(),
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(404, "old password and new password are required");
  }
  if (!userId) throw new ApiError(401, "unauthorized request");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "user not found");

  const isOldPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isOldPasswordValid) {
    throw new ApiError(401, "invalid old password");
  }

  user.password = newPassword;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "refresh token not found");
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new ApiError(401, "invalid refresh token");
  }

  const { accessToken } = await generateRefreshTokenAndAccessToken(user._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "access token refreshed successfully",
      ),
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
};
