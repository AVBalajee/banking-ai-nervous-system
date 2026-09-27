// Knowledge graph schema for the Economic Nervous System
// Run via: cypher-shell -u neo4j -p nervous_system_pw -f init.cypher
// or paste into the Neo4j Browser at http://localhost:7474

// --- Constraints ---
CREATE CONSTRAINT event_id IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT segment_name IF NOT EXISTS FOR (s:CustomerSegment) REQUIRE s.name IS UNIQUE;
CREATE CONSTRAINT industry_name IF NOT EXISTS FOR (i:Industry) REQUIRE i.name IS UNIQUE;
CREATE CONSTRAINT location_name IF NOT EXISTS FOR (l:Location) REQUIRE l.name IS UNIQUE;

// --- Seed reference nodes ---
MERGE (:Industry {name: 'IT'});
MERGE (:Industry {name: 'Manufacturing'});
MERGE (:Industry {name: 'Real Estate'});
MERGE (:Industry {name: 'Agriculture'});
MERGE (:Industry {name: 'Energy'});
MERGE (:Industry {name: 'Banking/Finance'});

MERGE (:CustomerSegment {name: 'Salaried - Tech'});
MERGE (:CustomerSegment {name: 'Personal Loan Holders'});
MERGE (:CustomerSegment {name: 'Credit Card Customers'});
MERGE (:CustomerSegment {name: 'Home Loan Customers'});
MERGE (:CustomerSegment {name: 'Business Loan Customers'});
MERGE (:CustomerSegment {name: 'Crop Loan Holders'});
MERGE (:CustomerSegment {name: 'MSME Loan Holders'});

MERGE (:Location {name: 'Bengaluru'});
MERGE (:Location {name: 'Mumbai'});
MERGE (:Location {name: 'Delhi'});
MERGE (:Location {name: 'Pan-India'});

// --- Example: how an event would be linked once ingested ---
// MATCH (i:Industry {name:'IT'}), (l:Location {name:'Bengaluru'}), (s:CustomerSegment {name:'Salaried - Tech'})
// CREATE (e:Event {id: randomUUID(), type:'Mass Layoffs', severity:'High', createdAt: datetime()})
// CREATE (e)-[:OCCURRED_IN]->(l)
// CREATE (e)-[:AFFECTS_INDUSTRY]->(i)
// CREATE (e)-[:IMPACTS_SEGMENT]->(s);
