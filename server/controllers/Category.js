const Category = require("../models/Category");


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
            message: "Internal Server Error for Category creation" 
        });
    }   
};



// here we are creating getAllCategories handler function
exports.showAllCategories = async (req, res) => {
    try {
        // fetch all Category from the database
        const allCategorys = await Category.find({}, {name:true, description:true});     //  return all Categorys which have only name and description

        // return success response with all Categorys
        return res.status(200).json({
            success: true,
            message: "All Categorys fetched successfully",
            allCategorys,
        }); 

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error in fetching all Categorys"
        });
    }
}



// Defining categoryPageDetails Handler Function
exports.categoryPageDetails = async(req,res) => {
    try {
        // get category id
        const {categoryId} = req.body;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required",
            });
        }

        // get courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId).populate("course").exec();
        console.log(selectedCategory);

        // validation- handle the case when the category is not found
        if(!selectedCategory) {
            console.log("Category Not Found");
            return res.status(404).json({
                success:false,
                message: "Data Not Found",
            });
        }
        // handle the case when there are no courses
        if(selectedCategory.course.length === 0) {
            console.log("No courses found for the Selected category");
            return res.status(404).json({
                success:false,
                message:"No courses found for the Selected Category."
            });
        }

        // get courses for different categories
        const differentCategories = await Category.find({_id: {$ne: categoryId},})         // its mean id: notequalto($ne) to categoryId
                                                        .populate("course")       
                                                        .exec();

        // get top selling courses across all categories
        // const allCategories = await Category.find().populate("course").exec();
        // const allCourses = allCategories.flatMap((category) => category.course);
        // const mostSellingCourses = allCourses.sort((a,b) => b.sold - a.sold).slice(0, 10);      OR
        
        const mostSellingCourses = await Course.find({})
                                                .sort({ sold: -1 })
                                                .limit(10)
                                                .exec();

        // return response
        return res.status(200).json({
            success:true,
            data: {
                selectedCategory,
                differentCategories,
                mostSellingCourses,
            },
        });      

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
