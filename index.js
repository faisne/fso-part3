// 1:20, 

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person.js')

app.use(express.json())
morgan.token('req_data', (req, res) => req.method === 'POST' ? JSON.stringify(req.body) : '')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req_data'))
app.use(express.static('build'))
app.use(cors())

app.get('/info', (req, res) => {
    Person.countDocuments({})
        .then(len => {
            res.send(`<p>There ${len === 1 ? 'is' : 'are'} ${len} contact${len === 1 ? '' : 's'} in the phonebook</p>
            <p>${new Date()}</p>`)
        })
})

app.get('/api/persons', (req, res) => Person.find({}).then(persons => res.json(persons)) )

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => res.json(person))
        .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const {name, number} = req.body
    if (!name || !number)
        return res.status(400).json({error: 'Name and number can\'t be empty'})
    Person.countDocuments({name})
        .then(x => {
            if (x) 
                res.status(400).json({ error: `Name ${name} already exists in the phonebook` }) 
            else {
                const person = new Person({ name, number })
                person.save()
                    .then(result => res.json(result))
                    .catch(error => next(error))
            }
        })    
})

app.put('/api/persons/:id', (req, res, next) => {
    const person = { number: req.body.number }
    Person.findByIdAndUpdate(req.params.id, person, {new: true, runValidators: true, context: 'query'})
        .then(result => res.json(result))
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => res.status(204).end())
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    switch (error.name) {
    case 'CastError': return response.status(400).send({ error: 'malformatted id' })
    case 'ValidationError': return response.status(400).json({ error: error.message })
    default: next(error)
    }
}
app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT //|| 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
