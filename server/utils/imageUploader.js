const cloudinary = require('cloudinary').v2;

// define cloudinary function to upload image
exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        // define options object for cloudinary upload
        const options = { folder };
        if(height) {
            options.height = height;
        }
        if(quality) {
            options.quality = quality;
        }
        // set resource type to auto to support all file types
        options.resource_type = "auto";

        // upload image to cloudinary with given options
        return await cloudinary.uploader.upload(file.tempFilePath, options);

    }
    catch (error) {
        throw new Error("Image upload to Cloudinary failed");   
    }
}