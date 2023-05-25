require('dotenv').config()
const morgan = require('morgan')
const express = require('express')
const cors = require('cors')
const app = express()
const Person = require('./models/record')
const { default: mongoose } = require('mongoose')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

// logging
morgan.token('body', req => `body: ${JSON.stringify(req.body)}`)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// TODO: Replace with db model `Person`
const { persons: hardCodedPersons } = require('./data.js')

// get all persons
app.get('/api/persons', async (req, res) => {
  try {
    const persons = await Person.find({})
    res.json(persons)
    mongoose.connection.close()
  } catch (err) {
    console.log(err.message)
  }
})

// get info about phonebook
app.get('/api/info', async (req, res) => {
  // get persons
  
  try {
    const persons = await Person.find({})
    mongoose.connection.close()

    const date = new Date()
    res.send(`
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${date}</p>
    `)
  } catch (err) {
    console.log(err.message)
  }

})

// get person by id
app.get('/api/persons/:id', (req, res) => {
  try {
    const id = Number(req.params.id)
    const person = hardCodedPersons.find(person => person.id === id)
    // const person = Person.findById(id) // TODO
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }

  } catch (err) {
    console.log(err.message)
  }
})

// delete person by id
app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  hardCodedPersons = hardCodedPersons.filter(person => person.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body

  if (!name || !number) {
    return res.status(400).json({
      error: 'name or number is missing'
    })
  }

  if (hardCodedPersons.find(person => person.name === name)) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    name,
    number,
    id: Math.floor(Math.random() * 1000000)
  }

  hardCodedPersons = hardCodedPersons.concat(person)

  res.json(person)

})

app.use((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})