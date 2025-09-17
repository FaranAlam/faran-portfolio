// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const subscribers = [];

app.post("/subscribe", (req, res) => {
  const { email } = req.body;
  if (subscribers.includes(email)) {
    return res.status(400).json({ message: "You are already subscribed!" });
  }
  subscribers.push(email);
  res.json({ message: "Subscription successful!" });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
