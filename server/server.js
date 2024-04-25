const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 8081;
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: "james.cedarville.edu",
    user: "cs3220_sp24",
    password: "OqagokbAg9DzKZGb",
    database: "cs3220_sp24"
})

app.post('/login', (req, res)=> {
    const sql = "SELECT username, password FROM JAC_users WHERE username= ?;";

    db.query(sql, [req.body.username, req.body.password], (err, data) =>{
        if(err) {
            console.error("Error:", err);
            return res.json("Login Failed");
        }
        if(data.length > 0) {
            //res.redirect("/");
            return res.json("Login Successful"); // Assuming if data exists, it's a successful login
        } else {
            return res.json("Login Failed: Invalid username or password");
        }
        
    });
})
app.listen(port, () => {
    console.log("Listening...");
});