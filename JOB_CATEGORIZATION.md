# Job Type Categorization Guide

## Overview

This document provides a comprehensive guide on how to distinguish and categorize different types of jobs from the latest notifications endpoint (`/freejobalert/`). The latest notifications endpoint returns a simple structure with only `title` and `link` fields, making it necessary to analyze both URL patterns and title keywords to accurately categorize job notifications.

## Table of Contents

1. [Understanding the Latest Notifications Structure](#understanding-the-latest-notifications-structure)
2. [Categorization Methods](#categorization-methods)
3. [URL Pattern Analysis](#url-pattern-analysis)
4. [Title Keyword Analysis](#title-keyword-analysis)
5. [Complete Implementation Guide](#complete-implementation-guide)
6. [Edge Cases and Considerations](#edge-cases-and-considerations)
7. [Examples and Use Cases](#examples-and-use-cases)

---

## Understanding the Latest Notifications Structure

### Endpoint
```
GET /freejobalert/
```

### Response Format
The latest notifications endpoint returns an array of objects, each containing:
- `title`: The job notification title (string)
- `link`: The URL to the full job notification (string)

### Example Response
```json
[
  {
    "title": "RRB NTPC Graduate Recruitment 2026 - Apply Online for 5,810 Posts",
    "link": "http://www.freejobalert.com/articles/rrb-ntpc-graduate-reruitment-2026-apply-online-for-5-810-station-master-clerk-and-more-posts-3027289"
  },
  {
    "title": "SBI PO 2025 Notification - Apply Online for 2000 Probationary Officer Posts",
    "link": "http://www.freejobalert.com/bank-jobs/sbi-po-2025/"
  },
  {
    "title": "NVS 370 PGT, TGT & FCSA Notification",
    "link": "http://www.freejobalert.com/navodaya-vidyalaya/1785/"
  }
]
```

### Why Categorization is Needed

Since the latest notifications endpoint returns a mixed list of all job types without explicit categorization, you need to analyze the `title` and `link` fields to determine the job category. This is essential for:
- Filtering jobs by type
- Routing users to appropriate job listings
- Building category-specific features
- Analytics and reporting

---

## Categorization Methods

There are two primary methods for categorizing jobs:

1. **URL Pattern Matching**: More reliable, based on the URL structure
2. **Title Keyword Matching**: Secondary method, based on keywords in the job title

**Best Practice**: Use URL pattern matching as the primary method, with title keyword matching as a fallback or for additional confidence.

---

## URL Pattern Analysis

### Railway Jobs

#### URL Patterns
- `/railway-jobs/` - Main railway jobs category page
- `/rrb-` - Railway Recruitment Board specific pages
- `/railway` - Any URL containing "railway"
- `/rrc-` - Railway Recruitment Cell pages
- `/articles/` with railway-related slugs

#### Examples
```
http://www.freejobalert.com/railway-jobs/
http://www.freejobalert.com/rrb-ntpc/
http://www.freejobalert.com/rrb-group-d/
http://www.freejobalert.com/rrc-group-d/
http://www.freejobalert.com/articles/rrb-ntpc-graduate-reruitment-2026-...
```

#### Pattern Matching Regex
```javascript
/railway|rrb|rrc/i
```

---

### Bank Jobs

#### URL Patterns
- `/bank-jobs/` - Main banking jobs category page
- `/bank` - Any URL containing "bank"
- Bank-specific slugs like `/sbi-`, `/ibps-`, `/rbi-`, etc.

#### Examples
```
http://www.freejobalert.com/bank-jobs/
http://www.freejobalert.com/sbi-po-2025/
http://www.freejobalert.com/ibps-po/
http://www.freejobalert.com/rbi-grade-b/
http://www.freejobalert.com/bank-exam/
```

#### Pattern Matching Regex
```javascript
/bank-jobs|bank|sbi|ibps|rbi|bank-exam/i
```

---

### Teaching Jobs

#### URL Patterns
- `/teaching-faculty-jobs/` - Main teaching jobs category page
- `/teaching` - URLs containing "teaching"
- `/faculty` - URLs containing "faculty"
- Educational institution names like `/navodaya-vidyalaya/`, `/kvs/`, `/nvs/`

#### Examples
```
http://www.freejobalert.com/teaching-faculty-jobs/
http://www.freejobalert.com/navodaya-vidyalaya/1785/
http://www.freejobalert.com/kvs-teacher-recruitment/
http://www.freejobalert.com/nvs-pgt-tgt/
http://www.freejobalert.com/teaching-jobs/
```

#### Pattern Matching Regex
```javascript
/teaching|faculty|navodaya|kvs|nvs|vidyalaya|school-teacher|college-teacher/i
```

---

### Engineering Jobs

#### URL Patterns
- `/engineering-jobs/` - Main engineering jobs category page
- `/engineering` - Any URL containing "engineering"
- Engineering-related terms like `/technical/`, `/engineer/`

#### Examples
```
http://www.freejobalert.com/engineering-jobs/
http://www.freejobalert.com/engineering-jobs/mechanical/
http://www.freejobalert.com/technical-jobs/
http://www.freejobalert.com/engineer-recruitment/
```

#### Pattern Matching Regex
```javascript
/engineering|engineer|technical-jobs/i
```

---

### Defence/Police Jobs

#### URL Patterns
- `/police-defence-jobs/` - Main defence/police jobs category page
- `/defence` - URLs containing "defence"
- `/police` - URLs containing "police"
- `/army`, `/navy`, `/air-force`, `/coast-guard` - Specific defence branches
- Force-specific URLs like `/bsf/`, `/crpf/`, `/cisf/`, `/itbp/`, `/ssb/`

#### Examples
```
http://www.freejobalert.com/police-defence-jobs/
http://www.freejobalert.com/indian-army-territorial-army/99486/
http://www.freejobalert.com/afcat/62751/
http://www.freejobalert.com/coast-guard-recruitment/
http://www.freejobalert.com/bsf-constable/
http://www.freejobalert.com/crpf-recruitment/
http://www.freejobalert.com/nda-2025/
```

#### Pattern Matching Regex
```javascript
/police|defence|army|navy|air-force|coast-guard|afcat|bsf|crpf|cisf|itbp|ssb|nda|cds|territorial-army/i
```

---

### Government Jobs (General)

#### URL Patterns
- `/government-jobs/` - Main government jobs category page
- `/gov/` - Government jobs section
- State-specific patterns like `/-government-jobs/` (e.g., `/ap-government-jobs/`)
- PSU and department names

#### Examples
```
http://www.freejobalert.com/government-jobs/
http://www.freejobalert.com/ap-government-jobs/
http://www.freejobalert.com/wb-government-jobs/
http://www.freejobalert.com/ssc-cgl/
http://www.freejobalert.com/upsc-ias/
```

#### Pattern Matching Regex
```javascript
/government-jobs|gov/|ssc|upsc|psu|public-sector/i
```

---

## Title Keyword Analysis

### Railway Jobs Keywords

#### Primary Keywords
- `RRB` - Railway Recruitment Board
- `Railway` - General railway term
- `RRC` - Railway Recruitment Cell
- `NTPC` - Non-Technical Popular Categories
- `Group D` - Railway Group D posts
- `ALP` - Assistant Loco Pilot
- `JE` - Junior Engineer

#### Secondary Keywords
- `Station Master`
- `Traffic Assistant`
- `Railway Recruitment`
- `Railway Jobs`
- `RRB NTPC`
- `RRB Group D`
- `Railway Clerk`
- `Railway Technician`

#### Keyword Matching Regex
```javascript
/\b(rrb|railway|rrc|ntpc|group\s*d|alp|je|station\s*master|traffic\s*assistant|railway\s*recruitment|railway\s*jobs|railway\s*clerk|railway\s*technician)\b/i
```

---

### Bank Jobs Keywords

#### Primary Keywords
- `Bank` - General banking term
- `SBI` - State Bank of India
- `IBPS` - Institute of Banking Personnel Selection
- `RBI` - Reserve Bank of India
- `PO` - Probationary Officer
- `Clerk` - Bank Clerk
- `SO` - Specialist Officer

#### Secondary Keywords
- `Banking`
- `Bank Exam`
- `Banking Jobs`
- `Bank Recruitment`
- `Bank PO`
- `Bank Clerk`
- `Bank SO`
- `Bank Manager`
- `Bank Officer`

#### Keyword Matching Regex
```javascript
/\b(bank|sbi|ibps|rbi|po\b|clerk|so\b|banking|bank\s*exam|bank\s*recruitment|bank\s*po|bank\s*clerk|bank\s*so|bank\s*manager|bank\s*officer)\b/i
```

---

### Teaching Jobs Keywords

#### Primary Keywords
- `PGT` - Post Graduate Teacher
- `TGT` - Trained Graduate Teacher
- `Teacher` - General teaching term
- `Teaching` - Teaching profession
- `Faculty` - Academic faculty
- `Lecturer` - College/University lecturer
- `Professor` - University professor

#### Secondary Keywords
- `Principal`
- `Vidyalaya` - School (Hindi term)
- `School`
- `College`
- `University`
- `Education`
- `Academic`
- `NVS` - Navodaya Vidyalaya Samiti
- `KVS` - Kendriya Vidyalaya Sangathan
- `TET` - Teacher Eligibility Test
- `CTET` - Central Teacher Eligibility Test

#### Keyword Matching Regex
```javascript
/\b(pgt|tgt|teacher|teaching|faculty|lecturer|professor|principal|vidyalaya|school|college|university|education|academic|nvs|kvs|tet|ctet)\b/i
```

---

### Engineering Jobs Keywords

#### Primary Keywords
- `Engineer` - General engineering term
- `Engineering` - Engineering field
- `B.Tech` - Bachelor of Technology
- `M.Tech` - Master of Technology
- `Diploma` - Engineering diploma
- `Technical` - Technical positions

#### Secondary Keywords
- `Technician`
- `ITI` - Industrial Training Institute
- `Mechanical Engineer`
- `Electrical Engineer`
- `Civil Engineer`
- `Computer Engineer`
- `Software Engineer`
- `Technical Officer`
- `Engineering Jobs`

#### Keyword Matching Regex
```javascript
/\b(engineer|engineering|b\.tech|m\.tech|diploma|technical|technician|iti|mechanical\s*engineer|electrical\s*engineer|civil\s*engineer|computer\s*engineer|software\s*engineer|technical\s*officer|engineering\s*jobs)\b/i
```

---

### Defence/Police Jobs Keywords

#### Primary Keywords
- `Army` - Indian Army
- `Navy` - Indian Navy
- `Air Force` - Indian Air Force
- `AFCAT` - Air Force Common Admission Test
- `CDS` - Combined Defence Services
- `NDA` - National Defence Academy
- `Police` - Police force
- `Defence` - Defence services
- `BSF` - Border Security Force
- `CRPF` - Central Reserve Police Force
- `CISF` - Central Industrial Security Force
- `ITBP` - Indo-Tibetan Border Police
- `SSB` - Service Selection Board
- `Coast Guard` - Indian Coast Guard
- `Territorial Army` - Territorial Army

#### Secondary Keywords
- `Assistant Commandant`
- `Constable`
- `Sub Inspector`
- `Defence Jobs`
- `Police Recruitment`
- `Army Recruitment`
- `Navy Recruitment`
- `Air Force Recruitment`
- `Defence Exam`

#### Keyword Matching Regex
```javascript
/\b(army|navy|air\s*force|afcat|cds|nda|police|defence|bsf|crpf|cisf|itbp|ssb|coast\s*guard|territorial\s*army|assistant\s*commandant|constable|sub\s*inspector|defence\s*jobs|police\s*recruitment|army\s*recruitment|navy\s*recruitment|air\s*force\s*recruitment|defence\s*exam)\b/i
```

---

### Government Jobs (General) Keywords

#### Primary Keywords
- `SSC` - Staff Selection Commission
- `UPSC` - Union Public Service Commission
- `Government` - Government sector
- `Govt` - Abbreviation for government
- `PSU` - Public Sector Undertaking
- `Public Sector` - Public sector jobs

#### Secondary Keywords
- `State`
- `Central`
- `Ministry`
- `Department`
- `Government Jobs`
- `Govt Jobs`
- `SSC CGL`
- `SSC CHSL`
- `UPSC IAS`
- `UPSC IES`

#### Keyword Matching Regex
```javascript
/\b(ssc|upsc|government|govt|psu|public\s*sector|state|central|ministry|department|government\s*jobs|govt\s*jobs|ssc\s*cgl|ssc\s*chsl|upsc\s*ias|upsc\s*ies)\b/i
```

---

## Complete Implementation Guide

### Basic Categorization Function

Here's a complete implementation of a job categorization function:

```javascript
/**
 * Categorizes a job notification based on URL patterns and title keywords
 * @param {Object} notification - The notification object with title and link
 * @returns {string} - The job category: 'railway', 'bank', 'teaching', 'engineering', 'defence', 'government', or 'other'
 */
function categorizeJob(notification) {
  const { title, link } = notification;
  
  if (!title || !link) {
    return 'other';
  }
  
  const titleLower = title.toLowerCase();
  const linkLower = link.toLowerCase();
  
  // Railway Jobs - Check URL first, then title
  if (
    linkLower.includes('/railway') || 
    linkLower.includes('/rrb') || 
    linkLower.includes('/rrc') ||
    titleLower.includes('rrb') || 
    titleLower.includes('railway') || 
    titleLower.includes('ntpc') || 
    titleLower.includes('station master') ||
    titleLower.includes('rrc') ||
    titleLower.includes('group d') ||
    titleLower.includes('railway recruitment')
  ) {
    return 'railway';
  }
  
  // Bank Jobs
  if (
    linkLower.includes('/bank') || 
    linkLower.includes('/sbi') ||
    linkLower.includes('/ibps') ||
    linkLower.includes('/rbi') ||
    titleLower.includes('bank') || 
    titleLower.includes('ibps') || 
    titleLower.includes('sbi') || 
    titleLower.includes('rbi') || 
    (titleLower.includes('po ') && !titleLower.includes('police')) || 
    (titleLower.includes(' clerk') && !titleLower.includes('police'))
  ) {
    return 'bank';
  }
  
  // Teaching Jobs
  if (
    linkLower.includes('/teaching') || 
    linkLower.includes('/faculty') ||
    linkLower.includes('/navodaya') ||
    linkLower.includes('/kvs') ||
    linkLower.includes('/nvs') ||
    linkLower.includes('/vidyalaya') ||
    titleLower.includes('pgt') || 
    titleLower.includes('tgt') || 
    titleLower.includes('teacher') || 
    titleLower.includes('faculty') ||
    titleLower.includes('lecturer') || 
    titleLower.includes('vidyalaya') ||
    titleLower.includes('principal') ||
    titleLower.includes('teaching')
  ) {
    return 'teaching';
  }
  
  // Engineering Jobs
  if (
    linkLower.includes('/engineering') || 
    linkLower.includes('/technical') ||
    titleLower.includes('engineer') || 
    titleLower.includes('engineering') ||
    titleLower.includes('b.tech') ||
    titleLower.includes('m.tech') || 
    titleLower.includes('technical') ||
    titleLower.includes('technician') ||
    titleLower.includes('iti')
  ) {
    return 'engineering';
  }
  
  // Defence/Police Jobs
  if (
    linkLower.includes('/police') || 
    linkLower.includes('/defence') ||
    linkLower.includes('/army') || 
    linkLower.includes('/navy') ||
    linkLower.includes('/air-force') || 
    linkLower.includes('/coast-guard') ||
    linkLower.includes('/bsf') ||
    linkLower.includes('/crpf') ||
    linkLower.includes('/afcat') ||
    linkLower.includes('/nda') ||
    titleLower.includes('army') || 
    titleLower.includes('navy') ||
    titleLower.includes('air force') || 
    titleLower.includes('afcat') ||
    titleLower.includes('police') || 
    titleLower.includes('defence') ||
    titleLower.includes('coast guard') || 
    titleLower.includes('bsf') ||
    titleLower.includes('crpf') ||
    titleLower.includes('nda') ||
    titleLower.includes('cds') ||
    titleLower.includes('territorial army') ||
    titleLower.includes('assistant commandant') ||
    titleLower.includes('constable') ||
    titleLower.includes('sub inspector')
  ) {
    return 'defence';
  }
  
  // Government Jobs (General)
  if (
    linkLower.includes('/government') || 
    linkLower.includes('/gov/') ||
    linkLower.includes('-government-jobs') ||
    titleLower.includes('ssc') || 
    titleLower.includes('upsc') ||
    titleLower.includes('government') || 
    titleLower.includes('govt') ||
    titleLower.includes('psu') ||
    titleLower.includes('public sector')
  ) {
    return 'government';
  }
  
  return 'other';
}
```

### Advanced Categorization with Confidence Scoring

For more sophisticated categorization, you can implement a confidence scoring system:

```javascript
/**
 * Categorizes a job with confidence scores for each category
 * @param {Object} notification - The notification object with title and link
 * @returns {Object} - Object with category and confidence score
 */
function categorizeJobWithConfidence(notification) {
  const { title, link } = notification;
  
  if (!title || !link) {
    return { category: 'other', confidence: 0 };
  }
  
  const titleLower = title.toLowerCase();
  const linkLower = link.toLowerCase();
  
  const categories = {
    railway: 0,
    bank: 0,
    teaching: 0,
    engineering: 0,
    defence: 0,
    government: 0,
    other: 0
  };
  
  // Railway scoring
  if (linkLower.includes('/railway') || linkLower.includes('/rrb') || linkLower.includes('/rrc')) {
    categories.railway += 10;
  }
  if (titleLower.includes('rrb') || titleLower.includes('railway') || titleLower.includes('ntpc')) {
    categories.railway += 5;
  }
  if (titleLower.includes('station master') || titleLower.includes('rrc') || titleLower.includes('group d')) {
    categories.railway += 3;
  }
  
  // Bank scoring
  if (linkLower.includes('/bank') || linkLower.includes('/sbi') || linkLower.includes('/ibps')) {
    categories.bank += 10;
  }
  if (titleLower.includes('bank') || titleLower.includes('sbi') || titleLower.includes('ibps')) {
    categories.bank += 5;
  }
  if ((titleLower.includes('po ') && !titleLower.includes('police')) || titleLower.includes(' clerk')) {
    categories.bank += 3;
  }
  
  // Teaching scoring
  if (linkLower.includes('/teaching') || linkLower.includes('/faculty') || linkLower.includes('/navodaya')) {
    categories.teaching += 10;
  }
  if (titleLower.includes('pgt') || titleLower.includes('tgt') || titleLower.includes('teacher')) {
    categories.teaching += 5;
  }
  if (titleLower.includes('faculty') || titleLower.includes('lecturer') || titleLower.includes('vidyalaya')) {
    categories.teaching += 3;
  }
  
  // Engineering scoring
  if (linkLower.includes('/engineering') || linkLower.includes('/technical')) {
    categories.engineering += 10;
  }
  if (titleLower.includes('engineer') || titleLower.includes('engineering')) {
    categories.engineering += 5;
  }
  if (titleLower.includes('b.tech') || titleLower.includes('m.tech') || titleLower.includes('technical')) {
    categories.engineering += 3;
  }
  
  // Defence scoring
  if (linkLower.includes('/police') || linkLower.includes('/defence') || linkLower.includes('/army')) {
    categories.defence += 10;
  }
  if (titleLower.includes('army') || titleLower.includes('navy') || titleLower.includes('air force')) {
    categories.defence += 5;
  }
  if (titleLower.includes('police') || titleLower.includes('defence') || titleLower.includes('afcat')) {
    categories.defence += 3;
  }
  
  // Government scoring
  if (linkLower.includes('/government') || linkLower.includes('/gov/')) {
    categories.government += 10;
  }
  if (titleLower.includes('ssc') || titleLower.includes('upsc') || titleLower.includes('government')) {
    categories.government += 5;
  }
  
  // Find category with highest score
  const maxScore = Math.max(...Object.values(categories));
  const category = Object.keys(categories).find(key => categories[key] === maxScore);
  
  // Calculate confidence (0-1 scale)
  const totalScore = Object.values(categories).reduce((sum, score) => sum + score, 0);
  const confidence = totalScore > 0 ? maxScore / totalScore : 0;
  
  return {
    category: maxScore > 0 ? category : 'other',
    confidence: confidence,
    scores: categories
  };
}
```

### Batch Categorization

For processing multiple notifications at once:

```javascript
/**
 * Categorizes multiple job notifications
 * @param {Array} notifications - Array of notification objects
 * @returns {Object} - Object with notifications grouped by category
 */
function categorizeJobs(notifications) {
  const categorized = {
    railway: [],
    bank: [],
    teaching: [],
    engineering: [],
    defence: [],
    government: [],
    other: []
  };
  
  notifications.forEach(notification => {
    const category = categorizeJob(notification);
    categorized[category].push(notification);
  });
  
  return categorized;
}
```

### Using Regular Expressions for Pattern Matching

For more robust pattern matching, you can use regular expressions:

```javascript
const URL_PATTERNS = {
  railway: /\/railway|\/rrb|\/rrc/i,
  bank: /\/bank|\/sbi|\/ibps|\/rbi/i,
  teaching: /\/teaching|\/faculty|\/navodaya|\/kvs|\/nvs/i,
  engineering: /\/engineering|\/technical/i,
  defence: /\/police|\/defence|\/army|\/navy|\/air-force|\/coast-guard|\/bsf|\/crpf|\/afcat|\/nda/i,
  government: /\/government|\/gov\/|government-jobs/i
};

const TITLE_KEYWORDS = {
  railway: /\b(rrb|railway|rrc|ntpc|group\s*d|alp|je|station\s*master|traffic\s*assistant)\b/i,
  bank: /\b(bank|sbi|ibps|rbi|po\b|clerk|so\b|banking)\b/i,
  teaching: /\b(pgt|tgt|teacher|teaching|faculty|lecturer|professor|vidyalaya)\b/i,
  engineering: /\b(engineer|engineering|b\.tech|m\.tech|diploma|technical)\b/i,
  defence: /\b(army|navy|air\s*force|afcat|cds|nda|police|defence|bsf|crpf|coast\s*guard)\b/i,
  government: /\b(ssc|upsc|government|govt|psu|public\s*sector)\b/i
};

function categorizeJobWithRegex(notification) {
  const { title, link } = notification;
  
  if (!title || !link) {
    return 'other';
  }
  
  // Check URL patterns first (more reliable)
  for (const [category, pattern] of Object.entries(URL_PATTERNS)) {
    if (pattern.test(link)) {
      return category;
    }
  }
  
  // Check title keywords as fallback
  for (const [category, pattern] of Object.entries(TITLE_KEYWORDS)) {
    if (pattern.test(title)) {
      return category;
    }
  }
  
  return 'other';
}
```

---

## Edge Cases and Considerations

### 1. Multiple Category Matches

Some notifications may match multiple categories. For example:
- "Railway Bank Clerk" - Could match both railway and bank
- "Police Engineering Jobs" - Could match both defence and engineering

**Solution**: Implement priority-based matching. Check categories in order of specificity:
1. Railway (very specific)
2. Bank (very specific)
3. Defence/Police (specific)
4. Teaching (specific)
5. Engineering (specific)
6. Government (general)

### 2. Ambiguous Keywords

Some keywords can be ambiguous:
- `PO` can mean "Probationary Officer" (bank) or "Police Officer" (defence)
- `Clerk` can mean "Bank Clerk" or "Railway Clerk"
- `Officer` can appear in multiple categories

**Solution**: Use context-aware matching:
- Check for "police" or "bank" context when matching "PO"
- Check URL patterns first before title keywords
- Use word boundaries in regex to avoid partial matches

### 3. Case Sensitivity

Job titles and URLs may have inconsistent casing.

**Solution**: Always convert to lowercase before matching:
```javascript
const titleLower = title.toLowerCase();
const linkLower = link.toLowerCase();
```

### 4. URL Variations

URLs may have variations:
- `http://` vs `https://`
- `www.` prefix or not
- Trailing slashes
- URL parameters

**Solution**: Normalize URLs before matching:
```javascript
function normalizeUrl(url) {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .split('?')[0]; // Remove query parameters
}
```

### 5. Missing or Invalid Data

Some notifications may have missing or invalid `title` or `link` fields.

**Solution**: Add validation:
```javascript
function isValidNotification(notification) {
  return (
    notification &&
    typeof notification.title === 'string' &&
    typeof notification.link === 'string' &&
    notification.title.trim().length > 0 &&
    notification.link.trim().length > 0
  );
}
```

### 6. New Job Categories

The website may add new job categories that aren't covered.

**Solution**: 
- Always have an "other" category as fallback
- Log uncategorized jobs for analysis
- Periodically review and update patterns

---

## Examples and Use Cases

### Example 1: Basic Categorization

```javascript
const notification = {
  title: "RRB NTPC Graduate Recruitment 2026 - Apply Online for 5,810 Posts",
  link: "http://www.freejobalert.com/articles/rrb-ntpc-graduate-reruitment-2026-apply-online-for-5-810-station-master-clerk-and-more-posts-3027289"
};

const category = categorizeJob(notification);
console.log(category); // Output: "railway"
```

### Example 2: Filtering by Category

```javascript
// Get all notifications
const notifications = await fetch('/freejobalert/').then(r => r.json());

// Filter for railway jobs only
const railwayJobs = notifications.filter(notif => 
  categorizeJob(notif) === 'railway'
);

console.log(`Found ${railwayJobs.length} railway jobs`);
```

### Example 3: Grouping by Category

```javascript
const notifications = await fetch('/freejobalert/').then(r => r.json());
const grouped = categorizeJobs(notifications);

console.log('Railway Jobs:', grouped.railway.length);
console.log('Bank Jobs:', grouped.bank.length);
console.log('Teaching Jobs:', grouped.teaching.length);
// ... etc
```

### Example 4: Category Statistics

```javascript
const notifications = await fetch('/freejobalert/').then(r => r.json());
const stats = {};

notifications.forEach(notif => {
  const category = categorizeJob(notif);
  stats[category] = (stats[category] || 0) + 1;
});

console.log('Job Category Distribution:', stats);
// Output: { railway: 15, bank: 8, teaching: 12, ... }
```

### Example 5: Confidence-Based Filtering

```javascript
const notifications = await fetch('/freejobalert/').then(r => r.json());

// Only include jobs with high confidence (>0.7)
const highConfidenceJobs = notifications
  .map(notif => ({
    ...notif,
    categorization: categorizeJobWithConfidence(notif)
  }))
  .filter(item => item.categorization.confidence > 0.7);

console.log(`Found ${highConfidenceJobs.length} high-confidence categorizations`);
```

### Example 6: Real-time Categorization API

```javascript
// Express.js route example
app.get('/freejobalert/categorized', async (req, res) => {
  try {
    const notifications = await latestNotifications('http://www.freejobalert.com/');
    const categorized = categorizeJobs(notifications);
    res.json(categorized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Testing Your Categorization

### Test Cases

Create test cases to validate your categorization logic:

```javascript
const testCases = [
  {
    title: "RRB NTPC Graduate Recruitment 2026",
    link: "http://www.freejobalert.com/rrb-ntpc/",
    expected: "railway"
  },
  {
    title: "SBI PO 2025 Notification",
    link: "http://www.freejobalert.com/bank-jobs/sbi-po-2025/",
    expected: "bank"
  },
  {
    title: "NVS 370 PGT, TGT & FCSA Notification",
    link: "http://www.freejobalert.com/navodaya-vidyalaya/1785/",
    expected: "teaching"
  },
  {
    title: "Indian Air Force AFCAT (02/2019) Online Form",
    link: "http://www.freejobalert.com/afcat/62751/",
    expected: "defence"
  },
  {
    title: "SSC CGL 2025 Notification",
    link: "http://www.freejobalert.com/government-jobs/ssc-cgl/",
    expected: "government"
  }
];

testCases.forEach(testCase => {
  const result = categorizeJob(testCase);
  console.log(
    `Test: "${testCase.title}" - Expected: ${testCase.expected}, Got: ${result} - ${result === testCase.expected ? 'PASS' : 'FAIL'}`
  );
});
```

---

## Best Practices

1. **URL First, Title Second**: URL patterns are more reliable than title keywords
2. **Case Insensitive**: Always use case-insensitive matching
3. **Word Boundaries**: Use word boundaries in regex to avoid partial matches
4. **Priority Order**: Check more specific categories before general ones
5. **Fallback Category**: Always have an "other" category for uncategorized jobs
6. **Logging**: Log edge cases and uncategorized jobs for continuous improvement
7. **Regular Updates**: Periodically review and update patterns as the website evolves
8. **Testing**: Maintain a test suite with known examples

---

## Conclusion

By combining URL pattern analysis and title keyword matching, you can accurately categorize job notifications from the latest notifications endpoint. The implementation provided in this guide offers a robust foundation that can be extended based on your specific needs.

Remember to:
- Test your categorization logic with real data
- Monitor for edge cases and false positives
- Update patterns as the source website evolves
- Consider implementing confidence scoring for better accuracy

---

## Additional Resources

- [FreeJobAlert.com](http://www.freejobalert.com/) - Source website
- API Documentation: See main README.md for endpoint details
- Regular Expression Guide: [MDN RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)

---

**Last Updated**: 2025
**Version**: 1.0

