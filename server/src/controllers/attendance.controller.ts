import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get attendance (alias for getAllAttendances)
export const getAttendance = async (req: Request, res: Response) => {
  try {
    const attendances = await prisma.attendance.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendances' });
  }
};

// Get all attendance records
export const getAllAttendances = getAttendance;

// Check in
export const checkIn = async (req: Request, res: Response) => {
  try {
    const { date, status, notes } = req.body;
    const userId = (req as any).user?.id;

    // Check if already checked in today
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: new Date(date),
        status: status || 'present',
        notes,
        checkedInAt: new Date()
      }
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in' });
  }
};

// Get attendance by user
export const getUserAttendance = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const attendances = await prisma.attendance.findMany({
      where: {
        userId: parseInt(userId)
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user attendance' });
  }
};

// Get attendance report
export const getAttendanceReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Group by user
    const report: any = {};
    attendances.forEach(att => {
      if (!report[att.userId]) {
        report[att.userId] = {
          user: att.user,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }
      report[att.userId].total++;
      report[att.userId][att.status]++;
    });

    res.json(Object.values(report));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance report' });
  }
};
