// importación estática de módulos necesarios
// los import locales de JS tienen rutas relativas a la ruta del script que hace el enrutamiento
import * as Popper from '../utils/popper/popper.min.js'
import * as bootstrap from '../utils/bootstrap-5.3.3/js/bootstrap.bundle.min.js'
import { TabulatorFull as Tabulator } from '../utils/tabulator-6.3/js/tabulator_esm.min.js'
import { DateTime, Duration } from '../utils/luxon3x.min.js'
import icons from '../utils/own/icons.js'
import Helpers from '../utils/own/helpers.js'
import Popup from '../utils/own/popup.js'
import Toast from '../utils/own/toast.js'

class App {
  static async main() {
    // los recursos locales usan rutas relativas empezando por la carpeta principal del proyecto
    const config = await Helpers.fetchJSON('./resources/assets/config.json')
    // evite siempre los datos quemados en el código
    window.urlAPI = config.url
    // Ver: https://javascript.info/browser-environment (DOM|BOM|JavaScript)
    // Las clases importadas se asignan a referencias de la ventana actual:
    window.icons = icons
    window.DateTime = DateTime

    window.formatDateTime = {
      inputFormat: 'iso', // "yyyy-MM-dd'T'HH:mm:ss'Z'",  "yyyy-MM-dd'T'HH:mm:ss'Z'
      outputFormat: 'yyyy-MM-dd hh:mm a',
      invalidPlaceholder: 'fecha inválida',
    }
    window.Duration = Duration
    window.Helpers = Helpers
    window.Tabulator = Tabulator
    window.Toast = Toast
    window.Modal = Popup
    window.current = null // miraremos si se requiere...
    // lo siguiente es para estandarizar el estilo de los botones usados para add, edit y delete en las tablas
    window.addRowButton = `<button id='add-row' class='btn btn-info btn-sm'>${icons.plusSquare}&nbsp;&nbsp;Nuevo registro</button>`
    window.editRowButton = () => `<button id="edit-row" class="border-0 bg-transparent" data-bs-toggle="tooltip" title="Editar">${icons.edit}</button>`
    window.deleteRowButton = () => `<button id="delete-row" class="border-0 bg-transparent d-inline" data-bs-toggle="tooltip" title="Eliminar">${icons.delete}</button>`

    // lo siguiente es para estandarizar los botones de los formularios
    window.addButton = `${icons.plusSquare}&nbsp;&nbsp;<span>Agregar</span>`
    window.editButton = `${icons.editWhite}&nbsp;&nbsp;<span>Actualizar</span>`
    window.deleteButton = `${icons.deleteWhite}<span>Eliminar</span>`
    window.cancelButton = `${icons.xLg}<span>Cancelar</span>`
    window.tableHeight = 'calc(100vh - 190px)' // la altura de todos los elementos de tipo Tabulator que mostrará la aplicación

    try {
      // confirmación de acceso a la API REST
      const response = await Helpers.fetchJSON(`${urlAPI}/`)
      console.log(response)

      if (response.message === 'ok') {
        Toast.show({ title: '¡Bienvenido!', message: 'Bienvenido a la logística de envíos T.A', duration: 1000 })
        App.#mainMenu()
      } else {
        Toast.show({ message: 'Problemas con el servidor de datos', mode: 'danger', error: response })
      }
    } catch (e) {
      Toast.show({ message: 'Falló la conexión con el servidor de datos', mode: 'danger', error: e })
    }

    return true
  }

  /**
   * Determina la acción a llevar a cabo según la opción elegida en el menú principal
   * @param {String} option El texto del ancla seleccionada
   */
  static async #mainMenu() {
    // referenciar todos los elementos <a>...</a> que hayan dentro de main-menu
    const listOptions = document.querySelectorAll('#main-menu a')

    // asignarle un gestor de evento clic a cada opción del menú
    listOptions.forEach(item =>
      item.addEventListener('click', async e => {
        let option = ''
        try {
          e.preventDefault()
          // asignar a option el texto de la opción del menú elegida
          option = (e.target.text ?? 'Inicio').trim() // <-- Importante!!!

          switch (option) {
            case 'Inicio':
              document.querySelector('main').innerText = ''
              break
            case 'Clientes':
              // importar dinámicamente el módulo clientes.mjs
              const { default: Clientes } = await import('./clientes.mjs')
              Clientes.init()
              break
            case 'Mercancías':
              // importar dinámicamente el módulo mercancias.mjs
              const { default: Mercancias } = await import('./mercancias.mjs')
              Mercancias.init()
              break
            case 'Paquetes':
              // Importar dinámicamente el módulo paquetes.mjs
              const { default: Paquetes } = await import('./envios.mjs')
              Paquetes.init('Paquete')
              break
            case 'Sobres':
              // Importar dinámicamente
              const { default: Sobres } = await import('./envios.mjs')
              Sobres.init('Sobre')
              break
            case 'Bultos':
              // Importar dinámicamente
              const { default: Bultos } = await import('./envios.mjs')
              Bultos.init('Bulto')
              break
            case 'Cajas':
              // Importar dinámicamente el módulo paquetes.mjs
              const { default: Cajas } = await import('./cajas.mjs')
              Cajas.init()
              break
            case 'Estados':
              // Importar dinámicamente el módulo estados.mjs
              const { default: Estados } = await import('./estados.mjs')
              Estados.init()
              break
            case 'Acerca de...':
              Toast.show({ message: `No implementada la opción de ${option}`, mode: 'warning' })
              break
            default:
              if (option !== 'Envíos') {
                Toast.show({ message: `La opción ${option} no ha sido implementada`, mode: 'warning', delay: 3000, close: false })
                console.warn('Fallo en ', e.target)
              }
          }
        } catch (e) {
          Toast.show({ message: `Falló la carga del módulo ${option}`, mode: 'danger', error: e })
        }
        return true
      })
    )
  }
}

App.main()
