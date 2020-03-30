const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-kashish:test123@cluster0-aohbt.mongodb.net/todolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to todo List"
});

const item2 = new Item({
    name: "press the + button to add the new item"
});

const item3 = new Item({
    name: "hit this to delete the item"
});

const defaulItem = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


// var days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
// var listItems = ["Buy food", "cook food", "eat food"];

var today = new Date;
var options = {
    weekday: "long",
    day: "numeric",
    month: "long"
};
var day = today.toLocaleDateString("en-us", options);

app.get("/", (req, res) => {
    Item.find({}, (err, result) => {
        //    console.log(result);
        if (result.length === 0) {
            Item.insertMany(defaulItem, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("successfully added items");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                kindOfDay: day,
                listItems: result
            });
        }
    })
});

app.post("/", (req, res) => {
    var item = req.body.listItem;
    var listName = req.body.list;
    const newItem = new Item({
        name: item
    });

    if (listName === day) {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({
            name: listName
        }, (err, foundList) => {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", (req, res) => {
    const checkedItem = req.body.deletedItem;
    const listName = req.body.listName;
    if (listName === day) {
        Item.findByIdAndRemove(checkedItem, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("successfully deleted the item");

            }
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name:listName},{ $pull : {items : {_id : checkedItem} } },(err,foundList)=>{
            if(!err){
                res.redirect("/"+listName);   
                console.log("deleted");         
            }else{
                console.log(err);
                
            }
        });
    }
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/:category", (req, res) => {
    const customListName = _.capitalize(req.params.category);
    List.findOne({
        name: customListName
    }, (err, result) => {
        // console.log(result);

        if (result) {
            res.render("list", {
                kindOfDay: result.name,
                listItems: result.items
            })
        } else {
            const list = new List({
                name: customListName,
                items: defaulItem
            });
            list.save();
            res.redirect("/" + customListName);
        }
    });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, (req, res) => {
    console.log("server started successfully");
});