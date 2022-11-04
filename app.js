mapboxgl.accessToken = 'pk.eyJ1IjoidmRuaG1hcCIsImEiOiJjanU4ZnY5bHYxM3kzM3lrOWh2enl0MzBiIn0.xyvARfcr4SMjCbfUEmKBqQ';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/vdnhmap/cjuy0226207xv1fpndsxgpt0u',
  center: [37.634130, 55.827883],
  zoom: 13.6
}),
  popup = new mapboxgl.Popup({ closeOnClick: true }).addTo(map),
  menu = d3.select("#menu"),
  conf;


  getRoute = (from,to) => {
    //https://api.mapbox.com/directions/v5/mapbox/walking/-73.989%2C40.733%3B-74%2C40.733.json?access_token=pk.eyJ1IjoidXJiaWNhIiwiYSI6ImNpamFhZXNkOTAwMnp2bGtxOTFvMTNnNjYifQ.jUuvgnxQCuUBUpJ_k7xtkQ

    //урл запроса
    var url = 'https://api.mapbox.com/directions/v5/mapbox/walking/'+ from.join(",") +';'+ to.join(",") +'.json?overview=full&geometries=geojson&access_token=pk.eyJ1IjoidXJiaWNhIiwiYSI6ImNpamFhZXNkOTAwMnp2bGtxOTFvMTNnNjYifQ.jUuvgnxQCuUBUpJ_k7xtkQ';
    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(json => {
        if(json.routes.length) {
          //применяем данные геометрии маршрута к сорсу
          map.getSource("route").setData({type: "FeatureCollection", features: [{type: "Feature", geometry: json.routes[0].geometry }]})
        }

      });
  }


toggleLayers = (id) => {
  var menuLayerIdx = conf.menuLayers.findIndex(tl=>tl.id === id);
  if(menuLayerIdx>-1) {
    conf.menuLayers[menuLayerIdx].visible = conf.menuLayers[menuLayerIdx].visible ? false : true;
    d3.select("#"+conf.menuLayers[menuLayerIdx].id).attr("class", conf.menuLayers[menuLayerIdx].visible ? "menu-item-selected" : "menu-item");
    d3.select("#"+conf.menuLayers[menuLayerIdx].id+"-legend").style("display", conf.menuLayers[menuLayerIdx].visible ? "block" : "none");
    conf.menuLayers[menuLayerIdx].layers.forEach(l=>{
      map.setLayoutProperty(l, "visibility", conf.menuLayers[menuLayerIdx].visible ? "visible" : "none");
    })
  }
}

getVisibleLayers = () => {
  var visibleLayers = [];
  conf.menuLayers.filter(l=>l.visible).forEach(tl=>{
    tl.layers.forEach(l=>{ visibleLayers.push(l); })
  });
  return visibleLayers;
}

map.on("load", ()=>{
  fetch('./data/superpoi.geojson')
  .then(response => {
    return response.json();
  })
  .then(json => {

    //добавляем данные как source
    map.addSource("poi", { type: "geojson", data: json });



  });
});


map.on("load", ()=>{

  //пустой сорс c линией маршрута
  map.addSource("route", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addSource("location", { type: "geojson", data: { type: "FeatureCollection", features: [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [37.637768,55.826936]
      }
    }
  ] } });

  //линия маршрута — стиль
  map.addLayer({
    "id": "route",
    "source": "route",
    "type": "line",
    "layout": {
      "line-join": "round",
      "line-cap": "round"
    },
    "paint": {
      "line-width": 3.5,
      "line-color": "#336AF7"
    }
  });

  //линия маршрута — стиль
  map.addLayer({
    "id": "location-round",
    "source": "location",
    "type": "circle",
    "paint": {
      "circle-opacity": 0.25,
      "circle-radius": 20,
      "circle-color": "#336AF7"
    }
  });

  //линия маршрута — стиль
  map.addLayer({
    "id": "location-stroke",
    "source": "location",
    "type": "circle",
    "paint": {
      "circle-radius": 8,
      "circle-color": "#fff"
    }
  });

  //линия маршрута — стиль
  map.addLayer({
    "id": "location",
    "source": "location",
    "type": "circle",
    "paint": {
      "circle-radius": 7,
      "circle-color": "#336AF7"
    }
  });

 fetch('./data/conf.json?ddsss'+Math.random())
  .then(function(response) { return response.json(); })
  .then(function(json) {
    conf = json;
    json.sources.forEach(s=>{ map.addSource(s.id, s.data) });
    json.layers.forEach(l=>{ map.addLayer(l) });
    json.menuLayers.forEach(tl=>{
      var menuItem = menu.append("div").attr("class", "menu-item").attr("id", tl.id).text(tl.label);
      menuItem.on("click", ()=>{
        toggleLayers(tl.id);
      })
    })
  });


      //как показать обработать клик и достать данные из объектов карты
      map.on("click", (e)=>{
        var bbox = [[e.point.x - 2, e.point.y - 2], [e.point.x + 2, e.point.y + 2]];
        var features = map.queryRenderedFeatures(bbox, { }); //здесь в layers, массив id слоёв которые нужно обрабатывать по клику
        var coordinates = [e.lngLat.lng,e.lngLat.lat];
        getRoute([37.637768,55.826936], coordinates);

        if(features.length) {
//          var description = features[0].properties.name_ru; //берём из данных объекта
          //попап
//          popup.setLngLat(coordinates)
//              .setHTML(description)
//              .addTo(map);
        //строим маршрут


        }
      });

      //ховер по объектам на карте, смена курсора
      map.on('mousemove', (e) => {
        var bbox = [[e.point.x - 2, e.point.y - 2], [e.point.x + 2, e.point.y + 2]];
        var features = map.queryRenderedFeatures(bbox, { layers: getVisibleLayers() }); //здесь в layers, массив id слоёв которые нужно обрабатывать по клику
        map.getCanvas().style.cursor = features.length ? 'pointer' : '';
      });

});
