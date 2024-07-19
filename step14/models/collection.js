const debug = require('debug')('models')
const database = require('../database')

function getMetaData(serviceUrl, document) {

  var content = {}
  content.id = document.name // required
  content.title = document.name
  content.description = 'dbEntry.description'
  content.links = []
  // Requirement 15 A and B
  content.links.push({ href: `${serviceUrl}/collections/${content.title}/items?f=json`, rel: `items`, type: `application/geo+json`, title: `This document` })
  content.links.push({ href: `${serviceUrl}/collections/${content.title}/items?f=html`, rel: `items`, type: `text/html`, title: `This document in HTML` })
  content.extent = {}
  content.extent.spatial = {}
  // Requirement 16 A and B
  content.extent.spatial.bbox = []
  content.extent.spatial.bbox.push([-180, -90, 180, 90])
  content.extent.temporal = {}
  content.extent.temporal.interval = []
  content.extent.temporal.interval.push(['2010-02-15T12:34:56Z', null])
  content.itemType = 'feature'
  content.crs = []
  content.crs.push(document.crs.properties.name)

  return content
}

function getContent(name, collection)
{
  var item = {}
  item.id = name
  item.title = name
  item.description = "Description of " + name
  item.links = []
  item.crs = []
  var crsName = collection.crs.properties.name.split(':').pop();
  item.crs.push('http://www.opengis.net/def/crs/EPSG/0/' + crsName)

  return item
}

function get(serviceUrl, collectionId, callback) {

  debug(`collection ${serviceUrl}`)

  var root = serviceUrl.pathname.replace(/^\/+/, '') // remove any trailing /

  var query = { type: 'FeatureCollection', name: `${collectionId}` };
  var projection = { name: 1, crs: 1, _id: 1 }

  var collections = database.getCollection()
  var collection = collections[collectionId]

  var content = getContent(collectionId, collection)

  return callback(undefined, content);
}

module.exports = {
  get, getContent
}