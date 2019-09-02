export default ({ email, subject }) => {
  const msg = {
    from: email,
    subject,
    text: 'Exch',
    html: '<strong>Exch html</strong>'
  };

  return msg
}