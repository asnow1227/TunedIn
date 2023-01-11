import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { TextField, Grid, Card, Typography} from "@material-ui/core";
import MusicCard from "./MusicCard";

const style = {
  margin: "0 auto",
};

export default class SelectSongPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            hasMore: true,
            q: "",
            currPage: 1,
            currentIds: new Set(),
            selected: {},
            selectedComp: null,
        }
        this.fetchMoreData = this.fetchMoreData.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.selectedCallback = this.selectedCallback.bind(this);
    }
//   state = {
//     items: Array.from({ length: 20 })
//   };

    componentDidMount() {
        this.fetchMoreData()
    }

    selectedCallback(props, comp) {
        if (props == {}){
            this.setState({
                selected: props,
                selectedComp: null,
            });
            return 
        }
        if (this.state.selectedComp !== null){
            console.log(this.state.selected);
            this.state.selectedComp.setState({
                selected: false,
            })
        }
        this.setState({
            selected: props,
            selectedComp: comp,
        });
    }

    async fetchMoreData(from_search = false) {
        // a fake async api call like which sends
        // 20 more records in 1.5 secs
        var page = this.state.currPage;
        if (from_search) {
            page = 1;
        }
        const response = await axios.get(
            `http://127.0.0.1:8000/spotify/get-songs?query=${this.state.q}&page=${page}&limit=10`
        )
        console.log(response.data);
        console.log(page);
        if (!response.data.data.length) {
            this.setState({ hasMore: false });
            return 
        }

        var elementsToAdd = new Array()

        response.data.data.forEach((element) => {
            if (this.state.currentIds.has(element.id)){
                console.log(element.id)
                return 
            }
            this.state.currentIds.add(element.id);
            elementsToAdd.push(element)
        })

        // if (from_search){
        //     this.setState({
        //         items: [...elementsToAdd], 
        //         currPage: 2,
        //     })
        //     return
        // }

        this.setState({
            items: [...this.state.items, ...elementsToAdd],
            currPage: page + 1,
        });
    };

    handleSearchChange(e) {
        this.setState({
            items: [],
            hasMore: true,
            currPage: 1,
            q: e.target.value,
            currentIds: new Set(),
        });
        this.fetchMoreData(true);
    }

    render() {
        return (
        <div className="box" align="center">
            <div className = "row header" align="center">
                <TextField
                id="filled-search"
                label="Select a Song"
                type="search"
                variant="filled"
                onChange={e => this.handleSearchChange(e)}
                />
            </div>
            <div id="scrollableDiv" className="row content" align="center">
                <hr></hr>
                <InfiniteScroll
                className="white-outline"
                dataLength={this.state.items.length}
                next={this.fetchMoreData}
                hasMore={this.state.hasMore}
                loader={<h4>Loading...</h4>}
                scrollableTarget="scrollableDiv"
                >
                <Grid container align="center" spacing={1}>
                {this.state.items.map((i, index) => (
                    <MusicCard {...i} key={index} selectedCallback={this.selectedCallback}/>)
                )}
                </Grid>
                </InfiniteScroll>
            </div>
            <div className="row footer">
                <hr></hr>
                <Typography variant="h6" component="h6">Selected Song</Typography>
                {
                    this.state.selected.id ? 
                    <MusicCard {...this.state.selected} /> :
                    <MusicCard title="No Song Selected" 
                    image_url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="/>
                }
            </div>
        </div>
        );
  }
}
