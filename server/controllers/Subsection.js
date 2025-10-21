const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const {uploadImageToCloudinary} = require("../utils/imageUploader");
require('dotenv').config();



// Create SubSection Handler
exports.createSubSection = async (req, res) => {
    try {
        // fetch data from req.body
        const {sectionId, title, timeDuration, description} = req.body;

        // extract the file/video
        const video = req.files.videoFile;

        // validation
        if(!sectionId || !title || !description || !video || !timeDuration) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        // upload video to cloudinary - bcz we need url so here we get secure URL
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME); 

        // create a subSection
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })

        // update Section schema  with this SubSection's objectID
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
            {$push:{
                subSection : subSectionDetails._id,
            }},
            {new:true}
        ).populate("subSection").exec();

        // log updated Section here, after adding populate query
        // return success response
        return res.status(200).json({
            success:true,
            message: 'Sub Section Created Successfully',
            updatedSection,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something Error for creation SubSection',
            error:error.message,
        });
    }
}



// update SubSection Handler
exports.updateSubSection = async (req, res) => {
    try {
        // Extracting data from request
        const { sectionId, subSectionId, title, description } = req.body;

        // Find the existing SubSection or Validation
        const subSection = await SubSection.findById(subSectionId);
        if(!subSection) {
            return res.status(404).json({
                success:false,
                message:'SubSection not found',
            });
        }

        // Update title and description (if provided)
        if (title !== undefined) {
            subSection.title = title;
        }

        if (description !== undefined) {
        subSection.description = description;
        }    

        // Handle video update (if uploaded)
        if (req.files && req.files.videoFile !== undefined) {
            const video = req.files.videoFile;
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            );
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`;
        }

        // Save the updated SubSection
        await subSection.save();

        // Fetch the updated Section (with all its SubSections)
        const updatedSection = await Section.findById(sectionId).populate("subSection").exec();

        // Send success response
        return res.status(200).json({
            success: true,
            message: "Sub Section Updated Successfully",
            updatedSection,
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message: 'Something Error Occurred While Updating SubSection',
            error:error.message,
        });
    }
}




// Delete SubSection Handler
exports.deleteSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId } = req.body;

    // Validate input
    if (!sectionId || !subSectionId) {
      return res.status(400).json({
        success: false,
        message: "Section ID and SubSection ID are required",
      });
    }

    // Find and delete the SubSection
    const deletedSubSection = await SubSection.findByIdAndDelete(subSectionId);
    if (!deletedSubSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    // Remove SubSection reference from Section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $pull: { subSection: subSectionId } },
      { new: true }
    ).populate("subSection").exec();

    if (!updatedSection) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Sub Section Deleted Successfully",
      updatedSection,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something Error Occurred While Deleting SubSection",
      error: error.message,
    });
  }
};

