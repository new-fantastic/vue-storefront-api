import { apiStatus, apiError } from '../lib/util'; import { Router } from 'express';
import PlatformFactory from '../platform/factory'

export default ({ config, db }) => {
  let api = Router();

  const _getProxy = (req) => {
    const platform = config.platform
    const factory = new PlatformFactory(config, req)
    return factory.getAdapter(platform, 'stock')
  };

  const _getStockId = (storeCode) => {
    let storeView = config.storeViews[storeCode]
    return storeView ? storeView.msi.stockId : config.defaultStockId
  };

  /**
   * GET get stock item
   */
  api.get('/check/:sku', (req, res) => {
    const stockProxy = _getProxy(req)

    if (!req.params.sku) {
      return apiStatus(res, 'sku parameter is required', 500);
    }

    stockProxy.check({
      sku: req.params.sku,
      stockId: config.msi.enabled ? (req.params.stockId ? req.params.stockId : _getStockId(req.params.storeCode)) : null
    }).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiStatus(res, err, 500);
    })
  })

  /**
   * GET get stock item - 2nd version with the query url parameter
   */
  api.get('/check', (req, res) => {
    const stockProxy = _getProxy(req)

    if (!req.query.sku) {
      return apiStatus(res, 'sku parameter is required', 500);
    }

    stockProxy.check({
      sku: req.query.sku,
      stockId: config.msi.enabled ? (req.query.stockId ? req.query.stockId : _getStockId(req.query.storeCode)) : null
    }).then((result) => {
      apiStatus(res, result, 200);
    }).catch(err => {
      apiStatus(res, err, 500);
    })
  })

  /**
   * GET get stock item list by skus (comma separated)
   */
  api.get('/list', (req, res) => {
    const stockProxy = _getProxy(req)

    if (!req.query.skus) {
      return apiStatus(res, 'skus parameter is required', 500);
    }

    const skuArray = req.query.skus.split(',')
    const promisesList = []
    for (const sku of skuArray) {
      promisesList.push(stockProxy.check({sku: sku, stockId: config.msi.enabled ? _getStockId(req.query.storeCode) : null}))
    }
    Promise.all(promisesList).then((results) => {
      apiStatus(res, results, 200);
    }).catch(err => {
      apiError(res, err);
    })
  })

  return api
}

/**
 * stockStatuses
 * {
    "product_id": 2078,
    "stock_id": 1,
    "qty": 0,
    "stock_status": 0,
    "stock_item": {
        "item_id": 2600,
        "product_id": 2078,
        "stock_id": 1,
        "qty": 2,
        "is_in_stock": true,
        "is_qty_decimal": false,
        "show_default_notification_message": false,
        "use_config_min_qty": true,
        "min_qty": 0,
        "use_config_min_sale_qty": 1,
        "min_sale_qty": 1,
        "use_config_max_sale_qty": true,
        "max_sale_qty": 10000,
        "use_config_backorders": true,
        "backorders": 0,
        "use_config_notify_stock_qty": true,
        "notify_stock_qty": 1,
        "use_config_qty_increments": true,
        "qty_increments": 0,
        "use_config_enable_qty_inc": true,
        "enable_qty_increments": false,
        "use_config_manage_stock": true,
        "manage_stock": true,
        "low_stock_date": null,
        "is_decimal_divided": false,
        "stock_status_changed_auto": 0
    }
}

* stockItems
{
    "item_id": 2600,
    "product_id": 2078,
    "stock_id": 1,
    "qty": 2,
    "is_in_stock": true,
    "is_qty_decimal": false,
    "show_default_notification_message": false,
    "use_config_min_qty": true,
    "min_qty": 0,
    "use_config_min_sale_qty": 1,
    "min_sale_qty": 1,
    "use_config_max_sale_qty": true,
    "max_sale_qty": 10000,
    "use_config_backorders": true,
    "backorders": 0,
    "use_config_notify_stock_qty": true,
    "notify_stock_qty": 1,
    "use_config_qty_increments": true,
    "qty_increments": 0,
    "use_config_enable_qty_inc": true,
    "enable_qty_increments": false,
    "use_config_manage_stock": true,
    "manage_stock": true,
    "low_stock_date": null,
    "is_decimal_divided": false,
    "stock_status_changed_auto": 0
}
 */