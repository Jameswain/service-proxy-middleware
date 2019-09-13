module.exports = [
	{
		enable: true,
		context: [
			'/j/*'
		],
		target: 'https://movie.douban.com'
	},
	{
		enable: true,
		context: [
			'/passport'
		],
		target: 'http://news.baidu.com'
	},
	{
		enable: true,
		context: [
			'/mojiweather/**'
		],
		target: 'http://www.moji.com'
	}
]
