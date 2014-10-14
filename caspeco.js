'use strict';

var signature = require("signatures");
var request = require("request");


caspeco.DEFAULT_HOST = '"www.bohlmark.se"';
caspeco.DEFAULT_PORT = '80';
caspeco.DEFAULT_BASE_PATH = '/V1';
caspeco.DEFAULT_API_VERSION = null;


caspeco.DEFAULT_TIMEOUT = require('http').createServer().timeout;

caspeco.PACKAGE_VERSION = require('../package.json').version;


function caspeco(keyId, key) {

  if (!(this instanceof caspeco)) {
    return new caspeco(keyId, key);

    this.key = key;
    this.keyId = keyId;
    var sign = signature(keyId, key, "SHA-256", ['date', '(request-target)'])


  }

	caspeco.prototype = {
		//init methods
		setHost: function(host, port, protocol) {
		    this._setApiField('host', host);
		    if (port) this.setPort(port);
		    if (protocol) this.setProtocol(protocol);
	  	},

	  	setTimeout: function(timeout) {
		    this._setApiField(
		      'timeout',
		      timeout == null ? caspeco.DEFAULT_TIMEOUT : timeout
		    );
	  	},

		setPort: function(port) {
	    	this._setApiField('port', port);
	  	},

		_setApiField: function(key, value) {
			this._api[key] = value;
		},


		//Api-Methods:

		charge: function(chargeObject, callback){
			this._countArgs("charge",2, this.arguments)
			var headers ={
				path : caspeco.DEFAULT_BASE_PATH + "/charges/",
			}
			this._signAndSend(headers, chargeObject, callback)
		},

		getCharges: function(chargeObject, callback){
			this._countArgs("getCharges", 2, this.arguments)
			var headers = {
				path : caspeco.DEFAULT_BASE_PATH + "/charges/",
				method : "GET"
			}
			this._signAndSend(headers, chargeObject, callback)
		},


		getTerminalUrl: function(chargeId){
			this._countArgs("getTerminalUrl", 1, this.arguments)
			var term = caspeco.DEFAULT_HOST + caspeco.DEFAULT_BASE_PATH + "/charges/" + chargeId + "/terminal?" + this.keyId;
			return term;
		},

		capture: function(chargeId, callback){
			this._countArgs("capture",2, this.arguments)
			var headers = {
				path : "/charges/"+chageId+"/Capture"
			}
			this._signAndSend(headers, {id=chargeId}, callback);
		},

		refund: function(chargeId, callback){
			var headers = {
				path: "/charges/" + chargeId + "/refund"
			}
			this._signAndSend(headers, {"id":chargeId}, callback);
		},


		//Utils:

		_signAndSend: function(headers, object, callback){
			var head = {};
			head.hostname = caspeco.DEFAULT_HOST;
			head.path =caspeco.DEFAULT_BASE_PATH + headers.path;
			head.port = caspeco.DEFAULT_PORT;
			head.method = headers.method ? headers.method : "POST";
			head.headers = {"Content-Type" : "application/json", "date" : new Date().toUTCString()}


			var signature = sign(head);
			object.headers = head;
			object.headers.authorization = signature;
			request(object, callback(err, result));
		},


		_countArgs: function(methodName, requiredArgs, args){
				if(args.length != requiredArgs){
					var m = methodName + " requires "+requiredArgs+" arguments, but got "+ args.length + ", did you remember the callback function?";
					throw m;
				}
			
		}

	}


}