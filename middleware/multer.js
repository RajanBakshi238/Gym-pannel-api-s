const multer = require("multer");
const sharp = require("sharp");

const { BadRequestError } = require("../errors");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError("Not an image! Please upload only images.", 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("profilePic");

exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  //   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  req.file.filename = `user-${Math.floor(
    Math.random() * 1000000000
  )}-${Date.now()}.jpeg`;


  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};
