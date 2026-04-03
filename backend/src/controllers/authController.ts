import prisma from "../db";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


const createJwtToken = async (user: any) => {
  const token = jwt.sign({
    id: user.id,
    email: user.email,
  }, process.env.JWT_SECRET as string);
  return token;
}

const signup = async (req: Request, res: Response) => {
  const { name, phone, email, password, gender, address } = req.body;

  if (!name || !phone || !email || !password || !gender) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  if (!['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
    res.status(400).json({ error: "Invalid value for Gender" });
    return;
  }

  try {
    const userExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (userExists) {
      res.status(404).json({ error: "User with this email address already exists" });
      return;
    }

    const hashed_password = await bcrypt.hash(password, 5)

    let userObj = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashed_password,
        gender,
        address,
      }
    });


    const token = await createJwtToken(userObj);
    res.status(200).json({
      message: "Signup successful",
      token: token,
    });

  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      res.status(403)
        .json({ message: "incorrect password" });
      return;
    }
    const token = await createJwtToken(user);
    res.status(200).json({
      message: "Login successful",
      token: token,
    });


  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export { signup, login };
