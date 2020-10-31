//jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

// console.log(getDate());

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');


// const items = ["Buy foods", "Cook foods", "Eat foods"];
// const workitem = [];

// Database

// const uri = ""mongodb://localhost:27017/todolistDB"

const uri = "mongodb+srv://admin-tomiwa:Password123@cluster0.fijcw.mongodb.net/todolistDB"

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });



const itemsSchema = new mongoose.Schema({
    name: String,
});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item( {
    name: "<-- Hit this to delete an item "
});


const tray = [item1, item2, item3];

// --------------------------------------------------------------


const list_Schema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const ListSchema = mongoose.model("List", list_Schema);

// ---------------------------------------

app.get("/", function (req, res) {


    // logic 1

    // var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // var day = days[today.getDay()];


    // logic 2

    // var currentDay = today.getDay();
    // var day = "";

    // switch (currentDay) {
    //     case 0:
    //         day = "Sunday";
    //         break;
    //     case 1:
    //         day = "Monday";
    //         break;

    //     case 2:
    //         day = "Tuesday";
    //         break;

    //     case 3:
    //         day = "Wednesday";
    //         break;

    //     case 4:
    //         day = "Thursday";
    //         break;

    //     case 5:
    //         day = "Friday";
    //         break;

    //     case 6:
    //         day = "Saturday";
    //         break;


    //     default:
    //     console.log("Error current day is equal to; " + currentDay)
            
    // }


    // New logic

    const day = date.getDay();

    Item.find({}, function(err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(tray, function(err){
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved default tray items to DB")
                }
            });

            res.redirect("/")

        } else {
            res.render("list", {listTitle: "Today", NewListItem: foundItems});
        }
    
    });
    
});

// ----------------------------------------------

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    console.log(listName)


    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        ListSchema.findOne({name: listName}, function (err, foundlist) {
            //console.log(foundlist.items)
            
            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/" + listName);
        });
    };



    

    // ---------Rough code-----------
    // try{
        
    // } catch {
    //     console.log("gee")
    // }
    // if (req.body.list === "Work") {
        
    //     workitem.push(item);
    //     res.redirect("/work")

    // } else {
    //     items.push(item);
    //     res.redirect("/");
    // };
});

// -------------------------------------

app.get("/:customListName", function (req, res) {
    
    const customListName = _.capitalize(req.params.customListName);
    

    ListSchema.findOne({name: customListName}, function (err, foundlist) {
        if (!err) {

            if (!foundlist) {
                
                const list = new ListSchema({
                    name: customListName,
                    items: tray
                });

                list.save()

                res.redirect("/" + customListName)

                console.log("not present")

            } else {
                console.log("seen")

                res.render("list", {listTitle: foundlist.name, NewListItem: foundlist.items})
            }
        }
    })
});

// -------------------------------------

app.get("/about", function (req, res) {
    res.render("about");
});

// ----------------------------------

app.get("/work", function(req, res) {

    res.render("list", {listTitle: "Today", NewListItem: workitem})
    
});

// -------------------------------------

app.post("/delete", function (req, res) {
    
    const item_id = req.body.checkbox;
    const listName = req.body.listName;
    console.log(listName)

    if (listName === "Today") {
        Item.findByIdAndRemove(item_id, function(err){
            if (!err) {
                console.log("sucess")
            } 
    
            res.redirect("/")
        })
    } else {
        ListSchema.findOneAndUpdate({name: listName}, {$pull: {items: {_id: item_id}}}, function (err, foundlist) {
            if (!err) {
                res.redirect("/" + listName)
            }            
        })
    }

})


app.listen(3000, function () {
    console.log("speak I listen")
});