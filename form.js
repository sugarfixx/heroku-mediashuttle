const Express = require('express');
const app = Express();
const bodyParser = require('body-parser');
const querystring = require('querystring');
const crypto = require('crypto');
const PORT = process.env.PORT || 5000

const urlencodedParser = bodyParser.urlencoded({ extended: true });
const textParser = bodyParser.text({ type: '*/*' });

let registrationKey = 'e80764b1-d79b-4c61-9914-eafc677cc793';
let formUrl = '/form.html';

const generateSignedUrl = (requestUrl, requestBody, registrationKey) => {
    const requestTimestamp = new Date().toISOString();

    // Generate canonical query string
    const algorithmParam = 'X-Sig-Algorithm=SIG1-HMAC-SHA256';
    const dateParam = `X-Sig-Date=${requestTimestamp}`;
    const canonicalQueryString = `${querystring.escape(algorithmParam)}&${querystring.escape(dateParam)}`;

    // Generate the string to sign
    const requestBodyHash = crypto.createHash('sha256').update(requestBody).digest('hex');
    const stringToSign = `${requestTimestamp}\n${requestUrl}\n${canonicalQueryString}\n${requestBodyHash}`;

    // Generate the signing key
    let hmac = crypto.createHmac('sha256', registrationKey);
    const signingKey = hmac.update(requestTimestamp).digest();

    // Generate request signature
    hmac = crypto.createHmac('sha256', signingKey);
    const signature = hmac.update(stringToSign).digest('hex');

    // Generate the signed URL
    const signatureParam = `X-Sig-Signature=${signature}`;
    return `${requestUrl}?${algorithmParam}&${dateParam}&${signatureParam}`;
};
app.engine('html', require('ejs').renderFile);
app.set('view engine','html');

app.use('/show', urlencodedParser, function (req, res) {
    res.render( __dirname + formUrl, {
        redirectUrl: req.body.redirectUrl,
        packageId : req.body.packageId
    });
});

app.post('/process', textParser, function (req, res) {
  const form = querystring.parse(req.body);
  const signedUrl = generateSignedUrl(form.redirectUrl, req.body, registrationKey);
  res.set('Location', signedUrl);
  res.status(307).end();
});

app.get("/", (req, res) => {
    console.log( __dirname + formUrl);
    res.render( __dirname + formUrl, {
        redirectUrl: 'detta-gitt',
        packageId : '123456789'
    });
});


app.listen(PORT, () => {
  console.log("Server is listening on port:", PORT);
});
