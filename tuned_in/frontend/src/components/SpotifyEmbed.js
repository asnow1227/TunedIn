import { Helmet } from "react-helmet";
import React, { useState, useEffect } from "react";
import { Button } from "@material-ui/core";
import useScript from "../hooks/useScript";
  

export default function EmbedSpotify(props) {
    const[embedController, setEmbedController] = useState(null);
    useScript("https://open.spotify.com/embed-podcast/iframe-api/v1");

    const handleLoad = () => {
        if (embedController == null) {
            return
        }
        embedController.loadUri("spotify:track:6NhS5LwYbJ6xD7BGvlWRJO");
    }

    useEffect(() => {
        window.onSpotifyIframeApiReady = (IFrameAPI) => {
            let element = document.getElementById('embed-iframe');
            let options = {
                width: '60%',
                height: '200',
                uri: 'spotify:episode:7makk4oTQel546B0PZlDM5'
            };
            let callback = (EmbedController) => {
                setEmbedController(EmbedController);
            // document.querySelectorAll('ul#episodes > li > button').forEach(
            //     episode => {
            //     episode.addEventListener('click', () => {
            //         EmbedController.loadUri(episode.dataset.spotifyId)
            //     });
            //     })
            };
            IFrameAPI.createController(element, options, callback);
        }
    });



    return (
        <div>
            <h1>Pick an episode...</h1>
            <ul id="episodes">
            <li>
                <Button onClick={handleLoad}>Click Me Bitch</Button>
                <button data-spotify-id="spotify:episode:7makk4oTQel546B0PZlDM5">
                My Path to Spotify: Women in Engineering
                </button>
            </li>
            <li>
                <button data-spotify-id="spotify:episode:43cbJh4ccRD7lzM2730YK3">
                What is Backstage?
                </button>
            </li>
            <li>
                <button data-spotify-id="spotify:episode:6I3ZzCxRhRkNqnQNo8AZPV">
                Introducing Nerd Out@Spotify
                </button>
            </li>
            </ul>
        <div id="embed-iframe"></div>
        </div>
    )
}

// <Helmet>
// <script src="https://open.spotify.com/embed-podcast/iframe-api/v1" async/>
// </Helmet>
// window.onSpotifyIframeApiReady = (IFrameAPI) => {
// let element = document.getElementById('embed-iframe');
// let options = {
//     width: '60%',
//     height: '200',
//     uri: 'spotify:episode:7makk4oTQel546B0PZlDM5'
// };
// let callback = (EmbedController) => {
//     setEmbedController(EmbedController);
// // document.querySelectorAll('ul#episodes > li > button').forEach(
// //     episode => {
// //     episode.addEventListener('click', () => {
// //         EmbedController.loadUri(episode.dataset.spotifyId)
// //     });
// //     })
// };
// IFrameAPI.createController(element, options, callback);
// }