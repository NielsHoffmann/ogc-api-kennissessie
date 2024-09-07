import { join } from "path";
import { readdirSync, readFileSync } from "fs";

export async function readProcesses(dir) {
  var fileNames = readdirSync(dir).filter((fn) => fn.endsWith(".json"));

  fileNames.forEach((fileName) => {
    var path = join(dir, fileName);
    var rawData = readFileSync(path);
    var json = JSON.parse(rawData);

    var oapip = json;
    oapip.location = path;

    _processes[oapip.id] = oapip;
  });
}

var _processes = {};
var _jobs = {};

export function getProcesses() {
  return _processes;
}

export function getJobs() {
  return _jobs;
}

export default { getProcesses, getJobs };