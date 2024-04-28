const express = require("express");
const app = express();
const Products = require("../db/database");

// Define routes for the Express.js server
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/products", (req, res) => {
  Product.find()
    .then((products) => {
      res.send(products);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error");
    });
});

app.post("/add-to-cart", (req, res) => {
  const { productId } = req.body;
  // Add product to cart logic goes here
  res.send({ type: "cart-update", data: "" });
});

module.exports = app;
