var express = require('express') //express is a nodejs framework
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')
// const { stringify } = require('querystring')

app.use(express.static(__dirname));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false})) //the message comes urlencoded, extended: false data is only string

var dbUrl = 'mongodb+srv://user:user@cluster0.10tqq.mongodb.net/Cluster0?retryWrites=true&w=majority'

var Message = mongoose.model('Message', {
    name: String,
    message: String
})


app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
    
})


app.post('/messages', async (req, res) => {

    try {

        var message = new Message(req.body)
   
        var savedMessage = await message.save()
      
    
        console.log('saved')
    
        var censored =  await Message.findOne({message: 'badword'})
    
        if(censored)
            await Message.remove({_id: censored.id}) 
        else
            io.emit('message', req.body)
            
        res.sendStatus(200)    
        
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    }   
   
})




io.on('connection', (socket) => {
    console.log('a user connected')
})

mongoose.connect(dbUrl, (err) => {
    console.log('mongo db connection ', err)
})

var server = http.listen(3000, () => {
    console.log('Server is listening on port', server.address().port)
})