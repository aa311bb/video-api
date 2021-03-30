const express = require("express");
const mongoose = require("mongoose");
const bodyParser=require("body-parser");
const passport=require("passport");
const app = express();

//引入user.js
const users=require('./routes/api/user')

//DB config
const db = require("./config/keys").mongoURL;

//使用body-parser中间件
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Connect to mongodb
mongoose.connect(db).then(() => console.log("Mongoose connect")).catch(err=>console.log(err));

//passport初始化
app.use(passport.initialize());
require("./config/passport")(passport);

app.all("*",function(req,res,next){
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin","*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers","content-type,Authorization");
  //跨域允许的请求方式 
  res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == 'options')
      res.send(200);  //让options尝试请求快速结束
  else
      next();
})


// app.get("/", (req, res) => {
//   res.send("hello");
// });

//使用routes
app.use("/api/users",users)

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`sever running on port ${port}`);
});
