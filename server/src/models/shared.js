import mongoose from 'mongoose';
const { Schema } = mongoose;
export const imageSchema = new Schema({ url:String, publicId:String, width:Number, height:Number, format:String, alt:String }, { _id:false });
export const metricSchema = new Schema({ label:{type:String,trim:true,maxlength:100}, value:{type:String,trim:true,maxlength:100} },{_id:false});
export const contentOptions = { timestamps:true, toJSON:{transform:(_,ret)=>{delete ret.__v;return ret;}} };
export const status = { type:String, enum:['draft','published','archived'], default:'draft', index:true };
export const ordered = { type:Number, default:0, index:true };
