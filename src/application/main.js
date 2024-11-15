import express from "express";
// Import Middleware
import { errorMiddleware } from "../middleware/error-middleware.js";
// Import EJS layout
import expressLayouts from "express-ejs-layouts";
// cookie parser
import cookieParser from "cookie-parser";
// Import session
import session from "express-session";
// Import flash
import flash from "express-flash";
// Import routes
import { publicRouter } from "../route/public-api.js";
import { router } from "../route/api.js";
import { adminRouter } from "../route/admin.js";

// Import Prisma
export const app = express();

// MIDDLEWARE\
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.APP_SECRET,
        saveUninitialized: true,
        resave: false,
    })
);
app.use(flash());

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
