const express = require("express");
const app = express();

// routes import
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payment");
const courseRoutes = require("./routes/Course");

// import required module
const database = require("./config/database");
const cookieParser = require("cookie-parser"); 
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require('dotenv');

dotenv.config();
const PORT =  process.env.PORT || 4000;

// database connect
database.connect();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({              // this line use for intertain the  frontend
        origin: "http://localhost:3000",
        credentials:true,
    })
)
// it use to include temparory filepath
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
)

// cloudinary connection
cloudinaryConnect();

// routes mount
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/payment",paymentRoutes);


// default route
app.get("/", (req, res) => {
    return res.json({
        success:true,
        message: "Your Server us up and Running........",
    });
});

// server activate
app.listen(PORT, () => {
    console.log(`App is Runnung at ${PORT}`);
}); 