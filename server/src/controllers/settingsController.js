import SiteSettings from '../models/SiteSettings.js';
export async function getSettings(req,res){let settings=await SiteSettings.findOne();if(!settings)settings={companyName:'FLAASH Digital',tagline:'Digital Solutions | Creative Impact'};res.json({success:true,data:settings})}
export async function updateSettings(req,res){const settings=await SiteSettings.findOneAndUpdate({},req.body,{upsert:true,new:true,runValidators:true});res.json({success:true,message:'Settings saved successfully',data:settings})}
