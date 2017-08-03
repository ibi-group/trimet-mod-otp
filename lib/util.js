export function toSentenceCase (str) {
  if (str == null) {
    return ''
  }
  str = String(str)
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase()
}

export function pluralize (str, list) {
  return `${str}${list.length > 1 ? 's' : ''}`
}
