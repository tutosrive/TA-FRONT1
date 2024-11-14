var path = "https://comprehensive-harrie-trg-670f482b.koyeb.app";

/**
 * Crear solicitud a "**envio**" (**Transportadora Andina**) al "_endPoint_" especificado
 * @param {*} endPoint String. Contiene el "**endPoint**"/**ruta** a solicitar
 * @param {*} arrStr Object. Lista de los datos que quiere ver en la tabla (**el nombre de estos debe ser igual como está en el backend**)
 */
function get(endPoint, arrStr) {
  try {
    let url = new Request(path + endPoint);
    fetch(url)
      .then((res) => res.json())
      .then((content) => {
        switch (endPoint) {
          case "/cliente":
            getData(content, arrStr);
            break;
          case "/mercancia":
            getData(content, arrStr);
            break;
          case "/sobre":
          case "/bulto":
          case "/caja":
          case "/paquete":
            getData(content, arrStr);
            break;
          case "":
            getMessage(content, arrStr[0]);
            break;
        }
      })
      .catch((e) => console.warn("Ha pasado algo con la solicitud: " + e));
  } catch (error) {
    console.error("Ha ocurrido un error en get(): " + error);
  }
}

/**
 * Extraer y mostrar en el HTML los datos obtenidos en la "promesa"
 * @param {*} data Object. Datos obtenidos desde la "promesa"
 * @param {*} arrStr Object. Lista de los datos que quiere ver en la tabla (**el nombre de estos debe ser igual como está en el backend**)
 */
function getData(data, arrStr) {
  try {
    let dat = Array.from(data["data"]);

    let head = document.querySelector("#head-title");
    let body = document.querySelector("#body-table");

    head.innerHTML = "";
    body.innerHTML = "";

    // Poner titulos por columna
    for (var i = 0; i < arrStr.length; i++) {
      head.innerHTML += `<th>${arrStr[i]}</th>`;
    }

    // Recorrer el arreglo de datos
    for (var i = 0; i < dat.length; i++) {
      row = "<tr>"; // Crear fila
      for (var k = 0; k < arrStr.length; k++) {
        row += `<td>${dat[i][arrStr[k]]}</td>`; // Añadir columna a fila
      }
      body.innerHTML += row; // Añadir fila al HTML
    }
  } catch (error) {
    console.warn("Ha ocurrido un error en getData()" + error);
  }
}

/**
 * Extraer y mostrar **mensaje** contenido en la _respuesta_ del **content**
 * @param {*} content Object. Respuesta a la solicitud **planteada** en _get(endPoint, arrStr)_
 * @param {*} arrStr String. **Clave** del mensaje que estará almacenado en **content**
 */
function getMessage(content, arrStr) {
  let body = document.querySelector("#data"); // Seleccionar contenedor
  body.innerHTML = `<p>${content[arrStr]}</p>`; // Agregar mensaje al HTML
}
