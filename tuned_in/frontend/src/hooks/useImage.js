import { BASE_URL } from "../backend/API";


export default function useImage(type, imageName) {
    const assetsUrl = `${BASE_URL}static/assets/`;
    const folders = {
        'logo': 'logos/',
        'avatar': 'avatars/',
        'background': 'backgrounds/'
    };
    const folder = folders[type];
    const ext = type == 'avatar' ? '.jpg' : '.png'
    return `${assetsUrl}${folder}${imageName}${ext}`
}
