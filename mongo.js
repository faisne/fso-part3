const mongoose = require('mongoose')
const args = process.argv

if(args.length != 3 && args.length != 5) {
    console.log(`Invalid arguments. The syntax is: node mongo.js <password> [<name> <number>]`)
    process.exit(1)
}

const password = args[2]
const url =
    `mongodb+srv://faisne:${password}@cluster0.gtsmvwz.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

// if neither name nor number are present, show all people
if(args.length == 3)
    Person.find({}).then(result => {
        console.log("phonebook:");
        result.forEach(person => console.log(person.name, person.number))
        mongoose.connection.close()
    })

// in other case add a new person
else {
    const person = new Person({
        name: args[3],
        number: args[4],
    })

    person.save().then(result => {
        console.log(`added ${args[3]} number ${args[4]} to the phonebook`)
        mongoose.connection.close()
    })
}



