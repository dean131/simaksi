import express from "express";
// Import Middleware
import { errorMiddleware } from "./middleware/error-middleware.js";
// Import EJS layout
import expressLayouts from "express-ejs-layouts";
// cookie parser
import cookieParser from "cookie-parser";
// Import routes
import { publicRouter } from "./route/public-api.js";
import { router } from "./route/api.js";
import { adminRouter } from "./route/admin.js";

// Import Prisma
const app = express();

// MIDDLEWARE
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// body parser
app.use(express.urlencoded({ extended: true }));

// EJS
app.set("view engine", "ejs");
app.set("views", "./src/views");
// EJS Layout
app.use(expressLayouts);

// STATIC FILES
app.use("/public", express.static("./public"));

// ROUTES
app.use("/", publicRouter);
app.use("/api", router);
app.use("/admin", adminRouter);

// MIDLEWARE ERROR
app.use(errorMiddleware);

// SERVER
app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
