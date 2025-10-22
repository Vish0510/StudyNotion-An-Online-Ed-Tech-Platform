const Course = require('../models/Course');
const Tag = require('../models/Category');
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader');

// here we are creating createCourse handler function
exports.createCourse = async (req, res) => {
    try {
        // fetch course data from request body
        const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body;

        // fetch thumbnail image from request files
        const thumbnail = req.files.thumbnailImage;

        // validation: check if course with same name already exists
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // check for instructor id - because it will use in new course for knowing who is instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details: ", instructorDetails);
        // TODO HOMEWORK : Verify that userID and instructorDetails._id are same or different ????

        // if data is not found for the given user id
        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found"
            });
        }

        // check givem tag is valid or not
        const tagDetails = await Tag.findById(tag);
        // if no tag found for the given id
        if (!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "Tag not found"
            });
        }

        // upload thumbnail image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create entry in the database for the new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,price,
            tag: tagDetails._id,
            thumbnail : thumbnailImage.secure_url,
        });
        console.log("New Course Created: ", newCourse);

        // update user model to add this course to createdCourses array of instructor or add the new course to the user schema of instructor
        await User.findByIdAndUpdate(instructorDetails._id, 
            {$push: {
                courses: newCourse._id
                }
            },
            {new:true}
        );

        // update the TAG schema to include this new course
        await Tag.findByIdAndUpdate(
            tagDetails._id,
            { $push: { course: newCourse._id } }, 
            { new: true }
        );

        // return the response
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data : newCourse,
        });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error in creating course",
            error: error.message,
        });
    }
}



// now we will create a handler function for getAllCourses
exports.getAllCourses = async (req, res) => {
    try {
        // fetch all the courses
        const allCourses = await Course.find({}, 
            {                              // this is basically optional we just want to fetch the courses on the basis of these data
            courseName: true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true
            }).populate("instructor").exec();

        // return response
        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched Successfully",
            data:allCourses,
        });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message: " Internal server Error to get all the courses!!!",
            error:error.message
        })
    }
}



// creation of getCourseDetails Handler Function  -->> in this we want Entire Data without objectId only want actual  data
exports.getCourseDetails = async (req, res) => {
    try {
        // get/fetch id from body
        const {courseId} = req.body;

        // find course Details
        const courseDetails = await Course.find(
            {_id:courseId})
            .populate(
                {
                    path:"instructor",
                    populate:{
                        path:"additionalDetails",
                    },
                }
            )
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path:"courseContent",
                populate: {
                    path:"subSection",
                },
            })
            .exec();

        // validation
        if(!courseDetails) {
            return res.status(400).json({
                success:false,
                message: `Could not find the course with ${courseId},`
            });
        }

        // return response 
        return res.status(200).json({
            success:true,
            message:"Course Details fetched Successfully",
            data:courseDetails,
        })

    }   
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};
