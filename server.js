const express = require('express');
const app = express();
const bodyParser= require('body-parser')
require('dotenv').config();
const get_weather = require('./weather.js')

const MongoClient = require('mongodb').MongoClient

connectionString = process.env.DATABASE_URL

MongoClient.connect(connectionString, {
    useUnifiedTopology: true
}, (err, client) => {
  if (err) return console.error(err)

  console.log('Connected to Database')
  const db = client.db('cs-4261-first-programming-assignment')
  const vacationSpotsCollection = db.collection('vacation_spots')
  
  app.use(bodyParser.json())

  app.post('/vacation-spot', (req, res) => {
    get_weather(req.body.location, function(weather_data) {
        req.body.current_temperature = weather_data;
        vacationSpotsCollection.insertOne(req.body)
        .then(result => {
            res.status(200).send({
                data: {
                    result
                }
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

  app.put('/vacation-spots', (req, res) => {
    get_weather(req.body.location, function(weather_data) {
        vacationSpotsCollection.findOneAndUpdate(
            { id: req.body.id },
            {
              $set: {
                location: req.body.location,
                date_to_visit: req.body.date_to_visit,
                current_temperature: weather_data
              }
            },
            {
              upsert: true
            }
          )
            .then(result => {
                res.sendStatus(200)
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
            res.sendStatus(200)
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