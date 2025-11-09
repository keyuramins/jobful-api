const express = require('express');
const cors = require("cors");
const signale = require('signale');
const dotenv = require('dotenv');
const freejobalert = require('./routes/freejobalert/route');
dotenv.config();
const app = express();
var log = signale.scope("server:global");

app.use(cors());
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
