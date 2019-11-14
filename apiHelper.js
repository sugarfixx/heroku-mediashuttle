const request = require('request');

module.exports = {
    /*
    ** This method returns a promise
    ** which gets resolved or rejected based
    ** on the result from the API
    */
    make_API_call : function(url, data){
        return new Promise((resolve, reject) => {
            request.post({
                headers: {'content-type' : 'application/json'},
                url : url,
                body : JSON.stringify(data)
            }, (err, res, body) => {
                if (err) reject(err)
                resolve(body)
            });
        })
    }
}
