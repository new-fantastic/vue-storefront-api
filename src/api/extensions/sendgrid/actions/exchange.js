const validator = require('../util/validators.js')

export default ({ currency, storeCode, headers, email, subject, name, phone, orderId, orderDate, reason, accountNumber, products, changeFor }) => {
  const msg = {
    from: email,
    subject
  };

  if (!validator['email'](email)) {
    throw new Error('Bad email')
  }
  if (!validator['phone'](phone)) {
    throw new Error('Bad phone')
  }
  if (!validator['name'](name)) {
    throw new Error('Bad name')
  }
  if (!validator['orderDate'](orderDate)) {
    throw new Error('Bad orderDate')
  }
  if (!validator['orderId'](orderId)) {
    throw new Error('Bad orderId')
  }
  if (!validator['products'](products)) {
    throw new Error('Bad products')
  }
  if (!validator['products'](changeFor)) {
    throw new Error('Bad changeForProducts')
  }

  const tableElem = (header, content) => {
    return `<tr><th>${header}</th><td>${content}</td></tr>`
  }

  const checkStorecode = (header) => {
    return headers[header].hasOwnProperty(storeCode) ? headers[header][storeCode] : headers[header].default
  }

  const productTable = (products) => {
    const tableRow = (product) => `
      <tr>
        <td>${product.name}</td>
        <td>${product.color}</td>
        <td>${product.size}</td>
        <td>${product.price} ${currency}</td>
      </tr>
    `

    const rows = products.map(v => tableRow(v))

    return `<table>
      <tr><th>${checkStorecode('productName')}</th><th>${checkStorecode('color')}</th><th>${checkStorecode('size')}</th><th>${checkStorecode('price')}</th></tr>
      ${rows.join('')}
    </table>`
  }

  const table = `
    <table>
      ${tableElem(checkStorecode('name'), name)}
      ${tableElem(checkStorecode('phone'), phone)}
      ${tableElem(checkStorecode('email'), email)}
      ${tableElem(checkStorecode('orderId'), orderId)}
      ${tableElem(checkStorecode('orderDate'), orderDate)}
    </table>
    <br>${checkStorecode('theseProducts')}
    ${productTable(products)}
    <br>${checkStorecode('changeTo')}
    ${productTable(changeFor)}
  `

  msg.html = table

  return msg
}