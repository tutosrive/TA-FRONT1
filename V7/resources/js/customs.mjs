/**
 * Mostrar una "alerta" (Toast) cuando el formulario es incǘalido y
 * se presiona el botón "Añadir" del "Dialog"
 * @param {String} span Mensaje de alerta
 */
export function toastBeforeAddRecord(msg = null) {
  const span = msg ?? 'Debe <span class="text-warning">completar</span> el formulario'
  Toast.show({ message: `${span} antes de presionar el botón <button class="btn btn-primary">${addButton}</button>`, mode: 'warning', duration: 1000 })
}

/**
 * Mostrar "Toast" con información adicional sobre **como añadir y eliminar** registros :)
 * @param {String} msg Opción actual. `Ej: clientes`
 */
export function showInfoAboutUse(msg) {
  let cont // Para regular las veces que se mostrará el "Toast"
  const countOnLocalStorage = localStorage.getItem(`alertInfoOn${msg}`)
  // Verificar la existencia del contador
  if (!countOnLocalStorage) {
    // Si no existe, crearlo
    localStorage.setItem(`alertInfoOn${msg}`, 1)
    cont = countOnLocalStorage
  } else {
    // Castear el valor del contador almacenado
    cont = parseInt(countOnLocalStorage)
    // Contador menor a 3? seguir aumentando contador : null
    cont < 2 ? localStorage.setItem(`alertInfoOn${msg}`, cont + 1) : null
  }
  // Si el contador es menor a 2, el "Toast" se mostrará
  cont < 2 ? Toast.show({ message: `Puede <span class="text-info">agregar</span> ${msg} con <span class="d-inline">${addRowButton}</span> y <span class="text-danger">eliminarlos</span> con ${deleteRowButton()}` }) : null
}

// Versión original de showInfoAboutUse (copia por si la daño...)
/**
 * * export function showInfoAboutUse(msg = null) {
 *  const span = msg ?? 'registros'
 *  let cont // Para regular las veces que se mostrará el "Toast"
 *  const countOnLocalStorage = localStorage.getItem('alertInfoOnSearch')
   // Verificar la existencia del contador
 *  if (!countOnLocalStorage) {
     // Si no existe, crearlo
 *    localStorage.setItem('alertInfoOnSearch', 1)
 *    cont = countOnLocalStorage
 *  } else {
     // Castear el valor del contador almacenado
 *    cont = parseInt(countOnLocalStorage)
     // Contador menor a 3? seguir aumentanfo contador : null
 *    cont < 3 ? localStorage.setItem('alertInfoOnSearch', cont + 1) : null
 *  }
   // Si el contador es menor a 3, el "Toast" se mostrará
 *  cont < 3 ? Toast.show({ message: `Puede <span class="text-info">agregar</span> ${span} con <span class="d-inline">${addRowButton}</span> y <span class="text-danger">eliminarlos</span> con ${deleteRowButton()}` }) : null
 *}
 */

// Clases para agregar al modal (diálogo con el formulario para gestionar registros)
export const classesModal = 'position-absolute top-50 start-50 translate-middle bg-dark col-12 col-sm-10 col-md-9 col-lg-8 col-xl-7'
