const Section = require('../models/Section');
const Course = require('../models/Course');
const SubSection = require("../models/SubSection");

// here we are creating createSection handler
exports.createSection = async (req, res) => {
    try {
        // data fetch
        const {sectionName, courseId} = req.body;

        // data validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message: 'All fields are required for creating createSection'
            });
        }

        // create Section
        const newSection = await Section.create({sectionName});

        // update Course Schema with Section's object ID
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId, 
            {
                $push: {
                    courseContent: newSection._id,
                }    
            }, 
            {new:true}
        ).populate({                    //  use populate to replace sections/sub-sections both in the updatedCourseDetails
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        }).exec();

        // return response
        return res.status(200).json({
            success:true,
            message:'Section created Successfully',
            updatedCourseDetails
        })

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Some issue for creating a Section, Please try again',
            error:error.message,
        }); 
    }
}



// Creating update Section Handler
exports.updateSection = async (req, res) => {
    try {
        //  Data input
        const {sectionName, sectionId, courseId} = req.body;

        // Data Validation
        if(!sectionName || !sectionId) {
            return res.status(400).json({
                success:false,
                message: 'All fields are required for updating Section'
            });
        }

        // update Data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        const course = await Course.findById(courseId)
            .populate({
                path:"courseContent",
                populate:{
                path:"subSection",
                },
            })
            .exec();

        // return response
        return res.status(200).json({
            success:true,
            message: section,
			data:course,
        });

    }
    catch(error){
        console.log("Error updating section:", error);
        return res.status(500).json({
            success:false,
            message:'Facing some issue for Section updation, Please check it and try again',
            error:error.message,
        });
    }
}



// Defining Delete Section handler
exports.deleteSection = async (req, res) => {
    try {
        // fetch data/id
        // here we are sending id in params
        const {sectionId, courseId} = req.body;
        console.log("Delete Section Body =>", req.body);

        // validation 
        if(!sectionId || !courseId) {
            return res.status(400).json({
                success:false,
                message: 'Something Missing'
            });
        }

        // remove section from course content
        await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId,
            },
        });

        // delete section
        const section = await Section.findById(sectionId);
        console.log(sectionId, courseId);
        if(!section) {
            return res.status(404).json({
                success:false,
                message:"Section not Found",
            })
        }
        
        //delete sub section
        await SubSection.deleteMany({_id: {$in: section.subSection}});
        
        await Section.findByIdAndDelete(sectionId);
        
        //find the updated course and return 
        const course = await Course.findById(courseId).populate({
            path:"courseContent",
            populate: {
                path: "subSection"
                }
        })
        .exec();
        
        res.status(200).json({
            success:true,
            message:"Section deleted",
            data:course
        });
    } catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};