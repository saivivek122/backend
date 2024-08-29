const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const bcrypt=require('bcryptjs');
const path = require('path');
const dotenv=require('dotenv');
const cors = require('cors');

const defaultAdminName='admin';
const defaultAdminPassword="123";
const hashedPassword=bcrypt.hashSync(defaultAdminPassword,10);

// app.use(express.static(path.join(__dirname, '../frontend/public')));
// app.use(bodyParser.json());
// app.use(express.static('Frontend'));


dotenv.config();
const app=express();
app.use(cors({
  origin: 'https://job-app-project-3e1eb.web.app'
}));
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(bodyParser.json());
// app.use(express.static('Frontend'));
mongoose.connect(process.env.MONGO_URI,{
  // useNewUrlParse: true,
  // useUnifiedTopology: true
})
.then(()=>console.log("mongo db connected successfully"))
.catch(err=>console.log(err));


const UserSchema=new mongoose.Schema({
  username:{type:String,required:true},
  password:{type:String,required:true}
});

const User=mongoose.model('User',UserSchema);

const JobSchema=new mongoose.Schema({
  name:{type:String,required:true},
  email:{type:String,required:true},
  role:{type:String,required:true},
  salary:{type:Number,required:true}
})

const Job=mongoose.model('Job',JobSchema);

const BookmarkSchema=new mongoose.Schema({
  userName:{type:String,required:true},
  userEmail:{type:String,required:true},
  userRole:{type:String,required:true},
  userSalary:{type:Number,required:true}
})
const Bookmark=mongoose.model('Bookmark',BookmarkSchema);

const adminSchema=new mongoose.Schema({
  adminName:{type:String,required:true},
  adminPassword:{type:String,required:true}
})
const adminDetails=mongoose.model('adminDetails',adminSchema)





app.post('/register',async(req,res)=>{
  try{
    const {username,password}=req.body;
    const existingUser=await User.findOne({username});
      if(existingUser){
        return res.status(400).json({message:'Username already exist'})
      }

      const hashedPassword=await bcrypt.hash(password,10);
      const newUser=new User({username,password:hashedPassword});
      await newUser.save();
      res.json({message:"User done"});
    
  }
  catch(error){
    res.status(500).json({message:"error"})
  }
})

app.post('/login',async(req,res)=>{
  try{
    const {username,password}=req.body;
    const user=await User.findOne({username});
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if(!user){
      return res.status(400).json({message:"Username not found"})
    }
    const isMatch=await bcrypt.compare(password,user.password);
    if(isMatch){
      return res.json({ message: 'Login successful' });
      
    }
    else{
      res.status(400).json({message:'Incorrect password'})
    }
  }
  catch(error){
    res.status(500).json({message:"Error login user"})
  }
})

app.post('/jobapply',async(req,res)=>{
  const{name,email,role,salary}=req.body;
  if(!name||!email||!role ||!salary){
    return res.status(400).json({message:"all fields are required"})
  }

  try{
    // const{name,email,role,salary}=req.body;
    const newJob=new Job({name,email,role,salary});
    await newJob.save();
    res.json({message:'Job saved'})
  }
  catch(error){
    res.json({message:"error"})
  }

})


app.get('/fetch-data',async(req,res)=>{
   try{
    const data=await Job.find({});
     return res.json(data);

   }
   catch(error){
    res.status(500).send(error);
   }

})

app.post('/bookmarks',async(req,res)=>{
  try{
    const{userName,userEmail,userRole,userSalary}=req.body;
    const newBookmark=new Bookmark({userName,userEmail,userRole,userSalary});
    const existingJob=await Bookmark.findOne({userRole});
    const existingUser=await Bookmark.findOne({userName});
    if(existingJob && existingUser){
      return res.status(400).json({message:"already exist"})
    }
    else{
    await newBookmark.save();
    console.log("bookmark added")
    res.json({message:"Bookmark added"})
    }
  }
  catch(error){
    console.log(error);
    res.json({message:"error"});
  }

})

app.get('/fetch-bookmark',async(req,res)=>{
  try{
    const bookmarkData= await Bookmark.find({})
    return res.json(bookmarkData);
  }

  catch(error){
    res.json({message:"error"});
  }
})


app.post('/admin-login', async(req,res)=>{
  try{
    const{adminName,adminPassword}=req.body
    if(adminName!==defaultAdminName){
      return res.status(400).json({ message: "Check your login ID and password" });
    }
    if(adminName===defaultAdminName){
      const isMatch= await bcrypt.compare(adminPassword,hashedPassword);
      if(isMatch){
        return res.json({message:"Login succes"})
      }
      else{
         return res.json({message:"Chcek your login id and password"})
      }
      
    }
  }
  catch(error){
    console.log(error)
  }
})
app.delete('/delete-job',async(req,res)=>{
  const{id}=req.body;
  try{
    const result=await Job.deleteOne({_id:id});
    res.json(result);
  }
  catch(error){
    res.status(500).json({error:"no"})
  }
})
app.delete('/delete-bookmark-job',async(req,res)=>{
  const{id}=req.body;
  try{
    const result=await Bookmark.deleteOne({_id:id});
    res.json(result);
  }
  catch(error){
    res.status(500).json({error:"no"});
  }
})
const PORT= process.env.PORT||3000;
app.listen(PORT,()=>{
  console.log("sevrever running")
})