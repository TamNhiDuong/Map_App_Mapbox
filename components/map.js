import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

import MapboxGL from '@react-native-mapbox-gl/maps';

import LocationMarkers from './locationMarkers';

//DRAWING POLYLINES
import { lineString as makeLineString } from '@turf/helpers';
import MapboxDirectionsFactory from '@mapbox/mapbox-sdk/services/directions';

//DRAWING POLYGON
import polygonGeoJSON from './polygon.json';

//Get Token from Mapbox website
MapboxGL.setAccessToken('pk.eyJ1IjoibmhpZHVvbmc5NiIsImEiOiJja2d0dzBhamIwZXRwMzVxcjZmOWxsaHY2In0.DTvEY9r2c1RZ1hU-VyoAhw');
const IS_ANDROID = Platform.OS === 'android';

const accessToken = 'pk.eyJ1IjoibmhpZHVvbmc5NiIsImEiOiJja2d0dzBhamIwZXRwMzVxcjZmOWxsaHY2In0.DTvEY9r2c1RZ1hU-VyoAhw';
const directionsClient = MapboxDirectionsFactory({ accessToken });

export default class Map extends Component {

  async UNSAFE_componentWillMount() {
    if (IS_ANDROID) {
      const isAndroidGranted = await MapboxGL.requestAndroidLocationPermissions();
      this.setState({
        isAndroidPermissionGranted: isAndroidGranted,
        isFetchAndroidPermission: false,
      });
    }
  }
  constructor(props) {
    super(props);
    this.state = {
      isAndroidPermissionGranted: false,
      isFetchAndroidPermission: IS_ANDROID,
      showUserLocation: true,
      coordinates: [
        [24.778523, 60.220415],
        [24.780872, 60.220310]
      ], //Latitude and longitude is the order 
      location: [24.778523, 60.220415],
      destinationPoint: [24.780872, 60.220310],
      route: null
    }
  }

  fetchRoute = async () => {
    const reqOptions = {
      waypoints: [
        { coordinates: this.state.location },
        { coordinates: this.state.destinationPoint },
      ],
      profile: 'driving-traffic',
      geometries: 'geojson',
    };

    const res = await directionsClient.getDirections(reqOptions).send();

    const newRoute = makeLineString(res.body.routes[0].geometry.coordinates);
    console.log('ROUTE data: ', JSON.stringify(newRoute))
    this.setState({ route: newRoute })
  };

  componentDidMount() {
    this.fetchRoute();
  }


  render() {
    const { container } = styles;
    const layerStyles = { //https://github.com/nitaliano/react-native-mapbox-gl/blob/master/docs/FillLayer.md
      fillAntialias: true,
      fillColor: 'yellow',
      fillOutlineColor: 'blue',
      fillOpacity: '0.7'
    };

    const renderAnnotations = () => {
      return (
        this.state.coordinates.map((point, index) => (
          <MapboxGL.PointAnnotation
            key={`${index}-PointAnnotation`}
            id={`${index}-PointAnnotation`}
            coordinate={point}>
            <View style={{
              height: 25,
              width: 25,
              backgroundColor: '#000ccc',
              borderRadius: 50,
              borderColor: '#fff',
              borderWidth: 3
            }}
            />
          </MapboxGL.PointAnnotation>
        ))
      );
    }

    return (
      <SafeAreaView style={container} >
        <View style={container} >
          <MapboxGL.MapView style={container}
            styleURL={MapboxGL.StyleURL.Street}
            ref={c => (this._map = c)}
            zoomLevel={10}
            centerCoordinate={this.state.coordinates[0]}
            showUserLocation={true}
            userTrackingMode={this.state.userSelectedUserTrackingMode} >
            <MapboxGL.Camera
              zoomLevel={10}
              animationMode={'flyTo'}
              animationDuration={0}
              ref={c => (this.camera = c)}
              centerCoordinate={this.state.location} >
            </MapboxGL.Camera>
            {renderAnnotations()}
            {
              this.state.route && (
                <MapboxGL.ShapeSource id='shapeSource' shape={this.state.route}>
                  <MapboxGL.LineLayer id='lineLayer' style={{ lineWidth: 5, lineJoin: 'bevel', lineColor: '#000ccc' }} />
                </MapboxGL.ShapeSource>
              )
            }
            {/* <MapboxGL.VectorSource>
              <MapboxGL.BackgroundLayer id='background'/>
            </MapboxGL.VectorSource> */}

            <MapboxGL.ShapeSource id='polygonSource' shape={polygonGeoJSON}>
              <MapboxGL.FillLayer id='polygonFill' style={layerStyles} />
            </MapboxGL.ShapeSource>
            {/* <LocationMarkers></LocationMarkers> */}
          </MapboxGL.MapView>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});