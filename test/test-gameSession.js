let gameSession = require("../js/main.js");

let assert = require('assert');
describe('Juego del Ahorcado', function() {
  describe('#checkLetter()', function() {
    it('"l" in "gol" should return ["_","_","l"]', function() {
      gameSession.data.randomWord = "gol";
      gameSession.data.playedWord = ["_","_","_"];
      gameSession.checkLetter("l");
      assert.deepEqual(["_","_","l"], gameSession.data.playedWord);
    });
    it('"l" in "llaves" should return ["l","l","_","_","_","_"]', function() {
      gameSession.data.randomWord = "llaves";
      gameSession.data.playedWord = ["_","_","_","_","_","_"];
      gameSession.checkLetter("l");
      assert.deepEqual(["l","l","_","_","_","_"], gameSession.data.playedWord);
    });
  });
});