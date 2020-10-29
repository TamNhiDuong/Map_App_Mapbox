import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

import MapboxGL from '@react-native-mapbox-gl/maps';
import axios from "axios";


//Get Token from Mapbox website
MapboxGL.setAccessToken('pk.eyJ1IjoibmhpZHVvbmc5NiIsImEiOiJja2d0dzBhamIwZXRwMzVxcjZmOWxsaHY2In0.DTvEY9r2c1RZ1hU-VyoAhw');
const IS_ANDROID=Platform.OS==='android';

export default class MapApp extends Component {
  async UNSAFE_componentWillMount(){
    if(IS_ANDROID) {
      const isAndroidGranted = await MapboxGL.requestAndroidLocationPermissions();
      this.setState({
        isAndroidPermissionGranted: isAndroidGranted, 
        isFetchAndroidPermission: false,
      });
    }
  }
  constructor(props){
    super(props);
    this.state = {
      isAndroidPermissionGranted:false,
      isFetchAndroidPermission:IS_ANDROID,
      showUserLocation:true,
      coordinates: [[24.93545, 60.16952]], //Latitude and longitude is the order 
      location:[24.93545, 60.16952],
      countries_data: [],
      data_loaded: false,
    }
  }

  componentDidMount() {
    this.fetchCountryData();
  }

  fetchCountryData = async () => {
    try {
      const response = await axios({
        method: "get",
        url: "https://corona-api.com/countries",
      });
      console.log(response.data.data);
    } catch (e) {
      console.log("unable to retrieve data", e);
    }
  };

  render() {
    const {container} = styles;
    const { countries_data, data_loaded } = this.state;
    return (
      <SafeAreaView style={container}>
        <View style={container}>
          <MapboxGL.MapView
            style={container}
            styleURL={MapboxGL.StyleURL.Street}
            ref = {c=>(this._map=c)}
            zoomLevel={6}
            centerCoordinate={this.state.coordinates[0]}
            showUserLocation={true}
            userTrackingMode={this.state.userSelectedUserTrackingMode}
          >
            <MapboxGL.Camera
               zoomLevel={6}
               animationMode={'flyTo'}
               animationDuration={0}
               ref={c=>(this.camera=c)}
               centerCoordinate={this.state.location}
            >
            </MapboxGL.Camera>
          </MapboxGL.MapView>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
  }
});


