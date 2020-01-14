const users = () => {
  const users = []
  // Create 1000 users
  for (let i = 0; i < 100; i++) {
    users.push({ id: i, name: `user${i}`, dateTime: new Date().toString() })
  }
  return users
}
module.exports = {
  users: users()
}
// /test/users?id=0
// /test/users?name=user1
// /test/users?_page=7&_limit=10
