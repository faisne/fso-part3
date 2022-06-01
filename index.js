const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
morgan.token('req_data', (req, res) => req.method === 'POST' ? JSON.stringify(req.body) : '')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req_data'))
app.use(express.static('build'))
app.use(cors())

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieckkkk",
        "number": "39-23-6423122"
    }
]

app.get('/info', (req, res) => {
    len = persons.length
    res.send(`<p>There ${len === 1 ? 'is' : 'are'} ${len} contact${len === 1 ? '' : 's'} in the phonebook</p>
    <p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => res.json(persons))

app.get('/api/persons/:id', (req, res) => {
    const person = persons.find(person => person.id == req.params.id)
    if(person) return res.json(person)
    res.status(404).end()
})

app.delete('/api/persons/:id', (req, res) => {
    persons = persons.filter(person => person.id != req.params.id)
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const body = req.body
    if(!body.name || !body.number)
        return res.status(400).json({error: 'Name and number can\'t be empty'})
    if(persons.find(person => person.name === body.name))
        return res.status(400).json({error: 'Name already exists'})
    const person = { name: body.name, number: body.number, id: Math.floor(Math.random() * 1000000) }
    persons = persons.concat(person)
    res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
