export default class Mercancias {
  static #table
  static #modal
  static #currentOption
  static #form
  static #clients

  constructor() {
    throw new Error('No requiere instancias, todos los métodos son estáticos. Use Mercancias.init()')
  }

  static async init() {
    try {
      // intentar cargar los datos de los usuarios
      const response = await Helpers.fetchJSON(`${urlAPI}/mercancia`)
      if (response.message != 'ok') {
        throw new Error(response.message)
      }

      const clients = await Helpers.fetchJSON(`${urlAPI}/cliente`)
      if (clients.message != 'ok') {
        throw new Error(clients.message)
      }

      // Cargar formulario de mercancías
      Mercancias.#form = await Helpers.fetchText('./resources/html/mercancias.html')
      // Cargar los clientes disponibles
      Mercancias.#clients = Helpers.toOptionList({
        items: clients.data,
        value: 'id',
        text: 'id',
      })

      // agregar al <main> de index.html la capa que contendrá la tabla
      document.querySelector('main').innerHTML = `
      <div class="p-2 w-full">
          <div id="table-container" class="m-2">Pronto aquí se insertará una tabla</div>
      </dv>`

      Mercancias.#table = new Tabulator('#table-container', {
        height: tableHeight, // establecer la altura para habilitar el DOM virtual y mejorar la velocidad de procesamiento
        data: response.data,
        layout: 'fitColumns', // ajustar columnas al ancho disponible. También fitData|fitDataFill|fitDataStretch|fitDataTable|fitColumns
        columns: [
          // definir las columnas de la tabla, para tipos datetime se utiliza formatDateTime definido en index.mjs
          { formatter: editRowButton, width: 40, hozAlign: 'center', cellClick: Mercancias.#editRowClick },
          { formatter: deleteRowButton, width: 40, hozAlign: 'center', cellClick: Mercancias.#deleteRowClick },
          { title: 'ID', field: 'id', hozAlign: 'center', width: 90 },
          { title: 'Cliente', field: 'cliente.nombre', width: 200 },
          { title: 'Dice contener', field: 'contenido', width: 300 },
          { title: 'Ingreso', field: 'fechaHoraIngreso', width: 150, formatter: 'datetime', formatterParams: formatDateTime },
          { title: 'Salida', field: 'fechaHoraSalida', width: 150, formatter: 'datetime', formatterParams: formatDateTime },
          { title: 'Días', field: 'diasAlmacenado', hozAlign: 'center', width: 65 },
          { title: 'Alto', field: 'volumen', hozAlign: 'center', visible: false },
          { title: 'Ancho', field: 'volumen', hozAlign: 'center', visible: false },
          { title: 'Largo', field: 'volumen', hozAlign: 'center', visible: false },
          { title: 'Vol. m³', field: 'volumen', hozAlign: 'center', width: 80 },
          { title: 'Costo', field: 'costo', hozAlign: 'right', width: 100, formatter: 'money' },
          { title: 'Bodega', field: 'bodega', width: 280 },
        ],
        responsiveLayout: false, // activado el scroll horizontal, también: ['hide'|true|false]
        initialSort: [
          // establecer el ordenamiento inicial de los datos
          { column: 'fechaHoraIngreso', dir: 'asc' },
        ],
        columnDefaults: {
          tooltip: true, //show tool tips on cells
        },

        // mostrar al final de la tabla un botón para agregar registros
        footerElement: `<div class='container-fluid d-flex justify-content-end p-0'>${addRowButton}</div>`,
      })

