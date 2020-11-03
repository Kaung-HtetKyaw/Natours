const locations = JSON.parse(document.getElementById("map").dataset.locations);
console.log(locations);
mapboxgl.accessToken =
  "pk.eyJ1Ijoia2F1bmdodGV0a3lhdyIsImEiOiJja2gwbTRhb3gwbmg1MzNybnVvYnNoMjI0In0.z84zN_ixcjNUDAi9-VslRg";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
});
