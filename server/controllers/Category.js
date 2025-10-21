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