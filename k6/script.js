import http from 'k6/http';

export default function () {
	http.get('https://fa2cb03b5f.azurewebsites.net/api/users');
}