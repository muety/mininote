export function basicAuth(user, pass) {
  return btoa(`${user}:${pass}`)
}
