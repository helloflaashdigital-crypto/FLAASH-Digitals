const response = await fetch('http://localhost:5000/api/v1/contact', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    name: 'Website contact test',
    email: 'flaashdigital@gmail.com',
    phone: '9494582875',
    service: 'SEO',
    budget: 'Not Sure',
    message: 'This is a contact form delivery test message.',
  }),
});

console.log(response.status, await response.text());
