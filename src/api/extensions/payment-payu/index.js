import { apiStatus } from "../../../lib/util";
import { Router } from "express";
import request from "request-promise-native";

const PAYU_SANDBOX_CLIENT_ID = "300746";
const PAYU_SANDBOX_CLIENT_SECRET = "2ee86a66e5d97e3fadc400c9f19b065d";
const PAYU_SANDBOX_POS_ID = "300746";

module.exports = ({ config }) => {
  const payuApi = Router();

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

  const makeAnOrder = async (body, bearer, res) => {
    const url = config.payu.sandbox
      ? "https://secure.snd.payu.com/api/v2_1/orders"
      : "https://secure.payu.com/api/v2_1/orders";

    try {
      let response = await request({
        uri: url,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearer}`
        },
        body: JSON.stringify({
          ...body,
          merchantPosId: config.payu.sandbox
            ? PAYU_SANDBOX_CLIENT_ID
            : config.payu.merchantPosId
        })
      });
      // reponse
      // {
      //   redirectUri
      //   orderId
      // }
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

  payuApi.post("/order", async (req, res) => {
    try {
      const bearer = await receiveBearer(res);

      const response = await makeAnOrder(req.body, bearer, res);
      const body = JSON.parse(response);
      apiStatus(
        res,
        {
          redirectUri: body.redirectUri
        },
        200
      );
    } catch (e) {
      console.log(e);
      apiStatus(res, e, 400);
    }
  });

  return payuApi;
};
