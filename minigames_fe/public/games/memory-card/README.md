# [Match the memory](https://sctlcd.github.io/match-the-memory/)

<img src="https://github.com/sctlcd/match-the-memory/tree/master/app/assets/wireframes/Multi Device Website Mockup Generator-min.png" alt="Match the memory" width="700">
<dl>
<dt>A nice blast from the past!</dt><br>
<dd>I was playing memory card games with my sister when I was a little girl and I kept pretty fun memories of theses times</dd>

---

# Table of Contents <a name="TableOfContents"></a>

1. [About](#About)
	- [How to play](#HowToPlay)
	- [Why this project?](#WhyThisProject)

1. [UX](#UX)

	- [User Stories](#UserStories)
	- [Design](#Design)
		- [Framework](#Framework)
		- [color Scheme](#ColorScheme)
		- [Icons](#Icons)
		- [Typography](#Typography)
	- [Wireframes](#Wireframes)

2. [Features](#Features)

	- [Existing Features](#ExistingFeatures)
		- [Footer](#Footer)
		- [Main page](#Mainpage)
	- [Features Left to Implement](#FeaturesLeftToImplement)

3. [Technologies Used](#TechnologiesUsed)

	- [Front-End Technologies](#Front-end-technologies)

4. [Testing](#Testing)

    - [User story validation](#UserStoryValidation)
	- [Layout responsiveness](#LayoutResponsiveness)
	- [Compatibility](#Compatibility)
	- [Testing left](#Testingleft)
	- [Validators](#Validators)
	- [Known Issues](#KnownIssues)

5. [Deployment](#Deployment)

	- [Deployment – Live website](#Deploymentlivewebsite)
	- [Deployment – Run locally](#Deploymentrunlocally)

6. [Credits](#Credits)

	- [Content](#Content)
	- [Media](#Media)
	- [Code](#Code)
	- [Acknowledgements](#Acknowledgements)

---

## About <a name="About"></a>

The general purpose of this website is to give the opportunity to people to improve their concentration and challenging their visual memory while having fun. And this anytime, anywhere as this game is available on various devices as desktops, tablets and mobile.

**Match the memory** is a card game in which all of the cards are laid face down on the screen and two cards are flipped face up over each turn. If the cards match they stay face up if not they flip back. The object of the game is to turn over pairs of matching cards. Once all cards are matched, a popup message appears and congratulates the player for winning the game. The popup gives the game round result, how much time and how many moves it took to end the game.

### How to play? <a name="HowToPlay"></a>

The goal is to match all the cards together and win the game round.

1. Click on the Let's play button. Enter your player name and start playing.

2. Click on two cards, if they match, look for another pair of cards. If cards don't pair, try again.

3. Keep matching up pairs until all cards are matched and faced up.

4. If there is an issue during the game, just hit the restart button on the right corner of the game.
 If you want to start over, hit the exit button on the right corner of the game.

5. Once you matched all cards together. Congrats you win!
An popup window appears showing you your game round result, time and moves, to complete the game.

6. In the result popup, you can hit 'Level up!' to have another go at the level up game, keep playing for the minimum of moves in the minimum of time.

7. When the player complete the 5 levels, a popup invite him to start the game over by hitting 'Play again!'.

8. Good luck and may the best fan win!

Levels description:
- Level 1: 4 paired of cards, trigger the animation of flipping back the pair of card after 1s
- Level 2: 6 paired of cards, trigger the animation of flipping back the pair of card after 0,9s
- Level 3: 8 paired of cards, trigger the animation of flipping back the pair of card after 0,7s
- Level 4: 10 paired of cards, trigger the animation of flipping back the pair of card after 0,7s
- Level 5: 12 paired of cards, trigger the animation of flipping back the pair of card after 0,5s

### Why this project? <a name="WhyThisProject"></a>

This project is part of my [Code Institute](https://codeinstitute.net/) Full Stack Software Development studies, the **Interactive Front-End Development** module. The objective of this milestone project is the presentation of interactive data. "In this project, you'll build an interactive front-end site. The site should respond to the users' actions, allowing users to actively engage with data, alter the way the site displays the information to achieve their preferred goals."

For this project we could choose from one of the following ideas:
- Bring your own idea(s) to life, based on providing value to users to address a specific real or imagined need.
- Create a site that calls on the Google Maps API and/or the Google Places API (or similar) to allow users to search for their next holiday destination.
- Build a memory game (for inspiration [Simon](https://en.wikipedia.org/wiki/Simon_(game)) and [Bop It](https://en.wikipedia.org/wiki/Bop_It))

I have decided to create a website using HTML, CSS, Bootstrap 4, JavaScript and jQuery based on visual memory.

Back to [top](#TableOfContents)

---

## UX  <a name="UX"></a>

### User Stories <a name="UserStories"></a>

"***As a user, I want to _____***"

- [x] view the site from **any devices** (mobile, tablet, desktop).
- [x] Enter my player name
- [x] Player name is requiered prior to start the game
- [x] Start the game by myself (by clicking on a button)
- [x] Reset the game round (scope: current level)
- [x] Exit the game (start the game over and enter your player name again)
- [x] View information of my current game round in progress (level, moves, timer)
- [x] View game round results (player name, level, moves and time it took to finish the current game round)
- [x] Play again with level up by default.
- [x] Start the game over after 5 levels completed

<br>
- [x] *marked the item as implemented successfully*

### Design <a name="Design"></a>

When it comes about digital memory games it means potentially spending a long time on the screen playing so the design has to be eye-catching, user-friendly, peaceful and relaxing with vibrant but harmonious colors, straightforward and simple to boost concentration and memory.
This is why I have designed my entire project around the **Urban art** and **Abstract art**.

I choose an abstract peaceful [multicolored illustration](https://www.pexels.com/photo/photo-of-multicolored-illustration-2832382/) as background combined to a [colorful work of art](https://www.pexels.com/photo/city-art-los-angeles-street-art-2334805/) visible in Los Angeles streets as card illustration covers.    

I picked the [blue color](https://placehold.it/15/0000FF/0000FF) reminiscent of the same color in the [abstract background](https://www.pexels.com/photo/photo-of-multicolored-illustration-2832382/) for displaying the information badges and the reset and exit buttons.

I chose the combination of [purple](https://placehold.it/15/1f1740/1f1740) and [gold](https://placehold.it/15/DAA520/DAA520) reminiscent of the same colors in the [abstract background](https://www.pexels.com/photo/photo-of-multicolored-illustration-2832382/) for showing the start menu and the results menu.

I picked a Google Font [Sedgwick Ave Display](https://fonts.google.com/specimen/Sedgwick+Ave+Display) which emphasizes the Urban art concept with a graffiti style writing font.

I did not add any sound effects on purpose in this version of the game which the general purpose is memory and concentration as I believe sounds can disturb concentration. 
Sound effects will possibly be part of a future version with the option to mute them.

#### Framework <a name="Framework"></a>

Bootstrap 4 - Because I've already used Bootstrap and I liked it, because it meets the project requirements "*Incorporate a structured layout*". I've decided to build this website with Bootstrap 4.

#### Color Scheme <a name="ColorScheme"></a>

In keeping with the **Urban art** and **Abstract art** idea, I have chosen a colorful scheme. I first choose my background image, an abstract peaceful [multicolored illustration](https://www.pexels.com/photo/photo-of-multicolored-illustration-2832382/) and then the [colorful work of art](https://www.pexels.com/photo/city-art-los-angeles-street-art-2334805/). I really liked the [gold](https://placehold.it/15/DAA520/DAA520) which fits harmoniously with my background. From there, I used a color calculator to get complementary colors to match my [gold](https://placehold.it/15/DAA520/DAA520). I did not choose the exact complementary colors suggested [here](https://www.sessions.edu/color-calculator-results/?colors=daa520,7020da) and [here](https://www.sessions.edu/color-calculator-results/?colors=daa520,ce20da,2038da) but some derived [html colors](https://www.hexcolortool.com/) based on the color calculator suggestions which work with my background:

- ![#fafafa](https://placehold.it/15/fafafa/fafafa) `#fafafa`
- ![#0000](https://placehold.it/15/0000/0000) black
- ![#1f1740](https://placehold.it/15/1f1740/1f1740) `#1f1740`
- ![#DAA520](https://placehold.it/15/DAA520/DAA520) GoldenRod
- ![#0000FF](https://placehold.it/15/0000FF/0000FF) Blue
- ![#d39e00](https://placehold.it/15/d39e00/d39e00) `#d39e00`

#### Icons <a name="Icons"></a>

- [Font Awesome 5.12](https://fontawesome.com/)
 - I like the look of the Font Awesome's icons which fit my needs for this project.

#### Typography <a name="Typography"></a>

- I have opted to use the Google Font [Sedgwick Ave Display](https://fonts.google.com/specimen/Sedgwick+Ave+Display) which emphasizes the Urban art concept with a graffiti style throughout the application. As a secondary font I have imported the simple and easy to read font Google Font [Roboto](https://fonts.google.com/specimen/Roboto).

### Wireframes <a name="Wireframes"></a>

I have used [Balsamiq Wireframes](https://balsamiq.com/wireframes/) for my wireframes because:
- Code Institute have provided all students a free licence until end of 2020. I got to use this software a few year ago and I am pretty happy to get the chance to use it again.
- The simplicity, rapidity and ease of use by focusing on structure and content.

My wireframes for this project can be found [here](https://github.com/sctlcd/match-the-memory/tree/master/app/assets/wireframes) in the wireframes sub-directory.

Back to [top](#TableOfContents)

---

## Features <a name="Features"></a>

### Existing Features <a name="ExistingFeatures"></a>

##### Footer <a name="Footer"></a>

- A copyright mention is displayed with my name beside a GitHub icon which opens my [Github](https://github.com/sctlcd) home page in a new browser tab.

##### [Main page](https://github.com/sctlcd/match-the-memory/blob/master/index.html) <a name="Mainpage"></a>

- A button 'Let's play' opens a Start popup asking the player to enter a player name. This entry is requiered prior to start the game.
- By hitting 'Let's play' from the Start popup the user trigger the timer / the beginning of the game.
- When a card is selected it triggers a flip effect which makes the figure of the card visible.
- Only 2 cards can be visible at the same time. 
- If the 2 visible cards match the 2 cards disappear if not both cards are flipped back. 
- Each try of matching 2 pair of cards count for 1 move. 
- The current level, timer and moves in progress of the game round are displayed on the screen 
- The reset button reset the timer and the moves of the current level.
- The exit button starts the game over. (the user name has to be enter again)
- When all cards are matched a Result popup show the player's results : player name, level, time and moves it took to finish the game round. A 'Level up' button triggers a level up game round.
- When the player completed 5 levels a popup informs and invites him/her to play the game over by hitting 'Play again!'

### Features Left to Implement <a name="FeaturesLeftToImplement"></a>

 - Total time timer (all levels finished)
 - Total moves counter (all levels finished)
 - Implement score
 - Implement Scores saving and storage with player name
 - Displaying the highest scores recorded in the results popup or in another specific place in the application (to be defined)
 - Add more complexity to the levels
 - Allow the player to choose the level (to be defined, it could be implemented as options 'choose level mode' vs 'standard mode' which would be the current version of the game)
 - Add sound effects and an option to mute them

Back to [top](#TableOfContents)

---

## Technologies Used <a name="TechnologiesUsed"></a>

- [GitHub](https://github.com/) - Used as remote storage of my code online.
- [Gitpod](https://www.gitpod.io/) - Used as an online IDE.
- [Notepad++](https://notepad-plus-plus.org/) - Used as local source code editor.
- [Compressjpeg](https://compressjpeg.com/) - Used to compress images for loading faster
- [Techsini](https://techsini.com/multi-mockup/) - Used to generate multi-device website mockup

##### Front-End Technologies <a name="Front-end-technologies"></a>

- [HTML](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5) - Used as the base for markup text.
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS3) - Used as the base for cascading styles.
- [Bootstrap](https://getbootstrap.com/) - Used for responsive, mobile first projects design
- [JavaScript](https://www.javascript.com/): Used for user interactions.
- [jQuery](https://jquery.com/): JavaScript library, used to simplify some of the DOM manipulations

Back to [top](#TableOfContents)

---

## Testing <a name="Testing"></a>

My testing coverage for this project can be found [here](https://github.com/sctlcd/match-the-memory/blob/master/app/assets/testing/testing_README.md) in the testing sub-directory or below.

### User story validation <a name="UserStoryValidation"></a>

|  | Galaxy S5 | Pixel | Pixel 2 XL |iPhone 6/7/8 | iPhone 6/7/8 Plus | iPhone X | iPad | iPad Pro | Desktop 1024px | Desktop >1200px |
| :--- | :--- | :---| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| View the site from any devices | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |Pass  |
| Enter my player name | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Player name is requiered prior to start the game | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |Pass  |
| Start the game by myself (by clicking on a button) | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Reset the game round (scope: current level) | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Exit the game (start the game over and enter your player name again) | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| View information of my current game round in progress (level, moves, timer) | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| View game round results (player name, level, moves and time it took to finish the current game round) | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |
| Play again with level up by default | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |Pass  |
| Start the game over after 5 levels completed | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |Pass  |

### Layout responsiveness <a name="LayoutResponsiveness"></a>

|  | Galaxy S5 | Pixel | Pixel 2 XL |iPhone 6/7/8 | iPhone 6/7/8 Plus | iPhone X | iPad | iPad Pro | Desktop 1024px | Desktop >1200px |
| :--- | :--- | :---| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| website is responsive < 767 px | Good | Good | Good | Good | Good | Good | n/a | n/a | n/a | n/a |
| website is responsive > 768 px | n/a | n/a | n/a | n/a | n/a | n/a | Good | Good | Good | Good |
|**index.html** |
| modals | Good | Good | Good | Good | Good | Good | Good | Good | Good | Good |
| overlay of the background modal | Poor | Poor | Poor | Poor | Poor | Poor | Good | Good | Good | Good |
| images work | Good | Good | Good | Good | Good | Good |Good  | Good | Good | Good |
| links/buttons | Good | Good | Good | Good | Good | Good | Good | Good  | Good | Good |
| render as expected | Good | Good | Good | Good | Good | Good | Good | Good | Good | Good |

### Compatibility <a name="Compatibility"></a>

I tested the website across the 6 main browsers in both desktop and mobile configuration to ensure a large number of users can use it successfully.

- Chrome v.81.0
- Edge v.44
- Firefox v.75.0
- Safari v.5.1.7 for Windows 10
- Opera v.68.0
- Internet Explorer v.11

|All pages | Chrome | Edge | Firefox | Safari | Opera | IE |
| :--- | :--- | :---| :--- | :--- | :--- | :--- |
| Expected appearance | Good | Fair | Good | Poor | Good | Poor |
| Expected responsiveness | Good | Good | Good | Poor | Good | Poor |

- IE: Some CSS3 properties and HTML5 elements are not fully supported

- Safari v.5.1.7: It’s an outdated version and lacks many of the features present in the latest version of Safari. The last version of Safari for Windows was released on May 9, 2012.

### Testing left <a name="Testingleft"></a>

- There is no way to install the latest version of the Safari browser on Windows 10 as Apple stopped developing Safari for Windows operating system long ago.
For testing this website on the latest version of Safari, I will have to install the newest version of macOS on Windows 10 in a virtual machine.
- Adding automated tests

### Validators <a name="Validators"></a>

**HTML**
- [W3C HTML Validator](https://validator.w3.org/)
    - No errors

**CSS**
- [W3C CSS Validator](https://jigsaw.w3.org/css-validator/)
	- No errors

**Javascript**
- [Javascript Validator](http://beautifytools.com/javascript-validator.php)
	- No errors

**Chrome DevTools**
- [Chrome DevTools] (https://developers.google.com/web/tools/chrome-devtools/)
Console Navigating through the Website rendered no critical fails/errors in the console that were necessary to fix.

### Known Issues <a name="KnownIssues"></a>

- Background overlay of the Start and Result modal on Galaxy S5, Pixel Pixel 2 XL, iPhone 6/7/8, iPhone 6/7/8 Plus, iPhone X does not display as expected.

Back to [top](#TableOfContents)

---

## Deployment <a name="Deployment"></a>

### Deployment – Live Website <a name="Deploymentlivewebsite"></a>

 1.	Create repository in GitHub and give it a relevant name.
 2.	Click on your repository to open it.
 3.	Find the “settings” tab and click on it.
 4.	Scroll down until the “GitHub Pages” sections.
 5.	Under the “source” drop down menu, choose a branch. I chose “master branch” and select it.
 6.	You will then see a URL to your live webpage. In my case the URL is https://sctlcd.github.io/match-the-memory/

### Deployment – Run Locally <a name="Deploymentrunlocally"></a>

1.	Again, click on the repository called [Match the memory](https://github.com/sctlcd/match-the-memory)
2.	Along the top bar, find the “clone or download” button.
3.	Here you have the option to clone by HTTPS or SSH.
4.	Once you have chose your desired option, then click the copy icon next to the URL.
5.	Open Git Bash.
6.	Ensure you are in the correct directory which you want to copy the code into. If not, change the directory.
7.	In the terminal, write
			$ git clone https://github.com/sctlcd/match-the-memory.git
8.	Press the enter button and your clone will be created.

Back to [top](#TableOfContents)

---

## Credits <a name="Credits"></a>

- My inspiration comes from
	- [Memozor](https://www.memozor.com/memory-games/for-adults/famous-moovies), a free memory games online platform.
	- Memory Game built with jQuery [Medium](https://medium.com/letsboot/memory-game-built-with-jquery-ec6099618d67)
	- Memory Game Programming JavaScript Tutorial [YouTube](https://www.youtube.com/watch?v=c_ohDPWmsM0&feature=emb_rel_pause)
	- Part 1 - HTML / CSS - 4×4 Memory Game In JavaScript [YouTube](https://www.youtube.com/watch?v=qYMJMf7JsbM)
	- Memory Card Game - JavaScript Tutorial [YouTube](https://www.youtube.com/watch?v=ZniVgo8U7ek)

### Content <a name="Content"></a>

- All images visible on the cards come from [PlaceIMG](https://placeimg.com/), a random image generator website. It offers the possibility to customise images (width, height, category) before their random generation.

### Media <a name="Media"></a>

Sources of the images used on this site:

- From images sub-directory - [Github](https://github.com/sctlcd/match-the-memory/tree/master/app/assets/images)
	- city-art-los-angeles-street-art-min.jpg - [Pexel | copyright ᒷ⟁⨃.ᖇ.ᕮ.∥.ᕮ](https://www.pexels.com/photo/city-art-los-angeles-street-art-2334805/)
	- photo-of-multicolored-illustration-min.jpg - [Pexel | copyright Anni Roenkae](https://www.pexels.com/photo/photo-of-multicolored-illustration-2832382/)

### Code <a name="Code"></a>

- Sticky footer - [Css-tricks](https://css-tricks.com/couple-takes-sticky-footer/)
- Way to implement wrapper - [Css-tricks](https://css-tricks.com/best-way-implement-wrapper-css/)
- Responsive background image - [Webfx](https://www.webfx.com/blog/web-design/responsive-background-image/)
- Shuffle cards details - [Medium](https://medium.com/swlh/the-javascript-shuffle-62660df19a5d)
- How To Create a Flip Card - [W3schools](https://www.w3schools.com/howto/howto_css_flip_card.asp)
- Disable background after modal popup - [Stackoverflow](https://stackoverflow.com/questions/39672346/bootstrap-3-disable-background-after-modal-popup)
- jQuery timer - [Yogihosting](https://www.yogihosting.com/jquery-timer/)
- Stop setInterval call in JavaScript - [Stackoverflow](https://stackoverflow.com/questions/109086/stop-setinterval-call-in-javascript)
- jQuery effect - [jQuery UI](https://jqueryui.com/effect/)
- jQuery API documentation - [API jQuery](https://api.jquery.com/data/)
- Memory Game built with jQuery - [Medium](https://medium.com/letsboot/memory-game-built-with-jquery-ec6099618d67)
- Memory Game Programming JavaScript Tutorial - [YouTube](https://www.youtube.com/watch?v=c_ohDPWmsM0&feature=emb_rel_pause)
- Part 1 - HTML / CSS - 4×4 Memory Game In JavaScript - [YouTube](https://www.youtube.com/watch?v=qYMJMf7JsbM)
- Memory Card Game - JavaScript Tutorial - [YouTube](https://www.youtube.com/watch?v=ZniVgo8U7ek)

### Acknowledgements <a name="Acknowledgements"></a>

- [Anthony Ngene](https://github.com/tonymontaro)
	- Thanks to my Code Institute mentor for his time, suggestions, and constructive feedback

Back to [top](#TableOfContents)

---
