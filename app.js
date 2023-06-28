const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"));

let port = process.env.PORT;
if(port == null || port == ""){
    port == 3000;
}

app.listen(port,function(){
    console.log("Server has started succesfully");
});

mongoose.connect("mongodb+srv://willyfarel131003:****@cluster0.ekkf39f.mongodb.net/todolistDB");

const itemsSchema ={
    name: String
};

const listSchema ={
    name: String,
    items: [itemsSchema]
}

const Item = mongoose.model("item", itemsSchema);

const List = mongoose.model("list", listSchema);

const item1 = new Item({
    name: "Welcome to do list"
});

const item2 = new Item({
    name: "Hit the + to input a new to do list"
});

const item3 = new Item({
    name: "hit the check box to delete an item"
});

const defaultItem =[item1, item2, item3];



app.get("/",function(req,res){
    Item.find({})
    .then((foundItems)=>{
        if(foundItems.length === 0){
            Item.insertMany(defaultItem)
            .then(()=>{
                console.log("Successfully save default item to db");
            }).catch((err)=>{
                console.log(err);
            });
            res.redirect("/");
        }
        else{
            res.render("list", {listTitle: "Today", newList: foundItems});
        }
    })
    .catch((err)=>{
        console.log(err);
    });
});

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if(listName ===  "Today"){ 
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName})
            .then((foundList)=>{
                if(foundList){
                    foundList.items.push(item);
                    foundList.save();
                    res.redirect("/" + listName);
                }
                else{
                    console.log("eror");
                }
            })
    }
});

app.post("/delete",function(req,res){
    const checkItemId =req.body.checkbox;
    const checkListName = req.body.listDelete;
    if(checkListName === "Today"){
        Item.findByIdAndRemove(checkItemId)
            .then(()=>{
                console.log("succesful delete");
                res.redirect("/");
            })
            .catch((err)=>{
                console.log(err);
            });
    }
    else{
        List.findOneAndUpdate({name: checkListName},{$pull: {items : {_id: checkItemId}}})
            .then(()=>{
                res.redirect("/" +checkListName );
            });
    }
})

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne ({name: customListName})
        .then((foundList)=>{
            if (!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItem
                });
                list.save();
                res.redirect("/customListName");
            }
            else{
                res.render("list",{listTitle: foundList.name, newList: foundList.items});
            }
        })
    

});



app.get("/about",function(req,res){
    res.render("about")
});