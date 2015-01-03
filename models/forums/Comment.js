'use strict';

var Base = require('./Post');


function Comment(service, parent, data) {
	Base.call(this, service, parent, data);
}

Comment.prototype = Object.create(Base.prototype);
Object.assign(Comment.prototype, {
	constructor: Comment
});





function parse(service, parent, data) {
	return new Comment(service, parent, data);
}


Comment.parse = parse;
module.exports = Comment;
