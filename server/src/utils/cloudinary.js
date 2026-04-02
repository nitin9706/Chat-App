import cloudinary from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;
    // upload the file
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    // file is uploaded successfully
    // console.log("File is uploaded on cloudnary", response.url);
    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    fs.unlinkSync(localfilepath); // remove the file from the server if any error
    return console.log(`there is some error with ${error}`);
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete image");
  }
};
export { uploadToCloudinary, deleteFromCloudinary };