      Mercancias.#table.on('tableBuilt', () => {
        document.querySelector('#add-row').addEventListener('click', e => {
          Mercancias.#addRow()
        })
      })
    } catch (e) {
      Toast.show({ title: 'Mercancias', message: 'Falló la carga de la información', mode: 'danger', error: e })
    }

    return this
  }

  static #editRowClick = async (e, cell) => {
    Mercancias.#currentOption = 'edit'
    Mercancias.#modal = new Modal({
      classes: 'col-12 col-sm-10 col-md-9 col-lg-8 col-xl-7',
      title: '<h5>Ingreso de mercancías</h5>',
      content: Mercancias.#form,
      buttons: [
        { caption: editButton, classes: 'btn btn-primary me-2', action: () => Mercancias.#add() },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Mercancias.#modal.remove() },
      ],
      doSomething: idModal => Mercancias.#displayDataOnForm(idModal, cell.getRow().getData()),
    })
    Mercancias.#modal.show()
  }

  static #deleteRowClick = async (e, cell) => {
    console.warn('Sin implementar Mercancias.deleteRowClick()')
  }

  static async #addRow() {
    Mercancias.#currentOption = 'add'
    Mercancias.#modal = new Modal({
      classes: 'col-12 col-sm-10 col-md-9 col-lg-8 col-xl-7',
      title: '<h5>Ingreso de mercancías</h5>',
      content: Mercancias.#form,
      buttons: [
        { caption: addButton, classes: 'btn btn-primary me-2', action: () => Mercancias.#add() },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Mercancias.#modal.remove() },
      ],
      doSomething: Mercancias.#displayDataOnForm,
    })
    Mercancias.#modal.show()
  }

  static async #add() {
    try {
      // Validar formulario
      if (!Helpers.okForm('#form-mercancias')) {
        throw new Error('El formulario es inválido')
      }
      // Selccionar "selector" de clientes del HTML
      const clients = document.querySelector('#clientes')

      // Obtener los valores del formulario y crear un BODY para la solicitud
      const body = {
        id: document.querySelector('#id').value,
        cliente: clients.options[clients.selectedIndex].text,
        alto: document.querySelector('#alto').value,
        bodega: document.querySelector('#bodega').value,
        ancho: document.querySelector('#ancho').value,
        largo: document.querySelector('#largo').value,
        contenido: document.querySelector('#contenido').value,
        fechaHoraIngreso: document.querySelector('#ingreso').value,
        fechaHoraSalida: document.querySelector('#salida').value,
      }

      // Realizar solicitud a la API (POST)
      const response = await Helpers.fetchJSON(`${urlAPI}/mercancia`, {
        method: 'POST',
        body: body,
      })

      // Verificar la respuesta de la API
      if (response.message === 'ok') {
        // Si todo está bien, se agrega una nueva fila con los datos de la respuesta
        Mercancias.#table.addRow(response.data)
        // Remover/Esconder/Quitar el Popup (Diálogo de añadir mercancías)
        Mercancias.#modal.remove()
        // Mostrar una notificación con un mensaje de éxito
        Toast.show({ message: 'Agregado exitosamente' })
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      console.error(e)
    }
  }

  static #displayDataOnForm(idModal, rowData) {
    const selectClient = document.querySelector(`#${idModal} #clientes`)
    selectClient.innerHTML = Mercancias.#clients

    if (Mercancias.#currentOption === 'edit') {
      // mostrar los datos de la fila actual en los input del formulario html
      let id = document.querySelector(`#${idModal} #id`)
      id.value = rowData.id
      // Descativar campo de ID
      id.setAttribute('disabled', '')

      document.querySelector(`#${idModal} #contenido`).value = rowData.contenido
      document.querySelector(`#${idModal} #bodega`).value = rowData.bodega
      document.querySelector(`#${idModal} #alto`).value = rowData.alto
      document.querySelector(`#${idModal} #ancho`).value = rowData.ancho
      document.querySelector(`#${idModal} #largo`).value = rowData.largo
      document.querySelector(`#${idModal} #ingreso`).value = rowData.fechaHoraIngreso
      document.querySelector(`#${idModal} #salida`).value = rowData.fechaHoraSalida

      Helpers.selectOptionByText('#clientes', rowData.cliente.id)
    }
  }
}
