'use strict';

const passport = require('passport');
const User = require('../models/user');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: '1',
    clientSecret: '2',
    callbackURL: 'http://localhost:3000/auth/google/callback',
    passReqToCallback: true
    
}, (req, accessToken, refreshToken, profile, done) => {
    User.findOne({google:profile.id}, (err, user) => {
        if(err){
           return done(err);
        }
        
        if(user){
            return done(null, user);
        }else{
            const newUser = new User();
            newUser.google = profile.id;
            newUser.fullname = profile.displayName;
            newUser.username = profile.displayName;
            newUser.email = profile.emails[0].value;
            newUser.userImage = profile._json.image.url;
            
            newUser.save((err) => {
                if(err){
                    return done(err)
                }
                return done(null, newUser);
            })
        }
    })
}));































