import mongoose from 'mongoose'
import { Router } from 'express'
import FoodTruck from '../model/foodtruck'
import Review from '../model/review'

import { authenticate } from '../middleware/authMiddleware'

export default ({ config, db }) => {
    let api = Router()

    // CRUD - Create Read Update Delete

    // 'v1/foodtruck/add' Create
    api.post('/add', authenticate, (req, res) => {
        let newFoodTruck = new FoodTruck();
        newFoodTruck.name = req.body.name;
        newFoodTruck.foodtype = req.body.foodtype;
        newFoodTruck.avgcost = req.body.avgcost;
        newFoodTruck.geometry.coordinates.lat = req.body.geometry.coordinates.lat;
        newFoodTruck.geometry.coordinates.long = req.body.geometry.coordinates.long;

        newFoodTruck.save(err => {
            if (err) {
                res.send(err)
            }
            res.json({ message: 'FoodTruck saved succesfully' })
        })
    })

    // '/v1/foodtruck' - Read
    api.get('/', authenticate, (req, res) => {
        FoodTruck.find({}, (err, foodtrucks) => {
            if (err) {
                res.send(err)
            }
            res.json(foodtrucks)
        });
    });

    // '/v1/foodtruck/:id' - Read 1
    api.get('/:id', authenticate, (req, res) => {
        FoodTruck.findById(req.params.id, (err, foodtruck) => {
            if (err) {
                res.send(err)
            }
            res.json(foodtruck)
        });
    });

    // '/v1/foodtruck/:id' Update
    api.put('/:id', authenticate, (req, res) => {
        FoodTruck.findById(req.params.id, (err, foodtruck) => {
            if (err) {
                res.send(err)
            }
            foodtruck.name = req.body.name
            foodtruck.save(err => {
                if (err) {
                    res.send(err)
                }
                res.json({ message: 'FoodTruck info updated' })
            });
        });
    });

    // '/v1/foodtruck/:id' - Delete
    api.delete('/:id', authenticate, (req, res) => {
        FoodTruck.findById(req.params.id, (err, foodtruck) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            if (foodtruck === null) {
                res.status(404).send("Food Truck Not Found");
                return;
            }
            FoodTruck.remove({
                _id: req.params.id
            }, (err, foodtruck) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                Review.remove({
                    foodtruck: req.params.id
                }, (err, review) => {
                    if (err) {
                        res.send(err);
                    }
                })

                res.json({ message: 'FoodTruck succesfully deleted' })
            });
        });
    });


    // adding review
    // '/v1/foodtruck/review/add/:id'
    api.post('/review/add/:id', authenticate, (req, res) => {
        FoodTruck.findById(req.params.id, (err, foodtruck) => {
            if (err) {
                res.send(err)
            }
            let newReview = new Review

            newReview.title = req.body.title
            newReview.text = req.body.text
            newReview.foodtruck = req.body._id
            newReview.save((err, review) => {
                if (err) {
                    res.send(err)
                }
                foodtruck.reviews.push(newReview)
                foodtruck.save(err => {
                    if (err) {
                        res.send(err)
                    }
                    res.json({ message: 'Food Truck review saved' })
                });
            });
        });
    });

    // getting reviews
    // '/v1/foodtruck/reviews/:id'
    api.get('/reviews/:id', authenticate, (req, res) => {
        Review.find({ foodtruck: req.params.id }, (err, reviews) => {
            if (err) {
                res.send(err)
            }
            res.json(reviews)
        });
    });

    return api
}
