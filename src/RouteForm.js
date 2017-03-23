/* global google */
import React, { Component } from 'react';
import SearchResults from './SearchResults';
import RouteOption from './RouteOption';
import RouteConfig from './RouteConfig';
import FoodStopMap from './FoodStopMap';
import axios from 'axios';
import Select from 'react-select';
import busIcon from './img/bus-icon2.png'

import 'react-select/dist/react-select.css';

class RouteForm extends Component {
    constructor() {
        super();
        this.state = {
            agencyOptions: [],
            lineOptions: [],
            directionOptions: [],
            startOptions: [],
            destinationOptions: [],
            results: [],
            markers: [],
            stopMarkers: [],
            agencySelected: null,
            lineSelected: null,
            directionSelected: null,
            startSelected: null,
            destinationSelected: null,
        };
        this.routeConfig = null;
        this.map = null;
        this.getAgencyOptions();
    }

    getAgencyOptions() {
        axios.get('http://webservices.nextbus.com/service/publicJSONFeed?command=agencyList').then(res => {
            const agencyModels = res.data.agency;
            let agencyOptions = [];
            for(let i=0; i<agencyModels.length; i++) {
                agencyOptions.push(new RouteOption(agencyModels[i]['tag'], agencyModels[i]['title']));
            }
            this.setState(Object.assign({}, this.state, {agencyOptions: agencyOptions}));
        });
    }

    handleAgencySelected(event) {
        this.setState(Object.assign({}, this.state, {
            lineOptions: [],
            directionOptions: [],
            startOptions: [],
            destinationOptions: [],
            results: [],
            markers: [],
            stopMarkers: [],
            agencySelected: event ? event.value : null,
            lineSelected: null,
            directionSelected: null,
            startSelected: null,
            destinationSelected: null,
        }));
        if(event===null){
            return;
        }

        axios.get('http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a='+event.value).then(res => {
            const lineModels = res.data.route;
            let lineOptions = [];
            if(lineModels.length) {
                for(let i=0; i<lineModels.length; i++) {
                    lineOptions.push(new RouteOption(lineModels[i]['tag'], lineModels[i]['title']));
                }
            } else {
                // There's just one line (NextBus will return an dict instead of an array)
                lineOptions.push(new RouteOption(res.data.route['tag'], res.data.route['title']))
            }
            this.setState(Object.assign({}, this.state, {lineOptions: lineOptions}));
        });
    }

    handleLineSelected(event) {
        this.setState(Object.assign({}, this.state, {
            directionOptions: [],
            startOptions: [],
            destinationOptions: [],
            results: [],
            markers: [],
            stopMarkers: [],
            lineSelected: event ? event.value : null,
            directionSelected: null,
            startSelected: null,
            destinationSelected: null,
        }));
        if(event===null){
            return;
        }

        axios.get('http://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a='+this.state.agencySelected+'&r='+event.value).then(res => {
            if(this.routeConfig) {
                this.routeConfig.polylines.forEach((polyline) => {
                    polyline.setMap(null);
                });
            }
            this.routeConfig= new RouteConfig(res.data.route);
            window.googleMap.fitBounds(this.routeConfig.bounds);
            this.routeConfig.polylines.forEach((polyline) => {
                polyline.setMap(window.googleMap);
            });
            this.setState(Object.assign({}, this.state, {directionOptions: this.routeConfig.directionOptions}));
        });
    }

    handleDirectionSelected(event) {
        this.setState(Object.assign({}, this.state, {
            startOptions: event ? this.routeConfig.getStartOptions(event.value) : [],
            destinationOptions: [],
            results: [],
            markers: [],
            stopMarkers: [],
            directionSelected: event ? event.value : null,
            startSelected: null,
            destinationSelected: null,
        }));
    }

    handleStartSelected(event) {
        this.setState(Object.assign({}, this.state, {
            destinationOptions: event ? this.routeConfig.getStopOptionsAfter(event.value, this.state.directionSelected) : [],
            results: [],
            markers: [],
            stopMarkers: [],
            startSelected: event ? event.value : null,
            destinationSelected: null,
        }));
    }

    handleDestinationSelected(event) {
        if(event===null){
            this.setState(Object.assign({}, this.state, {
                results: [],
                markers: [],
            }));
            return;
        }
        const stopModels = this.routeConfig.getStopModelsBetween(this.state.directionSelected, this.state.startSelected, event.value);
        this.setState(Object.assign({}, this.state, {
            destinationSelected: event.value,
            results: [],
            markers: [],
            stopMarkers: createMarkersFromStopModels(stopModels),
        }));
        
        getBusinessesNearStops(stopModels, businesses => {
            let markers = createMarkersFromBusinessModels(businesses);
            this.setState(Object.assign({}, this.state, {results: businesses, markers: markers}));
        });
    }

    handleMarkerClick(targetMarker) {
        this.setState({
            markers: this.state.markers.map(marker => {
                if (marker === targetMarker) {
                    window.googleMap.panTo(marker.position);
                    window.googleMap.setZoom(17);
                    return {
                        ...marker,
                        showInfo: true,
                    };
                }
                return {
                    ...marker,
                    showInfo: false,
                };
            }),
        });
        
        document.getElementById(targetMarker.key).focus();
    }

