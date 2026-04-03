import prisma from "../db";
import { Request, Response } from "express";
import { randomUUID } from "crypto";

const createNewAlert = async (req: Request, res: Response) => {

  const user = await prisma.user.findUnique({
    where: {
      id: (req as any).user.id
    },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  let alert = await prisma.alert.create({
    data: {
      userId: user.id,
      accessCode: randomUUID()
    },
  })
  res.status(200).json({
    message: "New alert created successfully",
    alert
  });
}

const sendImage = async (req: Request, res: Response) => {
  const { alertid, image } = req.body;
  let data = await prisma.image.create({
    data: {
      base64: image,
      alertId: alertid,
    }
  })
  res.status(200).json({
    message: "Image added successfully",
    data
  });
}
const sendAudio = async (req: Request, res: Response) => {
  const { alertid, audio } = req.body;
  let data = await prisma.audio.create({
    data: {
      base64: audio,
      alertId: alertid,
    }
  })
  res.status(200).json({
    message: "Audio added successfully",
    data
  });
}
const sendLocation = async (req: Request, res: Response) => {
  const { alertid, latitude, longitude } = req.body;
  let resp = await prisma.location.create({
    data: {
      latitude,
      longitude,
      alertId: alertid,
      isalert: true,
      userId: (req as any).user.id
    }
  })
  res.status(200).json({
    message: "Location added successfully",
    data: resp
  });
}
const allAlertInfo = async (req: any, res: any) => {
  const { accessCode } = req.params;
  const page = req.query.page;

  const alert = await prisma.alert.findFirst({
    where: {
      accessCode: accessCode
    },
    include: {
      audio: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 5,
        skip: page ? (parseInt(page)) * 5 : 0
      },
      image: {
        orderBy: {
          createdAt: 'desc'
        }
        , take: 5,
        skip: page ? (parseInt(page)) * 5 : 0

      },
      location: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 50,
        skip: page ? (parseInt(page)) * 50 : 0

      },
      User: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  res.status(200).json({
    message: 'Alert found successfully',
    alert
  });
}
export { createNewAlert, sendAudio, sendImage, sendLocation, allAlertInfo };
