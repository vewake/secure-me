import prisma from "../db";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
const userInfo = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      id: (req as any).user.id,
    },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.status(200).json({
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    gender: user.gender,
  }
  );
}


const updateUserInfo = async (req: any, res: any) => {
  const { name, phone, email, address, gender } = req.body;
  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Name, phone, and email are required' });
  }
  const updatedUser = await prisma.user.update({
    where: { id: (req as any).user.id },
    data: { name, phone, email, address, gender },
  });
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(
    {
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      gender: updatedUser.gender,
    }
  );
}

const chagePassword = async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare current password with stored hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    // Hash new password

    const hashedPassword = await bcrypt.hash(newPassword, 5);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


export { userInfo, updateUserInfo, chagePassword };

