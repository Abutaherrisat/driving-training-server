const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
const port = process.env.PORT || 5000;

//
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('clients'));
app.use(fileUpload());

//
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ij59.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const serviceCollection = client.db("drivingTraining").collection("services");
  const orderCollection = client.db("drivingTraining").collection("orders");
  const reviewCollection = client.db("drivingTraining").collection("reviews");
  const adminCollection = client.db("drivingTraining").collection("admins");

  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    serviceCollection
      .insertOne({ title, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.delete('/delete/:id', (req, res) => {
    const id = ObjectId(req.params.id)
    serviceCollection.deleteOne({ _id: id })

      .then(result => {
        res.send(result.deletedCount>0);
      })

  })
  app.post("/addOrder", (req, res) => {
    const order = req.body;
    console.log(order);
    orderCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/orders", (req, res) => {
    orderCollection.find({email:req.query.email}).toArray((err, documents) => {
      console.log(documents);
      res.send(documents);
    });
  });
  app.post("/addReview", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const designation = req.body.designation;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    reviewCollection
      .insertOne({ name, designation, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/reviews", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/makeAdmin", (req, res) => {
    const admin = req.body;
    console.log(admin);
    adminCollection.insertOne(admin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/admins", (req, res) => {
    adminCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/isAdmin", (req, res) => {
    adminCollection.find({ email: req.query.email }).toArray((err, admins) => {
      console.log(admins);
      res.send(admins.length>0);
    });
  });

  console.log("connection error: ", err);
  console.log("DB connected");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
