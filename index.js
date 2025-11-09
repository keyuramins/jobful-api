const express = require('express');
const cors = require("cors");
const signale = require('signale');
const dotenv = require('dotenv');
const freejobalert = require('./routes/freejobalert/route');
dotenv.config();
const app = express();
var log = signale.scope("server:global");

const allowedOrigins = [
    "http://localhost:3000",
    "https://rrbjobs.in",
    "https://www.rrbjobs.in",
    "https://govjobs.serveriko.com",
    "https://www.govjobs.serveriko.com",
  ];

app.use(cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || origin === "http://localhost:3000" || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false,
  }));
app.use(express.json());

app.get('/',(req,res)=>{
    res.status(200).json({mssg:"In Root"})
});

app.use('/freejobalert', freejobalert);

app.all('*', (req, res) => {
    // Ignore common browser requests that don't need error logging
    const ignorePaths = ['/favicon.ico', '/robots.txt'];
    if (!ignorePaths.includes(req.path)) {
        log.error(`Invalid URL: ${req.method} ${req.path}`);
    }
    res.status(404).json({ error: "404 Invalid URL" })
})


app.listen(process.env.PORT || 3000, () => {
    log.watch("listening to port: " + (process.env.PORT || 3000));
})

module.exports = app;
