import axios from "axios";

export const BASE_URL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/';
const API_URL = BASE_URL + 'api/';
const SPOTIFY_URL = BASE_URL + 'spotify/';


const API = axios.create({
    baseURL: API_URL,
  });

export default API;

export const SPOTIFY_API = axios.create({
    baseURL: SPOTIFY_URL,
});


export async function authenticateUsersSpotify() {
  const response = await SPOTIFY_API.get('get-auth-url');
  window.location.replace(response.data.url);
};

