const users = () => {
  const users = []
  // Create 1000 users
  for (let i = 0; i < 100; i++) {
    users.push({ id: i, name: `user${i}`, dateTime: new Date().toString() })
  }
  return users
}
module.exports = {
  users: users(),
  'list[get]': [
    { id: 0, name: 'book1' },
    { id: 1, name: 'book2' },
    { id: 2, name: 'book3' }
  ],
  'upload[file]': { code: 200, message: 'succeed', data: true }
}
// /test/users?id=0
// /test/users?name=user1
// /test/users?_page=7&_limit=10
