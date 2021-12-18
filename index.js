const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 8000;

app.use(cors());
app.use(fileUpload());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5ltnk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("database connected successfully");
    await client.connect();
    const database = client.db("newspaper");
    const newsCollection = database.collection("allnews");
    const commentsCollection = database.collection("comments");

    //Post News Data
    app.post("/allnews", async (req, res) => {
      const title = req.body.title;
      const newsDetails = req.body.newsDetails;
      const category = req.body.category;
      const time = req.body.time;
      const reporter = req.body.reporter;
      const address = req.body.address;
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const news = {
        title,
        newsDetails,
        category,
        time,
        reporter,
        address,
        image: imageBuffer,
      };
      const result = await newsCollection.insertOne(news);
      res.json(result);
    });

    // //GET News API
    app.get("/allnews", async (req, res) => {
      const cursor = newsCollection.find({});
      const allnews = await cursor.toArray();
      res.send(allnews);
    });

    //Find one
    app.get("/allnews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await newsCollection.findOne(query);
      res.json(result);
    });
    app.get("/category", async (req, res) => {
      const category = req.query.category;
      const query = { category: category };
      const cursor = newsCollection.find(query);
      const categories = await cursor.toArray();
      res.json(categories);
    });

    //post comment
    app.post("/comments", async (req, res) => {
      const comments = req.body;
      const result = await commentsCollection.insertOne(comments);
      res.json(result);
    });
    // get comment
    app.get("/comments", async (req, res) => {
      const newsId = req.query.newsId;
      const query = { newsId: newsId };
      const cursor = commentsCollection.find(query);
      const comments = await cursor.toArray();
      res.json(comments);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello From Newspaper database!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
