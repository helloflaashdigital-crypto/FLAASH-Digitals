import mongoose from 'mongoose';import {contentOptions,metricSchema} from './shared.js';
const s=new mongoose.Schema({heroEyebrow:String,heroHeading:String,heroHighlight:String,heroDescription:String,primaryCta:String,secondaryCta:String,aboutPreview:String,stats:[metricSchema],finalCta:String},contentOptions);export default mongoose.model('HomepageContent',s);
