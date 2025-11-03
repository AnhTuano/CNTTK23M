import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { uploadToSupabase, deleteFromSupabase } from '../lib/supabase';
import { broadcastDocumentUpdate } from '../socket';
import { createNotificationHelper } from './notification.controller';
import { BadgeAutoAwardService } from '../services/badge-auto-award.service';
import { updateUserPoints } from '../services/points.service';

// Get all documents
export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    const { includeAll } = req.query;
    
    const documents = await prisma.document.findMany({
      where: includeAll === 'true' ? {} : { status: 'DaDuyet' },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

// Upload document
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { title, subject, type, link } = req.body;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const file = req.file;

    console.log('📤 Upload document request:', { title, subject, type, hasFile: !!file, link, userRole });

    let documentLink = link;

    // If file is uploaded, upload to Supabase
    if (file) {
      console.log('📁 Uploading file to Supabase:', file.originalname);
      const { url } = await uploadToSupabase(
        file.buffer,
        'documents',
        file.originalname
      );
      documentLink = url;
      console.log('✅ File uploaded to:', url);
    }

    // If no file and no link, return error
    if (!documentLink) {
      console.log('❌ No file or link provided');
      return res.status(400).json({ error: 'Either file or link is required' });
    }

    // Auto-approve for Admin, LopTruong, BiThu
    const bypassRoles = ['Admin', 'LopTruong', 'BiThu'];
    const status = bypassRoles.includes(userRole) ? 'DaDuyet' : 'ChoDuyet';
    
    console.log('💾 Creating document in database with status:', status);
    const document = await prisma.document.create({
      data: {
        title,
        subject,
        type,
        link: documentLink,
        uploaderId: userId,
        status
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    console.log('✅ Document created:', document.id);

    // Broadcast new document
    broadcastDocumentUpdate('create', document);

    // Auto-check and award badges for the uploader
    BadgeAutoAwardService.checkAndAwardUser(userId).catch(err => 
      console.error('Failed to auto-award badges:', err)
    );

    res.status(201).json(document);
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document', message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Approve document
export const approveDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.update({
      where: { id: parseInt(id) },
      data: {
        status: 'DaDuyet'
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Broadcast document approval
    broadcastDocumentUpdate('update', document);

    // Notify uploader
    await createNotificationHelper(
      document.uploader.id,
      'document',
      'Tài liệu được duyệt',
      `Tài liệu "${document.title}" của bạn đã được phê duyệt!`
    );

    // Update uploader's points when document is approved
    updateUserPoints(document.uploader.id).catch(err => 
      console.error('Failed to update user points:', err)
    );

    // Auto-check and award badges
    BadgeAutoAwardService.checkAndAwardUser(document.uploader.id).catch(err => 
      console.error('Failed to auto-award badges:', err)
    );

    res.json(document);
  } catch (error) {
    console.error('Approve document error:', error);
    res.status(500).json({ error: 'Failed to approve document' });
  }
};

// Delete document
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id: parseInt(id) }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Store uploader ID before deletion
    const uploaderId = document.uploaderId;

    // Delete from database
    await prisma.document.delete({
      where: { id: parseInt(id) }
    });

    // Broadcast document deletion
    broadcastDocumentUpdate('delete', { id: parseInt(id) });

    // Update uploader's points after deleting their document
    updateUserPoints(uploaderId).catch(err => 
      console.error('Failed to update user points:', err)
    );

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
};