    handleStopMarkerClick(targetMarker) {
        this.setState({
            stopMarkers: this.state.stopMarkers.map(stopMarker => {
                if (stopMarker === targetMarker) {
                    return {
                        ...stopMarker,
                        showInfo: true,
                    };
                }
                return stopMarker;
            }),
        });
    }

    handleStopMarkerClose(targetMarker) {
        this.setState({
            stopMarkers: this.state.stopMarkers.map(stopMarker => {
                if (stopMarker === targetMarker) {
                    return {
                        ...stopMarker,
                        showInfo: false,
                    };
                }
                return stopMarker;
            }),
        });
    }

    handleMarkerClose(targetMarker) {
        this.setState({
            markers: this.state.markers.map(marker => {
                if (marker === targetMarker) {
                    return {
                        ...marker,
                        showInfo: false,
                    };
                }
                return marker;
            }),
        });
    }

    handleResultClick(result) {
        this.setState({
            markers: this.state.markers.map(marker => {
                if (marker.key === result.id) {
                    window.googleMap.panTo(marker.position);
                    window.googleMap.setZoom(17);
                    return {
                        ...marker,
                        showInfo: true,
                    };
                }
                return {
                    ...marker,
                    showInfo: false,
                };
            }),
        });
    }

    render() {
        return (
            <div className="route-form">
                <div className="sidebar" style={{width: `400px`, right: `0px`, position: `absolute`, top: `70px`, bottom: `0px`, padding: `10px`, overflowY: `scroll`}}>
                    <div className="selectors">
                        <div className="selectors-label">Select your bus...</div>
                        { this.state.agencyOptions.length > 0 ? <Select placeholder='Service' name='service' options={this.state.agencyOptions} onChange={this.handleAgencySelected.bind(this)} value={this.state.agencySelected} /> : null}
                        { this.state.lineOptions.length > 0 ? <Select placeholder='Line' name='line' options={this.state.lineOptions} onChange={this.handleLineSelected.bind(this)} value={this.state.lineSelected} /> : null }
                        { this.state.directionOptions.length > 0 ? <Select placeholder='Direction' name='direction' options={this.state.directionOptions} onChange={this.handleDirectionSelected.bind(this)} value={this.state.directionSelected} /> : null }
                        { this.state.startOptions.length > 0 ? <Select placeholder='Start' name='start' options={this.state.startOptions} onChange={this.handleStartSelected.bind(this)} value={this.state.startSelected} /> : null }
                        { this.state.destinationOptions.length > 0 ? <Select placeholder='Destination' name='destination' options={this.state.destinationOptions} onChange={this.handleDestinationSelected.bind(this)} value={this.state.destinationSelected} /> : null }
                    </div>
                    <SearchResults results={this.state.results} handleResultClick={ this.handleResultClick.bind(this) } />
                </div>
                <FoodStopMap
                    markers={this.state.markers}
                    stopMarkers={this.state.stopMarkers}
                    id="food-map-container"
                    onMarkerClick={this.handleMarkerClick.bind(this)}
                    onMarkerClose={this.handleMarkerClose.bind(this)}
                    onStopMarkerClick={this.handleStopMarkerClick.bind(this)}
                    onStopMarkerClose={this.handleStopMarkerClose.bind(this)}
                />
            </div>
        );
    }
}

function getBusinessesNearStops(stopModels, cb) {
    let resolveCount = 0;
    let businessIds = new Set()
    let businesses = []
    for(let i=0; i < stopModels.length; i++){
        let service = new google.maps.places.PlacesService(window.googleMap);
        let request = {
            location: new google.maps.LatLng(parseFloat(stopModels[i].lat), parseFloat(stopModels[i].lon)),
            radius: 200,
            type: "restaurant"
        }
        service.nearbySearch(request, searchCallback);
    }
    function searchCallback(searchResult) {
        if(searchResult!==null) {
            searchResult.forEach(business => {
                if(!businessIds.has(business.id)) {
                    businesses.push(business);
                    businessIds.add(business.id);
                }
            })
        }
        resolveCount++;
        if(resolveCount === stopModels.length) {
            cb(businesses);
        }
    }
}

function createMarkersFromBusinessModels(businesses) {
    let markers = []
    businesses.forEach((business) => {
        markers.push({
            position: {
                lat: business.geometry.location.lat(),
                lng: business.geometry.location.lng(),
            },
            key: business.id,
            defaultAnimation: 2,
            showInfo: false,
            infoContent: business.name,
        });
    })
    return markers;
}

function createMarkersFromStopModels(stopModels) {
    let markers = []
    for(let i=0; i < stopModels.length; i++){
        let stopModel = stopModels[i];
        markers.push({
            position: {
                lat: parseFloat(stopModel.lat),
                lng: parseFloat(stopModel.lon),
            },
            icon: busIcon,
            key: stopModel.tag,
            defaultAnimation: 2,
            showInfo: false,
            infoContent: "Stop #" + (i+1).toString() + ": " + stopModel.title,
        });
    }
    return markers;
}

export default RouteForm;

