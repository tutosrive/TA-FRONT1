export default class Person {
  #fullName
  #email
  #address
  #phone

  constructor(fullname = 'Santiago', email = 'user@example.com', address = 'Cra. 23 #23C-45', phone = '3219355729') {
    this.setName(fullname)
    this.setEmail(email)
    this.setAddress(address)
    this.setPhone(phone)
  }

  // Accesores
  getName() {
    return this.fullName
  }
  getEmail() {
    return this.email
  }
  getPhone() {
    return this.phone
  }
  getAddress() {
    return this.address
  }
  // Mutadores
  setName(fullname) {
    this.fullName = fullname
  }
  setEmail(email) {
    this.email = email
  }
  setAddress(address) {
    this.address = address
  }
  setPhone(phone) {
    this.phone = phone
  }
}
