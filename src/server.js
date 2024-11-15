import { app } from "./application/main.js";

const port = process.env.APP_PORT || 3000;

app.listen(port || 3000, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
