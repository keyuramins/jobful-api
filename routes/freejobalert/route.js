const express = require("express");
const router = express.Router();
var log = require("signale");
const latestNotifications = require("../../customModules/freejobalerts/scraper")
  .latestNotifications;
const topicScraper = require("../../customModules/freejobalerts/scraper")
  .topicScraper;
const smartScraper = require("../../customModules/freejobalerts/scraper")
  .smartScraper;
const scrapeAllTablesByTitle = require("../../customModules/freejobalerts/scraper")
  .scrapeAllTablesByTitle;
const scrapeRailwayTablesAndContent = require("../../customModules/freejobalerts/scraper")
  .scrapeRailwayTablesAndContent;
const scrapeArticlePage = require("../../customModules/freejobalerts/scraper")
  .scrapeArticlePage;
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

router.get("/articles", articleDetails, (req, res) => {
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
  
  try {
    const allTablesData = await scrapeAllTablesByTitle(URL);
    
    // Get the specific table data or return all tables
    if (req.query.table) {
      // Normalize table name robustly (e.g., "All India Police / Defence Jobs" -> "all-india-police-defence-jobs")
      const normalizedTableName = req.query.table
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const tableData = allTablesData[normalizedTableName] || [];
      log.success(`Returning ${tableData.length} results for table "${normalizedTableName}"`);
      res.status(200);
      res.results = tableData;
    } else {
      // Return all tables with their header keys
      log.success(`Returning data for ${Object.keys(allTablesData).length} tables`);
      res.status(200);
      res.results = allTablesData;
    }
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
  
  try {
    const result = await scrapeRailwayTablesAndContent(URL);
    
    // Get the specific table data or return all tables (wrapped under "railway-jobs")
    if (req.query.table) {
      // Normalize table name robustly: letters/numbers only
      const normalizedTableName = req.query.table
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const tableData = result.tables[normalizedTableName] || [];
      log.success(`Returning ${tableData.length} results for table "${normalizedTableName}"`);
      res.status(200);
      res.results = tableData;
    } else {
      // Return only rows under the key "railway-jobs" as an array
      const allRows = Object.values(result.tables).reduce((acc, arr) => acc.concat(arr || []), []);
      log.success(`Returning ${allRows.length} railway rows from ${Object.keys(result.tables).length} tables`);
      res.status(200);
      res.results = { 'railway-jobs': allRows };
    }
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
  
  try {
    const allTablesData = await scrapeAllTablesByTitle(URL);
    
    // Get the specific table data or return all tables
    if (req.query.table) {
      // Normalize table name robustly (e.g., "All India Engineering Jobs" -> "all-india-engineering-jobs")
      const normalizedTableName = req.query.table
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const tableData = allTablesData[normalizedTableName] || [];
      log.success(`Returning ${tableData.length} results for table "${normalizedTableName}"`);
      res.status(200);
      res.results = tableData;
    } else {
      // Return all tables with their header keys
      log.success(`Returning data for ${Object.keys(allTablesData).length} tables`);
      res.status(200);
      res.results = allTablesData;
    }
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
  
  try {
    const allTablesData = await scrapeAllTablesByTitle(URL);
    
    // Get the specific table data or return all tables
    if (req.query.table) {
      // Normalize table name
      const normalizedTableName = req.query.table.toLowerCase().trim().replace(/\s+/g, '-');
      const tableData = allTablesData[normalizedTableName] || [];
      log.success(`Returning ${tableData.length} results for table "${normalizedTableName}"`);
      res.status(200);
      res.results = tableData;
    } else {
      // Return all tables
      log.success(`Returning data for ${Object.keys(allTablesData).length} tables`);
      res.status(200);
      res.results = allTablesData;
    }
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
  
  try {
    const allTablesData = await scrapeAllTablesByTitle(URL);
    
    // Get the specific table data or return all tables
    if (req.query.table) {
      // Normalize table name (e.g., "All India Teaching Jobs" -> "all-india-teaching-jobs")
      const normalizedTableName = req.query.table.toLowerCase().trim().replace(/\s+/g, '-');
      const tableData = allTablesData[normalizedTableName] || [];
      log.success(`Returning ${tableData.length} results for table "${normalizedTableName}"`);
      res.status(200);
      res.results = tableData;
    } else {
      // Return all tables with their header keys
      log.success(`Returning data for ${Object.keys(allTablesData).length} tables`);
      res.status(200);
      res.results = allTablesData;
    }
  } catch (error) {
    res.status(500);
    log.error(error);
    res.results = { error: "Something Went Wrong" };
  }
  next();
}

async function articleDetails(req, res, next) {
  log = log.scope("freejobalert:articleDetails");
  const url = (req.query.url || "").trim();

  if (!url) {
    res.status(400);
    res.results = { error: "Missing required query param: url" };
    return next();
  }
  const isAllowed = /^https?:\/\/(www\.)?freejobalert\.com\/articles\//i.test(url);
  if (!isAllowed) {
    res.status(400);
    res.results = { error: "Only freejobalert article URLs are allowed" };
    return next();
  }

  try {
    const data = await scrapeArticlePage(url);
    res.status(200);
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
