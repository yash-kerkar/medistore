var mongoose = require('mongoose');
var product = require('./models/product');
var comment = require('./models/comment');
var user = require('./models/user');


var data = [
    {
        title : "Whey Protein", 
        image : "/images/img16.jpg", 
        price : 304,
        desc:"MuscleBlaze whey protein is the bestseller protein health supplement from the portfolio of MuscleBlaze. It is specially formulated to satisfy the post-workout protein needs of the gym goers and regular bodybuilders. With zero added sugar and no aspartame, this health protein powder delivers nearly 76 percent of protein content per scoop. A superior bcaa and glutamic acid profile ensures fast muscle synthesis and recovery for the fitness enthusiasts. With delectable flavours like rich milk chocolate, cafe mocha, vanilla and strawberry, there is nothing else the fitness freaks should look out for."
    },
    {
        title : "Loreal Shampoo",
        image : "/images/d1.jpg",
        price : 100,
        desc:"5 Problems 1 Solution, Total Repair 5 repairing shampoo helps fight against the five visible signs of damaged hair. Hair fall, dryness, roughness, dullness and split ends without weighing it down. Day after day, your hair is strong , supple, smooth, shiny and protected tips. The L’Oreal Laboratories have developed a Ceramide-Cement enriched formula that helps repair weak, limp, lifeless hair without weighing it down, fighting the 5 hair problems."
    },
    {
        title : "Glaze Wax",
        image : "/images/d2.jpg",
        price : 120,
        desc:"For trendy young men who want to create hairstyles that suit their personality.Long-lasting effect. It has a re-styling ability. Can create a voluminous Hirajuku style with rich expression.Provides volume by making hair curly with a strong styling ability. Arrrange desired hairstyle without stiffness and stickiness."
    },
    {
        title : "Lifebuoy Handwash",
        image : "/images/d17.jpg",
        price : 50,
        desc:"Boost the agents that give you hand immunity to keep fighting germs for upto 10 hours with Lifebuoy Immunity Boosting Sanitizer. It not only kills 99.99% germs instantly, but also boosts you immunity for upto 10 hours.And all this without having to use any water. This makes Lifebuoy Immunity Boosting Hand Sanitizer your defense against germs, anytime, anywhere. Just take a drop and apply on your palm. Spread and rub over back of your hands and fingertips until dry. Your hands are free from 99.99% germs instantly, without water."
    },
    {
        title : "Bryl Cream",
        image : "/images/img4.jpg",
        price : 100,
        desc:"Brylcreem’s Bold Hold Hair Wax is no ordinary wax. It’s a re-styler that gives you bold hold, precision styling and structure, along with matte texture. It contains a blend of ingredients that will take care of your hair while giving it the bold hold it needs, keeping it looking neat and clean. And the fragrance is a real bonus."
    },
    {
        title : "Bourn Vita",
        image : "/images/img17.jpg",
        price : 100,
        desc:"Mix with milk. Very healthy."
    }
];

function seedDB(){
    product.deleteMany({},function(err){
        if(err){
            console.log(err);
        }
        console.log('Products Removed');
        data.forEach(function(item){
            product.create(item,function(err,res){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Product added");
                    /*comment.create({
                        text:"good product",
                        username:"yash kerkar"
                    },function(err,comment){
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.comments.push(comment);
                            res.save();
                            console.log('comment added');
                        }
                    })*/
                    
                }
            });
        }) 
    })
   
    user.find({},function(err,users){
        if(err)
        console.log(err);
        else{
            users.forEach(function(person){
                person.order = [];
                person.cart =[];
                person.save();
            })
        }
    })
}

module.exports = seedDB;