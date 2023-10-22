import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import { Card, CardOverflow, CardContent, AspectRatio,  Button, Link } from "@mui/joy";


export default function MusicCard(props){

    return (
        <Grid item xs={12}>
            <Card
             height={150}
             orientation="horizontal"
             variant="plain card"
             style={{backgroundColor: "black"}}
            >
                <CardOverflow>
                    <AspectRatio ratio="1" sx={{ width: 150 }}>
                        <img src={props.image_url} loading="lazy" alt=""/>
                    </AspectRatio>
                </CardOverflow>
                <CardContent>
                    <Typography variant="h6" color="white">
                        {props.title}
                    </Typography>
                    <Typography color="textSecondary" variant="subtitle2">
                        {props.artist}
                    </Typography>
                    <Box width={1}>
                        <Button sx={{backgroundColor:"#1DB954", color:"white"}} size="sm">
                            Select
                        </Button>
                    </Box>
                </CardContent>
                <CardOverflow
                    variant="soft"
                    color="primary"
                    sx={{
                    px: 0.2,
                    // writingMode: 'vertical-rl',
                    textAlign: 'center',
                    align: 'center',
                    fontSize: 'xs',
                    fontWeight: 'xl',
                    letterSpacing: '1px',
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                    }}
                >
                    <Link underline="none" overlay>
                        <div className="rotated">
                            <Typography>
                                Preview
                            </Typography>
                        </div>
                    </Link>
                </CardOverflow>
            </Card>
        </Grid>
    )
}