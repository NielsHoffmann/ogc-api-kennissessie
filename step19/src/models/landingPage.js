import utils from '../utils/utils.js'

function get(neutralUrl, format, callback) {

    // Requirement 2 A & B
    // The content of that response SHALL be based upon the OpenAPI 3.0 schema landingPage.yaml (http://schemas.opengis.net/ogcapi/features/part1/1.0/openapi/schemas/landingPage.yaml)
    // and include at least links to the following resources:
    //
    // - the API definition (relation type `service-desc` or `service-doc`)
    // - /conformance (relation type `conformance`)
    // - /collections (relation type `data`)
    var content = {}
    content.title = process.env.TITLE // Requirement 2 B
    content.description = process.env.DESCRIPTION
    content.links = []

    content.links.push({ href: `${neutralUrl}/?f=${format}`, rel: `self`, type: utils.getTypeFromFormat(format), title: `This document` })

    utils.getAlternateFormats(format, ['json', 'html']).forEach(altFormat => {
        content.links.push({ href: `${neutralUrl}/?f=${altFormat}`, rel: `alternate`, type: utils.getTypeFromFormat(altFormat), title: `This document as ${altFormat}` })
    })

    content.links.push({ href: `${neutralUrl}/conformance`, rel: `conformance`,                                        title: `OGC API conformance classes implemented by this server` })
    content.links.push({ href: `${neutralUrl}/conformance`, rel: `http://www.opengis.net/def/rel/ogc/1.0/conformance`, title: `OGC API conformance classes implemented by this server` })

    content.links.push({ href: `${neutralUrl}/api?f=json`, rel: `service-desc`, type: `application/vnd.oai.openapi+json;version=3.0`, title: `Definition of the API in OpenAPI 3.0` })
    content.links.push({ href: `${neutralUrl}/api?f=yaml`, rel: `service-desc`, type: `application/vnd.oai.openapi;version=3.0`,      title: `Definition of the API in OpenAPI 3.0` })
    content.links.push({ href: `${neutralUrl}/api?f=html`, rel: `service-doc`,  type: `text/html`,                                    title: `Documentation of the API` })
    
    content.links.push({ href: `${neutralUrl}/collections`, rel: `data`, title: `Access the data` })
  
    return callback(undefined, content);
}

export default {
    get
}