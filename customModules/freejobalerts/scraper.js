const request = require('request');
const cheerio = require('cheerio');
const stateCodes =require('../../data/freeJobAlertStateMap.json');
//const log = require('signale');
const signale = require('signale');


function topicScraper(URL, topic,tableNO) {
    var log = signale.scope("scraper:TopicScraper");
    const options = {
        url: URL,
        headers: {
            'User-Agent': 'request'
        }
    };
    var results = [];
    return new Promise((resolve,reject)=>{
        request.get(options,(error,response,html)=>{
            if(error)
            {
                log.error("could not fetch the source");
                reject(error);
            }
            else if(!error && response.statusCode === 200)
            {
                
                log.success("successfully fetched");
                const $ = cheerio.load(html);
                var allPosts = $('div .post');
                var topic = $(allPosts).find('table').eq(tableNO);
                // log.log(topic.html());
                var entries = $(topic).find('tr').toArray();
               // log.log(entries.length);

                entries.forEach((el,index)=>{
                    if(index===0) return; //to skip the first row which contains empty data
                    var result ={
                        postDate:"",
                        postBoard:"",
                        postName:"",
                        qualification:"",
                        advtNo:"",
                        lastDate:"",
                        link:""
                    }
                    result.postDate = $(el).find('td').eq(0).text();
                    result.postBoard=$(el).find('td').eq(1).text();
                    result.postName=$(el).find('td').eq(2).text();
                    result.qualification = $(el).find('td').eq(3).text();
                    result.advtNo = $(el).find('td').eq(4).text();
                    result.lastDate = $(el).find('td').eq(5).text();
                    result.link = $(el).find('td').eq(6).find('a').attr('href');

                    results.push(result);
                 
                });
                //log.log(results);
                resolve(results);
            }
            else
            {
                log.error(`HTTP ${response.statusCode}: Failed to fetch source`);
                reject(new Error(`HTTP ${response.statusCode}: Failed to fetch source`));
            }
        })
    })
}

function latestNotifications(URL) {
var log = signale.scope("scraper:latestNotifications");
const options = {
    url: URL,
    headers: {
        'User-Agent': 'request'
    }
};

var results = [];
return new Promise((resolve, reject) => {

    request.get(options, (error, response, html) => {
        if (error) {
            log.error("could not fetch the source");
            reject(error);
        }
        else if (!error && response.statusCode === 200) {
            log.success("successfully fetched");
            const $ = cheerio.load(html);
            const notifications = $('div .listcontentj').find('ul').toArray();
            notifications.forEach((el, index) => {
                var result = {
                    title: "",
                    link: ""
                };
                var entry = $(el).first('li').find('a');
                result.title = $(entry).text();
                result.link = $(entry).attr('href');
                // add it to the list
                results.push(result);
            });
            //log.log(results);
            resolve(results);
        }
        else
        {
            log.error(`HTTP ${response.statusCode}: Failed to fetch source`);
            reject(new Error(`HTTP ${response.statusCode}: Failed to fetch source`));
        }

    });
});
}


//////////////////////////////////// state wise scraper ////////////////////////////////////










