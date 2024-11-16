import { app } from "./application/main.js";
import { logger } from "./application/logging.js";

const port = process.env.APP_PORT || 3000;

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
