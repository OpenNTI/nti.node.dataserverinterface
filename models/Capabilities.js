'use strict';

var assign = require('../utils/assign');

var withValue = require('../utils/object-attribute-withvalue');

var capabilities = {
	canUploadAvatar: 'nti.platform.customization.avatar_upload',
	canBlog: 'nti.platform.blogging.createblogentry',
	canChat: 'nti.platform.p2p.chat',
	canShare: 'nti.platform.p2p.sharing',
	canFriend: 'nti.platform.p2p.friendslists',
	canHaveForums: 'nti.platform.forums.communityforums',
	canChangePassword: 'nti.platform.customization.can_change_password',
	canCreateLists: 'nti.platform.p2p.friendslists',
	canCreateGroups: 'nti.platform.p2p.dynamicfriendslists',

	canShareRedaction: false,

	canSeeBlogs: function() {
		return Boolean(this._service.getCollection('Blog'));
	},

	canRedact: function() {
		return !!this._service.getCollectionFor(
			'application/vnd.nextthought.redaction',
			'Pages');
	},

	canCanvasURL: function() {
		return !!this._service.getCollectionFor(
			'application/vnd.nextthought.canvasurlshape',
			'Pages');
	},

	canEmbedVideo: function() {
		return !!this._service.getCollectionFor(
			'application/vnd.nextthought.embeddedvideo',
			'Pages');
	},

};





function Capabilities(service, list) {
	Object.defineProperty(this, '_service', withValue(service));
	Object.defineProperty(this, '_list', withValue(list || []));

	var cap, test;

	for (cap in capabilities) {
		if (!capabilities.hasOwnProperty(cap)) {continue;}
		test = capabilities[cap];
		if (typeof test === 'string') {
			test = this.hasCapability(test);
		} else if (test.call){
			test = test.call(this);
		}

		this[cap] = test;
	}
}

assign(Capabilities.prototype, {
	hasCapability: function(c) {
		return this._list.indexOf(c) >= 0;
	}
});


module.exports = Capabilities;
