import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { broadcastConfigUpdate } from '../socket';

// Get website config
export const getConfig = async (req: Request, res: Response) => {
  try {
    const config = await prisma.websiteConfig.findFirst();
    
    if (!config) {
      // Return default config
      return res.json({
        isMaintenanceMode: false,
        bannerText: '',
        bannerIsActive: false
      });
    }

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
};

// Update config
export const updateConfig = async (req: Request, res: Response) => {
  try {
    const { 
      className, 
      slogan, 
      coverImage, 
      websiteName, 
      websiteTitle, 
      isMaintenanceMode, 
      bannerText, 
      bannerType, 
      bannerIsActive,
      allowedPostRoles,
      postCategories
    } = req.body;

    const existing = await prisma.websiteConfig.findFirst();

    let config;
    if (existing) {
      config = await prisma.websiteConfig.update({
        where: { id: existing.id },
        data: {
          className,
          slogan,
          coverImage,
          websiteName,
          websiteTitle,
          isMaintenanceMode,
          bannerText,
          bannerType,
          bannerIsActive,
          allowedPostRoles,
          postCategories
        }
      });
    } else {
      config = await prisma.websiteConfig.create({
        data: {
          className,
          slogan,
          coverImage,
          websiteName,
          websiteTitle,
          isMaintenanceMode,
          bannerText,
          bannerType,
          bannerIsActive,
          allowedPostRoles,
          postCategories
        }
      });
    }

    // Broadcast config update to all connected clients
    broadcastConfigUpdate(config);

    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update config' });
  }
};
