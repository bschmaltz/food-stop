/* global google */
import RouteOption from './RouteOption';

class RouteConfig {
    constructor(routeConfigModel) {
        this.tag = routeConfigModel.tag;
        this.title = routeConfigModel.title;

        let paths = [];
        routeConfigModel.path.forEach((points) => {
            let path = []
            points.point.forEach((point) => {
                path.push({lat: parseFloat(point.lat), lng: parseFloat(point.lon)});
            });
            paths.push(path)
        });

        this.polylines = []
        paths.forEach((path) => {
            this.polylines.push(new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: routeConfigModel.color,
                strokeOpacity: 1.0,
                strokeWeight: 2
            }));
        })

        this.bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(routeConfigModel.latMin, routeConfigModel.lonMin),
            new google.maps.LatLng(routeConfigModel.latMax, routeConfigModel.lonMax)
        );

        this.directionOptions = [];
        this.directionToStopOptions = {};
        this.directionToStopTags = {}
        this.directionToStopModels = {}

        let stopTagToStopModel = {}
        for(let i=0; i<routeConfigModel.stop.length; i++) {
            stopTagToStopModel[routeConfigModel.stop[i].tag] = routeConfigModel.stop[i];
        }

        const directionModels = routeConfigModel.direction;
        if(directionModels.length) {
            for(let j=0; j<directionModels.length; j++) {
                this.processDirectionModel(directionModels[j], stopTagToStopModel);
            }
        } else {
            // There's just one direction (NextBus will return an dict instead of an array)
            this.processDirectionModel(routeConfigModel.direction, stopTagToStopModel);
        }
        
    }

    processDirectionModel(directionModel, stopTagToStopModel) {
        this.directionOptions.push(new RouteOption(directionModel.tag, directionModel.title));

        let stopTags = [];
        let stopModels = [];
        let stopOptions = [];
        for(let k=0; k<directionModel.stop.length; k++) {
            const stopModel = stopTagToStopModel[directionModel.stop[k].tag]
            stopTags.push(stopModel.tag)
            stopModels.push(stopModel)
            stopOptions.push(new RouteOption(stopModel.tag, stopModel.title));
        }

        this.directionToStopTags[directionModel.tag] = stopTags;
        this.directionToStopModels[directionModel.tag] = stopModels;
        this.directionToStopOptions[directionModel.tag] = stopOptions;
    }

    getStartOptions(directionTag) {
        return this.directionToStopOptions[directionTag].slice(0, this.directionToStopOptions[directionTag].length-1);
    }

    getStopOptionsAfter(stopTag, directionTag) {
        let allStopOptions = this.directionToStopOptions[directionTag]
        let i = 0;
        while(i < allStopOptions.length) {
            if(stopTag === allStopOptions[i].value){
                return allStopOptions.slice(i+1);
            }
            i++;
        }
        return [];
    }

    getStopTagsBetween(directionTag, startStopTag, destinationStopTag) {
        // return stops between start and destination tag (inclusive)
        let stopTags = this.directionToStopTags[directionTag];
        let i=0;
        let j=0;
        while(i < stopTags.length) {
            if (stopTags[i] === startStopTag){
                j = i + 1;
                while(j < stopTags.length) {
                    if(stopTags[j] === destinationStopTag) {
                        return stopTags.slice(i, j+1);
                    }
                    j++;
                }
            }
            i++;
        }
        return [];
    }

    getStopModelsBetween(directionTag, startStopTag, destinationStopTag) {
        // return stops between start and destination tag (inclusive)
        let stopModels = this.directionToStopModels[directionTag];
        let i=0;
        let j=0;
        while(i < stopModels.length) {
            if (stopModels[i].tag === startStopTag){
                j = i + 1;
                while(j < stopModels.length) {
                    if(stopModels[j].tag === destinationStopTag) {
                        return stopModels.slice(i, j+1);
                    }
                    j++;
                }
            }
            i++;
        }
        return [];
    }
}


export default RouteConfig