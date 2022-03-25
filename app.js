var express = require('express'),
    mongoose = require('mongoose'),
    product = require('./models/product'),
    comment = require('./models/comment'),
    user = require('./models/user'),
    session = require('express-session'),
    passport = require('passport'),
    localStratergy = require('passport-local'),
    passlocalmongoose = require('passport-local-mongoose'),
    seedDB = require('./seed');
var app = express();

seedDB();
var bodyparser = require('body-parser');

//mongodb+srv://yash:1234@medistore-a5xnv.mongodb.net/test?retryWrites=true&w=majority
//mongodb://localhost/products
mongoose.connect('mongodb+srv://yash:1234@medistore.pleat.mongodb.net/medistore?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
    console.log('connected to database');
}).catch((err)=>{
    console.log('Not connected to db ERROR',err);
})

app.set( 'port', ( process.env.PORT || 5000 ));
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));

app.set('view engine','ejs');

//passport
app.use(session({
    secret:"my name is yash",
    resave:false,
    saveUninitialized:false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
    res.locals.currentuser = req.currentuser;
    res.locals.session = req.session;
    next();
})

passport.use(new localStratergy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get('/',function(req,res){

     product.find({},function(err,items){
        if(err){
            console.log(err);
        }
        else{
            console.log(items);
            res.render('product/home',{itemss:items, bseller:items, special:items,currentuser:req.user});
        }
    });
});

app.get('/show/:id',function(req,res){
    product.findById(req.params.id).populate({path:'comments',model:'comment',populate:{path:'author',model:'user'}}).exec(function(err,prod){
        if(err) console.log(err);
        else{
            console.log(prod.comments)
            res.render('product/show',{item:prod,currentuser:req.user});
        }
        })
    
});

app.get('/show/:id/comment/new',isLoggedIn,function(req,res){
    product.findById(req.params.id,function(err,product){
        if(err){
            console.log(err);
        }
        else{
            res.render('comment/new',{product:product,currentuser:req.user});
        }
    })
});

app.post('/show/:id/comment',isLoggedIn,function(req,res){
    console.log(req.params.id);
    product.findById(req.params.id,function(err,product){
        if(err){
            console.log(err);
        }
        else{
            
            comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(comment);
                    comment.author= req.user._id;
                    comment.save();
                    product.comments.push(comment);
                    product.save();
                   
                    res.redirect('/show/'+ product._id );;
                }
            })
        }
    })
   
});

app.get('/register',function(req,res){
    res.render('product/register',{
        err:false
    });
})

app.post('/register',function(req,res){
    var newUser = new user({username:req.body.username});
    user.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render('product/register',{
                err:err
            });
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect('/');
        });
    });
});


app.get('/login',function(req,res){
    var invalid = false;
    if(req.query.invalid){
        invalid = true
    }
    res.render('product/login',{invalid:invalid});
})

app.post('/login',function(req,res,next){
    passport.authenticate('local',function(err,user){
        if(err)
        console.log(err);
        else{
            if(user){
               if(user.username !== 'admin'){
                   req.logIn(user,function(err,use){});
                   res.redirect('/');
               }
            } else res.redirect('/login'+"?invalid=true");
        }
    })(req,res,next);
})

app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
});

app.get('/admin/login',function(req,res){
    var invalid = false;
    if(req.query.invalid){
        invalid = true
    }
    res.render('admin/login',{invalid:invalid});
})

app.post('/admin/login',function(req,res,next){
    passport.authenticate('local',function(err,user){
        if(err)
        console.log(err);
        else{
            if(user){
              req.logIn(user,function(err,user){});
              res.redirect('/admin/home');
            }
            else
            res.redirect('/admin/login'+"?invalid=true");
        }
    })(req,res,next);
})

app.get('/admin/home',isAdmin,function(req,res){
    product.find({},function(err,items){
        if(err){
            console.log(err);
        }
        else{
            res.render('admin/home',{products:items,currentuser:req.user});
        }
    });
})

app.get('/admin/edit/:id',isAdmin,function(req,res){
    product.findById(req.params.id,function(err,item){
        if(err)
        console.log(err);
        else{
            res.render('admin/edit',{item:item,currentuser:req.user});
        }
    })
})

app.post('/admin/edit/:id',isAdmin,function(req,res){
    var item = req.body;
    product.findById(req.params.id,function(err,found){
        if(err)
        console.log(err);
        else{
            found.title = item.title;
            found.image = item.image;
            found.price = item.price;
            found.desc = item.desc;
            found.save();
            res.redirect('/admin/home');c
        }
    })
})

app.get('/admin/remove/:id',isAdmin,function(req,res){
    var id1 = req.params.id;
    product.findById(id1,function(err,item){
        if(err)
        console.log(err);
        else{
            item.remove();
            item.save();
            user.find({},function(err,users){
                if(err)
                console.log(err);
                else{
                    users.forEach(function(person){
                        for(var i=0;i<person.cart.length;i++){
                            if(person.cart[i].id == id1){
                                person.cart.splice(i,1);
                                person.save();
                                break;
                            }
                        }
                    })
                }
            })
            res.redirect('/admin/home');
        }
    })
})

app.get('/admin/orders',isAdmin,function(req,res){
    user.findOne({username:'admin'},function(err,admin){
        if(!err){
            res.render('admin/orders',{orders:admin.order,currentuser:req.user})
        }
    })
})

app.get('/admin/new',isAdmin,function(req,res){
    res.render('admin/new',{currentuser:req.user});
});

