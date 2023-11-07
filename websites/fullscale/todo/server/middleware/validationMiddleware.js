import { body, param, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../custom-errors/customErrors.js";

import userModel from "../models/userModel.js";

const validate = (validationValues) => {
  return [
    validationValues,
    (req, _, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

export const validateRegisterInput = validate([
  body("firstName").notEmpty().withMessage("Please provide a first name."),
  body("lastName").notEmpty().withMessage("Please provide a last name."),
  body("email")
    .notEmpty()
    .withMessage("Please provide an email.")
    .isEmail()
    .withMessage("Please provide a valid email.")
    .custom(async (email) => {
      // TODO: add in `check if email exists in database logic here`
      const isEmailUsed = await userModel.findOne({ email });
      console.log(isEmailUsed);
      if (isEmailUsed) throw new BadRequestError("Email already exists. Please choose another email.");
    }),
  body("password")
    .notEmpty()
    .withMessage("Please provide a password.")
    .isLength({ min: 10 })
    .withMessage("Please provide a password at least 10 characters long."),
]);
