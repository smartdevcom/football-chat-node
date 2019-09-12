"use strict";

const Users = require("../models/user");
var jwt = require("jsonwebtoken");

module.exports = function(_, passport, User) {
	return {
		SetRouting: function(router) {
			router.post("/user_management", function(req, res, next) {
				var email = req.body.data.email;
				Users.findOne({ email: email }, (err, user) => {
					if (err) {
						return done(err);
					}
					if (user) {
						res.send({ error: "User with email already exist" });
					} else {
						const newUser = new Users();
						newUser.username = req.body.data.username;
						newUser.fullname = req.body.data.username;
						newUser.email = req.body.data.email;
						newUser.password = newUser.encryptPassword(req.body.data.password);

						newUser.save(err => {
							var token = jwt.sign({ id: newUser._id }, "worldisfullofdevelopers", {
								expiresIn: 86400
							});
							res.send({ user: newUser, token: token });
						});
					}
				});
			});

			router.post("/get_user", function(req, res, next) {
				var id = req.body.id;
				Users.findOne({ _id: id }, (err, user) => {
					if (err) {
						return done(err);
					}
					if (user) {
						res.send({ user: user });
					}
				});
			});

			router.post("/user_register", function(req, res, next) {
				var email = req.body.data.email;
				Users.findOne({ email: email }, (err, user) => {
					if (err) {
						return res.send({ error: "user error" });
					}
					if (user) {
						jwt.verify(req.body.authorization, "worldisfullofdevelopers", function(err, decoded) {
							if (err) {
								return res.send({ error: "Invalid Token" });
							} else {
								res.send({ user: user });
							}
						});
					} else {
						return res.send({ error: "user error" });
					}
				});
			});

			router.post("/user_login", function(req, res, next) {
				var email = req.body.data.email;
				var password = req.body.data.password;

				Users.findOne({ email: email }, (err, user) => {
					if (err) {
						res.send({ error: "user error" });
					}

					const messages = [];
					if (!user || !user.validUserPassword(password)) {
						res.send({ error: "No User with email exists" });
					} else {
						var token = jwt.sign({ id: user._id }, "worldisfullofdevelopers", {
							expiresIn: 86400
						});
						res.send({ user: user, token: token });
					}
				});
			});

			router.post("/user_register_fb", function(req, res, next) {
				Users.findOne({ facebook: profile.id }, (err, user) => {
					if (err) {
						return res.send({ error: "user error" });
					}

					if (user) {
						return res.send({ error: "user error" });
					} else {
						const newUser = new User();
						newUser.facebook = profile.id;
						newUser.fullname = profile.displayName;
						newUser.username = profile.displayName;
						newUser.email = profile._json.email;
						newUser.userImage = "https://graph.facebook.com/" + profile.id + "/picture?type=large";
						newUser.fbTokens.push({ token: token });

						newUser.save(err => {
							res.send({ user: newUser });
						});
					}
				});
			});

			router.post("/user_register_gg", function(req, res, next) {
				Users.findOne({ google: profile.id }, (err, user) => {
					if (err) {
						return res.send({ error: "user error" });
					}

					if (user) {
						return res.send({ error: "user error" });
					} else {
						const newUser = new User();
						newUser.google = profile.id;
						newUser.fullname = profile.displayName;
						newUser.username = profile.displayName;
						newUser.email = profile.emails[0].value;
						newUser.userImage = profile._json.image.url;

						newUser.save(err => {
							if (err) {
								return res.send({ error: "user error" });
							} else {
								res.send({ user: newUser });
							}
						});
					}
				});
			});
			router.get("/", this.indexPage);
			router.get("/signup", this.getSignUp);
			router.get("/auth/facebook", this.getFacebookLogin);
			router.get("/auth/facebook/callback", this.facebookLogin);
			router.get("/auth/google", this.getGoogleLogin);
			router.get("/auth/google/callback", this.googleLogin);

			router.post("/", User.LoginValidation, this.postLogin);
			router.post("/signup", User.SignUpValidation, this.postSignUp);
		},

		indexPage: function(req, res) {
			const errors = req.flash("error");
			res.send({ title: "Footballkk | Login", messages: errors, hasErrors: errors.length > 0 });
		},

		postLogin: passport.authenticate("local.login", {
			successRedirect: "/home",
			failureRedirect: "/",
			failureFlash: true
		}),

		getSignUp: function(req, res) {
			const errors = req.flash("error");
			res.send({
				title: "Footballkk | SignUp",
				messages: errors,
				hasErrors: errors.length > 0
			});
		},

		postSignUp: passport.authenticate("local.signup", {
			successRedirect: "/home",
			failureRedirect: "/signup",
			failureFlash: true
		}),

		getFacebookLogin: passport.authenticate("facebook", {
			scope: "email"
		}),

		getGoogleLogin: passport.authenticate("google", {
			scope: [
				"https://www.googleapis.com/auth/plus.login",
				"https://www.googleapis.com/auth/plus.profile.emails.read"
			]
		}),

		googleLogin: passport.authenticate("google", {
			successRedirect: "/home",
			failureRedirect: "/signup",
			failureFlash: true
		}),

		facebookLogin: passport.authenticate("facebook", {
			successRedirect: "/home",
			failureRedirect: "/signup",
			failureFlash: true
		})
	};
};
