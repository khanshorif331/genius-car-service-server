const express = require('express')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const cors = require('cors')
const res = require('express/lib/response')
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wxx8e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
})
async function run() {
	try {
		await client.connect()
		const serviceCollection = client.db('geniusCar').collection('service')
		const orderCollection = client.db('geniusCar').collection('order')

		// auth related api
		app.post('/login', async (req, res) => {
			const user = req.body
			const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
				expiresIn: '1d',
			})
			res.send({ accessToken })
		})

		// services api
		app.get('/service', async (req, res) => {
			const query = {}
			const cursor = serviceCollection.find(query)
			const services = await cursor.toArray()
			res.send(services)
		})

		app.get('/service/:id', async (req, res) => {
			const id = req.params.id
			const query = { _id: ObjectId(id) }
			const service = await serviceCollection.findOne(query)
			res.send(service)
		})

		// post method
		app.post('/service', async (req, res) => {
			const newService = req.body
			const result = await serviceCollection.insertOne(newService)
			res.send(result)
		})

		// delete method
		app.delete('/service/:id', async (req, res) => {
			const id = req.params.id
			const query = { _id: ObjectId(id) }
			const result = await serviceCollection.deleteOne(query)
			res.send(result)
		})

		// order collection api
		app.get('/order', async (req, res) => {
			const email = req.query.email
			// console.log(email)
			const query = { email: email }
			const cursor = orderCollection.find(query)
			const orders = await cursor.toArray()
			res.send(orders)
		})

		app.post('/order', async (req, res) => {
			const order = req.body
			const result = await orderCollection.insertOne(order)
			res.send(result)
		})
	} finally {
	}
}

run().catch(console.dir)

app.get('/', (req, res) => {
	res.send('Running genius server')
})

app.listen(port, () => {
	console.log('Listening to port', port)
})
