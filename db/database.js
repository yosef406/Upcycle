const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/products", {});

// Define the Product model
let Product = mongoose.model("Product", {
  name: String,
  image: String,
  price: Number,
  description: String,
});

module.exports = { Product };
