import urlJoin from "url-join";
import utils from "../../utils/utils.js";
import { getProcesses } from "../../database/processes.js";

function getLinks(neutralUrl, format, name, links) {
  function getTypeFromFormat(format) {
    var _formats = ["json", "html"];
    var _encodings = ["application/json", "text/html"];

    var i = _formats.indexOf(format);
    return _encodings[i];
  }

  links.push({
    href: urlJoin(neutralUrl),
    rel: `self`,
    type: getTypeFromFormat(format),
    title: `Process description as ${format}`,
  });
  utils.getAlternateFormats(format, ["json", "html"]).forEach((altFormat) => {
    links.push({
      href: urlJoin(neutralUrl, `?f=${altFormat}`),
      rel: `alternate`,
      type: getTypeFromFormat(altFormat),
      title: `Process description as ${altFormat}`,
    });
  });

  let serviceUrl = neutralUrl.substring(0, neutralUrl.indexOf("processes"));

  links.push({
    href: urlJoin(serviceUrl, "jobs?f=html"),
    rel: `http://www.opengis.net/def/rel/ogc/1.0/job-list`,
    type: "text/html",
    title: `Jobs list as HTML`,
  });
  links.push({
    href: urlJoin(serviceUrl, "jobs?f=json"),
    rel: `http://www.opengis.net/def/rel/ogc/1.0/job-list`,
    type: "application/json",
    title: `Jobs list as JSON`,
  });

  links.push({
    href: urlJoin(neutralUrl, "execution"),
    rel: `http://www.opengis.net/def/rel/ogc/1.0/execute`,
    title: `Execute endpoint`,
  });
}

function getContent(neutralUrl, format, name, process) {
  var content = {};
  content.id = process.id;
  content.title = process.title;
  content.description = process.description;
  content.version = process.version;
  content.jobControlOptions = process.jobControlOptions;
  content.outputTransmission = process.outputTransmission;

  content.inputs = process.inputs;
  content.outputs = process.outputs;

  content.links = [];

  getLinks(neutralUrl, format, name, content.links);

  return content;
}

function get(neutralUrl, format, processId, callback) {
  var processes = getProcesses();
  var process = processes[processId];
  if (!process)
    return callback(
      {
        httpCode: 404,
        code: `Process not found: ${processId}`,
        description: "Make sure you use an existing processId. See /processes",
      },
      undefined
    );

  var content = getContent(neutralUrl, format, processId, process);

  return callback(undefined, content);
}

export default {
  get,
};
