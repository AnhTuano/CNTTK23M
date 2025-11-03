import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// Get grades (alias for getAllGrades)
export const getGrades = async (req: Request, res: Response) => {
  try {
    const grades = await prisma.grade.findMany({
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
        userId: 'asc'
      }
    });

    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
};

// Get all grades
export const getAllGrades = getGrades;

// Get grade by ID
export const getGradeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const grade = await prisma.grade.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!grade) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json(grade);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch grade' });
  }
};

// Get grades by student
export const getStudentGrades = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const grades = await prisma.grade.findMany({
      where: {
        userId: parseInt(userId)
      }
    });

    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student grades' });
  }
};

// Create/Update grade
export const upsertGrade = async (req: Request, res: Response) => {
  try {
    const { userId, subject, semester, midterm, final, average, letter, credits, notes } = req.body;

    const grade = await prisma.grade.create({
      data: {
        userId,
        subject,
        semester,
        midterm,
        final,
        average,
        letter,
        credits: credits || 3,
        notes
      }
    });

    res.json(grade);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upsert grade' });
  }
};

// Create grade (alias for upsertGrade)
export const createGrade = upsertGrade;

// Update grade
export const updateGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, semester, midterm, final, average, letter, credits, notes } = req.body;

    const grade = await prisma.grade.update({
      where: { id: parseInt(id) },
      data: {
        subject,
        semester,
        midterm,
        final,
        average,
        letter,
        credits,
        notes
      }
    });

    res.json(grade);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update grade' });
  }
};

// Delete grade
export const deleteGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.grade.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete grade' });
  }
};

// Import grades
export const importGrades = async (req: Request, res: Response) => {
  try {
    const { grades } = req.body; // Array of grade objects

    const created = await prisma.grade.createMany({
      data: grades,
      skipDuplicates: true
    });

    res.json({ message: `Imported ${created.count} grades successfully` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import grades' });
  }
};

// Export grades
export const exportGrades = async (req: Request, res: Response) => {
  try {
    const { semester } = req.query;

    const where: any = {};
    if (semester) {
      where.semester = semester as string;
    }

    const grades = await prisma.grade.findMany({
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
      orderBy: [
        { semester: 'asc' },
        { userId: 'asc' }
      ]
    });

    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export grades' });
  }
};
