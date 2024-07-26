const encodings = require('./middlewares/encodings')
const version = require('./middlewares/version')
const oapifp1 = require('./routes/ogcapiFeaturesPart1')
const swig = require('swig');
const express = require('express')
const port = 80

const app = express()

// For HTML rendering
app.engine('swig',swig.renderFile);
app.set('view engine', 'swig');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
app.use(express.json());

// setup middleware to decode the content-type
// see http://docs.opengeospatial.org/is/17-069r3/17-069r3.html#_encodings
app.use(encodings)
app.use(version)

// Mount API on this path
app.use('/amstelveen/v1', oapifp1)

module.exports = app