import express from "express";
import multer from "multer";
import { getProducts, getCsv, mergePdf, orderDetail } from "./controller.js";

const app = express();

// Middleware to parse JSON in the request body
app.use(express.json());

// Middleware to parse URL-encoded data in the request body
app.use(express.urlencoded({ extended: true }));
// Set up multer to handle file uploads
const upload = multer();

app.get("/getproducts", getProducts);
app.post("/getcsv", getCsv);
app.post("/orderDetail", orderDetail);
app.post(
  "/mergepdf",
  upload.fields([
    { name: "order1", maxCount: 1 },
    { name: "order2", maxCount: 1 },
  ]),
  mergePdf
);

app.listen(8080, (req, res) => {
  console.log("Connected to the DataBase");
});
