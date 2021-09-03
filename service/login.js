const AWS = require('aws-sdk');
AWS.config.update({
    region: 'ap-south-1'
})

const util = require('../utlis/utlis')
const bcrypt = require('bcryptjs');
const auth = require('../utlis/auth');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'chinmaya_user';


async function login(user) {
    const username = user.username;
    const password = user.password;
    if(!user || !username || !password) {
        return util.buildResponse(401, {
            message: 'username and password are required'
        })
    }

    const dynamoUser = await getUser(username);
    if (!dynamoUser || !dynamoUser.username){
        return util.buildResponse(403, { message: 'user doesnot exist'});
    }

    if(!bcrypt.compareSync(password, dynamoUser.password)) {
        return util.buildResponse(403, {message : 'password is incorrect'});
    }

    const userInfo = {
        username: dynamoUser.username,
        name: dynamoUser.name
    }

    const token = auth.generateToken(userInfo)
    const response = {
        user: userInfo,
        token: token
    }

    return util.buildResponse(200, response);

}


async function getUser(username){
    const params = {
        TableName: userTable,
        Key:{
            username: username
        }
    }

    return await dynamodb.get(params).promise().then(response => {
        return Response.Item;
    }, error => {
        console.error('There is an error getting user : ', error);
    })
}


module.exports.login = login;