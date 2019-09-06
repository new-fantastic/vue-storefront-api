const validator = require('../util/validators.js')

export default ({ message, subject, email, headers, storeCode }) => {
  const msg = {
    from: email,
    subject: 'Kontakt - ' + subject
  };

  if (!validator['email'](email)) {
    throw new Error('Bad email')
  }
  if (!subject || subject.length < 2) {
    throw new Error('Bad subject')
  }
  if (!message || message.length < 2) {
    throw new Error('Bad message')
  }

  const tableElem = (header, content) => {
    return `<tr><th>${header}</th><td>${content}</td></tr>`
  }

  const checkStorecode = (header) => {
    return headers[header].hasOwnProperty(storeCode) ? headers[header][storeCode] : headers[header].default
  }

  const table = `
    <table>
      ${tableElem(checkStorecode('email'), email)}
      ${tableElem(checkStorecode('subject'), subject)}
      ${tableElem(checkStorecode('message'), message)}
    </table>
  `

  msg.html = table

  return msg
}