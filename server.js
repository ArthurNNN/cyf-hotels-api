const express = require("express");
const secret = require("./secret.json")

const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());




const { Pool } = require('pg');

const pool = new Pool(secret);

app.get("/", function (req, res) {
    res.send("Hello World!");
});

app.get("/hotels", function (req, res) {
    pool.query('SELECT * FROM hotels', (error, result) => {
        if (result) {
            res.json(result.rows);
        } else {
            res.status(404).send({ error: error.message });
        }
    })
})

app.get("/customers", function (req, res) {
    pool.query('SELECT * FROM customers', (error, result) => {
        if (result) {
            res.json(result.rows);
        } else {
            res.status(404).send({ error: error.message });
        }
    })
})
// set port, listen for requests
app.listen(3000, function () {
    console.log("Server is listening on port 3000. Ready to accept requests!");
});