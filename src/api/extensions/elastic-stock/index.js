import {
  apiStatus
} from '../../../lib/util';
import {
  Router
} from 'express';
const es = require('elasticsearch')
const bodybuilder = require('bodybuilder')

module.exports = ({
  config,
  db
}) => {
  let api = Router();

  const getElasticClient = (config) => {
    const esConfig = { // as we're runing tax calculation and other data, we need a ES indexer
      host: {
        host: config.elasticsearch.host,
        port: config.elasticsearch.port,
        protocol: config.elasticsearch.protocol
      },
      apiVersion: config.elasticsearch.apiVersion,
      requestTimeout: 5000
    }
    if (config.elasticsearch.user) {
      esConfig.httpAuth = config.elasticsearch.user + ':' + config.elasticsearch.password
    }
    return new es.Client(esConfig)
  }

  const getStockList = (storeCode, skus) => {
    let storeView = config
    if (storeCode && config.storeViews[storeCode]) {
      storeView = config.storeViews[storeCode]
    }

    const esQuery = {
      index: storeView.elasticsearch.indexName, // current index name
      type: 'product',
      _source_includes: ['stock'],
      body: bodybuilder().filter('terms', 'visibility', [2, 3, 4]).andFilter('term', 'status', 1).andFilter('terms', 'sku', skus).build()
    }
    return getElasticClient(config).search(esQuery).then((products) => { // we're always trying to populate cache - when online
      console.log(products)
      return products.hits.hits.map(el => {
        return el._source.stock
      })
    }).catch(err => {
      console.error(err)
    })
  }

  /**
   * GET get stock item
   */
  api.get('/check/:sku', (req, res) => {
    if (!req.params.sku) {
      return apiStatus(res, 'sku parameter is required', 500);
    }

    getStockList(req.params.storeCode, [req.params.sku]).then((result) => {
      if (result && result.length > 0) {
        apiStatus(res, result[0], 200);
      } else {
        apiStatus(res, 'No stock information for given sku', 500);
      }
    }).catch(err => {
      apiStatus(res, err, 500);
    })
  })

  /**
   * GET get stock item - 2nd version with the query url parameter
   */
  api.get('/check', (req, res) => {
    if (!req.query.sku) {
      return apiStatus(res, 'sku parameter is required', 500);
    }
    getStockList(req.params.storeCode, [req.query.sku]).then((result) => {
      if (result && result.length > 0) {
        apiStatus(res, result[0], 200);
      } else {
        apiStatus(res, 'No stock information for given sku', 500);
      }
    }).catch(err => {
      apiStatus(res, err, 500);
    })
  })

  /**
   * GET get stock item list by skus (comma separated)
   */
  api.get('/list', (req, res) => {
    if (!req.query.skus) {
      return apiStatus(res, 'skus parameter is required', 500);
    }
    const skuArray = req.query.skus.split(',')
    getStockList(req.params.storeCode, skuArray).then((result) => {
      if (result && result.length > 0) {
        apiStatus(res, result, 200);
      } else {
        apiStatus(res, 'No stock information for given sku', 500);
      }
    }).catch(err => {
      apiStatus(res, err, 500);
    })
  })

  return api
}
