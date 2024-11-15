import multer from "multer";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/images/uploads");
	},
	filename: function (req, file, cb) {
		cb(null, new Date().getTime() + "-" + file.originalname);
	},
});

export const upload = multer({ storage: storage });
