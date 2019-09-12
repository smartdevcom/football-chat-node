module.exports = function(async, Users, Message, FriendResult) {
	return {
		SetRouting: function(router) {
			router.get("/settings/interests", this.getInterestPage);
			router.post("/settings/interests", this.postInterestPage);
		},

		getInterestPage: function(req, res) {
			var user = JSON.parse(req.query.user);
			async.parallel(
				[
					function(callback) {
						Users.findOne({ username: user.username })
							.populate("request.userId")
							.exec((err, result) => {
								callback(err, result);
							});
					},

					function(callback) {
						const nameRegex = new RegExp("^" + user.username.toLowerCase(), "i");
						Message.aggregate(
							[
								{ $match: { $or: [{ senderName: nameRegex }, { receiverName: nameRegex }] } },
								{ $sort: { createdAt: -1 } },
								{
									$group: {
										_id: {
											last_message_between: {
												$cond: [
													{
														$gt: [
															{ $substr: ["$senderName", 0, 1] },
															{ $substr: ["$receiverName", 0, 1] }
														]
													},
													{ $concat: ["$senderName", " and ", "$receiverName"] },
													{ $concat: ["$receiverName", " and ", "$senderName"] }
												]
											}
										},
										body: { $first: "$$ROOT" }
									}
								}
							],
							function(err, newResult) {
								const arr = [
									{ path: "body.sender", model: "User" },
									{ path: "body.receiver", model: "User" }
								];

								Message.populate(newResult, arr, (err, newResult1) => {
									callback(err, newResult1);
								});
							}
						);
					}
				],
				(err, results) => {
					const result1 = results[0];
					const result2 = results[1];

					res.send({
						title: "Footballkik - Interests",
						user: user,
						data: result1,
						chat: result2
					});
					// res.render("user/interest", {
					// 	title: "Footballkik - Interests",
					// 	user: user,
					// 	data: result1,
					// 	chat: result2
					// });
				}
			);
		},

		postInterestPage: function(req, res) {
			var user = req.body.user;
			// FriendResult.PostRequest(req, res, "/settings/interests");

			async.parallel(
				[
					function(callback) {
						if (req.body.data.favClub) {
							Users.update(
								{
									_id: user._id,
									"favClub.clubName": { $ne: req.body.data.favClub }
								},
								{
									$push: {
										favClub: {
											clubName: req.body.data.favClub
										}
									}
								},
								(err, result1) => {
									callback(err, result1);
								}
							);
						}
					}
				],
				(err, results) => {
					res.send({
						redirect: true
					});
					// res.redirect("/settings/interests");
				}
			);

			async.parallel(
				[
					function(callback) {
						if (req.body.data.favPlayer) {
							Users.update(
								{
									_id: user._id,
									"favPlayer.playerName": { $ne: req.body.data.favPlayer }
								},
								{
									$push: {
										favPlayer: {
											playerName: req.body.data.favPlayer
										}
									}
								},
								(err, result2) => {
									callback(err, result2);
								}
							);
						}
					}
				],
				(err, results) => {
					res.send({
						redirect: true
					});
					// res.redirect("/settings/interests");
				}
			);

			async.parallel(
				[
					function(callback) {
						if (req.body.data.nationalTeam) {
							Users.update(
								{
									_id: user._id,
									"favNationalTeam.teamName": { $ne: req.body.data.nationalTeam }
								},
								{
									$push: {
										favNationalTeam: {
											teamName: req.body.data.nationalTeam
										}
									}
								},
								(err, result3) => {
									callback(err, result3);
								}
							);
						}
					}
				],
				(err, results) => {
					res.send({
						redirect: true
					});
					// res.redirect("/settings/interests");
				}
			);
		}
	};
};
