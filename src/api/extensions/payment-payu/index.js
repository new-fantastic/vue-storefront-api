import { apiStatus } from "../../../lib/util";
import { Router } from "express";
import request from "request-promise-native";

const Magento2Client = require('magento2-rest-client').Magento2Client

const PAYU_SANDBOX_CLIENT_ID = "300746";
const PAYU_SANDBOX_CLIENT_SECRET = "2ee86a66e5d97e3fadc400c9f19b065d";
const PAYU_SANDBOX_POS_ID = "300746";

module.exports = ({ config }) => {
  let mcApi = Router();

  mcApi.get('/redirectUri/:orderId', (req, res) => {
    const client = Magento2Client(config.magento2.api);
    const { orderId } = req.params
		client.addMethods('redirectUri', function (restClient) {
            var module = {};
			
			module.search = function () {
        return restClient.get('/payu/getredirecturi/'+orderId);
      }
      return module;
		})
		client.redirectUri.search().then((result) => {
			apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
		}).catch(err=> {
			apiStatus(res, err, 500);
		})				
	})

  let bearer = null;
  let expirationTime = null;

  const receiveBearer = async res => {
    if (bearer && expirationTime > new Date()) {
      return bearer;
    }
    const clientId = config.payu.sandbox
      ? PAYU_SANDBOX_CLIENT_ID
      : config.payu.clientId;
    const clientSecret = config.payu.sandbox
      ? PAYU_SANDBOX_CLIENT_SECRET
      : config.payu.clientSecret;
    const url = config.payu.sandbox
      ? `https://secure.snd.payu.com/pl/standard/user/oauth/authorize?grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
      : `https://secure.payu.com/pl/standard/user/oauth/authorize?grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;

    try {
      let response = await request(url);

      let body = JSON.parse(response);

      const date = new Date();
      date.setSeconds(date.getSeconds() + body.expires_in);
      expirationTime = date;
      bearer = body.access_token;
      return bearer;
    } catch (e) {
      console.log(e);
      throw new Error("Couldn't get OAuth Bearer!" + e);
    }
  };

  const getPaymentMethods = async (bearer) => {
    const url = config.payu.sandbox
      ? "https://secure.snd.payu.com/api/v2_1/paymethods"
      : "https://secure.payu.com/api/v2_1/paymethods";

    try {
      let response = await request({
        uri: url,
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Authorization: `Bearer ${bearer}`
        }
      });
      return response;
    } catch (e) {
      if (e.statusCode === 302) {
        return e.response.body;
      } else {
        console.log(e);
        throw new Error(e);
      }
    }
  };

  mcApi.get("/payment-methods", async (req, res) => {
    try {
      const bearer = await receiveBearer(res);

      const response = await getPaymentMethods(bearer);
      const body = JSON.parse(response);
      apiStatus(
        res,
        body,
        200
      );
    } catch (e) {
      console.log(e);
      apiStatus(res, e, 400);
    }
  });

//   return payuApi;

  return mcApi
};
