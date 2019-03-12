const users = () => {
  const users = []
  // Create 1000 users
  for (let i = 0; i < 100; i++) {
    users.push({ id: i, name: `user${i}` })
  }
  return users
}
module.exports = {
  users: users()
}
// /get/users?id=0
// /get/users?name=user1
// /get/users?_page=7&_limit=10
