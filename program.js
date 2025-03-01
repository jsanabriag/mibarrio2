var map = L.map('map').setView([4.671162, -74.130165], 17);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


async function loadPolygon(){
    

    let myData = await fetch('capellania.geojson')
    let myPolygon = await myData.json();

    L.geoJSON(myPolygon,
        {
            style: { 
                color: 'blue'
            }
        }
    ).addTo(map);



}


loadPolygon();

let btnTrees = document.getElementById('btnTrees');

btnTrees.addEventListener('click', ()=> alert("hola"));