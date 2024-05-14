import express from "express";
// Import Middleware
import { errorMiddleware } from "./middleware/error-middleware.js";
// Import EJS layout
import expressLayouts from "express-ejs-layouts";
// Import routes
import { router } from "./route/api.js";
import { publicRouter } from "./route/public-api.js";

// Import Prisma
const app = express();

// MIDDLEWARE
app.use(express.json());
// STATIC FILES
app.use("/public", express.static("./public"));

// EJS
app.set("view engine", "ejs");
app.set("views", "./src/views");
// EJS Layout
app.use(expressLayouts);

// ROUTES
app.use(publicRouter);
app.use(router);

// MIDLEWARE ERROR
app.use(errorMiddleware);

// SERVER
app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
