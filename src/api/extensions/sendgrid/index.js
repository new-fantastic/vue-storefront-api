import { apiStatus } from '../../../lib/util';
import { Router } from 'express';
const sgMail = require('@sendgrid/mail');

module.exports = ({ config, db }) => {
  let mcApi = Router();
  sgMail.setApiKey(config.sendgrid.key);

  mcApi.post('/mail/:action/:storeCode', async (req, res) => {
    const { storeCode, action } = req.params;

    try {
      const actionModule = await import('./actions/' + action + '.js');

      const msg = actionModule.default({
        ...req.body,
        storeCode,
        currency: config.storeViews[storeCode].i18n.currencySign,
        headers: config.sendgrid.headers,
        subject: config.sendgrid.subjects.hasOwnProperty(action) && config.sendgrid.subjects[action].hasOwnProperty(storeCode)
          ? config.sendgrid.subjects[action][storeCode]
          : config.sendgrid.subjects[action].default
      });
      msg.to = config.sendgrid.mails.hasOwnProperty(storeCode)
        ? config.sendgrid.mails[storeCode]
        : config.sendgrid.mails.default;

      await sgMail.send(msg)
      apiStatus(res, 'Email sent', 200);

    } catch (err) {
      console.error(err);
      apiStatus(res, err, 500);
    }
  });

  // mcApi.get('/mail/:action', (req, res) => {
  //   const client = Magento2Client(config.magento2.api);

  //   client.addMethods('cartPriceRules', function(restClient) {
  //     var module = {};

  //     module.all = function(categoryId) {
  //       return restClient.get(`/salesRules/search?searchCriteria=`);
  //     };
  //     return module;
  //   });

  //   client.cartPriceRules
  //     .all(req.params.cid)
  //     .then(result => {
  //       apiStatus(res, result, 200); // just dump it to the browser, result = JSON object
  //     })
  //     .catch(err => {
  //       apiStatus(res, err, 500);
  //     });
  // });

  return mcApi;
};
