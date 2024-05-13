import express from "express";
// Import Middleware
import { errorMiddleware } from "./middleware/error-middleware.js";
// Import EJS layout
import expressLayouts from "express-ejs-layouts";
// Import Routers
import { userRouter } from "./route/user-router.js";
import { adminRouter } from "./route/admin-router.js";
import { publicApi } from "./route/public-api.js";
import { tripRouter } from "./route/trip-router.js";
import { memberRouter } from "./route/member-router.js";
import { checkpointRouter } from "./route/checkpoint-router.js";

// Import Prisma
const app = express();

// MIDDLEWARE
app.use(express.json());

// EJS
app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use(expressLayouts);
// STATIC FILES
app.use("/static", express.static("./src/static"));

// ROUTES
app.use(publicApi);
app.use("/", adminRouter);
app.use("/api/users", userRouter);
app.use("/api/trips", tripRouter);
app.use("/api/members", memberRouter);
app.use("/api/checkpoints", checkpointRouter);

// MIDLEWARE ERROR
app.use(errorMiddleware);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
