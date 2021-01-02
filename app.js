//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Alex:Test123@myfirstcluster.6yjd9.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});


const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const code = new Item({name: "Write code"});
const coffee = new Item({name: "Get coffee"});
const moreCode = new Item({name: "Write some more code"});

const defaultItems = [code, coffee, moreCode];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, results) {
    if (results.length === 0) {
      Item.insertMany(defaultItems, function(err) {
       if (err) {
         console.log(err);
       } else {
         console.log("items successfully added");

       }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: results});
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newToDo = new Item({name: itemName});

  newToDo.save();
  res.redirect("/");

});

app.post("/delete", function(req, res) {
  const deletedItem = req.body.listName;

  console.log(deletedItem)


    Item.findByIdAndRemove(deletedItem, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("successfully deleted item");
        res.redirect("/");
      }
    });

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create new list
        const list = new List ({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName)
      } else {
        //show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
};

app.listen(port, function() {
  console.log("Server has started successfully");
});
