const fs = require('fs');
const http = require('http');
const url = require('url');
const queryString = require('querystring');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

/////////////////////////////////////////////
//FILES

// Blocking, synchronous way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File written!');

// Non blocking asynchronous way
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     console.log(data2);
//     fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//       console.log(data3);

//       fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//         console.log('Your file has been written ');
//       })
//     });
//   });
// });

/////////////////////////////////////
// SERVER

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  const baseURL = `http://${req.headers.host}`;
  const requestURL = new URL(req.url, baseURL);
  // requestURL variable contains the absolute URL
  // in this case it's http://localhost:8000/product?id=1

  // get the path name from URL: /product
  const pathName = requestURL.pathname;

  // get query from URL
  const query = requestURL.searchParams.get('id');

  console.log(pathName);
  console.log(query);

  // Overview page
  if (pathName === '/' || pathName === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = dataObj.map((el) => replaceTemplate(tempCard, el)).join();
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    // Set page html to output
    res.end(output);

    // Product page
  } else if (pathName === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    // access the relevant product in our json object
    const product = dataObj[query];
    // call the function which converts
    // our template file to the relevant product details
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // API
  } else if (pathName === '/api') {
    res.writeHead(200, { 'Content-type': 'Application/json' });
    res.end(data);
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world',
    });
    res.end('<h1>This page not found!</h1>');
  }
});

server.listen(5000, '86.152.5.78', () => {
  console.log('Listening to requests on port 5000');
});
