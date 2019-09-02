module.exports = {
  email: (v) => /\S+@\S+\.\S+/.test(v),
  phone: (v) => /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/m.test(v) || /^[1-9][0-9]{8}$/.test(v),
  name: (v) => /^(([A-Za-zĄąęĘóćĆłŁńŚśźŹżŻ]+[\-\']?)*([A-Za-zĄąęĘóćĆłŁńŚśźŹżŻ]+)?\s)+([A-Za-zĄąęĘóćĆłŁńŚśźŹżŻ]+[\-\']?)*([A-Za-zĄąęĘóćĆłŁńŚśźŹżŻ]+)?$/.test(v),
  orderDate: (v) => /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/.test(v),
  reason: (v) => v.length >= 2,
  accountNumber: (v) => v.length >= 14,
  products: (v) => {
    for (let item of v) {
      if (!item.name || item.name.length < 2) {
        return false
      }
      if (!item.color || item.color.length < 2) {
        return false
      }
      if (!item.size || item.size.length < 1) {
        return false
      }
      if (!item.price || item.price.length < 1 || isNaN(item.price)) {
        return false
      }
    }
    return true
  }
}