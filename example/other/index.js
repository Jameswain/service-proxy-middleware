import axios from 'axios';
let result;
(async () => {
	console.log('other.js...');
	
	try {
		result = await axios.get('/mojiweather/news.php');
		console.log('/mojiweather/news.php=>', result);
	} catch (e) {
		console.log(e)
	}
})();


