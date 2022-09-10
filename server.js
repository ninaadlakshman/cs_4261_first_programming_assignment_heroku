const express = require('express');
const app = express();
const bodyParser= require('body-parser')
require('dotenv').config();
const cors = require('cors')
const get_weather = require('./weather.js')

const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId

connectionString = process.env.DATABASE_URL

MongoClient.connect(connectionString, {
    useUnifiedTopology: true
}, (err, client) => {
  if (err) return console.error(err)

  console.log('Connected to Database')
  const db = client.db('cs-4261-first-programming-assignment')
  const vacationSpotsCollection = db.collection('vacation_spots')
  
  app.use(bodyParser.json())
  app.use(cors())

  app.post('/vacation-spot', (req, res) => {
    const received_request = req.body
    get_weather(received_request.body.location, function(weather_data) {
      received_request.body.current_temperature = weather_data;
        vacationSpotsCollection.insertOne(received_request.body)
        .then(result => {
            res.status(200).send({
              response: "Vacation spot has been successfully added."
            })
        })
        .catch(error => console.error(error))
    })
  })

  app.get('/vacation-spots', (req, res) => {
    const cursor = vacationSpotsCollection.find().toArray()
        .then(results => {
            res.status(200).send({
                data: results
            })
        })
        .catch(error => {
            res.sendStatus(400)
        })
  })

  app.get('/vacation-spot', (req, res) => {
    const received_request = req.body
    const cursor = vacationSpotsCollection.findOne({_id: ObjectId(received_request.body._id)})
        .then(result => {
            res.status(200).send({
                data: result
            })
        })
        .catch(error => {
            res.sendStatus(400)
        })
  })

  app.put('/vacation-spots', (req, res) => {
    const received_request = req.body
    get_weather(received_request.body.location, function(weather_data) {
        vacationSpotsCollection.findOneAndUpdate(
            { _id: ObjectId(received_request.body._id) },
            {
              $set: {
                location: received_request.body.location,
                date_to_visit: received_request.body.date_to_visit,
                current_temperature: weather_data
              }
            },
            {
              upsert: true
            }
          )
            .then(result => {
                res.status(200).send({
                  response: "Vacation spot has been successfully updated."
                })
            })
            .catch(error => {
                console.error(error)
                res.sendStatus(500)
            })
    })
  })

  app.delete("/vacation-spots", (req, res) => {
    vacationSpotsCollection.deleteMany({})
        .then(result => {
          res.status(200).send({
            response: "All vacation spots have been successfully deleted."
          })
        })
        .catch(error => {
            console.error(error)
            res.sendStatus(500)
        })
  })
  

})

app.use(bodyParser.urlencoded({ extended: true }))

app.listen(process.env.PORT || 3000, function() {
    console.log('listening on 3000 in local or process.env.PORT in Heroku')
})