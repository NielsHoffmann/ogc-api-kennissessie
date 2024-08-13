import urlJoin from "url-join";
import { getProcesses } from '../database/processes.js'
import { join } from "path";
import { existsSync } from "fs";

function getLinks(neutralUrl, format, name, links) {
  links.push({
    href: urlJoin(neutralUrl),
    rel: `self`,
    type: "application/json",
    title: `The Document`,
  });
}

function getContent(neutralUrl, process, body) {
  var content = {};
  // A local identifier for the collection that is unique for the dataset;
  content.id = name; // required
  // An optional title and description for the collection;
  content.title = document.name;
  content.description = document.description;
  content.links = [];

  getLinks(neutralUrl, format, name, content.links);

  return content;
}

function post(neutralUrl, processId, body, callback) {
  var processes = getProcesses();
  var process = processes[processId];
  if (!process)
    return callback(
      {
        httpCode: 404,
        code: `Collection not found: ${processId}`,
        description: "Make sure you use an existing processId. See /processes",
      },
      undefined
    );

  let path = join(process.location.replace(/\.[^/.]+$/, ""), "launch.js");
  const fileExists = existsSync(path);
  import(path)
    .then((module) => {
      module.launch(process, body, function (err, content) {
        if (err) {
          res
            .status(err.httpCode)
            .json({ code: err.code, description: err.description });
          return;
        }

        return callback(undefined, content);
      });
    })
    .catch((error) => {
      return callback(
        {
          httpCode: 500,
          code: `Server error`,
          description: `${error}`,
        },
        undefined
      );
    });
}

export default {
  post,
};
