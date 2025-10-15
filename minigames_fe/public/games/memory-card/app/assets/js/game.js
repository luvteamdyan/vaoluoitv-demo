/*jshint esversion: 6 */

$(document).ready(function() {
	// game namespace/scope
	var game = {
		playerName: "noname",
		moves: 0,
		timeCounter: 0,
		imgCategory: "any",
		cardFigures: [],
		gameLevel: 0,
		isProcessing: false, // Lock to prevent clicking more cards while processing
		totalMoves: 0, // Track total moves across all levels
		totalTime: 0, // Track total time across all levels

		// Initialize the game
		init: function() {
			$(".header-details")
				.append("<h1>Luck8 Event - Lật Thẻ Nhớ</h1>")
				.addClass("uppercase");

			$("#btnStartModal").click(function() {
				// Start game directly without modal
				$(this).hide();
				game.playerName = "Player"; // Set default player name
				$(".information-details").empty();
				$(".information-details").append(
					'<p><h4 class="inline"><span class="badge badge-primary level">Level<span id="levelCounter">0</span></span><span class="badge badge-primary moves"><span id="moves">0</span> moves</span><span class="badge badge-primary levelTimer"><span id="levelTimer">0</span> s</span></h4><button type="button" class="btn btn btn-primary" id="restart"><i class="fas fa-redo-alt"></i></button><button type="button" class="btn btn btn-primary" id="exit"><i class="fas fa-sign-out-alt"></i></button></p>'
				);
				$(".information-details").show();
				game.clickCardHandlers();
				game.exit();
				game.restart();
				game.initTime();
				game.gameLevel = 1;
				game.displayGameLevel(game.gameLevel);
				game.cardFigures = game.getCardFigures(game.gameLevel);
				game.shuffleCards();
				game.getImagesloaded();
			});
		},

		// Continue the game by starting a new game round to the level up
		playAgain: function(level) {
			$("h1").show();
			$(".container-information").show();
			$("#btnStartModal").hide();
			game.exit();
			game.restart();
			game.resetTime();
			game.resetMoves();
			game.displayGameLevel(level);
			game.cardFigures = game.getCardFigures(level);
			game.shuffleCards();
			game.getImagesloaded();
		},

		getPlayerData: function() {
			if ($("#playerName").val() !== "") {
				game.playerName = $("#playerName").val();
				game.clickCardHandlers();
				$("#startModal").modal("toggle");
			} else {
				setTimeout(function() {
					$("#playerName").effect("bounce");
				}, 1000);
			}
		},

	// Get the card deck according the game round level - Always 4 columns
	getCardFigures: function(gameLevel) {
		switch (gameLevel) {
			case (gameLevel = 1):
				// Level 1: 2 rows x 4 columns = 8 cards
				return (game.cardFigures = [1, 2, 3, 4, 1, 2, 3, 4]);
			case (gameLevel = 2):
				// Level 2: 3 rows x 4 columns = 12 cards (6 pairs: 1,2,3,4,5,6)
				return (game.cardFigures = [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6]);
			case (gameLevel = 3):
				// Level 3: 4 rows x 4 columns = 16 cards (8 pairs: 1,2,3,4,5,6,7,8)
				return (game.cardFigures = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]);
			case (gameLevel = 4):
				// Level 4: 5 rows x 4 columns = 20 cards (10 pairs: 1,2,3,4,5,6,7,8,9,10)
				return (game.cardFigures = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
			case (gameLevel = 5):
				// Level 5: 6 rows x 4 columns = 24 cards (12 pairs: 1,2,3,4,5,6,7,8,9,10,11,12)
				return (game.cardFigures = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
			default:
				return (game.cardFigures = [1, 2, 3, 4, 1, 2, 3, 4]);
		}
	},

	// credit: https://medium.com/swlh/the-javascript-shuffle-62660df19a5d
	// Iterate over the cards array and each time generate a random number
	// then switching numbers which shuffles cards and then, after cards are shuffled, assign cards
	shuffleCards: function() {
		var switching = 0;
		var temp = 0;
		game.isProcessing = false; // Reset processing lock when shuffling cards
		$(".card-details").empty();
		// Remove previous level classes
		$(".card-details").removeClass("level-1 level-2 level-3 level-4 level-5");
		// Add current level class for responsive sizing
		$(".card-details").addClass("level-" + game.gameLevel);
		
		// Debug: Log current level and class
		
		for (var i = game.cardFigures.length - 1; i > -1; i -= 1) {
			switching = Math.floor(Math.random() * game.cardFigures.length);
			temp = game.cardFigures[i];
			game.cardFigures[i] = game.cardFigures[switching];
			game.cardFigures[switching] = temp;
			$(".card-details").append('<div class="card unpaired"></div>');
		}
		game.getCards();
	},

		// Assign cards
		// Iterate over each one of the elements with class="card" and assign a data-value attribute and a relative value to each one of the individual cards
		// https://api.jquery.com/data/
		getCards: function() {
			$(".card").each(function(index) {
				$(this).attr("data-card-figure", game.cardFigures[index]);
			});
			game.clickCardHandlers();
		},

		clickCardHandlers: function() {
			$(".card").click(function() {
				game.flipCard($(this));
			});
		},

	// On-click flip the card and display the number of the card
	flipCard: function(card) {
		// Prevent flipping if already processing or card is already visible
		if (game.isProcessing || card.hasClass("visible")) {
			return;
		}
		
		// Prevent opening more than 2 cards
		if ($(".visible").length >= 2) {
			return;
		}
		
		card.addClass("visible");
		// Display number instead of background image
		card.css({
			"background": "#4CAF50",
			"display": "flex",
			"justify-content": "center",
			"align-items": "center",
			"font-size": "48px",
			"font-weight": "bold",
			"color": "#ffffff"
		});
		card.text(card.data("cardFigure"));
		if ($(".visible").length == 2) {
			game.isProcessing = true; // Lock when 2 cards are visible
			game.checkForPairedCards(game.gameLevel);
		}
	},

		// Check if the 2 visible cards have similar figures,
		//if they match make the paired cards disapeared if not flip the figures of the unpaired ones back after a timeout interval
		checkForPairedCards: function(level) {
			var time = 0;
			game.gameLevel = level;
			switch (game.gameLevel) {
				case (game.gameLevel = 1):
					time = 1000;
					break;
				case (game.gameLevel = 2):
					time = 900;
					break;
				case (game.gameLevel = 3):
					time = 700;
					break;
				case (game.gameLevel = 4):
					time = 700;
					break;
				case (game.gameLevel = 5):
					time = 500;
					break;
			}

		if (
			$(".visible").first().data("cardFigure") ==
			$(".visible").last().data("cardFigure")
		) {
			setTimeout(function() {
				$(".visible").each(function() {
					$(this)
						.css({
							opacity: 0,
						}, {
							duration: 1000,
						})
						.removeClass("unpaired visible");
				});
				game.isProcessing = false; // Unlock after cards are removed
				game.checkForSuccess();
			}, time);
	} else {
		setTimeout(function() {
			$(".visible").each(function() {
				$(this)
					.css({
						background: "",
						"font-size": "",
						"font-weight": "",
						"color": "",
					})
					.text("")
					.removeClass("visible");
			});
			game.isProcessing = false; // Unlock after cards are flipped back
		}, time);
	}
		game.moves++;
		$("#moves").html("" + game.moves);
		},

		// Check if all cards are suceessfully paired
		checkForSuccess: function() {
			if ($(".unpaired").length === 0) {
				this.getResults(game.gameLevel);
			}
		},

	// Once all cards are paired, pop up your results: player name, level, time and moves it took to finish the game round
	getResults: function(level) {
		$(".container-information").hide();
		$("h1").hide();
		game.gameLevel = level;
		
		// Add to total stats
		game.totalMoves += game.moves;
		game.totalTime += game.timeCounter;
		
		// Prepare stats for current level
		var stats = {
			time: game.timeCounter,
			moves: game.moves,
			totalTime: game.totalTime,
			totalMoves: game.totalMoves
		};

		if (game.gameLevel == 5) {
			// Level 5 completed - Show celebration modal
			if (window.memoryCardMilestoneTracker && window.memoryCardMilestoneTracker.initialized) {
				
				// Show celebration modal
				window.memoryCardMilestoneTracker.showCompletionCelebration(stats);
				
				// Report to server for spin reward
				window.memoryCardMilestoneTracker.onCompleteAllLevels();
			}
		} else {
			// Level 1-4 completed - Show progress modal
			if (window.memoryCardMilestoneTracker) {
				window.memoryCardMilestoneTracker.showLevelProgressModal(level, stats);
			}
		}
	},

		displayGameLevel: function(level) {
			game.gameLevel = level;
			$("#levelCounter").html(" " + game.gameLevel);
		},

		// Reset moves (scope: current level of the game round)
		resetMoves: function() {
			game.moves = 0;
			$("#moves").html("" + game.moves);
		},

		// Reset time (scope: current level of the game round)
		resetTime: function() {
			game.timeCounter = 0;
			$("#levelTimer").html("" + game.timeCounter);
		},

		// Restart the game round (scope: current level)
		restart: function() {
			$("#restart").click(function() {
				game.resetMoves();
				game.resetTime();
				game.shuffleCards();
			});
		},

		initTime: function() {
			game.refreshIntervalId = setInterval(function() {
				game.timeCounter++;
				$("#levelTimer").html("" + game.timeCounter);
			}, 1000);
		},

		clearTime: function() {
			clearInterval(game.refreshIntervalId);
		},

		// Continue to next level (called from milestone tracker)
		continueToNextLevel: function(level) {
			$("h1").show();
			$(".container-information").show();
			game.resetMoves();
			game.resetTime();
			game.displayGameLevel(level);
			game.cardFigures = game.getCardFigures(level);
			game.shuffleCards();
			game.getImagesloaded();
		},

		// Exit game (called from milestone tracker)
		exitGame: function() {
			game.clearTime();
			$(".container-information").hide();
			$(".container-cards").hide();
			$("#btnStartModal").show();
			
			// Reset total stats
			game.totalMoves = 0;
			game.totalTime = 0;
		},

		// Restart game from beginning (called from milestone tracker)
		restartGame: function() {
			// Reset total stats
			game.totalMoves = 0;
			game.totalTime = 0;
			
			// Start fresh from level 1
			$("h1").show();
			$(".container-information").show();
			$(".container-cards").show();
			game.resetMoves();
			game.resetTime();
			game.gameLevel = 1;
			game.displayGameLevel(game.gameLevel);
			game.cardFigures = game.getCardFigures(game.gameLevel);
			game.shuffleCards();
			game.getImagesloaded();
		},

	// Pre load the images - Currently using numbers instead of images
	getImagesloaded: function() {
		// This function is kept for future use when switching back to images
		// Currently displaying numbers, so no image preloading needed
		return;
	},

		// Start the game over
		exit: function() {
			// From the Exit button 
			$("#exit").click(function() {
				game.clearTime();
				$(".container-information").hide();
				$(".container-cards").hide();
				$("#btnStartModal").show();

				$("#btnStartModal").off('click').click(function() {
					// Start game directly without modal
					$(this).hide();
					game.playerName = "Player"; // Set default player name
					$(".information-details").empty();
					$(".information-details").append(
						'<p><h4 class="inline"><span class="badge badge-primary level">Level<span id="levelCounter">0</span></span><span class="badge badge-primary moves"><span id="moves">0</span> moves</span><span class="badge badge-primary levelTimer"><span id="levelTimer">0</span> s</span></h4><button type="button" class="btn btn btn-primary" id="restart"><i class="fas fa-redo-alt"></i></button><button type="button" class="btn btn btn-primary" id="exit"><i class="fas fa-sign-out-alt"></i></button></p>'
					);
					$(".container-information").show();
					$(".container-cards").show();
					game.clickCardHandlers();
					game.exit();
					game.restart();
					game.resetTime();
					game.resetMoves();
					game.initTime();
					game.gameLevel = 1;
					game.displayGameLevel(game.gameLevel);
					game.cardFigures = game.getCardFigures(game.gameLevel);
					game.shuffleCards();
					game.getImagesloaded();
				});
			});

			// From the result pop up when the player has completed the 5 levels
			$("#endGameButton").click(function() {
				$("h1").show();
				$(".container-information").hide();
				$(".container-cards").hide();
				$("#btnStartModal").show();

				$("#btnStartModal").off('click').click(function() {
					// Start game directly without modal
					$(this).hide();
					game.playerName = "Player"; // Set default player name
					$(".information-details").empty();
					$(".information-details").append(
						'<p><h4 class="inline"><span class="badge badge-primary level">Level<span id="levelCounter">0</span></span><span class="badge badge-primary moves"><span id="moves">0</span> moves</span><span class="badge badge-primary levelTimer"><span id="levelTimer">0</span> s</span></h4><button type="button" class="btn btn btn-primary" id="restart"><i class="fas fa-redo-alt"></i></button><button type="button" class="btn btn btn-primary" id="exit"><i class="fas fa-sign-out-alt"></i></button></p>'
					);
					$(".container-information").show();
					$(".container-cards").show();
					game.clickCardHandlers();
					game.exit();
					game.restart();
					game.resetTime();
					game.resetMoves();
					game.initTime();
					game.gameLevel = 1;
					game.displayGameLevel(game.gameLevel);
					game.cardFigures = game.getCardFigures(game.gameLevel);
					game.shuffleCards();
					game.getImagesloaded();
				});
			});
		},
	};

	game.init();
	
	// Expose game object to window for milestone tracker
	window.game = game;
});