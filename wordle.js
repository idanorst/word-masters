async function getWord(url) {
    const response = await fetch(url, {method: "GET"})
    const wordObject = await response.json()
    const word = wordObject.word
    return word
}

async function validateWord(url, wordGuess) {
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

function setValidation(validation) {
    valid = validation
    return valid
}

function getPosition(word, letter, index) {
    return word.split(letter, index).join(letter).length
}

const countOccurences = (word, search) => {
    return word.split(search).length - 1
}

// Function to test wether the user is typing a single letter
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter)
}

function startClick(){
    console.log("clicked")
    document.querySelector(".pop-up").style.display = "none"
}

function init() {
    const WORD_URL = "https://words.dev-apis.com/word-of-the-day"
    const RANDOM_WORD_URL = "https://words.dev-apis.com/word-of-the-day?random=1"
    const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word"


    let valid = true

    let correctWord = ''
    
    getWord(RANDOM_WORD_URL).then(x => {
        correctWord = x
        console.log(correctWord)
    })

    let guessedWord = ''
    let currentRow = 0
    let count = 0
    let letterDict = {}

    const startButton = document.querySelector(".start-btn")
    startButton.addEventListener("click", startClick)

    const container = document.getElementsByClassName("word-container")[0]
    container.onkeyup = function(e) {
        if (parseInt(e.target.parentNode.parentNode.id) != currentRow || parseInt(e.target.id) === 0) {
            guessedWord = ''
            currentRow = e.target.parentNode.parentNode.id
            count = 0
            letterDict = {}
        }
        let target = e.srcElement || e.target
        let myLength = target.value.length
        if (myLength >= 1) {
            guessedWord += e.target.value.toLowerCase()
            if (correctWord.includes(e.target.value)){
                if (countOccurences(correctWord, e.target.value) > 1) {
                    if (parseInt(e.target.id) === correctWord.indexOf(e.target.value)) {
                        letterDict[e.target.id] = "ac"
                    } else if (parseInt(e.target.id) === getPosition(correctWord, e.target.value, 2)){
                        letterDict[e.target.id] = "ac"
                    } else if (parseInt(e.target.id) != correctWord.indexOf(e.target.value) ){
                        letterDict[e.target.id] = "cl"
                    }
                } else {
                    if (parseInt(e.target.id) === correctWord.indexOf(e.target.value)) {
                        console.log("ac")
                        letterDict[e.target.id] = "ac"
                    } else if (parseInt(e.target.id) != correctWord.indexOf(e.target.value)) {
                        if (guessedWord.includes(e.target.value) && countOccurences(guessedWord, e.target.value) > 1) {
                            letterDict[e.target.id] = "w"
                        } else {
                            letterDict[e.target.id] = "cl"
                        }
                    }
                }
                
            } else {
                letterDict[e.target.id] = "w"
            }
            count += 1
            if (!isLetter(e.key)) {
                e.preventDefault()
                return
            } else {
                let next = target.parentNode
                let row = target.parentNode.parentNode
                while (next = next.nextElementSibling) {
                    if (next.tagName.toLowerCase() === "td") {
                        next.children[0].focus()
                        break
                    }
                }
                if (count === 5) {
                    let parentNode = e.target.parentNode.parentNode
                    validateWord(VALIDATE_WORD_URL, guessedWord).then(setValidation).then(data => {
                        valid = data.validWord
                        if (!valid) {
                            for (let i = 0; i < 5; i++) {
                                parentNode.children[i].children[0].classList.add("not-valid")
                            }
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
                            if (guessedWord === correctWord) {
                                document.querySelector("header").classList.add("celebration")
                                document.querySelector(".winning").style.display = "block"
                                document.querySelector(".guess-board").classList.add("blocked")
                            } 
                            if (guessedWord != correctWord && parentNode.id === '5') {
                                document.querySelector(".correct-word").innerHTML = `${correctWord}`
                                document.querySelector(".lost").style.display = "block"
                                document.querySelector(".guess-board").classList.add("blocked")
                            }
                            if (!next && row.parentNode.rows[row.rowIndex + 1]) {
                                setTimeout(function() {
                                    row.parentNode.rows[row.rowIndex + 1].children[0].children[0].focus()
                                    row.parentNode.rows[row.rowIndex + 1].classList.remove("blocked")
                                }, 1000)
                                /* row.parentNode.rows[row.rowIndex + 1].children[0].children[0].focus()
                                row.parentNode.rows[row.rowIndex + 1].classList.remove("blocked") */
                            } 
                        }
                    })
                   /*  if (guessedWord === correctWord) {
                        alert("Correct! You won!")
                        document.querySelector("header").classList.add("celebration")
                        document.querySelector(".guess-board").classList.add("blocked")
                    } 
                    if (guessedWord != correctWord && parentNode.id === '5') {
                        alert(`Sorry, you lost! The correct word was ${correctWord}.`)
                        document.querySelector(".guess-board").classList.add("blocked")
                    } */
                }
                /* if (!next && row.parentNode.rows[row.rowIndex + 1]) {
                    setTimeout(function() {
                        row.parentNode.rows[row.rowIndex + 1].children[0].children[0].focus()
                        row.parentNode.rows[row.rowIndex + 1].classList.remove("blocked")
                    }, 1000)
                    /* row.parentNode.rows[row.rowIndex + 1].children[0].children[0].focus()
                    row.parentNode.rows[row.rowIndex + 1].classList.remove("blocked")
                } */
            }
        } else if (myLength === 0) {
            guessedWord = guessedWord.slice(0, guessedWord.length - 1)
            let previous = target.parentNode
            if (previous.children[0].classList.contains("not-valid")) {
                previous.children[0].classList.remove("not-valid")
            }
            while (previous = previous.previousElementSibling) {
                if (previous.tagName.toLowerCase() === "td") {
                    count -= 1
                    previous.children[0].focus()
                    break
                }
            }

        }
    }
}

init()

