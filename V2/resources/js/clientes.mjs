export default class Clientes {
  static #table
  static #modal
  static #currentOption
  static #form
  static #cities

  constructor() {
    throw new Error('No requiere instancias, todos los métodos son estáticos. Use Clientes.init()')
  }

  static async init() {
    try {
      // Se carga el formulario de clientes
      Clientes.#form = await Helpers.fetchText('./resources/html/clientes.html')
      // Se crea una lista de opciones para el select "ciudad"
      Clientes.#cities = Helpers.toOptionList({
        items: await Helpers.fetchJSON('./resources/assets/ciudades.json'),
        value: 'codigo',
        text: 'nombre',
      })

      // intentar cargar los datos de las mercancías
      const response = await Helpers.fetchJSON(`${urlAPI}/cliente`)
      // Si no existe el archivo.json, se muestra el formulario y proceder a crear una mercancía
      if (response.message == 'Sin acceso a datos de clientes') {
        Clientes.#addRow()
      } else if (response.message != 'ok') {
        throw new Error(response.message)
      }

      // Agregar al <main> index.html el contenedor de la tabla
      document.querySelector('main').innerHTML = `
      <div class="p-2 w-full">
          <div id="table-container" class="m-2">Pronto aquí se insertará una tabla</div>
      </dv>`

      Clientes.#table = new Tabulator('#table-container', {
        height: tableHeight,
        data: response.data,
        layout: 'fitColumns',
        columns: [
          // Columnas de la tabla
          { formatter: editRowButton, width: 40, hozAlign: 'center', cellClick: Clientes.#editRowClick },
          { formatter: deleteRowButton, width: 40, hozAlign: 'center', cellClick: Clientes.#deleteRowClick },
          { title: 'ID', field: 'id', hozAlign: 'center', width: 90 },
          { title: 'NOMBRE', field: 'nombre', hozAlign: 'left', width: 367 },
          { title: 'DIRECCIÓN', field: 'direccion', hozAlign: 'left', width: 420 },
          { title: 'TELÉFONO', field: 'telefono', hozAlign: 'center', width: 220 },
          { title: 'CIUDAD', field: 'ciudad', hozAlign: 'left', width: 140 },
        ],
        responsiveLayout: false, // activado el scroll horizontal, también: ['hide'|true|false]
        initialSort: [
          // establecer el ordenamiento inicial de los datos
          { column: 'id', dir: 'asc' },
        ],
        columnDefaults: {
          tooltip: true, //show tool tips on cells
        },
        // mostrar al final de la tabla un botón para agregar registros
        footerElement: `<div class='container-fluid d-flex justify-content-end p-0'>${addRowButton}</div>`,
      })

      Clientes.#table.on('tableBuilt', async () => {
        document.querySelector('#add-row').addEventListener('click', e => {
          Clientes.#addRow()
        })
      })
    } catch (e) {
      Toast.show({ title: 'Clientes', message: 'Falló la carga de la información', mode: 'danger', error: e })
    }

    return this
  }

  static async #addRow() {
    Clientes.#currentOption = 'add'
    Clientes.#modal = new Modal({
      classes: 'col-12 col-sm-10 col-md-9 col-lg-8 col-xl-7',
      title: '<h5>Ingreso de clientes</h5>',
      content: Clientes.#form,
      buttons: [
        { caption: addButton, classes: 'btn btn-primary me-2', action: () => Clientes.#add() },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Clientes.#modal.remove() },
      ],
      doSomething: Clientes.#displayDataOnForm,
    })
    Clientes.#modal.show()
  }

  static async #add() {
    try {
      if (!Helpers.okForm('#form-clientes')) {
        throw new Error('El formulario es inválido')
      }

      const cities = document.querySelector('#ciudad')

      const body = {
        id: document.querySelector('#id').value,
        nombre: document.querySelector('#nombre').value,
        ciudad: cities.options[cities.selectedIndex].text,
        direccion: document.querySelector('#direccion').value,
        telefono: document.querySelector('#telefono').value,
      }
      const response = await Helpers.fetchJSON(`${urlAPI}/cliente`, {
        method: 'POST',
        body: body,
      })

      if (response.message === 'ok') {
        Clientes.#table.addRow(response.data) // agregar el usuario a la tabla
        Clientes.#modal.remove()
        Toast.show({ message: 'Agregado exitosamente' })
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      console.error(e)
    }
  }

  static #editRowClick = async (e, cell) => {
    Clientes.#currentOption = 'edit'
    Clientes.#modal = new Modal({
      classes: 'col-12 col-sm-10 col-md-9 col-lg-8 col-xl-7',
      title: '<h5>Ingreso de clientes</h5>',
      content: Clientes.#form,
      buttons: [
        { caption: editButton, classes: 'btn btn-primary me-2', action: () => Clientes.#edit(cell) },
        { caption: cancelButton, classes: 'btn btn-secondary', action: () => Clientes.#modal.remove() },
      ],
      doSomething: idModal => Clientes.#displayDataOnForm(idModal, cell.getRow().getData()),
    })
    Clientes.#modal.show()
  }

  static async #edit(cell) {
    try {
      if (!Helpers.okForm('#form-clientes')) {
        throw new Error('Formulario inválido')
      }

      const cities = document.querySelector('#ciudad')
      const id = document.querySelector('#id').value

      const body = {
        nombre: document.querySelector('#nombre').value,
        ciudad: cities.options[cities.selectedIndex].text,
        direccion: document.querySelector('#direccion').value,
        telefono: document.querySelector('#telefono').value,
      }

      const response = await Helpers.fetchJSON(`${urlAPI}/cliente/${id}`, {
        method: 'PATCH',
        body: body,
      })

      if (response.message === 'ok') {
        cell.getRow().update(response.data) // agregar el usuario a la tabla
        Clientes.#modal.remove()
        Toast.show({ message: 'Actualizado exitosamente' })
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      console.error(e)
    }
  }

  static #deleteRowClick = async (e, cell) => {
    console.warn('Sin implementar Clientes.deleteRowClick()')
  }

  static async #delete(cell) {
    console.warn('Sin implementar Clientes.delete()')
  }

  static #toComplete(idModal, rowData) {
    console.warn('Sin implementar Clientes.toComplete()')
  }

  /**
   * Recupera los datos del formulario y crea un objeto para ser retornado
   * @returns Un objeto con los datos del usuario
   */
  static #getFormData() {
    console.warn('Sin implementar Clientes.toComplete()')
  }

  static #displayDataOnForm(idModal, rowData) {
    // referenciar el select "ciudad"
    const selectCities = document.querySelector(`#${idModal} #ciudad`)
    // asignar la lista de opciones al select "ciudad" de clientes.html
    selectCities.innerHTML = Clientes.#cities

    if (Clientes.#currentOption === 'edit') {
      // mostrar los datos de la fila actual en los input del formulario html
      let id = document.querySelector(`#${idModal} #id`)
      id.value = rowData.id
      // Descativar campo de ID
      id.setAttribute('disabled', '')
      document.querySelector(`#${idModal} #nombre`).value = rowData.nombre
      document.querySelector(`#${idModal} #direccion`).value = rowData.direccion
      document.querySelector(`#${idModal} #telefono`).value = rowData.telefono
      // buscar el índice de la opción cuyo texto sea igual al de la ciudad de la fila seleccionada
      Helpers.selectOptionByText('#ciudad', rowData.ciudad)
    }
  }
}
