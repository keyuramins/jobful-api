const express = require("express");
const router = express.Router();
var log = require("signale");
const latestNotifications = require("../../customModules/freejobalerts/scraper")
  .latestNotifications;
const topicScraper = require("../../customModules/freejobalerts/scraper")
  .topicScraper;
const smartScraper = require("../../customModules/freejobalerts/scraper")
  .smartScraper;
const stateCodes = require("../../data/freeJobAlertStateMap.json");
log.scope("freejobalert:global");

/////////////////////////////////////////////////// routes
/////////////////////////////////////////////////
router.get("/", getDefault, (req, res) => {
  if (res.results !== undefined) {
    res.json(res.results);
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/gov/other-all-india-exam", otherAllIndiaExam, (req, res) => {
  if (res.results !== undefined) {
    res.json(res.results);
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/gov/state/:code([a-zA-Z]{2})", stateWiseGovjobs);

router.get("/bank-jobs", bankJobs, (req, res) => {
  if (res.results !== undefined) {
    res.json(res.results);
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/teaching-jobs", allIndiaTeachingJobs, (req, res) => {
  if (res.results !== undefined) {
    res.json(res.results);
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/engineering-jobs", allIndiaEngineeringJobs, (req, res) => {
  if (res.results !== undefined) {
    res.json(res.results);
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/railway-jobs", allIndiaRailwayJobs, (req, res) => {
  if (res.results !== undefined) {
    res.json(res.results);
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/defence-jobs", allIndiaDefenceJobs, (req, res) => {
  if (res.results !== undefined) {
    res.json(res.results);
  } else {
    res.status(500).json({ error: "Internal server error" });
  }
});

/////////////////////////////////////////////////////// Invalid URL
///////////////////////////////////////////

router.all("*", notFound, (req, res) => {
  res.json({ error: "404: invalid URL" });
});

///////////////////////////////////////// middleware functions
////////////////////////////////////////////////

async function stateWiseGovjobs(req, res, next) {
  log = log.scope("freejobalert:stateWiseGovjobs");
  var stateCode = req.params.code.toUpperCase();
  var state = stateCodes.filter(function (item) {
    return item.code == stateCode;
  })[0];
  
  if (!state || !state.link) {
    res.status(404).json({ error: "Invalid state code" });
    return;
  }
  
  var URL = state.link;
  log.info(URL);
  const topic = "Govt. job for " + state.name;
  
  try {
    const data = await smartScraper(URL, topic);
    log.success(`Returning ${data.length} results`);
    res.status(200).json(data);
  } catch (error) {
    res.status(500);
    log.error(error);
    res.json({ error: "Something Went Wrong" });
  }
}

async function allIndiaDefenceJobs(req, res, next) {
  log = log.scope("freejobalert:allIndiaDefenceJobs");
  const URL = "http://www.freejobalert.com/police-defence-jobs/";
  const topic = "All India Defence Jobs";
  const tableNo = 1;

  try {
    const data = await topicScraper(URL, topic, tableNo);
    log.success(data);
    res.status(200);
    res.results = data;
  } catch (error) {
    res.status(500);
    log.error(error);
    res.results = { error: "Something Went Wrong" };
  }
  next();
}

async function allIndiaRailwayJobs(req, res, next) {
  log = log.scope("freejobalert:allIndiaRailwayJobs");
  const URL = "http://www.freejobalert.com/railway-jobs/";
  const topic = "All India Railway Jobs";
  const tableNo = 1;

  try {
    const data = await topicScraper(URL, topic, tableNo);
    log.success(data);
    res.status(200);
    res.results = data;
  } catch (error) {
    res.status(500);
    log.error(error);
    res.results = { error: "Something Went Wrong" };
  }
  next();
}

async function allIndiaEngineeringJobs(req, res, next) {
  log = log.scope("freejobalert:allIndiaEngineeringJobs");
  const URL = "http://www.freejobalert.com/engineering-jobs/";
  const topic = "All India Engineering Jobs";
  const tableNo = 1;

  try {
    const data = await topicScraper(URL, topic, tableNo);
    log.success(data);
    res.status(200);
    res.results = data;
  } catch (error) {
    res.status(500);
    log.error(error);
    res.results = { error: "Something Went Wrong" };
  }
  next();
}

async function bankJobs(req, res, next) {
  log = log.scope("freejobalert:bankJobs");
  const URL = "http://www.freejobalert.com/bank-jobs/";
  const topic = "Banking Jobs";
  const tableNo = 1;

  try {
    const data = await topicScraper(URL, topic, tableNo);
    log.success(data);
    res.status(200);
    res.results = data;
  } catch (error) {
    res.status(500);
    log.error(error);
    res.results = { error: "Something Went Wrong" };
  }
  next();
}

async function otherAllIndiaExam(req, res, next) {
  log = log.scope("freejobalert:otherAllIndiaExam");
  const URL = "http://www.freejobalert.com/government-jobs/";
  const topic = "Other All India Exams";
  const tableNo = 4;
  
  try {
    const data = await topicScraper(URL, topic, tableNo);
    res.status(200);
    log.success(data);
    res.results = data;
  } catch (error) {
    res.status(500);
    log.error(error);
    res.results = { error: "Something Went Wrong" };
  }
  next();
}

async function allIndiaTeachingJobs(req, res, next) {
  log = log.scope("freejobalert:allIndiaTeachingJobs");
  const URL = "http://www.freejobalert.com/teaching-faculty-jobs/";
  const topic = "All India Teaching Jobs";
  const tableNo = 2;
  
  try {
    const data = await topicScraper(URL, topic, tableNo);
    res.status(200);
    log.success(data);
    res.results = data;
  } catch (error) {
    res.status(500);
    log.error(error);
    res.results = { error: "Something Went Wrong" };
  }
  next();
}

//////////////////////////////////////////////////////////////////////////////////////
async function getDefault(req, res, next) {
  log = log.scope("freejobalert:getDefault");
  
  try {
    const data = await latestNotifications("http://www.freejobalert.com/");
    res.status(200);
    log.success(data);
    res.results = data;
  } catch (error) {
    res.status(500);
    log.error(error);
    res.results = { error: "Something Went Wrong" };
  }

  next();
}

function notFound(req, res, next) {
  log.error("freejobalert:Invalid URL");
  res.status(404);
  next();
}

module.exports = router;
