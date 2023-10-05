// getting the loading div from the document
const loadingDiv = document.querySelector(".info-bar")


// this function controlls and starts the whole game
async function init() {
    const WORD_URL = "https://words.dev-apis.com/word-of-the-day"
    const RANDOM_WORD_URL = "https://words.dev-apis.com/word-of-the-day?random=1"
    const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word"

    // setting the loading state
    let isLoading = true
    setLoading(isLoading)
    let done = false

    // getting the word
    const response = await fetch(WORD_URL)
    const wordObject = await response.json()
    const correctWord = wordObject.word

    // changing the loading state after fetching word
    isLoading = false
    setLoading(isLoading)

    let guessedWord = ''
    let currentRow = 0
    let count = 0
    let letterDict = {}
    let value4 = ''

    // getting the start button from the dom
    const startButton = document.querySelector(".start-btn")
    startButton.addEventListener("click", startClick)

    // the container that holds all the input boxes
    const container = document.getElementsByClassName("word-container")[0]
    // adding a event handler on the container
    container.onkeyup = function(e) {
        if (done) {
            return
        }
        // resetting and updating the variables when jumping to next row
        if (parseInt(e.target.parentNode.parentNode.id) != currentRow || parseInt(e.target.id) === 0) {
            guessedWord = ''
            currentRow = e.target.parentNode.parentNode.id
            count = 0
            letterDict = {}
        }
        
        let target = e.srcElement || e.target
        // the length of the value in the input box
        let myLength = target.value.length
        
        // as long as the box has input the letter is added to the guessed word
        if (myLength >= 1) {
            // saving the fifth letter if it's correct
            if (parseInt(target.id) === 4 && correctWord.includes(target.value)) {
                value4 = target.value
            }

            // as long as the next element is not null, traverse the row
            if (target.parentNode.nextElementSibling != null && target.parentNode.nextElementSibling.children[0].value != "") {
                // making a dict to keep the letters
                let tempDict = {}
                // if a fifth letter is registered, only the first four letters in the row is added to the dictionary
                // together with the already known fifth value
                if (value4 != null) {
                    tempDict[4] = value4
                    for (let i = 0; i < 4; i++) {
                        tempDict[i] = target.parentNode.parentNode.children[i].children[0].value
                    }
                // if a fifth value is not saved, all the five letters in the row are added to the dict
                } else {
                    for (let i = 0; i < 5; i++) {
                        tempDict[i] = target.parentNode.parentNode.children[i].children[0].value
                    }
                }
                // the guessed word is made out of the dictionary
                guessedWord = ''
                for (let i = 0; i < 5; i++) {
                    guessedWord += tempDict[i]
                }
            // as long as the guessword length is under 5, a new letter is added
            } else if (guessedWord.length < 5) {
                // the backspace make the focus jump too long, so if the target.id is higher
                // than the guessword lenght, nothing is added
                if (guessedWord.length > parseInt(target.id)) {
                    // do nothing
                } else {
                    guessedWord += target.value.toLowerCase()
                }
            }
            // when the row is filled with five letters the validation of the letters starts
            if (guessedWord.length === 5) {
                // having a dictionary controlling the marked letters
                let marked = {}
                // looping through the letters in the guessed word
                for (let i = 0; i < guessedWord.length; i++) {
                    // checking if the letter is actually in the correct word
                    if (correctWord.includes(guessedWord[i])) {
                        // checking the number of occurences of the letter in the correct word
                        if (countOccurences(correctWord, guessedWord[i]) > 1) {
                            if (guessedWord[i] === correctWord[i]) {
                                letterDict[i] = "ac"
                            } else if (i === getPosition(correctWord, guessedWord[i], 2)){
                                letterDict[i] = "ac"
                            } else if (i === getPosition(correctWord, guessedWord[i], 3)){
                                letterDict[i] = "ac"
                            } else if (i != correctWord.indexOf(guessedWord[i]) ){
                                letterDict[i] = "cl"
                            }
                        // if the number of occurences of the letter is equal to one
                        } else {
                            if (i === correctWord.indexOf(guessedWord[i]) && !marked[guessedWord[i]]) {
                                letterDict[i] = "ac"
                                marked[guessedWord[i]] = true 
                            } else if (i != correctWord.indexOf(guessedWord[i])) {
                                if (correctWord.includes(guessedWord[i]) && !marked[guessedWord[i]]) {
                                    letterDict[i] = "cl"
                                    marked[guessedWord[i]] = true
                                } else{
                                    letterDict[i] = "w"
                                }
                            }
    
                        }
                    // if the letter is not in the word it's marked as wrong
                    } else {
                        letterDict[i] = "w"
                    }    
                }
            }
            // setting the count of letters as number of keys in the dictionary
            if (guessedWord.length === 5) {
                count = Object.keys(letterDict).length
            }
            
            // checking if the event is a press on a letter button or not
            if (!isLetter(e.key)) {
                e.preventDefault()
                return
            // jumping to the next letter box
            } else {
                let next = target.parentNode
                let row = target.parentNode.parentNode
                while (next = next.nextElementSibling) {
                    if (next.tagName.toLowerCase() === "td") {
                        next.children[0].focus()
                        break
                    }
                }
                // validating the word when reaching five letters
                if (count === 5) {
                    let parentNode = target.parentNode.parentNode
                    // using a POST-request to validate the guessed word
                    validateWord(VALIDATE_WORD_URL, guessedWord).then(setValidation).then(data => {
                        valid = data.validWord
                        // if the word is not valid, all the boxes are marked as not valid
                        if (!valid) {
                            for (let i = 0; i < 5; i++) {
                                parentNode.children[i].children[0].classList.remove("not-valid")

                                setTimeout(function() {
                                    parentNode.children[i].children[0].classList.add("not-valid")
                                }, 10)
                            }
                        // if the word is valid, the boxes are colored all-correct, correct-letter or wrong
                        } else {
                            for (let i = 0; i < 5; i++) {
                                if (letterDict[i] === "ac"){
                                    parentNode.children[i].children[0].classList.add("all-correct")
                                } else if (letterDict[i] === "cl") {
                                    parentNode.children[i].children[0].classList.add("correct-letter")
                                } else if (letterDict[i] === "w") {
                                    parentNode.children[i].children[0].classList.add("wrong")
                                }
                            }
                            // making is possible to change a entered row as long as valid
                            parentNode.classList.add("blocked")

                            // checking if the guessed word was correct
                            if (guessedWord === correctWord) {
                                // adding a celebration style to the header
                                document.querySelector("header").classList.add("celebration")
                                document.querySelector(".winning").style.display = "block"
                                for (let i = 0; i < guessedWord.length; i++) {
                                    parentNode.children[i].children[0].classList.add("winning-letter")
                                }
                                done = true
                            } 
                            // if the word was not correct, and last row reached, the player lost
                            if (guessedWord != correctWord && parentNode.id === '5') {
                                document.querySelector(".correct-word").innerHTML = `${correctWord}`
                                document.querySelector(".lost").style.display = "block"
                                done = true
                            }

                            // jumping to the next row
                            if (!next && row.parentNode.rows[row.rowIndex + 1]) {
                                setTimeout(function() {
                                    row.parentNode.rows[row.rowIndex + 1].children[0].children[0].focus()
                                    row.parentNode.rows[row.rowIndex + 1].classList.remove("blocked")
                                }, 1000)
                            } 
                        }
                    })
                }
            }
        // handling the pressing of the backspace
        } else if (myLength === 0) {
            guessedWord = guessedWord.slice(0, guessedWord.length - 1)
            let previous = target.parentNode
            /* if (previous.children[0].classList.contains("not-valid")) {
                previous.children[0].classList.remove("not-valid")
            } */
            while (previous = previous.previousElementSibling) {
                if (previous.tagName.toLowerCase() === "td") {
                    count -= 1
                    previous.children[0].focus()
                    break
                }
            }

        }
    }

    // function that validates the guessed word
    async function validateWord(url, wordGuess) {
        isLoading = true
        setLoading(isLoading)
        try {
            const response = await fetch(url, {
                method: "POST", 
                body: JSON.stringify({
                    word: wordGuess
                })
            })
            const validation = await response.json()
            return validation
        } catch (error) {
            console.error(error)
        }
    }
    
    // a helper function to validate the word
    function setValidation(validation) {
        valid = validation
        isLoading = false
        setLoading(isLoading)
        return valid
    }

    // function to get the position of the letter in a word
    function getPosition(word, letter, index) {
        return word.split(letter, index).join(letter).length
    }
    
    // counting number of occurences of a letter in a word
    const countOccurences = (word, search) => {
        return word.split(search).length - 1
    }
}

// function to test wether the user is typing a single letter
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter)
}

// hiding the intro popup and starts the game
function startClick(){
    document.querySelector(".pop-up").style.display = "none"
}

// closing the result popup
function closeWinningPopup() {
    document.querySelector(".winning").style.display = "none"
}

function closeLosingPopup() {
    document.querySelector(".lost").style.display = "none"
}

// function that handles the loading state
function setLoading(isLoading) {
    if (isLoading) {
        loadingDiv.style.display = "block"
    } else if (!isLoading) {
        loadingDiv.style.display = "none"
    }
}

init()
