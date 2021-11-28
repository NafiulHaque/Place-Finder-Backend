const { validationResult } = require('express-validator');
const { v4: uuid } = require('uuid');

const HttpError = require('../models/http-error');
//const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');



let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire state bouilding',
        description: 'One of the most famous sky scrapers in the woorld',
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        address: '20 W 34th St, New York, NY 10001',
        creator: 'u1'
    }
];



const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went worng , could not find a place',
            500
        );
        return next(error);
    }


    if (!place) {
        const error = new HttpError(
            'Could not find a place for the provided id?',
            404
        );
        return next(error);
    }
    res.json({ place: place.toObject({ getters: true }) });

};


const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let places;
    try {
        places = await Place.find({ creator: userId });
    } catch (err) {
        const error = new HttpError(
            'Fetching places failed , please try again later',
            500
        );
        return next(error);
    }


    if (!places || places.length === 0) {

        return next(new Error('Could not find  places for the provided user id?', 404));
    }
    res.json({ places: places.map(place => place.toObject({ getters: true })) });
};


const createPlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors);
        next(new HttpError('Invalid inputs passed , please check your data.', 422));
    }

    const { title, description, coordinates, address, creator } = req.body;

    // let coordinates;
    // try {
    //     coordinates = await getCoordsForAddress(address);
    // } catch (error) {
    //     return next(error);
    // }


    const createdPlace = new Place({
        title,
        description,
        address,
        location: {
            lat: 40.7484474,
            lng: -73.9871516
        },
        image: 'https://firebasestorage.googleapis.com/v0/b/myapp-c3e74.appspot.com/o/5afe8b46c08ca750f1040f62896545a5c-f1xd-w1020_h770_q80.jpg?alt=media&token=ecb1893a-f412-44ab-bfd6-dba76144fd38',
        creator
    });

    try {
        await createdPlace.save();
    } catch (err) {
        const error = new HttpError(
            'Creationg place failed',
            500
        )
        return next(error);
    }

    res.status(201).json({ place: createdPlace });
};


const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passed , please check your data.', 422);
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went worong, could not update place',
            500
        );
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError(
            'Sometihing went wrong, could not update place.',
            500
        );
        return next(error);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });

};


const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong , could not delete place',
            500
        );
        return next(error);
    }

    try {
        await place.remove();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong , could not delete place',
            500
        );
        return next(error);
    }

    res.status(200).json({ message: 'Deleted place.' })
};


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;