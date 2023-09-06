import { Helmet } from "react-helmet";
import React, { useState, useEffect, Fragment } from "react";
import { Button, Grid, Typography } from "@material-ui/core";
import useScript from "../hooks/useScript";
  

export default function EmbedSpotify(props) {
    const[embedControllers, setEmbedControllers] = useState([null, null]);
    useScript("https://open.spotify.com/embed-podcast/iframe-api/v1");

    // const handleLoad = () => {
    //     if (embedController == null) {
    //         return
    //     }
    //     embedController.loadUri("spotify:track:6NhS5LwYbJ6xD7BGvlWRJO");
    // }

    useEffect(() => {
        window.onSpotifyIframeApiReady = (IFrameAPI) => {
            let element1 = document.getElementById('embed-iframe-1');
            let element2 = document.getElementById('embed-iframe-2');
            let options = {
                width: '80%',
                height: '100%',
                uri: "spotify:track:6NhS5LwYbJ6xD7BGvlWRJO"
            };
          
            // let callback = (EmbedController) => {
            //     embedControllers[0];
            //     // document.querySelectorAll('ul#episodes > li > button').forEach(
            //     //     episode => {
            //     //     episode.addEventListener('click', () => {
            //     //         EmbedController.loadUri(episode.dataset.spotifyId)
            //     //     });
            //     // })
            // };
            IFrameAPI.createController(element1, options, (EmbedController) => {embedControllers[0] = EmbedController});
            IFrameAPI.createController(element2, options, (EmbedController) => {embedControllers[1] = EmbedController});
        }
    });



    return (
        <>
        <Grid container align="center" spacing={1}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h4">
                Pick an Episode
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <div id="embed-iframe-1"/>
          </Grid> 
          <Grid item xs={6}>
            <div id="embed-iframe-2"/>
          </Grid> 
        </Grid>
        </>
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