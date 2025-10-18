const Tag = require("../models/tag");


// creation of  CreateTag handler function
exports.createTag = async (req, res) => {
    try{
        // fetch tag data from request body
        const { name, description } = req.body;

        // validation: check if tag with same name already exists
        if(!name || !description){
            return res.status(400).json({ 
                success: false,
                message: "Tag name and description are required" 
            });
        }

        // create entry in the database for the new tag
        const tagDetails = await Tag.create({name:name, description:description});
        console.log(tagDetails);

        // return success response
        return res.status(201).json({ 
            success: true,
            message: "Tag created successfully",
        });

    }
    catch(error){
        return res.status(500).json({ 
            success: false,
            message: "Internal Server Error for tag creation" 
        });
    }   
};



// here we are creating getAllTags handler function
exports.showAllTags = async (req, res) => {
    try {
        // fetch all tags from the database
        const allTags = await Tag.find({}, {name:true, description:true});     //  return all tags which have only name and description

        // return success response with all tags
        return res.status(200).json({
            success: true,
            message: "All tags fetched successfully",
            allTags,
        }); 

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error in fetching all tags"
        });
    }
}