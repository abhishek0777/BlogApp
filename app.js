const express=require("express");
const path=require("path");
const mongoose=require("mongoose");
const bodyParser=require("body-parser");
const expressValidator=require("express-validator");
const flash=require("connect-flash");
const session=require("express-session");
const passport=require('passport');
const config=require('./config/database');



mongoose.connect(config.database);
let db=mongoose.connection;

//check connection
db.once('open',()=>{
    console.log("Connected to Mongo DB");
});

// check for DB errors
db.on('error',(req,res)=>{
    console.log(err);
})



// init app
const app=express();



// Bring in models
let Article=require('./models/article');




app.set("views",path.join(__dirname,"views"));
app.set("view engine","pug");




// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// set public folder
app.use(express.static(path.join(__dirname,"public")));

// express session middleware
app.use(session({
    secret:'keyboard cat',
    resave:true,
    saveUninitialized:true,
    
}));

// express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// express validator middleware
app.use(expressValidator({
    errorFormatter:function(param,msg,value) {
        var namespace =param.split('.'),
        root=namespace.shift(),
        formParam=root;

        while(namespace.length){
            formParam+='['+namespace.shift()+']';
        }
        return {
            param :formParam,
            msg   : msg,
            value : value
        };
    }
}));

// Passport config
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',(req,res,next)=>{
    res.locals.user=req.user || null;
    next();
});

// Home route
app.get('/',(req,res)=>{
    
    Article.find({},(err,articles)=>{
        if(err){
            console.log(err);
        }
        else{
            res.render("index",{
                articles:articles 
            });
        }
        
    });
    
});


let articles = require('./routes/articles');
app.use('/articles',articles);

let users=require('./routes/users');
app.use('/users',users);


app.listen(3000,()=>{
    console.log("server started on port no 3000");
});