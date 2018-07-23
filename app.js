var bodyParser          = require("body-parser"),
    methodOverride      = require("method-override"),
    expressSanitizer    = require("express-sanitizer"),
    mongoose            = require("mongoose"),
    express             = require("express"),
    app                 = express();

// APP CONFIG    
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
    //has to be after body-parser 
    //use it in create and update routes to sanitize the input (to protect from JS script tags from running in our application)
app.use(methodOverride("_method"));


// MONGOOSE MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
        // this sets the default date to current instead of having the user to specify the date
});
var Blog = mongoose.model("Blog", blogSchema);
/*  Blog.create({
        title: "First Blog Post",
        image: "http://www.iheartradio.ca/image/policy:1.2189244:1479223978/Dwayne-Johnson-as-a-SUNshine-boy-in-1997.jpg",
        body: "This is my fist blog post and you're a Jabroni!"
    }); */

//============================== RESTFUL ROUTES ==============================//

//redirects back to index route
app.get("/", function(req, res) {
    res.redirect("/blogs"); 
}); 

// INDEX ROUTE
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err) {
            console.log("Error!");
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
   res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res){
   // create blog
   req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.create(req.body.blog, function(err, newBlog){
        if(err) {
            res.render("new");
        } else {
            // then, redirect to the index
            res.redirect("/blogs");
        }
   });
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
   Blog.findById(req.params.id, function(err, foundBlog){
      if(err) {
          res.redirect("/blogs");
      } else {
          res.render("show", {blog: foundBlog});
      }
   }); 
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("edit", {blog: foundBlog});
       }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //Blog.findByIdAndUpdate(id, newData, callback)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
       if(err) {
           res.redirect("/blogs");
       } else {
           res.redirect(/blogs/ + req.params.id);
       }
    });
});

// DESTROY(DELETE) ROUTE
app.delete("/blogs/:id", function(req, res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
       if(err) {
            res.redirect("/blogs");
       } else {
            //redirect somwhere
            res.redirect("/blogs");
       }
    });
});

//============================================================================//

//SERVER CONFIG
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("RESTful Blog App server is running.....");
});