/* global google */
import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, Marker, InfoWindow } from "react-google-maps";

const GoogleMapWrapper = withGoogleMap(props => (
  <GoogleMap
    ref={(map) => {
      if(map && map.context){
        window.googleMap = map.context.__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      }
    }}
    defaultZoom={3}
    defaultCenter={{ lat: 40, lng: -98 }}
    onClick={props.onMapClick}
  >
    {props.markers.map((marker, index) => (
      <Marker
        {...marker}
        onClick={() => props.onMarkerClick(marker)}
      >
        {marker.showInfo && (
          <InfoWindow onCloseClick={() => props.onMarkerClose(marker)}>
            <div>{marker.infoContent}</div>
          </InfoWindow>
        )}
      </Marker>
    ))}
    {props.stopMarkers.map((marker, index) => (
      <Marker
        {...marker}
        onClick={() => props.onStopMarkerClick(marker)}
      >
        {marker.showInfo && (
          <InfoWindow onCloseClick={() => props.onStopMarkerClose(marker)}>
            <div>{marker.infoContent}</div>
          </InfoWindow>
        )}
      </Marker>
    ))}
  </GoogleMap>
));
class FoodStopMap extends Component {

  render() {
    return (
      <GoogleMapWrapper
        containerElement={
          <div style={{bottom: `0px`, top: `70px`, left:`0px`, right: `420px`, position: `absolute`}} />
        }
        mapElement={
          <div style={{height: '100%', width: '100%'}} />
        }
        onMapLoad={function(){}}
        onMapClick={function(){}}
        markers={this.props.markers}
        stopMarkers={this.props.stopMarkers}
        onMarkerClick={this.props.onMarkerClick}
        onMarkerClose={this.props.onMarkerClose}
        onStopMarkerClick={this.props.onStopMarkerClick}
        onStopMarkerClose={this.props.onStopMarkerClose}
      />
    );
  }
}

export default FoodStopMap;