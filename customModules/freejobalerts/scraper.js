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
                    
                    var tds = $(el).find('td');
                    // Skip rows that don't have at least 7 columns
                    if (tds.length < 7) {
                        log.debug(`Row ${index} skipped - only has ${tds.length} columns`);
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

                    // Only add results that have at least some meaningful data
                    if (result.postName || result.postBoard || result.link) {
                        results.push(result);
                    } else {
                        log.debug(`Row ${index} skipped - all fields are empty`);
                    }
                 
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
            // Updated selector: ul.listcontentnu (class name changed from listcontentj to listcontentnu)
            const notifications = $('ul.listcontentnu').toArray();
            log.info(`Found ${notifications.length} ul.listcontentnu elements`);
            
            notifications.forEach((el, index) => {
                // Get all links from each ul element
                const links = $(el).find('li a');
                links.each((linkIndex, linkEl) => {
                    var result = {
                        title: "",
                        link: ""
                    };
                    result.title = $(linkEl).text().trim();
                    result.link = $(linkEl).attr('href');
                    // Only add if we have both title and link
                    if (result.title && result.link) {
                        results.push(result);
                    }
                });
            });
            
            log.info(`Extracted ${results.length} total notifications`);
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

















//////////////////////////////////// scrape all tables by title ////////////////////////////////////

function scrapeAllTablesByTitle(URL) {
    var log = signale.scope("scraper:scrapeAllTablesByTitle");
    const options = {
        url: URL,
        headers: {
            'User-Agent': 'request'
        }
    };
    
    var allTablesData = {};
    
    return new Promise((resolve, reject) => {
        request.get(options, (error, response, html) => {
            if (error) {
                log.error("could not fetch the source");
                reject(error);
            }
            else if (!error && response.statusCode === 200) {
                log.success("successfully fetched");
                const $ = cheerio.load(html);
                
                // Find all tables with class lattbl
                const tables = $('table.lattbl').toArray();
                log.info(`Found ${tables.length} tables`);
                
                tables.forEach((table, tableIndex) => {
                    // Find the preceding h4.latsec heading to get the table title
                    const $table = $(table);
                    let title = 'Unknown';
                    
                    // Look for h4.latsec before this table
                    let prev = $table.prev();
                    let attempts = 0;
                    while (prev.length && attempts < 5) {
                        if (prev.is('h4.latsec')) {
                            title = prev.text().trim();
                            break;
                        }
                        prev = prev.prev();
                        attempts++;
                    }
                    
                    // If not found, try parent traversal
                    if (title === 'Unknown') {
                        const parent = $table.parent();
                        const prevSibling = parent.prev();
                        if (prevSibling.length && prevSibling.find('h4.latsec').length) {
                            title = prevSibling.find('h4.latsec').first().text().trim();
                        }
                        // Also check parent's parent
                        if (title === 'Unknown' && parent.parent().length) {
                            const grandParent = parent.parent();
                            const prevToGrand = grandParent.prev();
                            if (prevToGrand.length && prevToGrand.find('h4.latsec').length) {
                                title = prevToGrand.find('h4.latsec').first().text().trim();
                            }
                        }
                    }
                    
                    // Normalize title to a safe slug: letters/numbers only, hyphen separated
                    title = title
                        .trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    
                    log.info(`Processing table "${title}" (index ${tableIndex})`);
                    
                    // Extract data from this table
                    var results = [];
                    const entries = $table.find('tr').toArray();
                    
                    entries.forEach((el, index) => {
                        if (index === 0) return; // Skip header row
                        
                        const tds = $(el).find('td');
                        if (tds.length < 7) {
                            log.debug(`Table "${title}", row ${index}: skipped - only has ${tds.length} columns`);
                            return;
                        }
                        
                        var result = {
                            postDate: "",
                            postBoard: "",
                            postName: "",
                            qualification: "",
                            advtNo: "",
                            lastDate: "",
                            link: ""
                        };
                        
                        result.postDate = $(el).find('td').eq(0).text().trim();
                        result.postBoard = $(el).find('td').eq(1).text().trim();
                        result.postName = $(el).find('td').eq(2).text().trim();
                        result.qualification = $(el).find('td').eq(3).text().trim();
                        result.advtNo = $(el).find('td').eq(4).text().trim();
                        result.lastDate = $(el).find('td').eq(5).text().trim();
                        const linkEl = $(el).find('td').eq(6).find('a');
                        result.link = linkEl.length > 0 ? linkEl.attr('href') : '';
                        
                        // Only add results that have at least some meaningful data
                        if (result.postName || result.postBoard || result.link) {
                            results.push(result);
                        } else {
                            log.debug(`Table "${title}", row ${index}: skipped - all fields are empty`);
                        }
                    });
                    
                    // Store results with title as key (or empty array if no data)
                    allTablesData[title] = results;
                    log.info(`Table "${title}": extracted ${results.length} results`);
                });
                
                log.success(`Extracted data from ${tables.length} tables`);
                resolve(allTablesData);
            }
            else {
                log.error(`HTTP ${response.statusCode}: Failed to fetch source`);
                reject(new Error(`HTTP ${response.statusCode}: Failed to fetch source`));
            }
        });
    });
}

function scrapeRailwayTablesAndContent(URL) {
    var log = signale.scope("scraper:scrapeRailwayTablesAndContent");
    const options = {
        url: URL,
        headers: {
            'User-Agent': 'request'
        }
    };
    
    return new Promise((resolve, reject) => {
        request.get(options, (error, response, html) => {
            if (error) {
                log.error("could not fetch the source");
                reject(error);
            }
            else if (!error && response.statusCode === 200) {
                log.success("successfully fetched");
                const $ = cheerio.load(html);
                
                // Scrape all tables (by headers if they exist, otherwise use 'main')
                const tablesData = {};
                const tables = $('table.lattbl').toArray();
                
                tables.forEach((table, tableIndex) => {
                    const $table = $(table);
                    let title = 'main';
                    
                    // Try to find h4.latsec heading before table
                    let prev = $table.prev();
                    let attempts = 0;
                    while (prev.length && attempts < 5) {
                        if (prev.is('h4.latsec')) {
                            title = prev.text().trim();
                            break;
                        }
                        prev = prev.prev();
                        attempts++;
                    }
                    
                    // Normalize title to a safe slug: letters/numbers only, hyphen separated
                    title = title
                        .trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    
                    log.info(`Processing table "${title}" (index ${tableIndex})`);
                    
                    var results = [];
                    const entries = $table.find('tr').toArray();
                    
                    entries.forEach((el, index) => {
                        if (index === 0) return; // Skip header
                        
                        const tds = $(el).find('td');
                        if (tds.length < 7) {
                            log.debug(`Table "${title}", row ${index}: skipped - only has ${tds.length} columns`);
                            return;
                        }
                        
                        var result = {
                            postDate: "", postBoard: "", postName: "",
                            qualification: "", advtNo: "", lastDate: "", link: ""
                        };
                        
                        result.postDate = $(el).find('td').eq(0).text().trim();
                        result.postBoard = $(el).find('td').eq(1).text().trim();
                        result.postName = $(el).find('td').eq(2).text().trim();
                        result.qualification = $(el).find('td').eq(3).text().trim();
                        result.advtNo = $(el).find('td').eq(4).text().trim();
                        result.lastDate = $(el).find('td').eq(5).text().trim();
                        const linkEl = $(el).find('td').eq(6).find('a');
                        result.link = linkEl.length > 0 ? linkEl.attr('href') : '';
                        
                        if (result.postName || result.postBoard || result.link) {
                            results.push(result);
                        }
                    });
                    
                    tablesData[title] = results;
                    log.info(`Table "${title}": extracted ${results.length} results`);
                });
                
                // Extract content after tables (paragraphs and lists)
                const content = {
                    paragraphs: [],
                    lists: []
                };
                
                // Find all tables and get content after the last table
                const $entryContent = $('div.entry-content');
                if ($entryContent.length) {
                    const lastTable = $entryContent.find('table.lattbl').last();
                    if (lastTable.length) {
                        // Get all siblings after the last table
                        let current = lastTable.next();
                        while (current.length) {
                            if (current.is('p')) {
                                const text = current.text().trim();
                                if (text) {
                                    content.paragraphs.push(text);
                                }
                            } else if (current.is('ul')) {
                                const listItems = [];
                                current.find('li').each(function() {
                                    const itemText = $(this).text().trim();
                                    if (itemText) {
                                        listItems.push(itemText);
                                    }
                                });
                                if (listItems.length > 0) {
                                    content.lists.push(listItems);
                                }
                            }
                            current = current.next();
                        }
                    }
                }
                
                log.success(`Extracted ${Object.keys(tablesData).length} tables and content`);
                resolve({
                    tables: tablesData,
                    content: content
                });
            }
            else {
                log.error(`HTTP ${response.statusCode}: Failed to fetch source`);
                reject(new Error(`HTTP ${response.statusCode}: Failed to fetch source`));
            }
        });
    });
}

module.exports.latestNotifications = latestNotifications;
module.exports.topicScraper = topicScraper;
module.exports.smartScraper=smartScraper;
module.exports.scrapeAllTablesByTitle = scrapeAllTablesByTitle;
module.exports.scrapeRailwayTablesAndContent = scrapeRailwayTablesAndContent;
 
// Scrape a FreeJobAlert article page into a normalized JSON
function scrapeArticlePage(URL) {
    const log = signale.scope("scraper:scrapeArticlePage");
    const options = { url: URL, headers: { "User-Agent": "request" } };

    const isAllowed = /^https?:\/\/(www\.)?freejobalert\.com\/articles\//i.test(URL);
    if (!isAllowed) {
        return Promise.reject(new Error("Only freejobalert article URLs are allowed"));
    }

    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    const toISO = (txt) => {
        if (!txt) return undefined;
        const t = txt.replace(/\u00A0/g, " ").trim();
        let m = t.match(/(\d{2})[.\-\/](\d{2})[.\-\/](\d{4})/);
        if (m) return `${m[3]}-${m[2]}-${m[1]}`;
        m = t.match(/(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})/);
        if (m) return `${m[1]}-${m[2]}-${m[3]}`;
        return undefined;
    };
    const sumNumbers = (arr) => arr.reduce((acc, v) => acc + (parseInt(String(v).replace(/[^\d]/g, ""), 10) || 0), 0);

    const extractTable = ($, $table) => {
        const headers = [];
        const rows = [];
        const firstRow = $table.find("tr").first();
        if (firstRow.find("th").length) {
            firstRow.find("th,td").each((i, th) => headers.push(clean($(th).text())));
        }
        $table.find("tr").each((i, tr) => {
            if (i === 0 && headers.length) return;
            const cells = [];
            $(tr).find("td,th").each((j, td) => cells.push(clean($(td).text())));
            if (cells.join("").length) rows.push(cells);
        });
        return { headers, rows };
    };

    const tableToKV = (table) => {
        const out = {};
        (table.rows || []).forEach((r) => {
            if (r.length >= 2) {
                const k = clean(r[0]).replace(/:$/, "");
                const v = clean(r[1]);
                if (k) out[k] = v;
            }
        });
        return out;
    };

    const extractQnA = ($, $content) => {
        const qna = [];
        const faqsRoot = $content.find("h2, h3").filter((i, el) => /faq|frequently asked/i.test($(el).text())).first();
        const scanRoot = faqsRoot.length ? faqsRoot.nextAll() : $content.children();

        scanRoot.each((idx, el) => {
            const $el = $(el);
            if ($el.is("p") || $el.is("li")) {
                const t = clean($el.text());
                const qMatch = t.match(/^\d+\.\s*(what|which|when|where|who|how|is|are|can|does|do|shall|will|may|could|should|why)\b.*\??/i) || t.match(/^q\s*[:\-]\s*(.*)/i);
                if (qMatch) {
                    const q = qMatch[0].replace(/^q\s*[:\-]\s*/i, "").trim();
                    let a = "";
                    const ansInline = t.split(/ans\s*[:\-]\s*/i);
                    if (ansInline.length > 1) a = clean(ansInline.slice(1).join(" "));
                    if (!a) {
                        let n = $el.next();
                        while (n.length) {
                            const txt = clean(n.text());
                            if (/^\d+\.\s*/.test(txt) || /^q\s*[:\-]/i.test(txt) || n.is("h2") || n.is("h3")) break;
                            const aMatch = txt.match(/^ans\s*[:\-]\s*(.*)/i);
                            if (aMatch) { a = clean(aMatch[1]); break; }
                            if (!/^ans\s*[:\-]/i.test(txt) && txt) { a = txt; break; }
                            n = n.next();
                        }
                    }
                    if (q && a) qna.push({ q: q.replace(/^\d+\.\s*/, ""), a });
                }
            }
        });
        return qna;
    };

    return new Promise((resolve, reject) => {
        request.get(options, (error, response, html) => {
            if (error) return reject(error);
            if (!response || response.statusCode !== 200) return reject(new Error(`HTTP ${response && response.statusCode}`));

            const $ = cheerio.load(html);
            const $content = $("div.entry-content");

            const meta = {
                url: URL,
                slug: clean((URL.split("/").filter(Boolean).pop() || "")),
                title: clean($("h1.entry-title").first().text()),
                description: clean($('meta[name="description"]').attr("content")),
                category: clean($('meta[property="category"]').attr("content") || $("article").attr("data-category") || ""),
                publishedAt: clean($('meta[property="article:published_time"]').attr("content")),
                updatedAt: clean($('meta[property="article:modified_time"]').attr("content")),
                updatedText: clean($("p.lastupdated").first().text()),
                author: {
                    name: clean($("p.lastupdated .fn a, .entry-meta .vcard .fn a").first().text()) || clean($("p.lastupdated .fn, .entry-meta .vcard .fn").first().text()),
                    profileUrl: $("p.lastupdated .fn a, .entry-meta .vcard .fn a").first().attr("href") || ""
                },
                tags: [],
                seo: {
                    keywords: clean($('meta[name="keywords"]').attr("content") || "").split(",").map((s) => clean(s)).filter(Boolean),
                    canonical: $('link[rel="canonical"]').attr("href") || "",
                    ogImage: {
                        url: $('meta[property="og:image"]').attr("content") || "",
                        width: parseInt($('meta[property="og:image:width"]').attr("content") || "0", 10) || undefined,
                        height: parseInt($('meta[property="og:image:height"]').attr("content") || "0", 10) || undefined,
                        alt: $('meta[property="og:image:alt"]').attr("content") || undefined
                    }
                }
            };

            const footerTags = [];
            $("footer.entry-meta, .copyright-bar").find("a").each((i, a) => {
                const t = clean($(a).text());
                if (t) footerTags.push(t);
            });
            meta.tags = Array.from(new Set([...(meta.tags || []), ...footerTags]));

            // Overview table
            let overviewTable = null;
            const h2Overview = $content.find("h2").filter((i, el) => /overview/i.test($(el).text())).first();
            if (h2Overview.length) overviewTable = h2Overview.nextAll("div.table-container").find("table").first();
            if (!overviewTable || !overviewTable.length) overviewTable = $content.find("div.table-container table.scrollable-table").first();
            if (!overviewTable || !overviewTable.length) overviewTable = $content.find("table").first();
            const overviewRaw = overviewTable && overviewTable.length ? extractTable($, overviewTable) : { headers: [], rows: [] };
            const overview = { keyValues: tableToKV(overviewRaw), tableRaw: overviewRaw };

            // Vacancy
            const vacancy = { heading: "", table: { headers: [], rows: [] }, computed: { totalVacancies: 0 } };
            const h2Vac = $content.find("h2").filter((i, el) => /vacancy/i.test($(el).text())).first();
            if (h2Vac.length) {
                vacancy.heading = clean(h2Vac.text());
                const vacTable = h2Vac.nextAll("div.table-container").find("table").first().length
                    ? h2Vac.nextAll("div.table-container").find("table").first()
                    : h2Vac.nextAll("table").first();
                if (vacTable && vacTable.length) {
                    vacancy.table = extractTable($, vacTable);
                    const colIndex = vacancy.table.headers.findIndex((h) => /total/i.test(h)) > -1
                        ? vacancy.table.headers.findIndex((h) => /total/i.test(h))
                        : 1;
                    vacancy.computed.totalVacancies = sumNumbers(vacancy.table.rows.map((r) => r[colIndex]));
                }
            }

            // Eligibility
            const eligibility = { qualifications: [], ageLimit: { asOn: "", min: undefined, max: undefined, relaxationsText: "" } };
            const h2Elig = $content.find("h2").filter((i, el) => /eligibility/i.test($(el).text())).first();
            if (h2Elig.length) {
                const lis = [];
                let node = h2Elig.next();
                while (node.length && !node.is("h2")) {
                    if (node.is("ul")) node.find("li").each((i, li) => { const t = clean($(li).text()); if (t) lis.push(t); });
                    node = node.next();
                }
                eligibility.qualifications = lis.filter((t) => /:/.test(t) || /assistant|engineer|manager|clerk|typist|trainee|technician|officer/i.test(t));
            }
            const h2Age = $content.find("h2").filter((i, el) => /age\s*limit/i.test($(el).text())).first();
            if (h2Age.length) {
                const items = [];
                let n = h2Age.next();
                while (n.length && !n.is("h2")) {
                    if (n.is("ul")) n.find("li").each((i, li) => items.push(clean($(li).text())));
                    else if (n.is("p")) { const t = clean(n.text()); if (t) items.push(t); }
                    n = n.next();
                }
                const asOn = items.find((t) => /as on/i.test(t));
                eligibility.ageLimit.asOn = asOn ? clean(asOn).replace(/^.*?:\s*/, "") : "";
                const min = items.find((t) => /minimum/i.test(t));
                const max = items.find((t) => /maximum/i.test(t));
                const extractNum = (s) => parseInt((s || "").replace(/[^\d]/g, ""), 10) || undefined;
                eligibility.ageLimit.min = extractNum(min);
                eligibility.ageLimit.max = extractNum(max);
                const relax = items.find((t) => /relaxation/i.test(t));
                eligibility.ageLimit.relaxationsText = relax || "";
            }

            // Application
            const application = { fees: [], importantDates: [], selectionProcess: [], howToApply: [] };
            const captureListUnder = (re) => {
                const h = $content.find("h2").filter((i, el) => re.test($(el).text())).first();
                const out = [];
                if (!h.length) return out;
                let node = h.next();
                while (node.length && !node.is("h2")) {
                    if (node.is("ul")) node.find("li").each((i, li) => { const t = clean($(li).text()); if (t) out.push(t); });
                    else if (node.is("p")) { const t = clean(node.text()); if (t) out.push(t); }
                    node = node.next();
                }
                return out;
            };
            application.fees = captureListUnder(/application\s*fee/i);
            const impDatesRaw = captureListUnder(/important\s*dates/i);
            application.importantDates = impDatesRaw.map((t) => {
                const parts = t.split(":");
                const label = clean(parts[0] || t);
                const dateText = clean(parts.slice(1).join(":")) || t;
                return { label, dateText, dateISO: toISO(dateText) };
            });
            application.selectionProcess = captureListUnder(/selection\s*process/i);
            application.howToApply = captureListUnder(/how\s*to\s*apply/i);

            // Links
            const links = { applyOnline: "", notificationPdf: "", officialWebsite: "", alsoRead: [], attachments: [] };
            $content.find("a").each((i, a) => {
                const label = clean($(a).text());
                const href = $(a).attr("href") || "";
                if (!href) return;
                if (/apply\s*online/i.test(label) && !links.applyOnline) links.applyOnline = href;
                if (/official\s*notification/i.test(label) && !links.notificationPdf) links.notificationPdf = href;
                if (/official\s*website/i.test(label) && !links.officialWebsite) links.officialWebsite = href;
            });
            const alsoRead = [];
            $content.find(".alsoread .alsoreadlink a").each((i, a) => {
                alsoRead.push({ title: clean($(a).text()), href: $(a).attr("href") || "" });
            });
            links.alsoRead = alsoRead;
            const attachments = [];
            $content.find('a[href$=".pdf"]').each((i, a) => {
                const label = clean($(a).text()) || "attachment";
                attachments.push({ label, href: $(a).attr("href"), type: "pdf" });
            });
            links.attachments = attachments;

            // QnA
            const qna = extractQnA($, $content);

            // Raw blocks
            const raw = { tables: [], lists: [], paragraphs: [] };
            $content.find("h2").each((i, h2) => {
                const heading = clean($(h2).text());
                let n = $(h2).next();
                while (n.length && !n.is("h2")) {
                    if (n.is("div.table-container") || n.is("table") || n.find("table").length) {
                        const ts = n.is("table") ? [n] : n.find("table").toArray().map((t) => $(t));
                        ts.forEach(($t) => raw.tables.push({ heading, ...extractTable($, $t) }));
                    } else if (n.is("ul")) {
                        const items = [];
                        n.find("li").each((ii, li) => items.push(clean($(li).text())));
                        if (items.length) raw.lists.push({ heading, items });
                    } else if (n.is("p")) {
                        const t = clean(n.text());
                        if (t) raw.paragraphs.push(t);
                    }
                    n = n.next();
                }
            });

            resolve({ meta, overview, vacancy, eligibility, application, links, qna, raw });
        });
    });
}

module.exports.scrapeArticlePage = scrapeArticlePage;