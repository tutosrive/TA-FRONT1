export default class Paquetes {
  static #table
  static #modal
  static #currentOption
  static #form
  static #states

  constructor() {
    throw new Error('No se requiere instancias, todos los métodos son estáticos. User Paquetes.init()')
  }

  static async init() {
    try {
      let response = await Helpers.fetchJSON(`${urlAPI}/envio/estados`)
      Paquetes.#states = response.data
      // Intentar cargar los datos de los paquetes
      response = await Helpers.fetchJSON(`${urlAPI}/paquete`)
      if (response.message != 'ok') {
        throw new Error(response.message)
      }

      // Agregar la capa que contendrá la tabla al <main> de index.html
      document.querySelector('main').innerHTML = `
      <div class="p-2 w-full">
          <div id="table-container" class="m-2">Pronto aquí se insertará una tabla</div>
      </div>`

      Paquetes.#table = new Tabulator('#table-container', {
        height: tableHeight, // establecer la altura para habilitar el DOM virtual y mejorar la velocidad de procesamiento
        data: response.data,
        layout: 'fitColumns', // ajustar columnas al ancho disponible. También fitData|fitDataFill|fitDataStretch|fitDataTable|fitColumns
        columns: [
          // definir las columnas de la tabla, para tipos datetime se utiliza formatDateTime definido en index.mjs
          { formatter: editRowButton, width: 40, hozAlign: 'center', cellClick: Paquetes.#editRowClick },
          { formatter: deleteRowButton, width: 40, hozAlign: 'center', cellClick: Paquetes.#deleteRowClick },
          { title: 'Guía', field: 'nroGuia', hozAlign: 'center', width: 90 },
          { title: 'Remitente', field: 'remitente.nombre', hozAlign: 'left', width: 200 },
          { title: 'Destinatario', field: 'destinatario.nombre', hozAlign: 'left', width: 200 },
          { title: 'Dice contener', field: 'contenido', hozAlign: 'left', width: 200 },
          { title: 'Valor', field: 'valorDeclarado', hozAlign: 'right', width: 100, formatter: 'money', formatterParams: { precision: 2 } },
          { title: 'Costo', field: 'costo', hozAlign: 'right', width: 100, formatter: 'money', formatterParams: { precision: 0 } },
          {
            title: 'Frágil',
            field: 'fragil',
            hozAlign: 'center',
            width: 90,
            formatter: 'tickCross',
          },
          {
            title: 'Estado actual',
            field: 'estados',
            width: 257,
            formatter: Paquetes.#getState,
          },
        ],
        responsiveLayout: false, // activado el scroll horizontal, también: ['hide'|true|false]
        initialSort: [
          // establecer el ordenamiento inicial de los datos
          { column: 'nroGuia', dir: 'asc' },
        ],
        columnDefaults: {
          tooltip: true, //show tool tips on cells
        },

        // mostrar al final de la tabla un botón para agregar registros
        footerElement: `<div class='container-fluid d-flex justify-content-end p-0'>${addRowButton}</div>`,
      })

      Paquetes.#table.on('tableBuilt', () => {
        document.querySelector('#add-row').addEventListener('click', e => {
          console.log(e.target)
        })
      })
    } catch (e) {
      Toast.show({ title: 'paquetes', message: 'Falló la carga de la información', mode: 'dange', error: e })
    }
    return this
  }

  static #getState(cell) {
    const data = cell.getValue()
    const ultimoEstado = data[data.length - 1]
    console.log(Paquetes.#states)

    const estado = Paquetes.#states.find(state => ultimoEstado.estado == state.key)

    console.log(estado)

    // Fecha del último "estado" en formato (año-mes-día hora:minuto)
    const fecha = DateTime.fromISO(ultimoEstado.fechaHora)
      .setLocale('es-co') // Establecer un "formato" local (Colombia)
      .toFormat('yyyy-MM-dd - hh:mm a') // (año-mes-día hora:minuto)

    // Devolver "${Estado}" año-mes-día hora:minuto
    return `${fecha} - ${estado.value}`
  }

  static #editRowClick = async (e, cell) => {
    console.warn('Sin implementar Mercancias.editRowClick()')
  }

  static #deleteRowClick = async (e, cell) => {
    console.warn('Sin implementar Mercancias.deleteRowClick()')
  }
}
