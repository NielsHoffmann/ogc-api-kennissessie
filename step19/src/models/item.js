import { getDatabases } from '../database/database.js'
import utils from '../utils/utils.js'

function get(neutralUrl, format, collectionId, featureId, callback) {

  var collections = getDatabases()
  var collection = collections[collectionId]
  if (!collection)
    return callback({ 'httpCode': 404, 'code': `Collection not found: ${collectionId}`, 'description': 'Make sure you use an existing collectionId. See /Collections' }, undefined);

  var id = collection.id;

  var index = 0
  for (; index < collection.features.length; index++)
    if (collection.features[index].properties[id] == featureId) break;

  if (index >= collection.features.length)
    return callback({ 'httpCode': 404, 'code': `Item: ${featureId} not found`, 'description': 'Id needs to exist' }, undefined);

  var content = collection.features[index]
  content.links = []
  content.links.push({ href: `${neutralUrl}?f=${format}`, rel: `self`, type: utils.getTypeFromFormat(format), title: `This document` })
  utils.getAlternateFormats(format, ['json', 'html', 'csv']).forEach(altFormat => {
    content.links.push({ href: `${neutralUrl}?f=${altFormat}`, rel: `alternate`, type: utils.getTypeFromFormat(altFormat), title: `This document as ${altFormat}` })
  })

  col = neutralUrl.toString()
  var col = col.substr(0, col.lastIndexOf("/"));
  content.links.push({ href: `${col}?f=${format}`, rel: `collection`, type: utils.getTypeFromFormat(format), title: `The collection the feature belongs to` })

  return callback(undefined, content);
}

function create(serviceUrl, collectionId, body, callback) {

  if (body.type.toLowerCase() != 'feature')
    return callback({ 'httpCode': 400, 'code': `Type not "feature"`, 'description': 'Type must be "feature"' });

  var collections = getDatabases()
  var collection = collections[collectionId]
  if (!collection)
    return callback({ 'httpCode': 404, 'code': `Collection not found: ${collectionId}`, 'description': 'Make sure you use an existing collectionId. See /Collections' }, undefined);

  var id = collection.id;

  // (OAPIF P4) Requirement 4 If the operation completes successfully, the server SHALL assign a new, unique identifier 
  //      within the collection for the newly added resource.

  // generate new id (than largest id and add 1)
  var index = 0
  var newId = -1
  for (; index < collection.features.length; index++)
    if (collection.features[index].properties[id] > newId) newId = collection.features[index].properties[id];
  newId++

  body.properties[id] = newId

  // create new resource
  collection.features.push(body)

  return callback(undefined, body, newId);
}

function replacee(serviceUrl, collectionId, featureId, body, callback) {

  if (body.type.toLowerCase() != 'feature')
    return callback({ 'httpCode': 400, 'code': `Type not "feature"`, 'description': 'Type must be "feature"' });

  var collections = getDatabases()
  var collection = collections[collectionId]
  if (!collection)
    return callback({ 'httpCode': 404, 'code': `Collection not found: ${collectionId}`, 'description': 'Make sure you use an existing collectionId. See /Collections' }, undefined);

  var id = collection.id;

  var index = 0
  for (; index < collection.features.length; index++)
    if (collection.features[index].properties[id] == featureId) break;

  if (index >= collection.features.length)
    return callback({ 'httpCode': 404, 'code': `Item: ${featureId} not found`, 'description': 'Id needs to exist' });

  // delete the 'old' resource
  collection.features.splice(index, 1);

  // (OAPIF P4) Requirement 4 If the operation completes successfully, the server SHALL assign a new, unique identifier 
  //      within the collection for the newly added resource.

  // generate new id (than largest id and add 1)
  var index = 0
  var newId = -1
  for (; index < collection.features.length; index++)
    if (collection.features[index].properties[id] > newId) newId = collection.features[index].properties[id];
  newId++

  body.properties[id] = newId

  // create new resource
  collection.features.push(body)

  return callback(undefined, body, newId);
}

function deletee(serviceUrl, collectionId, featureId, callback) {

  var collections = getDatabases()
  var collection = collections[collectionId]
  if (!collection)
    return callback({ 'httpCode': 404, 'code': `Collection not found: ${collectionId}`, 'description': 'Make sure you use an existing collectionId. See /Collections' }, undefined);

  var id = collection.id;

  var index = 0
  for (; index < collection.features.length; index++)
    if (collection.features[index].properties[id] == featureId) break;

  if (index >= collection.features.length)
    return callback({ 'httpCode': 404, 'code': `Item: ${featureId} not found`, 'description': 'Id needs to exist' }, undefined);

  collection.features.splice(index, 1);

  return callback(undefined, {});
}

function update(serviceUrl, collectionId, featureId, body, callback) {

  if (body.type.toLowerCase() != 'feature')
    return callback({ 'httpCode': 400, 'code': `Type not "feature"`, 'description': 'Type must be "feature"' }, undefined);

  var collections = database.getCollection()
  var collection = collections[collectionId]
  if (!collection)
    return callback({ 'httpCode': 404, 'code': `Collection not found: ${collectionId}`, 'description': 'Make sure you use an existing collectionId. See /Collections' }, undefined);

  var id = collection.id;

  var index = 0
  for (; index < collection.features.length; index++)
    if (collection.features[index].properties[id] == featureId) break;

  if (index >= collection.features.length)
    return callback({ 'httpCode': 404, 'code': `Item: ${featureId} not found`, 'description': 'Id needs to exist' }, undefined);

  var feature = collection.features[index]

  // check if geometry type is the same
  if (body.geometry) {
    if (body.geometry.type != feature.geometry.type)
      return callback({ 'httpCode': 400, 'code': `Geometry type mismatch`, 'description': 'Item update must have the same geometry type' }, undefined);

    feature.geometry = body.geometry
  }

  if (body.properties) {
    // TODO replace properties
  }

  return callback(undefined, feature);
}

export default {
  get, create, replacee, deletee, update
}