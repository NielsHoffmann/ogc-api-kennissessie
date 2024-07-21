const debug = require('debug')('models')
const database = require('../database')

function getContent(serviceUrl, name, collection) {
  var item = {}
  item.type = collection.type
  item.features = collection.features
  item.timestamp = new Date().toISOString()
  item.links = []

  return item
}

function get(serviceUrl, collectionId, query, options, callback) {

  debug(`items`)

  var collections = database.getCollection()
  var collection = collections[collectionId]

  var content = getContent(serviceUrl, collectionId, collection)

  // make local copy to do subtraction (limit, offset, bbox,...) on
  var features = content.features

  if (options)
    features = content.features.slice(options.offset, options.offset + options.limit)

  var _query = query
  if (_query) {
    // (OAPIF P1) Requirement 23A The operation SHALL support a parameter bbox
    // (OAPIF P2) Requirement 6 Each GET request on a 'features' resource SHALL support a query parameter bbox-crs 
    if (_query.bbox) {
      features = features.filter(
        element =>
          element.properties[attributeName] == targetValue
      )
      delete _query.bbox
    }

    // (OAPIF P1) Requirement 17A If features in the feature collection include a feature property that has
    //            a simple value (for example, a string or integer) that is expected to be useful for 
    //            applications using the service to filter the features of the collection based on this property
    if (_query.filter) {
      var parts = _query.filter.split(' and ') // only AND supported (not OR)
      parts.forEach(element => {
        var ao = element.split(' ', 2)
        var attributeName = ao[0]
        var operator = ao[1]
        var tv = ao.join(' ') + ' '
        var targetValue = element.slice(tv.length).replace(/^\W+|\W+$/g, '') // removes ' at start and end

        if (operator != 'eq')
          return callback({ 'httpCode': 400, 'code': `Invalid operator: ${operator}`, 'description': 'Valid operators are: eq' }, undefined);

        features = features.filter(
          element =>
            element.properties[attributeName] == targetValue)

      });

      delete _query.filter
    }

    // Filter parameters as query
    for (var attributeName in _query) {
      // is attribute part of the queryables?
      const hasAttribute = attributeName in collection.queryables;
      if (hasAttribute) {
        var targetValue = _query[attributeName]
        features = features.filter(
          element =>
            element.properties[attributeName] == targetValue)
      }
      else
        return callback({ 'httpCode': 400, 'code': `The following query parameters are rejected: ${attributeName}`, 'description': 'Valid parameters for this request are ' + collection.queryables }, undefined);

    }

  }

  // bring back subtracted list as 'main'
  content.features = features
  var featureCount = content.features.length

  content.numberReturned = featureCount
  content.numberMatched = featureCount

  content.links.push({ href: `${serviceUrl}/collections/${content.title}/items?f=json`, rel: `self`, type: `application/geo+json`, title: `This document` })
  content.links.push({ href: `${serviceUrl}/collections/${content.title}/items?f=html`, rel: `alternate`, type: `text/html`, title: `This document as HTML` })
  if (content.numberReturned != content.numberMatched)
    content.links.push({ href: `${serviceUrl}/collections/${content.title}/items?f=json`, rel: `next`, type: `application/geo+json`, title: `Next page` })



  return callback(undefined, content);
}

module.exports = {
  get, getContent
}