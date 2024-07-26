const router = require('express').Router()

const landingPage = require('../controllers/landingPage')
const conformance = require('../controllers/conformance')
const collections = require('../controllers/collections')
const collection  = require('../controllers/collection')
const items       = require('../controllers/items')
const item        = require('../controllers/item')
//
const api         = require('../controllers/api')

// 7.5 The server SHOULD support the HTTP 1.1 method HEAD for all 
// resources that support the method GET.

//    The app.get() function is automatically called for the HTTP HEAD method 
//    in addition to the GET method if app.head() was not called for the path 
//    before app.get().

// Requirement 7 A, Express.js conforms to HTTP 1.1 (no HTTPS for the moment)
// Recommendation 2 A, The server SHOULD support the HTTP 1.1 method HEAD for all resources that support the method GET.

// (OAPIF P1) Requirement 1 A: The server SHALL support the HTTP GET operation at the path /

// OGC API Features Part 1 - Core

// OGC API Common Part 1 - Core
router.get('/.:ext?', landingPage.get)

// (OAPIF P1) Requirement 5 A: The server SHALL support the HTTP GET operation at the path /conformance
router.get('/conformance.:ext?', conformance.get)

// Every OGC Web API is expected to provide a definition that describes the capabilities of the 
// server and which can be used by developers to understand the API, by software clients to connect 
// to the server, or by development tools to support the implementation of servers and clients.
// Requirement 3 and Permission 1
router.get('/api.:ext?', api.get)

// OGC API Common Part 2 - Collections

// (OAPIF P1) Requirement 11 A: The server SHALL support the HTTP GET operation at the path /collections.
// (OAPIC P2) Recommendation 1: An implementation of the /Collections Requirements Class SHOULD also
//            implement the Core Conformance Class defined in OGC API - Common Part 1.
// (OAPIC P2) Recommendation 2: An implementation of the /Collections Requirements Class SHOULD also 
//            implement the Landing Page Conformance Class defined in OGC API - Common Part 1.
// (OAPIC P2) Requirement 2A. The API SHALL support the HTTP GET operation at the path /collections
router.get('/collections.:ext?', collections.get)

// The server SHALL support the HTTP GET operation at the path /collections/{collectionId}.
router.get('/collections/:collectionId.:ext?', collection.get)

// For every feature collection identified in the feature collections response (path /collections), 
// the server SHALL support the HTTP GET operation at the path /collections/{collectionId}/items.
router.get('/collections/:collectionId/items.:ext?', items.get)

// For every feature in a feature collection (path /collections/{collectionId}), 
// the server SHALL support the HTTP GET operation at the path /collections/{collectionId}/items/{featureId}.
router.get('/collections/:collectionId/items/:featureId', item.get)

module.exports = router