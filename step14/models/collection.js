const debug = require('debug')('models')
const database = require('../database')

function getMetaData(serviceUrl, name, document) {

  var content = {}
  // A local identifier for the collection that is unique for the dataset;
  content.id = name // required
  // An optional title and description for the collection;
  content.title = name
  content.description = name
  content.links = []
  // Requirement 15 A and B
  content.links.push({ href: `${serviceUrl}/collections/${content.title}/items?f=json`, rel: `items`, type: `application/geo+json`, title: `Access the features in the collection as GeoJSON` })
  content.links.push({ href: `${serviceUrl}/collections/${content.title}/items?f=html`, rel: `items`, type: `text/html`, title: `Access the features in the collection as HTML` })
  content.links.push({ href: `${serviceUrl}/collections/${content.title}`, rel: `self`, title: `The '${content.title}' feature collection` })
  // An optional extent that can be used to provide an indication of the spatial and temporal 
  // extent of the collection - typically derived from the data;
  content.extent = {}
  content.extent.spatial = {}
  // Requirement 16 A and B
  content.extent.spatial.bbox = []
  content.extent.spatial.bbox.push([-180, -90, 180, 90])
  content.extent.temporal = {}
  content.extent.temporal.interval = []
  content.extent.temporal.interval.push(['2010-02-15T12:34:56Z', null])
  // An optional indicator about the type of the items in the collection 
  // (the default value, if the indicator is not provided, is 'feature').
  content.itemType = 'feature'
  // An optional list of coordinate reference systems (CRS) in which geometries may be returned by the server. 
  // The default value is a list with the default CRS (WGS 84 with axis order longitude/latitude);
  content.crs = []
  if (document.crs.properties.name)
    content.crs.push(document.crs.properties.name)

  return content
}

function get(serviceUrl, collectionId, callback) {

  debug(`collection ${serviceUrl}`)

  var root = serviceUrl.pathname.replace(/^\/+/, '') // remove any trailing /

  var query = { type: 'FeatureCollection', name: `${collectionId}` };
  var projection = { name: 1, crs: 1, _id: 1 }

  var collections = database.getCollection()

  var content = getMetaData(serviceUrl, collectionId, collections[collectionId])

  return callback(undefined, content);
}

module.exports = {
  get, getMetaData
}