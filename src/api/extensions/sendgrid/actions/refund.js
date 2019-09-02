export default ({ currency, storeCode, headers, email, subject, name, phone, orderId, reason, accountNumber, products }) => {
  const msg = {
    from: email,
    subject,
    text: 'Refund'
  };

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
      ${tableElem(checkStorecode('reason'), reason)}
      ${tableElem(checkStorecode('accountNumber'), accountNumber)}
    </table>
    ${productTable(products)}
  `

  msg.html = table

  return msg
}