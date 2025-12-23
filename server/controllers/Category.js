const { Mongoose } = require("mongoose");
const Category = require("../models/Category");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
    }

// creation of  CreateCategory handler function
exports.createCategory = async (req, res) => {
    try{
        // fetch Category data from request body
        const { name, description } = req.body;

        // validation: check if Category with same name already exists
        if(!name || !description){
            return res.status(400).json({ 
                success: false,
                message: "Category name and description are required" 
            });
        }

        // create entry in the database for the new Category
        const categoryDetails = await Category.create({name:name, description:description});
        console.log(categoryDetails);

        // return success response
        return res.status(200).json({ 
            success: true,
            message: "Category created successfully",
        });

    }
    catch(error){
        return res.status(500).json({ 
            success: false,
            message: error.message, 
        });
    }   
};



// here we are creating getAllCategories handler function
exports.showAllCategories = async (req, res) => {
    try {
        console.log("INSIDE SHOW ALL CATEGORIES");
        // fetch all Category from the database
        const allCategorys = await Category.find({});     //  return all Categorys 

        // return success response with all Categorys
        res.status(200).json({
            success: true,
            message: "All Categorys fetched successfully",
            data:allCategorys,
        }); 

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}



// Defining categoryPageDetails Handler Function
exports.categoryPageDetails = async(req,res) => {
    try {
        // get category id
        const {categoryId} = req.body;
        console.log("PRINTING CATEGORY ID: ", categoryId);

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required",
            });
        }

        // get courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: "ratingAndReviews",
            }).exec();
        console.log(selectedCategory);

        // validation- handle the case when the category is not found
        if(!selectedCategory) {
            console.log("Category Not Found");
            return res.status(404).json({
                success:false,
                message: "Category Not Found",
            });
        }
        // handle the case when there are no courses
        if(selectedCategory.courses.length === 0) {
            console.log("No courses found for the Selected category");
            return res.status(404).json({
                success:false,
                message:"No courses found for the Selected Category."
            });
        }

        // get courses for different categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        })
        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
            ._id
        )
            .populate({
                path: "courses",
                match: { status: "Published" },
            })
            .exec()
            //console.log("Different COURSE", differentCategory)
            // Get top-selling courses across all categories
        const allCategories = await Category.find()
            .populate({
              path: "courses",
              match: { status: "Published" },
              populate: {
                path: "instructor",
            },
            })
            .exec()
            const allCourses = allCategories.flatMap((category) => category.courses)
            const mostSellingCourses = allCourses
                .sort((a, b) => b.sold - a.sold)
                .slice(0, 10)
            // console.log("mostSellingCourses COURSE", mostSellingCourses)
            res.status(200).json({
                success: true,
                data: {
                  selectedCategory,
                  differentCategory,
                  mostSellingCourses,
                },
              })
            } catch (error) {
              return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            })
        }
}
