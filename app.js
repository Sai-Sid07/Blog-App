const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const dateMethod = new Date();
const monthArray = ["Jan","Feb","Mar","April","May","June","July","Aug","Sept","Oct","Nov","Dec"];
let port = process.env.PORT;


app.set('view engine', 'ejs');

app.use(express.json())

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public", {root:__dirname}));

mongoose.connect("mongodb+srv://admin:admin1234@blogdb.9g6vg8d.mongodb.net/blogDB")
//mongodb://localhost:27017/blogDB

const blogSchema = {
  title : String,
  category : String,
  jist : String,
  content : String,
  date:String,
  month:String,
  year:String,
  fileName:{
    type:String,
    unique:true,
    required:true
  },
  contentType : {
      type:String,
      required:true
  },
  imageBase64 : {
      type:String,
      required:true
  }
}

const Blog = mongoose.model("Blog", blogSchema)

const homePageContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";

const aboutPageContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";

const contactPageContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

let title = "fdv"
let body = "vdfv"
let jist = "vfdvfd"
let category = "bgfb"
let content = "gfb"
let contentType = ""
let imageBase64 = ""
let date = ""
let month = ""
let year = ""
let user = ""

const storage = multer.diskStorage({
  filename: function(req, file, callback){
      const extension = file.originalname.slice(file.originalname.lastIndexOf("."))
      callback(null, file.fieldname + "-" + Date.now() + extension)
  //If you wan the Original Name to be there, use file.originalname instead
  }
})

const store = multer({storage:storage})

app.get("/", function(req, res){
  Blog.find({}, function(err, data){
    if(err){
      console.log("404 Error")
    }else{
      if(user === "root"){
        res.render("home", {posts : data, user: "root"})
      }else{
        res.render("home", {posts : data, user: ""})
      }
      
    }
  })  
})

app.get("/about-me", function(req, res){
  res.render("about", {aboutPageContent : aboutPageContent})
})

app.get("/compose", function(req, res){
  res.render("compose")
})

app.get("/post", function(req, res){
  res.render("post", {title:title, 
    body:body, 
    jist:jist,
    contentType:contentType,
    imageBase64:imageBase64,
    date:date,
    month:month,
    year:year,
  })
})

app.get("/posts/:title", function(req, res){
  const idName = req.params.title
  console.log(idName)
  Blog.findOne({_id:idName}, function(err, data){
    if(err){
      console.log("Error 404");
    }else{
      title = data.title
      body = data.content
      fileName = data.fileName
      jist = data.jist
      contentType = data.contentType
      imageBase64 = data.imageBase64
      date = data.date,
      month = data.month,
      year = data.year,
      res.redirect("/post")
    }
  })
})

/*
Improvements in the Pipeline - 
  * Make it colourful
  * Update Home, About and Contact Page
  * Host it in Heruko
*/

app.post("/compose", store.single("thumbnail"),function(req, res, next){
  const title = req.body.title
  const jist = req.body.jist
  const category = req.body.category
  const content = req.body.content
  const date = dateMethod.getDate();
  const month = monthArray[dateMethod.getMonth()]
  const year = dateMethod.getFullYear();
  const file = req.file
  let img = fs.readFileSync(file.path)
  let encodedImage = img.toString("base64")
  const newEntry = new Blog({
    title:title,
    jist:jist,
    category:category,
    content:content,
    date:date,
    month:month,
    year:year,
    fileName: file.originalname, 
    contentType: file.mimetype,
    imageBase64: encodedImage
  })
  newEntry.save().then(function(){
    res.redirect("/")
  })  
})

app.get("/root", function(req, res){
  Blog.find({}, function(err, data){
    if(err){
      console.log("404 Error")
    }else{
      user = "root"
      res.redirect("/")
      //res.render("root", {posts : data, user: "root"})
    }
  })  
})

app.post("/update", function(req, res){
  const idName = req.body.button
  console.log(idName + " - To be Updated")
  Blog.find({_id:idName}, function(err, data){
    if(err){
      console.log("404 Error")
    }else{
      category = data[0].category
      jist = data[0].jist
      content = data[0].content
      title = data[0].title
      content = content.replace(/(\r\n|\n|\r)/gm, "");
      res.render("edit", {category : category, jist : jist, content : content, title : title, id: idName})
    }
  })
})

app.post("/edit", function(req, res){
  const idName = req.body.id
  title = req.body.title
  jist = req.body.jist
  content = req.body.content
  category = req.body.category
  const date = dateMethod.getDate();
  const month = monthArray[dateMethod.getMonth()]
  const year = dateMethod.getFullYear();
  Blog.updateOne({_id:idName},{
    title : title,
    category : category,
    jist : jist,
    date:date,
    month:month,
    year:year,
    content : content
  }, function(err){
    if(err){
      console.log("404 Error")
    }else{
      user = ""
      res.redirect("/")
    }
  })
})

app.post("/delete", function(req, res){
  const idName = req.body.button
  Blog.deleteOne({_id:idName}, function(err){
    if(err){
      console.log("404 Error");
    }else{
      user = ""
      res.redirect("/")
    }
  })
})

if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server Started Successfully");
});
