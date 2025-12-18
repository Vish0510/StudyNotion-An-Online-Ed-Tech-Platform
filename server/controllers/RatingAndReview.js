const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { mongo, default: mongoose } = require("mongoose");

// createRating Handler Function
exports.createRating = async (req, res) => {
    try {
        // get user id
        const userId = req.user.id;

        // fetchdata from req body
        const {rating, review, courseId} = req.body;

        // check if user is enrolled or not
        const courseDetails = await Course.findOne(
            {_id: courseId,
                studentsEnrolled: {$elemMatch: {$eq: userId}},
            }
        );

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Students is not enrolled in the Course",
            });
        }

        // check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        });

        if(alreadyReviewed) {
            return res.status(403).json({
                success:false,
                message:"Course is Already reviewed by the User",
            });
        }

        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating, review,
            course:courseId,
            user:userId,
        });

        // update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                }
            },
            {new:true}
        );
        console.log(updatedCourseDetails);

        // return response
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });         
    }
};


// getAverageRating Handler Function
exports.getAverageRating = async (req, res) => {
    try {
        // get courseId
        const courseId = req.body.courseId;

        // calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {    // inthis we find all match courseId that contain in course
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {        
                    _id:null,    // it means we grouped/wrap all entries in single group
                    averageRating: { $avg: "$rating"},
                },
            }
        ]);

        // return rating
        if(result.length > 0) {
            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating,  // here we send average rating 
            });
        }

        // if no rating/review exist
        return res.status(200).json({
            success:true,
            message: 'Average Rating is 0, no ratings given till now',
            averageRating:0,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};


// getAllRatingAndReviews Handler Function
exports.getAllRating = async(req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
                                                .sort({rating: "desc"})
                                                .populate({
                                                    path: "user",
                                                    select: "firstName lastName email image",
                                                })
                                                .populate({
                                                    path:"course",
                                                    select:"courseName",
                                                })
                                                .exec();
                                                
        // return response
        return res.status(200).json({
            success:true,
            message:"All reviews fetched Successfully",
            data: allReviews,
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}; 
