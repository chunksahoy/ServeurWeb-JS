var http = require("http");
var querystring = require('querystring');
var url = require("url");

var toBase64 = function(str) {
   return (new Buffer(str || "", "ascii")).toString("base64");
};
var fromBase64 = function(str) {
   return (new Buffer(str || "", "base64")).toString("ascii");
};
function commandesValides() {
	return ["/minify","/jshint"];	
}
function contient(array, chaine) {
	for (var i = 0; i < array.length; ++i) {
		if (array[i] === chaine) {
			return true;
		}
	}
	return false;
}
function start() {
	console.log("Lancement du serveur...");

   function onRequest(request, response) {
      var parsedUrl = url.parse(request.url);
      var pathname = parsedUrl.pathname;
      var query = parsedUrl.query;
      var search = parsedUrl.search;
      var inputText = decodeURIComponent(escape(fromBase64(querystring.parse(query).input)));
      var zeQuery = querystring.stringify({
         input : inputText
      });
	  if(!contient(commandesValides(), pathname)) {
		 console.log("Service non supporté!");
	  }
      else if (request.method === 'POST') {
		var req;
		switch(pathname) {
		case '/minify':
			req = Options.getInstance().traiterOptions(0, response);
			break;
		case '/jshint': 
			req= Options.getInstance().traiterOptions(1, response);
			break;
		default: 
			console.log("Erreur: Service non supporté!");
			break;
		}
         req.on('error', function(err) {
            throw err;
         });
         req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
         req.setHeader('Content-Length', zeQuery.length);
         req.end(zeQuery, 'utf8');
      }
      else if (request.method == 'GET') {
         console.log("get...");
      }
      else {
         console.log("duh?...");
      }
   }
   http.createServer(onRequest).listen(8888);
   console.log("Le serveur a ete demarre.");
}
exports.start = start;

var Options = (function () {
      var instance;
      function ZeOptions() {
          var options = new Array();
			options[0] = requeteMini; // on suppose qu'une fonction de ce nom a été définie plus haut
			options[1] = requeteHint;   // idem
			
			this.traiterOptions = function (nb, response) {
   				if(options[nb] != null) {
      				return options[nb](response);
  				}
			}
      }			
      function createInstance() {
          var singleton = new ZeOptions();
          return singleton;
      }
      return {
          getInstance : function() {
              if (!instance) {
                  instance = createInstance();
              }
              return instance;
          }	
      };
  })();
  
  function requeteMini(response) {
	return http.request({
               method   : 'POST',
               hostname : 'javascript-minifier.com',
               path     : '/raw',
            },
            function(resp) {
               var msgRecu = "";
               resp.on('data', function (moton) {
                  msgRecu += moton;
               });
               resp.on('end', function () {
                  response.writeHead(200, {
                     "Content-Type": "text/plain",
                     "Access-Control-Allow-Origin": "*",
                     "Access-Control-Allow-Headers": "X-Requested-With"
                  });
                  response.write(toBase64(unescape(encodeURIComponent(msgRecu))));
                  response.end();
               });
               if ( resp.statusCode !== 200 ) {
                  return;
               }
            }
         );
  }
  function requeteHint(response) {
	return http.request({
               method   : 'POST',
               hostname : 'javascript-minifier.com',
               path     : '/raw',
            },
            function(resp) {
               var msgRecu = "";
               resp.on('data', function (moton) {
                  msgRecu += moton;
               });
               resp.on('end', function () {
                  response.writeHead(200, {
                     "Content-Type": "text/plain",
                     "Access-Control-Allow-Origin": "*",
                     "Access-Control-Allow-Headers": "X-Requested-With"
                  });
                  response.write(toBase64(unescape(encodeURIComponent(msgRecu))));
                  response.end();
               });
               if ( resp.statusCode !== 200 ) {
                  return;
               }
            }
         );  
  }