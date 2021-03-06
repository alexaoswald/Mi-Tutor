import React, { Component } from "react";
import { Link } from "react-router-dom";
import Map from "../components/Map";
import Inperson from "../components/Inperson";
import M from "materialize-css";
import API from "../utils/API";

class SearchResults extends Component {
  constructor(props) {
    super(props)
    this.state = {
      address: [],
      latLong: {}
    }
  }

  //  display inperson tutors on map.
  loadTutors = (map) => {
    var addresses = []
    var lat = []
    var long = []
    var markers = []
    var names = []
    var bounds = new window.google.maps.LatLngBounds();
    var infowindow = new window.google.maps.InfoWindow();


    API.getInperson()
      .then(res => res.data.map(tutors => {
        addresses.push(tutors.address)
        names.push(tutors.first_name +" "+ tutors.last_name)
      }))
      .then(() => {
        this.setState({ address: addresses },
          function () {
            for (var i = 0; i < this.state.address.length; i++) {
              API.getFromGeo(this.state.address[i])
                .then((res => {
                  lat.push(res.data.results[0].geometry.location.lat)
                  long.push(res.data.results[0].geometry.location.lng)
                }))

            }
          })
      }).then(setTimeout(function () {
        console.log(addresses)
        console.log(lat)
        console.log(long)
        console.log(names)

        for (var i = 0; i < addresses.length; i++) {
          markers.push([addresses[i], lat[i], long[i]])
        }
        console.log(markers)

        for (var i = 0; i < markers.length; i++) {
          var position = new window.google.maps.LatLng(markers[i][1], markers[i][2]);
          bounds.extend(position);
          var marker = new window.google.maps.Marker({
            position: position,
            map: map,
            title: markers[i][0]
          })
         
          window.google.maps.event.addListener(marker, "click", (function(marker, i){
            console.log("clicked")
           
            return function(){
              infowindow.setContent(names[i]);
              infowindow.open(map, marker);
            }
          })(marker, i));
        }
      }, 1000))
  }

  loadLatLong = () => {
    console.log(this.state.address, "state address inside load");
  }

  componentDidMount() {
    M.AutoInit()
    this.loadTutors();
    this.loadLatLong();
  }

  render() {

    return (
      <div>
        <div className=" bg-2 valign-wrapper">
          <div className="row">
            <div className="col s12 ">
              <Map
                id="myMap"
                options={{
                  center: { lat: this.props.lat ? this.props.lat : 41.0082, lng: this.props.lng ? this.props.lng : 28.9784 },
                  zoom: 10
                }}
                onMapLoad={this.loadTutors}
              ></Map>
            </div>
          </div>
        </div>
        <div className="indigo lighten-2">
          <div className="row">
            <div className="col s0 m3"></div>
            <div className="col s12 m6">
              <div className="center-align">
                <h3 className="white-text">In-Person Tutors</h3>
                <Inperson></Inperson>
              </div>
              <div className="row">
                <div className="center-align">
                  <Link to="/remote" className=" waves-effect waves-light btn">Remote Tutors</Link>
                </div>
              </div>
            </div>
            <div className="col s0 m3"></div>
          </div>
        </div>
      </div>
    )
  };
}

export default SearchResults;