const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dateMod = require('date-fns')
const format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
const isValid = require('date-fns/isValid')

app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const connectDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server connected')
    })
  } catch (e) {
    console.log(`error : ${e.message}`)
    process.exit(1)
  }
}

module.exports = app

connectDbServer()

const output = item => {
  return {
    id: item.id,
    todo: item.todo,
    priority: item.priority,
    status: item.status,
    category: item.category,
    dueDate: item.due_date,
  }
}

//api1

app.get('/todos/', async (request, response) => {
  const {status, priority, category, search_q} = request.query
  let data
  //scenario 3
  if (priority !== undefined && status !== undefined) {
    if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH') {
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        data = `SELECT * FROM todo WHERE priority = '${category}' AND status = '${status}';`
        const dbSearchQ = await db.all(data)
        response.send(dbSearchQ.map(item => output(item)))
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  }

  //scenarion 5
  else if (category !== undefined && status !== undefined) {
    if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        data = `SELECT * FROM todo WHERE category = '${category}' AND status = '${status}';`
        const dbSearchQ = await db.all(data)
        response.send(dbSearchQ.map(item => output(item)))
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  }

  //scenario 7
  else if (category !== undefined && priority !== undefined) {
    if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
      if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH') {
        data = `SELECT * FROM todo WHERE category = '${category}' AND priority = '${priority}';`
        const dbSearchQ = await db.all(data)
        response.send(dbSearchQ.map(item => output(item)))
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  }

  //scenario 1
  else if (status !== undefined) {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      data = `SELECT * FROM todo WHERE status = '${status}';`
      const dbSearchQ = await db.all(data)
      response.send(dbSearchQ.map(item => output(item)))
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  }

  //scenario 2
  else if (priority !== undefined) {
    if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH') {
      data = `SELECT * FROM todo WHERE priority = '${priority}';`
      const dbSearchQ = await db.all(data)
      response.send(dbSearchQ.map(item => output(item)))
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  }

  //scenario 6
  else if (category !== undefined) {
    if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
      data = `SELECT * FROM todo WHERE category = '${category}';`
      const dbSearchQ = await db.all(data)
      response.send(dbSearchQ.map(item => output(item)))
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  }

  //scenario 4
  else if (search_q !== undefined) {
    data = `SELECT * FROM todo WHERE todo LIKE %'${search_q}'%;`
    const dbSearchQ = await db.all(data)
    response.send(dbSearchQ.map(item => output(item)))
  }
})

//api 2

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todoIdQuery = `SELECT * FROM todo WHERE id = ${todoId};`
  const todoIdData = await db.get(todoIdQuery)
  response.send(todoIdData)
})

//api 3

app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  if (isMatch(date, 'yyyy-MM-dd')) {
    const newDate = format(new Date(date), 'yyyy-MM-dd')
    const todoIdQuery = `SELECT * FROM todo WHERE due_date = '${newDate}';`
    const todoIdData = await db.all(todoIdQuery)
    response.send(todoIdData.map(item => output(item)))
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

//api 4

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
    if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH') {
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const newFormat = format(new Date(dueDate), 'yyyy-MM-dd')
          const insertDbQuery = `INSERT INTO todo(id,todo,category,priority,status,due_date) VALUES (${id},'${todo}','${priority}','${status}','${category}','${newFormat}';`
          await db.run(insertDbQuery)
          response.send('Todo Successfully Added')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Category')
  }
})

//api 6

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const delQuery = `DELETE FROM todo WHERE id = ${todoId};`
  await db.run(delQuery)
  response.send('Todo Deleted')
})
