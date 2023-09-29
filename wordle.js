const loadingDiv = document.querySelector(".info-bar")

async function init() {
    const WORD_URL = "https://words.dev-apis.com/word-of-the-day"
    const RANDOM_WORD_URL = "https://words.dev-apis.com/word-of-the-day?random=1"
    const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word"
    let isLoading = true
    let done = false

    // getting the word
    const response = await fetch(WORD_URL)
    const wordObject = await response.json()
    const correctWord = wordObject.word

    isLoading = false
    setLoading(isLoading)

    let guessedWord = ''
    let currentRow = 0
    let count = 0
    let letterDict = {}

    const startButton = document.querySelector(".start-btn")
    startButton.addEventListener("click", startClick)

    const container = document.getElementsByClassName("word-container")[0]
    container.onkeyup = function(e) {
        if (done) {
            return
        }
        if (parseInt(e.target.parentNode.parentNode.id) != currentRow || parseInt(e.target.id) === 0) {
            guessedWord = ''
            currentRow = e.target.parentNode.parentNode.id
            count = 0
            letterDict = {}
        }
        
        let target = e.srcElement || e.target
        let myLength = target.value.length
        if (myLength >= 1) {
            let value4 = ''
            if (parseInt(target.id) === 4) {
                value4 = target.value
                console.log(value4)
            }
            if (target.parentNode.nextElementSibling != null && target.parentNode.nextElementSibling.children[0].value != "") {
                let tempDict = {}
                if (value4 != null) {
                    tempDict[4] = value4
                    for (let i = 0; i < 4; i++) {
                        tempDict[i] = target.parentNode.parentNode.children[i].children[0].value
                    }
                } else {
                    for (let i = 0; i < 5; i++) {
                        tempDict[i] = target.parentNode.parentNode.children[i].children[0].value
                    }
                }
                guessedWord = ''
                for (let i = 0; i < 5; i++) {
                    guessedWord += tempDict[i]
                }
            } else if (guessedWord.length < 5) {
                guessedWord += target.value.toLowerCase()
            }
            if (guessedWord.length === 5) {
                let marked = {}
                for (let i = 0; i < guessedWord.length; i++) {
                    if (correctWord.includes(guessedWord[i])) {
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
                    } else {
                        letterDict[i] = "w"
                    }
                    
                }
            }/*  else { */
            count = Object.keys(letterDict).length
            
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
                    let parentNode = target.parentNode.parentNode
                    validateWord(VALIDATE_WORD_URL, guessedWord).then(setValidation).then(data => {
                        valid = data.validWord
                        if (!valid) {
                            for (let i = 0; i < 5; i++) {
                                parentNode.children[i].children[0].classList.add("not-valid")
                            }
                        } else {
                            for (let i = 0; i < 5; i++) {
                                if (parentNode.children[i].children[0].classList.contains("not-valid")) {
                                    parentNode.children[i].children[0].classList.remove("not-valid")
                                }
                                if (letterDict[i] === "ac"){
                                    parentNode.children[i].children[0].classList.add("all-correct")
                                } else if (letterDict[i] === "cl") {
                                    parentNode.children[i].children[0].classList.add("correct-letter")
                                } else if (letterDict[i] === "w") {
                                    parentNode.children[i].children[0].classList.add("wrong")
                                }
                            }
                            parentNode.classList.add("blocked")
                            if (guessedWord === correctWord) {
                                document.querySelector("header").classList.add("celebration")
                                document.querySelector(".winning").style.display = "block"
                                done = true
                            } 
                            if (guessedWord != correctWord && parentNode.id === '5') {
                                document.querySelector(".correct-word").innerHTML = `${correctWord}`
                                document.querySelector(".lost").style.display = "block"
                                done = true
                            }
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
    
    function setValidation(validation) {
        valid = validation
        isLoading = false
        setLoading(isLoading)
        return valid
    }

    function getPosition(word, letter, index) {
        return word.split(letter, index).join(letter).length
    }
    
    const countOccurences = (word, search) => {
        return word.split(search).length - 1
    }
}

// Function to test wether the user is typing a single letter
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter)
}

function startClick(){
    document.querySelector(".pop-up").style.display = "none"
}

function closeWinningPopup() {
    document.querySelector(".winning").style.display = "none"
}

function closeLosingPopup() {
    document.querySelector(".lost").style.display = "none"
}

function setLoading(isLoading) {
    if (isLoading) {
        loadingDiv.style.display = "block"
    } else if (!isLoading) {
        loadingDiv.style.display = "none"
    }
}

init()