function smartScraper(URL,topic) {
    var log = signale.scope("scraper:stateWiseScraper");

 

    const options = {
        url: URL,
        headers: {
            'User-Agent': 'request'
        }
    };
    
    var results = [];
    return new Promise((resolve, reject) => {
    
        request.get(options, (error, response, html) => {
            if (error) {
                log.error("could not fetch the source");
                reject(error);
            }
            else if (!error && response.statusCode === 200) {
                log.success("successfully fetched");
                const $ = cheerio.load(html);
                const posts = $('div .post');
                const tables = posts.find('table').toArray();
                log.info(`Found ${tables.length} tables`);
               
                var desiredTble;

                const matchPattern = new RegExp('<th>Recruitment Board</th>');

                // First, try to find table with the exact pattern
                tables.forEach((el,index)=>{
                    var textToMatch = $(el).html();
                    if (textToMatch) {
                        textToMatch = textToMatch.replace(/^\s+|\s+$/g, '');
                        if(matchPattern.test(textToMatch)) {
                            desiredTble=index;
                            log.info(`Found matching table at index ${index}`);
                            return;
                        }
                    }
                });

                // If pattern not found, look for table with 7+ columns (expected structure)
                if (desiredTble === undefined) {
                    log.warn("Could not find matching table with pattern '<th>Recruitment Board</th>'");
                    log.info("Searching for table with 7+ columns (expected structure)");
                    
                    tables.forEach((el, index) => {
                        if (desiredTble !== undefined) return; // Already found one
                        
                        var firstRow = $(el).find('tr').first();
                        var cells = firstRow.find('td, th').toArray();
                        
                        if (cells.length >= 7) {
                            desiredTble = index;
                            log.info(`Found table at index ${index} with ${cells.length} columns`);
                            // Log column headers for debugging
                            var headers = cells.map(cell => $(cell).text().trim()).join(' | ');
                            log.info(`Column headers: ${headers}`);
                        }
                    });
                }

                // Fallback to first table if still not found
                if (desiredTble === undefined) {
                    log.warn("Could not find table with 7+ columns, using first table as fallback");
                    if (tables.length > 0) {
                        desiredTble = 0;
                        log.info("Using first table (may have different structure)");
                    } else {
                        log.error("No tables found at all");
                        reject(new Error("Could not find matching table"));
                        return;
                    }
                }

                var dataTable = tables[desiredTble];
                var entries = $(dataTable).find('tr').toArray();
                log.info(`Processing table with ${entries.length} rows`);
                
                // Check first row structure
                if (entries.length > 0) {
                    var firstRow = entries[0];
                    var firstRowCells = $(firstRow).find('td, th').toArray();
                    log.info(`First row has ${firstRowCells.length} cells (td/th)`);
                    
                    if (firstRowCells.length >= 7) {
                        // Standard structure - skip first row (header) and process data rows
                        entries.forEach((el,index)=>{
                            if(index===0) return; // Skip header row
                            var tds = $(el).find('td');
                            if (tds.length < 7) {
                                log.debug(`Row ${index} has only ${tds.length} cells, skipping`);
                                return;
                            }
                            
                            var result ={
                                postDate:"",
                                postBoard:"",
                                postName:"",
                                qualification:"",
                                advtNo:"",
                                lastDate:"",
                                link:""
                            }
                            result.postDate = $(el).find('td').eq(0).text().trim();
                            result.postBoard=$(el).find('td').eq(1).text().trim();
                            result.postName=$(el).find('td').eq(2).text().trim();
                            result.qualification = $(el).find('td').eq(3).text().trim();
                            result.advtNo = $(el).find('td').eq(4).text().trim();
                            result.lastDate = $(el).find('td').eq(5).text().trim();
                            var linkEl = $(el).find('td').eq(6).find('a');
                            result.link = linkEl.length > 0 ? linkEl.attr('href') : '';
                            
                            // Only push if there's at least some data
                            if (result.postName || result.postBoard || result.link) {
                                results.push(result);
                                log.debug(`Row ${index} extracted: ${result.postName || result.postBoard || 'link only'}`);
                            }
                        });
                    } else {
                        // Non-standard structure - try to extract what we can
                        log.warn(`Table has non-standard structure (${firstRowCells.length} columns), attempting alternative extraction`);
                        
                        // Try to find links and extract job information
                        entries.forEach((el,index)=>{
                            if(index===0) return; // Skip first row
                            
                            var links = $(el).find('a');
                            var text = $(el).text().trim();
                            
                            if (links.length > 0 && text) {
                                links.each(function() {
                                    var link = $(this).attr('href');
                                    var linkText = $(this).text().trim();
                                    
                                    if (link && linkText) {
                                        var result = {
                                            postDate: "",
                                            postBoard: "",
                                            postName: linkText,
                                            qualification: "",
                                            advtNo: "",
                                            lastDate: "",
                                            link: link
                                        };
                                        results.push(result);
                                        log.debug(`Extracted from row ${index}: "${linkText}"`);
                                    }
                                });
                            }
                        });
                    }
                }
                
                log.info(`Extracted ${results.length} results from table`);
                resolve(results);
            }
            else
            {
                log.error(`HTTP ${response.statusCode}: Failed to fetch source`);
                reject(new Error(`HTTP ${response.statusCode}: Failed to fetch source`));
            }
    
        });
    });
    }






    // smartScraper("http://www.freejobalert.com/odisha-government-jobs/","West Bengal").then((data)=>{
    //     // signale.log(data);
    // }).catch((err)=>{
    //     // signale.error(err);
    // })

















module.exports.latestNotifications = latestNotifications;
module.exports.topicScraper = topicScraper;
module.exports.smartScraper=smartScraper;