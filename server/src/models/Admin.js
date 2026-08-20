import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { contentOptions } from './shared.js';
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true,maxlength:100},email:{type:String,required:true,unique:true,lowercase:true,trim:true},passwordHash:{type:String,required:true,select:false},role:{type:String,enum:['superadmin','admin','editor'],default:'admin'},isActive:{type:Boolean,default:true},lastLogin:Date},contentOptions);
schema.methods.comparePassword=function(password){return bcrypt.compare(password,this.passwordHash)};
export default mongoose.model('Admin',schema);
