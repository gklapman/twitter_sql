'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db/index');

module.exports = function makeRouterWithSockets(io) {

    // a reusable function
    function respondWithAllTweets(req, res, next) {
        var allTheTweets = tweetBank.list();
        res.render('index', {
            title: 'Twitter.js',
            tweets: allTheTweets,
            showForm: true
        });
    }

    // here we basically treet the root view and tweets view as identical
    router.get('/', (req, res, next) => {
        client.query('SELECT tweets.content, users.name, tweets.id, users.picture_url FROM tweets JOIN users ON users.id = tweets.user_id', function(err, result) {
            // console.log(result);
            if (err) return next(err); // pass errors to Express
            var tweets = result.rows;
            // console.log(tweets);

            res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
        });
    });
    router.get('/tweets', respondWithAllTweets);

    // single-user page
    router.get('/users/:username', function(req, res, next) {
        client.query('SELECT tweets.content, users.name, tweets.id, users.picture_url FROM tweets JOIN users ON users.id = tweets.user_id WHERE users.name=$1', [req.params.username], function(err, result) {
            // console.log(result);
            if (err) return next(err); // pass errors to Express
            var tweets = result.rows;
            // console.log(tweets.picture_url);
            res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
        });
    });

    // single-tweet page
    router.get('/tweets/:id', function(req, res, next) {
        client.query('SELECT tweets.content, users.name, tweets.id, users.picture_url FROM tweets JOIN users ON users.id = tweets.user_id WHERE tweets.id=$1', [req.params.id], function(err, result) {
            // console.log(result);
            if (err) return next(err); // pass errors to Express
            var tweets = result.rows;
            console.log(tweets + " logged");
            res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
        });
    });

    // create a new tweet

    router.post('/tweets', function(req, res, next) {
        var name = req.body.name
        var text = req.body.text
        console.log(req.body.name);
        client.query('SELECT id FROM users WHERE $1 = users.name', [name], function(err, result) {
            if (err) return next(err);
            // if (result.rows.length === 0) {
            //     break;
            // }
            client.query("INSERT INTO tweets(id, user_id, content) VALUES (nextval('tweets_id_seq'), $1, $2)", [result.rows[0].id, req.body.text], function(err, result) {
                if (err) return next(err);
                console.log("success");
            })
        })

        // client.query("INSERT INTO tweets(id, user_id, content) VALUES (nextval('tweets_id_seq'), nextval('users_id_seq'), $1)", [req.body.text], function(err, result) {
        //     if (err) return next(err); // pass errors to Express
        //     console.log(result.rows);
        // })

        // // client.query("INSERT INTO users(id, name, picture_url) VALUES (nextval('users_id_seq'), $1)", [req.body.name])
        // console.log("this has been added");
        // io.sockets.emit('new_tweet', newTweet);
        res.redirect('/');
    });

    // replaced this hard-coded route with general static routing in app.js
    router.get('/stylesheets/style.css', function(req, res, next) {
        res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
    });

    return router;
}
