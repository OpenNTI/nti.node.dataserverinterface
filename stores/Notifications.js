/*
Service.getPageInfo(Globals.CONTENT_ROOT,
	//success:
	function(pageInfo) {
		var url = pageInfo.getLink(Globals.MESSAGE_INBOX);
		if (!url) {
			console.error('No Notifications url');
			url = 'bad-notifications-url';
		}

		store.lastViewed = new Date(0);

		Service.request(url + '/lastViewed')
				.then(function(lastViewed) {
					store.lastViewed = new Date(parseFloat(lastViewed) * 1000);
				})
				.fail(function() {
					console.warn('Could not resolve notification`s lastViewed');
				})
				.then(function() {
					store.proxy.proxyConfig.url = url;
					store.url = store.proxy.url = url;

					console.debug('Loading notifications: ' + url);
					store.load();
				});
	},
	//failure:
	function() {
		console.error('Could not setup notifications!');
	},
	this);
*/
