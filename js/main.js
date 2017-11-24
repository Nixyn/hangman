let peliculas = ["Origen","rey","norte","trescientos","trono"];

let gameSession = {
    dataDefault: {
        lifes: 10,
        userName: "none",
        randomWord: "random",
        playedWord: ["r","a","n","d","o","m"],
        timeCount: 60,
        wonScore: 0,
        lostScore: 0
    },
    data: {
        lifes: 10,
        userName: "",
        randomWord: "",
        playedWord: [],
        timeCount: 60,
        wonScore: 0,
        lostScore: 0,
        timerID: "",
    },
    initGame: function(arr,fn){
        this.data.playedWord = [];
        this.data.randomWord = gameSession.getRandomItem(arr,this.getCleanString);
        this.initPlayedWord();
        //this.data = JSON.parse(localStorage.getItem("dataStorage")); //El localStorage es externo
        this.timer(fn);
    },
    getRandomItem: function(arr,fn){
        let index;
        if(arr.length > 1) index = parseInt(Math.random()*arr.length);
        else index = 0;
        if(typeof fn !== "undefined") return fn(arr[index]);
        return arr[index];
    },
    getCleanString: function(string){
        let specialChars = "!@#$^&%*()+=-[]\/{}|:<>?,.¬'1234567890";
        for (let i = 0; i < specialChars.length; i++) {
            string= string.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
        }   
        string = string.toLowerCase();
        string = string.replace(/á/gi,"a");
        string = string.replace(/ä/gi,"a");
        string = string.replace(/é/gi,"e");
        string = string.replace(/ë/gi,"e");
        string = string.replace(/í/gi,"i");
        string = string.replace(/ï/gi,"i");
        string = string.replace(/ó/gi,"o");
        string = string.replace(/ö/gi,"o");
        string = string.replace(/ú/gi,"u");
        string = string.replace(/ü/gi,"u");
        return string;
    },
    initPlayedWord: function(){
        let playedWord = this.data.playedWord;
        let randomWord = this.data.randomWord;
        for(i=0;i<randomWord.length;i++){
            if(randomWord[i]===" ") playedWord[i] = "-";
            else playedWord[i] = "_";
        }
    },
    getRandomWord: function() {
        let max = 9999;
        let min = 1000;
        let randomNum = parseInt(Math.random()*(max-min)+min);
        let requestStr = "http://www.omdbapi.com/?i=tt078"+randomNum+"&apikey=65c34c49";
        
        $.ajax ({
            type: "GET",
            url : requestStr,
            dataType: 'jsonp'
        }).then ((data) => {
            if(typeof data.Title === "undefined" || data.Title.indexOf("pisode")>0){
                this.getRandomWord();
            }
            else this.initGame([data.Title],refreshPlayedWord);;
            
        });
    },
    checkLetter: function(letter){
        let correct = false;
        let playedWord = this.data.playedWord;
        let randomWord = this.data.randomWord;
        
        for(i=0;i<randomWord.length;i++){
            if(randomWord[i] === letter){ 
                playedWord[i] = letter;
                correct = true;   
            }  
        }    
        if(correct === false){
            this.data.lifes -=1;
            animate(".score-box--lifes", "animated bounceIn"); //Accion Externa
        } 
        this.getState();
    },
    getHint: function(){
        let wrongsLetters = [];
        let suggestedLetter;
        let playedWord = this.data.playedWord;
        let randomWord = this.data.randomWord;
    
        for(i=0;i<randomWord.length;i++){
            if(randomWord[i]!==playedWord[i] && playedWord[i]!== "-") wrongsLetters.push(randomWord[i]);
        }
        suggestedLetter = this.getRandomItem(wrongsLetters);
        this.data.timeCount -= 10;
        this.checkLetter(suggestedLetter);
        
        return suggestedLetter;
    },
    setUserName: function(name){
        this.data.userName = name;
    },
    setFinish: function(){
        clearInterval(this.data.timerID);
        $("#container--letters-box").css("pointer-events","none"); //Acción Externa
        $("#hint").css("pointer-events","none"); //Acción Externa 
        $("#resolve").css("pointer-events","none");//Acción Externa 
        $("#textBox-resolve").prop("disabled", true); //Acción Externa 
        $("#textBox-resolve").val(""); //Acción Externa 
        this.showSolutionInPlayedWord();
    },
    setWin: function(){
        this.data.wonScore++;
        this.setFinish();
        animate(".score-box--win", "animated tada");
        $("#playedWord").css("color","#72852e");//Acción Externa 
        
    },
    setLose: function(){
        this.data.lostScore++;
        this.setFinish();
        animate(".score-box--lose", "animated tada");
        $("#playedWord").css("color","#a94e38");//Acción Externa 
    },
    getState: function(){
        let playedWord = this.data.playedWord;
        let randomWord = this.data.randomWord;
        let playedWordString = "";
        playedWordString = playedWord.join("").replace(/-/gi," ");

        if(playedWordString !== randomWord && this.data.lifes<=0 || this.data.timeCount<=0){
            this.setLose();
        } else if(playedWordString === randomWord){
            this.setWin();
        }
    },
    restartGame: function(arr,fn){
        $("#container--letters-box").css("pointer-events","auto"); //Acción Externa
        $("#hint").css("pointer-events","auto");//Acción Externa
        clearClickedClassLetterBox(); //Accion Externa
        $("#playedWord").css("color","#858585"); //Acción Externa
        $("#resolve").css("pointer-events","auto"); //Acción Externa
        $("#textBox-resolve").prop("disabled", false); //Acción Externa
        

        this.data.lifes = this.dataDefault.lifes;
        this.data.timeCount = this.dataDefault.timeCount;
        this.initGame(arr,fn); 
    },
    showSolutionInPlayedWord: function(){
        let playedWord = this.data.playedWord;
        let randomWord = this.data.randomWord;
        for(i=0;i<randomWord.length;i++){
            if(randomWord[i]===" ") playedWord[i] = "-";
            else playedWord[i] = randomWord[i];
        }
    },
    resolveWord: function(word){       
        if(word===this.data.randomWord){
            this.setWin();
        }else{
            this.data.lifes -= 2;
            animate(".score-box--lifes", "animated bounceIn"); //Acción Externa
            this.getState();
        }
        refreshPlayedWord(); //Acción Externa
    },
    timer: function(fn){
        fn();
        clearInterval(this.data.timerID);
        this.data.timerID = setInterval(()=>{
            this.data.timeCount--;
            localStorage.setItem("dataStorage",JSON.stringify(this.data));
            
            if(this.data.timeCount<=0){
                animate(".score-box--time", "animated bounceIn");
                this.setLose();
            } 
            fn();
        },1000);
    }
}

