
//const URL = '//vimeo.com/api/v2/video/{0}.json',
const URL = '//vimeo.com/api/oembed.json?url=http%3A//vimeo.com/{0}';

export default class MetaDataResolverForVimeo {

	static resolve (service, source) {

		let url = URL.replace('{0}', source.source[0]);
		console.log(url);
		return service.get(url)
				.then(o=> o[0] || o)
				.then(o=>
					({
						poster: o.thumbnail_url
					})
				);

		/*
		author_name: "Oklahoma State University"
		author_url: "http://vimeo.com/osu"
		description: ""
		duration: 788
		height: 480
		html: "<iframe..."
		is_plus: "0"
		provider_name: "Vimeo"
		provider_url: "https://vimeo.com/"
		thumbnail_height: 427
		thumbnail_url: "http://i.vimeocdn.com/video/500719224_640.jpg"
		thumbnail_width: 640
		title: "Academic Integrity"
		type: "video"
		uri: "/videos/114672468"
		version: "1.0"
		video_id: 114672468
		width: 720
		 */
	}
}
