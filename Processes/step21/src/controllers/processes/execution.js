import accepts from "accepts";
import execution from "../../models/processes/execution.js";
import utils from "../../utils/utils.js";

export function post(req, res) {
  // (ADR) /core/no-trailing-slash Leave off trailing slashes from URIs (if not, 404)
  // https://gitdocumentatie.logius.nl/publicatie/api/adr/#/core/no-trailing-slash
  if (utils.ifTrailingSlash(req, res)) return;

  // (OAPIC) Req 8: The server SHALL respond with a response with the status code 400,
  //         if the request URI includes a query parameter that is not specified in the API definition
  var queryParams = ["f"];
  var rejected = utils.checkForAllowedQueryParams(req.query, queryParams);
  if (rejected.length > 0) {
    res.status(400).json({
      code: `The following query parameters are rejected: ${rejected}`,
      description: "Valid parameters for this request are " + queryParams,
    });
    return;
  }

  var processId = req.params.processId;

  var formatFreeUrl = utils.getFormatFreeUrl(req);

  var accept = accepts(req);
  var format = accept.type(["json"]);

  var prefer = req.get("Prefer") || "";

  execution.post(
    formatFreeUrl,
    processId,
    req.body,
    prefer,
    function (err, content) {
      if (err) {
        res
          .status(err.code)
          .json({ code: err.code, description: err.description });
        return;
      }

      let status = prefer.includes("async") ? 202 : 200;
      if (prefer.includes("async"))
        res.set("preference-applied", "respond - async");

      //      res.set('location', '') // TODO

      switch (format) {
        case "json":
          res.status(status).json(content);
          break;
        default:
          res.status(400).json({
            code: "InvalidParameterValue",
            description: `${accept} is an invalid format`,
          });
      }
    }
  );
}
