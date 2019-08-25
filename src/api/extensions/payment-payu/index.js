import { apiStatus } from "../../../lib/util";
import { Router } from "express";
import request from "request-promise-native";

module.exports = ({ config }) => {
  const payuApi = Router();

  let bearer = null;
  let expirationTime = null;

  const receiveBearer = async () => {
    if (bearer && expirationTime > new Date()) {
      return bearer;
    }
    const url = `https://secure.payu.com/pl/standard/user/oauth/authorize?grant_type=client_credentials&client_id=${config.payu.clientId}&client_secret=${config.payu.clientSecret}`;
    try {
      let response = await request(url);
      let body = JSON.parse(response);
      const date = new Date();
      date.setSeconds(date.getSeconds() + body.expires_in);
      expirationTime = date;
      bearer = body.access_token;
      return bearer;
    } catch (e) {
      apiStatus(res, "Couldn't get OAuth Bearer!", 404);
    }
  };

  payuApi.get("/order", async (req, res) => {
    const bearer = await receiveBearer();
    console.log(bearer);
    apiStatus(res, bearer, 200);
  });

  return payuApi;
};
