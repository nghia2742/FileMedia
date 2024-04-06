const userRouter = require('./user')
const fileRouter = require('./file')

function route(app){
    app.use('/user', userRouter);
    app.use('/',  fileRouter);
    app.use('*', (req, res)=> {
        res.render('error')
    })
}
module.exports = route;