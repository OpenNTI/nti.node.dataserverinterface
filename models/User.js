'use strict';

var assign = require('object-assign');
var base = require('./mixins/Base');

var defineProperties = require('../utils/object-define-properties');
var withValue = require('../utils/object-attribute-withvalue');

function User(service, data) {
	defineProperties(this, {
		_service: withValue(service),
		DisplayName: {
			get: function() {
				return this.alias ||
				   this.realname ||
				   this.Username;
			}
		}
	});
	assign(this, data);


}


assign(User.prototype, base, {


});



function parse(service, data) {
	return new User(service, data);
}

User.parse = parse;

module.exports = User;
