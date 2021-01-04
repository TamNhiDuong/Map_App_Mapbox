import React, { Component } from 'react';

import MapboxGL from '@react-native-mapbox-gl/maps';
import GeoJSON from 'geojson';


export default class LocationMarkers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            isLoading: true,
        }
    }

    //Getting Data from API
    componentDidMount() {
        fetch('https://corona.lmao.ninja/v2/jhucsse')
          .then((response) => response.json())
          .then((data) => {
            let processData = data.map((point, index) => ({
                id: index,
                lat: point.coordinates.latitude,
                lng: point.coordinates.longitude,
                country: point.country,
                province: point.province,
                cases: point.stats.confirmed,
                deaths: point.stats.deaths

            }))
            // Converst data to GeoJSON that Mapbox can read
            let geoJSON = GeoJSON.parse(processData, {Point: ['lat', 'lng']});
            this.setState({data: geoJSON});
            console.log('GeoJson of markers', this.state.data);

          })
          .catch((error) => console.error(error))
          .finally(() => {
            this.setState({ isLoading: false });
          });
    }

    render() {
        let icon = {
            iconImage: require('./marker.png'),
            iconAllowOverlap:true,
            iconSize:1.2,
        }

        return this.state.isLoading ? null : (
            <MapboxGL.ShapeSource
                id={'shapeSource'}
                hitbox={{width:20, height: 20}}
                onPress={e=> { console.log(e)}}
                shape={this.state.data}
                title="test">
            <MapboxGL.SymbolLayer
                id= {'iconName'}
                style={icon}
                >
            </MapboxGL.SymbolLayer>
        
            </MapboxGL.ShapeSource>
        );
    }

}