function createLetterButtons(){
    let containerLettersBox = $("#container--letters-box");
    for(i=97;i<=122;i++){
        containerLettersBox.append("<div class='letter-box'>"+String.fromCharCode(i)+"</div>");
    }
}

function forLetterBoxes(fn){
    let letterBoxes = document.querySelectorAll(".letter-box");

    for(i=0;i<letterBoxes.length;i++){
        let letterBox = letterBoxes[i];
        fn(letterBox);
    }
}

function addEventClickLetterBox(){
    forLetterBoxes(function(letterBox){
        let eventClickLetterBox = ()=>{
            let letra = letterBox.innerHTML;
        
            gameSession.checkLetter(letra);
            letterBox.className += " letter-box-clicked";
            refreshPlayedWord();
        }
        
        letterBox.addEventListener("click",eventClickLetterBox);
    });
}


function clearClickedClassLetterBox(){
    forLetterBoxes(function(letterBox){
        letterBox.classList.remove("letter-box-clicked");
    });
}

function addEventClickGetHint(){
    let btnHint = $("#hint");
    
    btnHint.on("click",()=>{
        let suggestedLetter = gameSession.getHint();
        forLetterBoxes(function(letterBox){
            if(letterBox.innerHTML==suggestedLetter) letterBox.classList.add("letter-box-clicked");
        });
        refreshPlayedWord();
    });
}

function addEventClickPlayAgain(){
    let btnPlayAgain = $("#playAgain");

    btnPlayAgain.on("click",()=>{
            gameSession.restartGame(peliculas,()=>{ 
            refreshPlayedWord();
        });
    });
}

function addEventClickResolve(){
    let btnResolve = $("#resolve");

    btnResolve.on("click",()=>{
        let inputText = $("#textBox-resolve").val();
        gameSession.resolveWord(inputText);
    });
}

function addEventKeypressTextBoxResolve(){
    let textBox = $("#textBox-resolve");

    textBox.keypress((e)=>{
        let inputText = textBox.val();
        console.log(inputText);
        if(e.which == 13) gameSession.resolveWord(inputText);;
    });
}

function addEventKeypressTextBoxResolveUserName(){
    let textBoxUser = $("#textBox-userName");

    textBoxUser.keypress((e)=>{
        let inputText = textBoxUser.val();
        if(e.which == 13){
            $("#coverPage").css("display","none");
            gameSession.setUserName(inputText);
            $("h1").css("color","black");
            gameSession.getRandomWord();
            animatePlayIn();
        } 
    });
}

function addEventClickStart(){
    let btnStart = $("#startPlay");

    btnStart.on("click",()=>{
        let inputText = $("#textBox-userName").val();
        $("#coverPage").css("display","none");
        $("h1").css("color","black");
        gameSession.setUserName(inputText);
        gameSession.getRandomWord();
        animatePlayIn();
    });
}

function refreshPlayedWord(){
    if(gameSession.data.playedWord.length>22){
        $("#playedWord").css("",30/(gameSession.data.playedWord.length-22)+"px");
    }
    $("#playedWord").html(gameSession.data.playedWord.join().replace(/,/gi," "));
    $("#userName span").html(gameSession.data.userName);
    $("#lifes").html(gameSession.data.lifes);
    $("#wonScore").html(gameSession.data.wonScore);
    $("#lostScore").html(gameSession.data.lostScore);
    $("#timeCount").html(gameSession.data.timeCount);
}


function animate(element_ID, animation) {
    $(element_ID).addClass(animation);
    let wait = window.setTimeout( function(){
    $(element_ID).removeClass(animation)}, 1300
    );
}

function animatePlayIn(){
    animate("#coverPage","animated fadeOut");
    let wait_1 = window.setTimeout( function(){
        $("#userName").show();
        $(".score-box").show();
        $("#container--letters-box").show();
        animate("#userName","animated fadeInLeft");
        animate(".score-box","animated fadeInRight");
        animate("#container--letters-box","animated fadeInUp");
        let wait_2 = window.setTimeout( function(){
            $("#container--last-buttons").show();
            $("#playedWord").show();
            animate("#container--last-buttons","animated fadeIn");
            animate("#playedWord","animated fadeIn");
        },550);
    },300);    
}


window.addEventListener("load", ()=>{
    createLetterButtons();
    addEventClickStart();
    addEventClickLetterBox();
    addEventClickGetHint();
    addEventClickPlayAgain();
    addEventClickResolve();
    addEventKeypressTextBoxResolve();
    addEventKeypressTextBoxResolveUserName();
    $("#container--last-buttons").hide();
    $("#playedWord").hide();
    $("#userName").hide();
    $(".score-box").hide();
    $("#container--letters-box").hide();

    //gameSession.initGame([getRandomWord(),"algo"],refreshPlayedWord);
});

//module.exports = gameSession;