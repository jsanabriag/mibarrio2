var map = L.map('map').setView([4.671162, -74.130165], 17);
var legend = L.control({ position: 'bottomright' });

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
                color: 'white',
                fillColor: "blue",
                fillOpacity: 0.1,
            }
        }
    ).addTo(map);



}


loadPolygon();

let btnTrees = document.getElementById('btnTrees');

btnTrees.addEventListener('click', 
    async function(){
        let response = await fetch("arboles_capellania.geojson");
        let datos = (await response.json());
        //Agregar la capa al mapa
        L.geoJSON(
            datos,
            {
                pointToLayer: (feature, latlong)=>{

                    return L.circleMarker(latlong, {
                        radius:3,
                        fillColor:'green',
                        weight:1,
                        opacity:1,
                        fillOpacity: 0.8,
                    })

                }
            }
        ).addTo(map);

    }
    
)

let btnDistance = document.getElementById("btnDistance");

btnDistance.addEventListener('click', 
    async function() {
        // 1. Cargar el archivo GeoJSON
        let response = await fetch("arboles_capellania.geojson");
        let datos = await response.json();

        // 2. Extraer los árboles en un arreglo con id y coordenadas
        let trees = datos.features.map((myElement, index) => ({
            id: index + 1,
            coordinates: myElement.geometry.coordinates
        }));

        // --- Escoger 20 árboles aleatorios ---
        // a) Hacemos una copia del array original para no modificarlo
        let treesCopy = [...trees];
        // b) Lo "barajamos" (shuffle) con Fisher-Yates
        for (let i = treesCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [treesCopy[i], treesCopy[j]] = [treesCopy[j], treesCopy[i]];
        }
        // c) Tomamos los 20 primeros de la copia barajada
        let selectedTrees = treesCopy.slice(0, 20);

        // 3. Calcular distancias SOLO para esos 20 árboles
        let distances = [];
        // Recorremos cada uno de los 20 árboles aleatorios
        selectedTrees.forEach((treeA) => {
            // Lo comparamos con TODOS los demás árboles del conjunto original
            trees.forEach((treeB) => {
                // Evitamos comparar un árbol consigo mismo
                if (treeA.id !== treeB.id) {
                    // Calculamos la distancia EN METROS con Turf
                    let distance = turf.distance(
                        turf.point(treeA.coordinates),
                        turf.point(treeB.coordinates),
                        { units: 'meters' } // <-- Esta opción indica "metros"
                    );

                    // Guardamos la distancia en el array (redondeando a 3 decimales)
                    distances.push([
                        `Árbol ${treeA.id}`,
                        `Árbol ${treeB.id}`,
                        distance.toFixed(3)
                    ]);
                }
            });
        });

        // 4. Llamada a la función generatePDF(distances, total_arboles)
        generatePDF(distances, trees.length);
    }
);

function generatePDF(distances, totalTrees) {
    let { jsPDF } = window.jspdf;
    let doc = new jsPDF({
      orientation: "p",
      unit: "pt",
      format: "letter"
    });
  
    // Título principal
    doc.setFontSize(16);
    doc.text("Reporte de árboles - Barrio Capellanía", 40, 40);
  
    // Ajustamos la fuente para el texto descriptivo
    doc.setFontSize(12);
    doc.setTextColor(50);
  
    // El texto que quieres mostrar
    const introText = 
      "Debido a la gran cantidad de árboles y al objetivo de este ejercicio, " +
      "se seleccionó una muestra de 20 árboles aleatorios. A continuación, " +
      "se presenta la distancia de esos 20 árboles frente al resto de los " +
      "árboles del barrio Capellanía, en la localidad de Fontibón.";
  
    // 1) Dividir el texto en varias líneas según un ancho dado (ej. 500 pt)
    const lines = doc.splitTextToSize(introText, 500);
  
    // 2) Imprimir esas líneas a partir de la posición (40, 60)
    let yPos = 60;
    lines.forEach((line) => {
      doc.text(line, 40, yPos);
      yPos += 14; // Ajusta este valor para tu interlineado
    });
  
    // Texto: número total de árboles
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Cantidad total de árboles en el archivo: ${totalTrees}`, 40, yPos + 20);
  
    // Calcula la posición de inicio de la tabla
    let startY = yPos + 40;
  
    // Generar la tabla
    doc.autoTable({
      startY: startY,
      head: [['Árbol 1', 'Árbol 2', 'Distancia (m)']],
      body: distances,
      theme: 'grid',
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { left: 40, right: 40 },
      styles: {
        fontSize: 10,
        cellPadding: 5
      }
    });
  
    // Agrega fecha de generación
    let finalY = doc.lastAutoTable.finalY;
    let currentDate = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Fecha de generación: ${currentDate}`, 40, finalY + 20);
  
    // Descargar PDF
    doc.save("Distancias_arboles_capellania.pdf");
  }



  btnSiniestros.addEventListener('click', 
    async function(){
        let response = await fetch("siniestros_capellania.geojson");
        let datos = (await response.json());
        //Agregar la capa al mapa
        L.geoJSON(
            datos,
            {
                pointToLayer: (feature, latlong)=>{

                    return L.circleMarker(latlong, {
                        radius:3,
                        fillColor:'red',
                        weight:1,
                        opacity:0,
                        fillOpacity: 0.5,
                    })

                }
            }
        ).addTo(map);

    }
    
)

legend.onAdd = function (map) {
    // 2. Crea un contenedor 'div' con clases CSS
    var div = L.DomUtil.create('div', 'info legend');

    // 3. Agrega el contenido de la leyenda
    // Puedes usar cuadrados de color (<i>) o imágenes. Ejemplo con cuadrados:
    div.innerHTML = `
      <h4>Convenciones</h4>
      <div><i style="background: blue; width: 12px; height: 12px; float: left; margin-right: 8px; opacity: 0.8;"></i> Árboles</div>
      <div><i style="background: red; width: 12px; height: 12px; float: left; margin-right: 8px; opacity: 0.8;"></i> Siniestros</div>
    `;

    return div;
};

// 4. Añade la leyenda al mapa
legend.addTo(map);