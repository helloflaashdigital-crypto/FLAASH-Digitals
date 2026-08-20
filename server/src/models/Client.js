import mongoose from 'mongoose';import {contentOptions,imageSchema,ordered} from './shared.js';
const s=new mongoose.Schema({name:{type:String,required:true,trim:true,maxlength:120},logo:imageSchema,website:String,industry:String,isFeatured:{type:Boolean,default:false,index:true},displayOrder:ordered},contentOptions);export default mongoose.model('Client',s);
