import axios from 'axios';
let result;
(async () => {
	try {
		result = await axios.get('/j/search_subjects?type=movie&tag=%E7%83%AD%E9%97%A8&page_limit=50&page_start=0');
		console.log('/j/search_subjects=>', result);
	} catch (e) {
		console.log(e)
	}
	
	try {
		result = await axios.get('/passport');
		console.log('/passport=>', result);
	} catch (e) {
		console.log(e);
	}
	
	try {
		result = await axios.get('/mojiweather/forecast.php');
		console.log('/mojiweather/forecast.php=>', result);
	} catch (e) {
		console.log(e)
	}
	
	try {
		result = await axios.get('/mojiweather/news.php');
		console.log('/mojiweather/news.php=>', result);
	} catch (e) {
		console.log(e)
	}
})();
