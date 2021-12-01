const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');


const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Nafiul Haque',
        email: 'nafiulhaque22@gmail.com',
        password: 'testers'
    }
];


const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) });

};


const signup = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return next(new HttpError('Invalid inputs passed , please check your data.', 422)
        );
    }
    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Singing up failed , plaese try again later',
            500

        )
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'User exists already, please login instead.',
            422
        );
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: 'https://firebasestorage.googleapis.com/v0/b/myapp-c3e74.appspot.com/o/82531761_171253510889533_5937920248739138889_n.jpg?alt=media&token=c17d0068-95ec-48df-bb40-2564675904ca',
        password,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'Signing up  failed',
            500
        )
        return next(error);
    }

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};


const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Login failed , plaese try again later',
            500
        );
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError(
            'Invalid credentials, could not log you in',
            401
        );
        return next(error);
    }


    res.json({ message: 'Logged in!' });
};


exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;