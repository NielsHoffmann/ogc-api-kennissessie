import database from '../database/database.js';
import utils from '../utils/utils.js';
import projgeojson from '../utils/proj4.js';
import { bboxPolygon, booleanWithin } from '@turf/turf';

function getContent(serviceUrl, name, document) {
  var item = {}
  item.type = document.type
  item.features = document.features
  item.timestamp = new Date().toISOString()
  item.links = []

  if (document.crs.properties.name)
    item.headerContentCrs = document.crs.properties.name

  return item
}

function get(serviceUrl, collectionId, query, options, acceptType, callback) {

  var collections = database.getCollection()
  var collection = collections[collectionId]
  if (!collection)
    return callback({ 'httpCode': 404, 'code': `Collection not found: ${collectionId}`, 'description': 'Make sure you use an existing collectionId. See /Collections' }, undefined);

  var content = getContent(serviceUrl, collectionId, collection)

  // make local copy to do subtraction (limit, offset, bbox,...) on
  var features = content.features

  var _query = query
  if (_query) {
    // (OAPIF P1) Requirement 23A The operation SHALL support a parameter bbox
    // (OAPIF P2) Requirement 6 Each GET request on a 'features' resource SHALL support a query parameter bbox-crs 
    if (_query.bbox) {
      var corners = _query.bbox.split(',') // 
      var bbox = bboxPolygon(corners);

      if (_query['bbox-crs']) {
        // Assumption that content comes in WGS84
        var fromEpsg = utils.UriToEPSG(_query['bbox-crs'])
        bbox = projgeojson.projectBBox(bbox, fromEpsg, 'EPSG:4326')
        delete _query['bbox-crs']
      }

      features = features.filter(
        feature =>
          booleanWithin(feature, bbox)
      )
      delete _query.bbox
    }

    if (_query.crs) {
      console.log('do crs conversion using proj4') // TODO
      var toEpsg = utils.UriToEPSG(query.crs)
      features = projgeojson.projectFeatureCollection(features, 'EPSG:4326', toEpsg);

      content.headerContentCrs = query.crs
      delete _query.crs
    }

    var filterLang = 'filter'
    if (_query['filter-lang']) {
      filterLang = _query['filter-lang'].replace(/^\W+|\W+$/g, '') // removes ' at start and end
      delete _query['filter-lang']
    }

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

  content.numberMatched = features.length

  if (options)
    content.features = features.slice(options.offset, options.offset + options.limit)
  else
    content.features = features

  content.numberReturned = content.features.length

  content.links.push({ href: `${serviceUrl}/collections/${collectionId}/items?f=json`, rel: `self`, type: `application/geo+json`, title: `This document` })
  content.links.push({ href: `${serviceUrl}/collections/${collectionId}/items?f=html`, rel: `alternate`, type: `text/html`, title: `This document as HTML` })

  var offsetLimit = '';
  if (options.offset > 0 || options.limit != limit) {
    offsetLimit = `&offset=${options.offset}`;
    if (options.limit != limit)
      offsetLimit += `&limit=${options.limit}`;
  }

  if (options.offset + options.limit < content.numberMatched) { // only if we need pagination
    content.links.push({ href: `${serviceUrl}/collections/${collectionId}/items?f=json`, rel: `first`, type: `application/geo+json`, title: `Next page` })
    content.links.push({ href: `${serviceUrl}/collections/${collectionId}/items?f=json&offset=${options.offset + options.limit}` + (options.limit == limit ? '' : `&limit=${options.limit}`), rel: `next`, type: `application/geo+json`, title: `Next page` })
  }

  var offset = options.offset - options.limit;
  if (offset < 0) offset = 0
  if (options.offset != 0)
    content.links.push({ href: `${serviceUrl}/collections/${collectionId}/items?f=json&offset=${offset}` + (options.limit == limit ? '' : `&limit=${options.limit}`), rel: `prev`, type: `application/geo+json`, title: `Previous page` })

  return callback(undefined, content);
}

export default {
  get, getContent
}