app.post('/admin/new',isAdmin,function(req,res){
    var title = req.body.title;
    var image = req.body.image;
    var price = req.body.price;
    var desc = req.body.desc;
    var item = {
        title:title,
        image:image,
        price:price,
        desc:desc
    }
   product.create(item,function(err,addeditem){
       if(err){
           console.log(err);
       }
       else{
           res.redirect('/admin/home');
       }
   });
});

app.get('/admin/remove-order/:username/:id',isAdmin,function(req,res){
    var id = req.params.id;
    var username = req.params.username;
    user.findOne({username:username},function(err,person){
        if(!err){
            for(var i=0;i<person.order.length;i++){
                if(person.order[i].id == id){
                    person.order.splice(i,1);
                    person.save();
                }
            }
                    user.findOne({username:'admin'},function(err,admin){
                        if(!err){
                            for(var i=0;i<admin.order.length;i++){
                                if(admin.order[i].id == id && admin.order[i].username == username){
                                    admin.order.splice(i,1);
                                    admin.save();
                                    break;
                                }
                            }
                            res.redirect('/admin/orders');
                        }
                    })
            }
    })
})

app.get('/add-to-cart/:id', isLoggedIn,async function (req, res) {
    var productId = req.params.id;
    var username = req.user.username;

    await addToCart(productId,username);
       
    res.redirect('/shopping-cart');
});

app.get('/reduce/:id',isLoggedIn,async function (req, res, next) {
    var productId = req.params.id;
    var username = req.user.username;
    await reduceCart(productId,username);
    res.redirect('/shopping-cart');
});

app.get('/remove/:id',isLoggedIn,async function (req, res, next) {
    var productId = req.params.id;
    var username = req.user.username;
    await removeFromCart(productId,username);
    res.redirect('/shopping-cart');
});

app.get('/shopping-cart', isLoggedIn,function (req, res, next) {
    var username = req.user.username;
    user.findOne({username:req.user.username},function(err,user){
        if(err)
        consolelog(err)
        else{
            var totalprice = 0;
            var totalqty = 0;
            var cart1 = user.cart;
            user.cart.forEach(function(item){
                totalprice += item.price*item.qty;
                totalqty += item.qty;
            })
          tprice = totalprice;
          tqty = totalqty;
          return res.render('product/shopping-cart', {products:cart1 , totalPrice: tprice,currentuser:req.user});
        }
    })    
   
});

app.post('/confirm-order',isLoggedIn,function(req,res){
    var username = req.user.username;
    var address = req.body.address;
    var number = req.body.number;
    user.findOne({username:username},function(err,person){
        if(err)
        console.log(err);
        else{
         var totalprice = 0;
         person.cart.forEach(function(item){
             totalprice += item.price*item.qty;
         })
         var id;
         if(person.order.length == 0)
           id = 0;
         else
           id = person.cart.length -1; 
            var order = {
                id:id,
                username:username,
                number:number,
                address:address,
                total:totalprice,
                cart:person.cart,
                total:totalprice
            }
            person.order.push(order);
            person.save();
            console.log(person.order);
            user.findOne({username:'admin'},function(err,admin){
                if(!err){
                    admin.order.push(order);
                    admin.save();
                    console.log(admin);
                }
            })
            res.redirect('/orders');
        }
    }) 
 });

app.get('/orders',isLoggedIn,function(req,res){
    user.findOne({username:req.user.username},function(err,user){
        if(!err){
            res.render('product/orders',{orders:user.order,currentuser:req.user});
        }
    })
})


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/login');
}

function isAdmin(req,res,next){
    if(req.isAuthenticated() && req.user.username == 'admin'){
        return next();
    }
    res.redirect('/admin/login');
}

/*app.listen(2007,function(){
    console.log("Server Running");
});*/

app.listen( app.get( 'port' ), function() {
    console.log( 'Node server is running on port ' + app.get( 'port' ));
});


async function addToCart(productid,Username){
    product.findById(productid,function(err,res){
        if(err)
        console.log(err);
        else{
            var item = {
                id:res._id,
                title:res.title,
                image:res.image,
                price:res.price,
                qty:1
            }
           user.findOne({username:Username},function(err,user){
               if(err)
               console.log(err);
               else{
                   var found = 0;
                   for(var i=0;i<user.cart.length;i++){
                       if(item.title == user.cart[i].title){
                           console.log(item.title);
                           user.cart[i].qty++;
                           user.markModified('cart');
                           found = 1;
                       }
                   }
                   if(!found){
                   user.cart.push(item);
                   }
                   user.save();
                  console.log(user);
               }
           })
        }
    })
}

async function removeFromCart(productid,username){
    var productid = productid;
   user.findOne({username:username},function(err,user){
       if(err)
       console.log(err);
       else{
           for(var i=0;i<user.cart.length;i++){
               if(productid == user.cart[i].id){
                  user.cart.splice(i,1);
               }
           }
           user.save();
       }
   })
}

async function reduceCart(productid,username){
    var productid = productid;
    user.findOne({username:username},function(err,user){
        if(err)
        console.log(err);
        else{
            for(var i=0;i<user.cart.length;i++){
                if(productid == user.cart[i].id){
                    if(user.cart[i].qty == 1)
                    user.cart.splice(i,1);
                    else
                    user.cart[i].qty--;
                    user.markModified('cart');
                }
            }
            user.save();
          // console.log(user);
        }
    })
}


