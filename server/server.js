const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());

app.get("/api", (req, res) => {
    console.log("Hitting api");
    res.json({"users": ["userOne", "userTwo", "userThree"]});
});

app.listen(port, () => {console.log("Server started on port ", port);});