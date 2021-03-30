//@login & register
const express =require("express");
const router=express.Router();
const bcrypt=require("bcrypt");
const gravatar = require("gravatar");
const jwt =require("jsonwebtoken");
const keys=require("../../config/keys");
const passport=require("passport");
const User=require("../../models/User");

//引入验证
const validateRegisterInput=require("../../validation/register")
const validateLoginInput=require("../../validation/login")
//$route GET api/users/test
//@desc 返回请求的json数据
//@access public
// router.get("/test",(req,res)=>{
//     res.json({msg:"login works"})
// })

//$route POST api/users/register
//@desc 返回请求的json数据
//@access public
router.post("/register",(req,res)=>{
    // console.log(req.body);
    const {errors,isValid}=validateRegisterInput(req.body);
    //判断isValid是否通过
    if(!isValid){
        return res.json(errors);
    }

    // 查询数据库中是否拥有邮箱
    User.findOne({email:req.body.email})
    .then((user)=>{
        if(user){
            return res.json({email:"邮箱已被占用"})
        }else{
            var avatar =gravatar.url(req.body.email,{s:'200',r:'pg',d:'mm'})
            const newUser =new User({
                name:req.body.name,
                email:req.body.email,
                avatar,
                password:req.body.password
            })
            //密码加密
            bcrypt.genSalt(10,function(err,salt){
                bcrypt.hash(newUser.password,salt,(err,hash)=>{
                    if(err) throw err;
                    newUser.password=hash;
                    newUser.save().then(user=>res.json({success:true,user})).catch(err=>console.log(err))

                })
            })
        }
    })
})
//$route POST api/users/login
//@desc 返回token jwt passort
//@access public
router.post("/login",(req,res)=>{
    const {errors,isValid}=validateLoginInput(req.body);
    // 判断isValid是否通过
    if(!isValid){
        return res.json(errors);
    }

    const email=req.body.email;
    const password=req.body.password;
    //查询数据库
    User.findOne({email}).then(user=>{
        if(!user){
            return res.json({message:"用户不存在"});
        }
       
        // 密码匹配
        bcrypt.compare(password,user.password).then(isMath=>{
            if(isMath){
                const rule={id:user.id,name:user.name};
                //登录token
                //参数：规则，加密名字，{过去时间}，箭头函数
                jwt.sign(rule,keys.secretOrKey,{expiresIn:3600},(err,token)=>{
                    if(err) throw err;
                    res.json({
                        success:true,
                        token:"Bearer "+token
                    })
                })
            }else{
                return res.json({message:"密码错误"})
            }
        })
    })
})

//$route POST api/users/current
//@desc 返回current user
//@access private
router.get("/current",passport.authenticate("jwt",{session:false}),(req,res)=>{
    res.json({
        id:req.user.id,
        name:req.user.name,
        email:req.user.email
    })
})
module.exports=router;