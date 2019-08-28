import { apiStatus } from "../../../lib/util";
import { Router } from "express";
const Magento2Client = require("magento2-rest-client").Magento2Client;

module.exports = ({ config, db }) => {
  let mcApi = Router();

  mcApi.get("/cart-price-rules/:storeCode", (req, res) => {
    const client = Magento2Client({
      ...config.magento2.api,
      url:
        config.magento2.api.url.replace("/rest", "/") +
        req.params.storeCode +
        "/rest"
    });

    client.addMethods("cartPriceRules", function(restClient) {
      var module = {};

      module.all = function(categoryId) {
        return restClient.get(`/salesRules/search?searchCriteria=`);
      };
      return module;
    });

    client.cartPriceRules
      .all(req.params.cid)
      .then(result => {
        apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
      })
      .catch(err => {
        apiStatus(res, err, 500);
      });
  });

  mcApi.get("/cart-price-rules", (req, res) => {
    const client = Magento2Client(config.magento2.api);

    client.addMethods("cartPriceRules", function(restClient) {
      var module = {};

      module.all = function(categoryId) {
        return restClient.get(`/salesRules/search?searchCriteria=`);
      };
      return module;
    });

    client.cartPriceRules
      .all(req.params.cid)
      .then(result => {
        apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
      })
      .catch(err => {
        apiStatus(res, err, 500);
      });
  });

  return mcApi;
};
