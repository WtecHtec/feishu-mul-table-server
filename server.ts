import express from 'express'
import { searchAndReplace } from './playground/search_and_replace'
import { jikeInsert } from './playground/jike_insert';
const bodyParser = require('body-parser');
const cors = require('cors'); 
const app = express()
const port = process.env.PORT || 3000
app.use(bodyParser.json({ limit: '500mb', extended: true }))
app.use(cors()); // 这将允许所有源进行跨域访问
// http trigger
app.get('/search_and_replace', async (req, res) => {
  await searchAndReplace('abc', '123');
  res.send('success!!!')
});


app.post('/jike_insert', async (req, res) => {
	const { tableData, config } = req.body || {}
	try {
		await jikeInsert(tableData || [], config);
		res.send('success!!!')
	} catch (error) {
		console.log('error-----', error)
		res.send('fail!!!')
	}
});

app.get('/', async (req, res) => {
  res.send('hello world')
});

app.listen(port, () => {
  // Code.....
  console.log('Listening on port: ' + port)
})