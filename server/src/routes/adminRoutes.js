import { Router } from 'express';
import multer from 'multer';
import { protect, allowRoles } from '../middleware/auth.js';
import { listAdmin, getAdmin, create, update, remove, removeMany } from '../controllers/contentController.js';
import { dashboard } from '../controllers/adminController.js';
import { listLeads, updateLead, deleteLeads } from '../controllers/contactController.js';
import { updateSettings } from '../controllers/settingsController.js';
import { upload } from '../controllers/uploadController.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import CaseStudy from '../models/CaseStudy.js';
import Testimonial from '../models/Testimonial.js';
import Client from '../models/Client.js';
import TeamMember from '../models/TeamMember.js';

const router = Router();
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => callback(null, /image\/(jpeg|png|webp|avif)/.test(file.mimetype)),
});

router.use(protect);
router.get('/dashboard', dashboard);

const resources = { services: Service, projects: Project, 'case-studies': CaseStudy, testimonials: Testimonial, clients: Client, team: TeamMember };
const defaultServices = [
  ['social-media-marketing', 'Social Media Marketing', 'A social presence that earns attention and builds community.'],
  ['meta-ads', 'Meta Ads', 'Campaigns engineered for reach, qualified leads and efficient spend.'],
  ['google-ads', 'Google Ads', 'Reach high-intent customers at their moment of decision.'],
  ['seo', 'SEO', 'Search visibility built on useful content and technical clarity.'],
  ['branding', 'Branding & Graphic Design', 'Distinctive identities and everyday creative systems.'],
  ['web-development', 'Website Development', 'High-performing digital experiences built to convert.'],
  ['video-marketing', 'Video & Reels Marketing', 'Short-form stories designed for the feed and the funnel.'],
  ['lead-generation', 'Lead Generation', 'An accountable pipeline from first click to qualified inquiry.']
];
router.post('/services/restore-defaults', allowRoles('superadmin', 'admin'), async (req,res) => {
  await Service.bulkWrite(defaultServices.map(([slug,title,shortDescription],index) => ({
    updateOne: { filter:{slug}, update:{$setOnInsert:{slug,title,shortDescription,status:'published',isFeatured:true,displayOrder:index+1}}, upsert:true }
  })));
  const restored = await Service.find({slug:{$in:defaultServices.map(([slug])=>slug)}}).sort({displayOrder:1});
  res.json({success:true,message:'Default services restored',data:restored});
});
for (const [type, Model] of Object.entries(resources)) {
  router.get(`/${type}`, listAdmin(Model, type));
  router.post(`/${type}`, allowRoles('superadmin', 'admin', 'editor'), create(Model, type));
  router.delete(`/${type}`, allowRoles('superadmin', 'admin'), removeMany(Model));
  router.get(`/${type}/:id`, getAdmin(Model));
  router.patch(`/${type}/:id`, allowRoles('superadmin', 'admin', 'editor'), update(Model, type));
  router.delete(`/${type}/:id`, allowRoles('superadmin', 'admin'), remove(Model));
}

router.get('/leads', allowRoles('superadmin', 'admin'), listLeads);
router.patch('/leads/:id', allowRoles('superadmin', 'admin'), updateLead);
router.delete('/leads', allowRoles('superadmin', 'admin'), deleteLeads);
router.put('/settings', allowRoles('superadmin', 'admin'), updateSettings);
router.post('/upload', allowRoles('superadmin', 'admin', 'editor'), uploadMemory.single('image'), upload);

export default router;
