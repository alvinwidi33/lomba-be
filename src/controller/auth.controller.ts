import { Request, Response } from "express";
import * as Yup from "yup";
import { sendVerificationEmail } from "../utils/mail/send-verif-email";
import mail from "../utils/mail/mail";
import jwt from "jsonwebtoken";
import {
  UsersModel,
  PartisipanModel,
  InstitusiKesehatanModel,
  AdminModel,
} from "../models/users.model";
import crypto from "crypto";
import { decrypt } from "../utils/encryption";
import { SECRET } from "../utils/env";
import { IReqUser } from "../utils/interfaces";

const validateRegisterSchema = Yup.object().shape({
  name: Yup.string().required(),
  email: Yup.string().email().required(),
  no_telp: Yup.string().required(),
  password: Yup.string().required(),
  passwordConfirmation: Yup.string().oneOf(
    [Yup.ref("password"), ""],
    "Passwords must match"
  ),
});
const validateAddSchema = Yup.object().shape({
  name: Yup.string().required(),
  email: Yup.string().email().required(),
  roles:Yup.string().required(),
  no_telp: Yup.string().required(),
  password: Yup.string().required(),
  passwordConfirmation: Yup.string().oneOf(
    [Yup.ref("password"), ""],
    "Passwords must match"
  ),
});

const validateLoginSchema = Yup.object().shape({
  email: Yup.string().required(),
  password: Yup.string().required(),
});

const validateProfileSchema = Yup.object().shape({
  name: Yup.string().required(),
  password: Yup.string().required(),
  passwordConfirmation: Yup.string().oneOf(
    [Yup.ref("password"), ""],
    "Passwords must match"
  ),
  profilePicture: Yup.string(),
});
async function generatePassword(): Promise<string> {
  return crypto.randomBytes(8).toString('hex'); // Generates a random 16-character password
}

export default {
  async profile(req: Request, res: Response): Promise<void> {
    const userId = (req as IReqUser).users.id;

    try {
      await validateProfileSchema.validate(req.body);
      await UsersModel.updateOne({ _id: userId }, { ...req.body });
      const updatedProfile = await UsersModel.findById(userId).select(
        "-password"
      );

      res.status(200).json({
        message: "Profile updated successfully",
        data: updatedProfile,
      });
      return;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        res.status(400).json({
          message: "Validation failed",
          error: error.errors,
        });
        return;
      }

      const _err = error as Error;

      res.status(500).json({
        message: "Error updating profile",
        data: _err.message,
      });
      return;
    }
  },

  async me(req: Request, res: Response): Promise<void> {
    const tokenKey =
      req.params.tokenKey || req.headers.authorization?.split(" ")[1];

    if (!tokenKey) {
      console.error("Token not provided");
      res.status(400).json({ error: "Token not provided" });
      return;
    }

    try {
      console.log("Received token:", tokenKey);
      const decodedToken = jwt.verify(tokenKey, SECRET) as { id: string };
      console.log("Decoded token:", decodedToken);

      const users = await UsersModel.findById(decodedToken.id).select(
        "-password"
      );

      if (!users) {
        res.status(401).json({ error: "User is not logged in" });
        return;
      }

      if (users.roles === "Partisipan") {
        const partisipan = await PartisipanModel.findOne({
          users: users._id,
        }).populate("users");
        res.status(200).json(partisipan || users);
        return;
      } else if (users.roles === "Institusi Kesehatan") {
        const institusi = await InstitusiKesehatanModel.findOne({
          users: users._id,
        }).populate("users");
        res.status(200).json(institusi || users);
        return;
      } else {
        res.status(200).json(users);
        return;
      }
    } catch (error) {
      console.error(
        "Error during token verification or user retrieval:",
        error
      );
      res.status(401).json({ error: "User is not logged in" });
      return;
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      await validateLoginSchema.validate({ email, password });
      const users = await UsersModel.findOne({ email });

      if (!users) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (users.isVerify === false) {
        res.status(403).json({
          message: "Your account is not verified. Please check your email.",
        });
        return;
      }

      const decryptedPassword = decrypt(SECRET, users.password);

      if (password !== decryptedPassword) {
        res
          .status(400)
          .json({ message: "Email/Username and Password do not match" });
        return;
      }

      const token = jwt.sign({ id: users._id, roles: users.roles }, SECRET, {
        expiresIn: "6h",
      });

      res.status(200).json({
        message: "User logged in successfully",
        data: token,
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        res.status(400).json({
          message: "Validation failed",
          error: error.errors,
        });
        return;
      }

      const _err = error as Error;

      res.status(500).json({
        message: "Error logging in user",
        data: _err.message,
      });
      return;
    }
  },

  async register(req: Request, res: Response): Promise<void> {
    const { name, email, no_telp, password } = req.body;

    try {
      await validateRegisterSchema.validate({
        name,
        email,
        no_telp,
        password,
      });

      const users = new UsersModel({
        name,
        email,
        no_telp,
        password,
        roles: "Partisipan",
      });
      await users.save();

      const partisipan = new PartisipanModel({ users: users._id });
      await partisipan.save();

      const token = jwt.sign({ id: users._id }, SECRET, { expiresIn: "1d" });
      const verifyUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/verify-email?token=${token}`;

      await sendVerificationEmail(users.email, users.name, verifyUrl);

      res.status(201).json({
        message: "User registered successfully. Please verify your email.",
        data: users,
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        res.status(400).json({
          message: "Validation failed",
          error: error.errors,
        });
      }
      const _err = error as Error;

      res.status(500).json({
        message: "Error registering user",
        data: _err.message,
      });
    }
  },
  async addUser(req: Request, res: Response): Promise<void> {
    const { name, email, no_telp, roles, password } = req.body;

    try {
      const generatedPassword = password || (await generatePassword());

      await validateAddSchema.validate({
        name,
        email,
        no_telp,
        roles,
        password: generatedPassword,
      });

      const user = new UsersModel({
        name,
        email,
        no_telp,
        password: generatedPassword,
        roles,
        isVerify: true, // Consider using false until verified
      });

      await user.save();

      // Save additional data based on user roles
      if (user.roles === "Admin") {
        const admin = new AdminModel({ users: user._id });
        await admin.save();
      } else if (user.roles === "Institusi Kesehatan") {
        const institusi = new InstitusiKesehatanModel({ users: user._id });
        await institusi.save();
      }

      // Render the email content using your render function
      const emailContent = await mail.render("add-user.ejs", {
        name: user.name,
        email: user.email,
        password: generatedPassword, // Be cautious about sending passwords
        roles: user.roles,
      });

      // Send the email using your send function
      await mail.send({
        to: user.email,
        subject: "User Registration Successful",
        content: emailContent,
      });

      // Send a response to the client only after all operations are successful
      res.status(201).json({
        message: "User added successfully and email sent!",
        data: user,
      });
    } catch (error) {
      // Only send a response in case of an error
      if (!res.headersSent) {
        // Check if headers are already sent
        if (error instanceof Yup.ValidationError) {
          res.status(400).json({
            message: "Validation failed",
            error: error.errors,
          });
        } else {
          console.error("Error adding user:", error);
          res.status(500).json({
            message: "Error adding user or sending email",
            data: (error as Error).message,
          });
        }
      }
    }
  },
};