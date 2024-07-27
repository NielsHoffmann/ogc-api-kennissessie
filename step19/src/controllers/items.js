const accepts = require('accepts')
var items = require('../models/items.js')
var utils = require('../utils/utils')

async function get(req, res, next) {

  var collectionId = req.params.collectionId
  var serviceUrl = utils.getServiceUrl(req)

  var options = {}
  options.offset = Number(req.query.offset) || 0
  options.limit = Number(req.query.limit) || 1000

  // remve not to be confused with other query parameters
  delete req.query.offset;
  delete req.query.limit;

  var query = req.query

  var accept = accepts(req)
  var acceptType = accept.type(['json', 'html'])

  await items.get(serviceUrl, collectionId, query, options, acceptType, function (err, content) {

    if (err) {
      res.status(err.httpCode).json({'code': err.code, 'description': err.description})
      return
    }

    // Content-Crs
    if (content.headerContentCrs)
      res.set('Content-Crs', content.headerContentCrs)
    delete content.headerContentCrs

    switch (acceptType) {
      case `json`:
        res.status(200).json(content)
        break
      case `html`:
        res.status(200).render(`items`, content )
        break
      default:
        res.status(400).json(`{'code': 'InvalidParameterValue', 'description': '${accept} is an invalid format'}`)
    }
  })

}

async function options (req, res) {
  
  res.status(200).end()
}


module.exports = {
  get, options
}
