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


const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;

    const places = DUMMY_PLACES.filter(p => {
        return p.creator === userId;
    });
    if (!places || places.length === 0) {

        return next(new Error('Could not find  places for the provided user id?', 404));
    }
    res.json({ places });
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


const updatePlace = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        throw new HttpError('Invalid inputs passed , please check your data.', 422);
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description;

    DUMMY_PLACES[placeIndex] = updatedPlace;

    res.status(200).json({ place: updatedPlace });

};


const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    if (!DUMMY_PLACES.find(p => p.id !== placeId)) {
        throw new HttpError('Could not find a place for that id.', 404);

    }
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({ message: 'Deleted place.' })
};


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;