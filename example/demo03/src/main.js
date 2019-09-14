import axios from 'axios';
let result;
(async () => {
	console.log('main.js');
	try {
		result = await axios.get('/mojiweather/forecast.php');
		console.log('/mojiweather/forecast.php=>', result);
	} catch (e) {
		console.log(e)
	}
})();
