const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyOtp,
  resendOtp,
  googleAuthVerification
} = require("../controllers/auth");

const { uploadUserPhoto, resizeUserPhoto } = require("../middleware/multer");

/**
 * @swagger
 * components:
 *  schemas:
 *    Login:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          description: Email id of the registered user
 *        password:
 *          type: string
 *          description: Password of the user
 *      example:
 *        email: rajan@gmail.com
 *        password: '123456789'
 */

/**
 * @swagger
 * tags:
 *    name: Auth
 *    description: The Authentication api for users
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: register the user
 *     tags: [Auth]
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - email
 *              - password
 *            properties:
 *              profilePic:
 *                type: string
 *                format: binary
 *                description: Profile pic to upload
 *              name:
 *                type: string
 *              role:
 *                type: string
 *              email:
 *                type: string
 *              password:
 *                type: string
 *     responses:
 *       200:
 *         description: Ok
 */
router.post("/register", uploadUserPhoto, resizeUserPhoto, register);

/**
 * @swagger
 * /auth/login:
 *  post:
 *    tags: [Auth]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Login'
 *    responses:
 *      200:
 *        description: User logged in successfully.
//  *      400:
//  *        description: User not found.
//  *      500:
//  *        descripption: Internal server error.
 */

router.post("/login", login);

router.post("/auth-with-mail", googleAuthVerification)

/**
 * @swagger
 *  /auth/verify-otp:
 *    post:
 *      tags: [Auth]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - email
 *                - otp
 *              properties:
 *                email:
 *                  type: string
 *                otp:
 *                  type: string
 *      responses:
 *        200:
 *          description: 'OK'
 *
 */
router.post("/verify-otp", verifyOtp);

/**
 * @swagger
 * /auth/resendOtp:
 *  post:
 *    tags: [Auth]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *            properties:
 *              email:
 *                type: string
 *    responses:
 *      200:
 *        description: 'OK'
 */

router.post("/resendOtp", resendOtp);

module.exports = router;
