import prisma from "../db";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const verifyToken = async (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
const getLocationHistory = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: (req as any).user.id
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const location = await prisma.location.findMany({
      where: {
        userId: user.id,
      },
    });
    res.status(200).json({
      message: "Location history fetched successfully",
      location,
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const location = async (req: Request, res: Response) => {
  const { latitude, longitude } = req.body;
  if (!latitude || !longitude) {
    res.status(400).json({ error: "Latitude and longitude are required" });
    return;
  }
  try {


    const location = await prisma.location.create({
      data: {
        latitude,
        longitude,
        userId: (req as any).user.id,
        isalert: false
      },
    });

    res.status(200).json({
      message: "Location added successfully",
      location,
    });

  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



function getNearbyUsers(userLocation: any, allLocations: any, radiusInKm = 5) {
  const EARTH_RADIUS_KM = 6371; // Earth radius in km

  return allLocations.filter((location: any) => {
    if (location.userId === userLocation.userId) return false; // Exclude self

    const lat1 = (userLocation.latitude * Math.PI) / 180;
    const lon1 = (userLocation.longitude * Math.PI) / 180;
    const lat2 = (location.latitude * Math.PI) / 180;
    const lon2 = (location.longitude * Math.PI) / 180;

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = EARTH_RADIUS_KM * c;

    return distance <= radiusInKm;
  });
}

const nearbyUers = async (req: Request, res: Response) => {
  const allUsersLastLocations = await prisma.location.findMany({
    where: {
      userId: { not: 0 },
    },
    orderBy: {
      createdAt: "desc", // Get the latest location
    },
    distinct: ["userId"], // Only the latest location per user
    select: {
      userId: true,
      latitude: true,
      longitude: true,
    }
  });


  const currentUserLocation = allUsersLastLocations.find(u => u.userId === (req as any).user.id);

  if (currentUserLocation) {
    const nearbyUsers = getNearbyUsers(currentUserLocation, allUsersLastLocations, 5);
    const nearbyUserInfo = await prisma.user.findMany({
      where: {
        id: {
          in: nearbyUsers.map((u: any) => u.userId)
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        gender: true,
        address: true,
      }

    });


    res.status(200).json({
      message: "Nearby users fetched successfully",
      nearbyUserInfo,
      nearbyUsers,
    });
  } else {
    res.status(404).json({ error: "not found" });
  }
}

export { verifyToken, location, getLocationHistory, nearbyUers };


