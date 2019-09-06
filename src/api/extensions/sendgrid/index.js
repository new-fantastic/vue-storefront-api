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
        subject: req.body.subject ? req.body.subject : (config.sendgrid.subjects.hasOwnProperty(action) && config.sendgrid.subjects[action].hasOwnProperty(storeCode)
          ? config.sendgrid.subjects[action][storeCode]
          : config.sendgrid.subjects[action].default)
      });
      msg.to = config.sendgrid.mails.hasOwnProperty(storeCode)
        ? config.sendgrid.mails[storeCode]
        : config.sendgrid.mails.default;

      await Promise.all([
        sgMail.send(msg),
        sgMail.send({ 
          ...msg,
          to: msg.from,
          from: msg.to
        })
      ])
      apiStatus(res, 'Email sent', 200);

    } catch (err) {
      console.error(err);
      apiStatus(res, err.message, 500);
    }
  });

  return mcApi;
};
