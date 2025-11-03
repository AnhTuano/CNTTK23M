import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { broadcastReportUpdate } from '../socket';

// Get all reports
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            content: true
          }
        },
        comment: {
          select: {
            id: true,
            content: true
          }
        },
        document: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(reports);
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

// Create report
export const createReport = async (req: Request, res: Response) => {
  try {
    const { contentType, contentId, postId, commentId, documentId, reason, details } = req.body;
    const userId = (req as any).user?.id;

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        contentType,
        contentId,
        postId,
        commentId,
        documentId,
        reason,
        details
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Broadcast new report
    broadcastReportUpdate('create', report);

    res.status(201).json(report);
  } catch (error) {
    console.error('Failed to create report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
};

// Update report status
export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await prisma.report.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    // Broadcast status update
    broadcastReportUpdate('update', report);

    res.json(report);
  } catch (error) {
    console.error('Failed to update report status:', error);
    res.status(500).json({ error: 'Failed to update report status' });
  }
};

// Delete report
export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.report.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Failed to delete report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};
