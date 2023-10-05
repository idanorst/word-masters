const loadingDiv = document.querySelector(".info-bar")
const letterArray = document.querySelectorAll(".letter-box")
const ANSWER_LENGTH = 5
const ROUNDS = 6
const WORD_URL = "https://words.dev-apis.com/word-of-the-day"
const RANDOM_WORD_URL = "https://words.dev-apis.com/word-of-the-day?random=1"
const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word"


async function init() {
    const startButton = document.querySelector(".start-btn")
    startButton.addEventListener("click", startClick)

    let guessedWord = ''
    let currentRow = 0
    let done = false
    let isLoading = true
    setLoading(isLoading)

    // getting the word
    const response = await fetch(WORD_URL)
    const wordObject = await response.json()
    const correctWord = wordObject.word

    isLoading = false
    setLoading(isLoading)

    async function commitAnswer() {
        if (guessedWord.length < ANSWER_LENGTH) {
            // do nothing
            return
        }

        // validate the committed word
        isLoading = true
        setLoading(isLoading)

        const res = await fetch(VALIDATE_WORD_URL, {
            method: "POST",
            body: JSON.stringify({word: guessedWord})
        })
        const wordObject = await res.json()
        const valid = wordObject.validWord 

        isLoading = false 
        setLoading(isLoading)

        if (!valid) {
            for (let i = 0; i < guessedWord.length; i++) {
                letterArray[currentRow * ANSWER_LENGTH + i].classList.remove("not-valid")

                setTimeout(function() {
                    letterArray[currentRow * ANSWER_LENGTH + i].classList.add("not-valid")
                }, 100)
            }
        } else {
            let wordMap = makeWordMap(guessedWord)

        // checking and marking all correct letters
        for (let i = 0 ; i < guessedWord.length; i++) {
            if (guessedWord[i] === correctWord[i]) {
                letterArray[currentRow * ANSWER_LENGTH + i].classList.add("all-correct")
                wordMap[guessedWord[i]]--
            }
        }

        // checking and marking correct and wrong letters
        for (let i = 0 ; i < guessedWord.length; i++) {
            if (guessedWord[i] === correctWord[i]) {
                // do nothing
            } else if (correctWord.includes(guessedWord[i]) && wordMap[guessedWord[i]] > 0) {
                letterArray[currentRow * ANSWER_LENGTH + i].classList.add("correct-letter")
                wordMap[guessedWord[i]]--
            } else {
                letterArray[currentRow * ANSWER_LENGTH + i].classList.add("wrong")
            }

        }

        currentRow++

        if (guessedWord === correctWord) {
            document.querySelector(".winning").style.display = "block"
            document.querySelector(".header").classList.add("celebration")
            done = true
        } 

        if (currentRow === 6) {
            document.querySelector(".lost").style.display = "block"
            document.querySelector(".correct-word").innerText = correctWord
            done = true
        }

        guessedWord = ''
        }
    }
    
    function addLetter(letter) {
        if (guessedWord.length < ANSWER_LENGTH) {
            guessedWord += letter
            letterArray[currentRow * ANSWER_LENGTH + guessedWord.length - 1].innerText = letter
        }
        
    }

    function backspace() {
        guessedWord = guessedWord.slice(0, guessedWord.length - 1)
        letterArray[currentRow * ANSWER_LENGTH + guessedWord.length].innerText = ''
    }
    
    document.addEventListener("keyup", (event) =>  {
        if (done || isLoading) {
            // do nothing
            return
        }
        
        let target = event.key
        if (target === "Enter") {
            console.log("enter")
            commitAnswer()
        } else if (target === "Backspace") {
            backspace()
        } else {
            if (isLetter(target)) {
                addLetter(target)
            }
        }
    })
        
}

function startClick(){
    document.querySelector(".pop-up").style.display = "none"
}

// Function to test wether the user is typing a single letter
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter)
}

function makeWordMap(word) {
    let map = {}
    for (let i = 0; i < word.length; i++) {
        if (map[word[i]]) {
            map[word[i]]++
        } else {
            map[word[i]] = 1
        }
    }
    return map
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

