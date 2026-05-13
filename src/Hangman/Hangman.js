import React, { Component } from "react";
import "./Hangman.css";
import { randomWord } from "./words";
import img0 from "./0.jpg";
import img1 from "./1.jpg";
import img2 from "./2.jpg";
import img3 from "./3.jpg";
import img4 from "./4.jpg";
import img5 from "./5.jpg";
import img6 from "./6.jpg";

class Hangman extends Component {
  static defaultProps = {
    maxWrong: 6,
    images: [img0, img1, img2, img3, img4, img5, img6]
  };

  constructor(props) {
    super(props);
    this.state = { nWrong: 0, guessed: new Set(), answer: randomWord() };
    this.handleGuess = this.handleGuess.bind(this);
    this.reset = this.reset.bind(this);
  }

  reset() {
    this.setState({ nWrong: 0, guessed: new Set(), answer: randomWord() });
  }

  guessedWord() {
    return this.state.answer
      .split("")
      .map(ltr => (this.state.guessed.has(ltr) ? ltr : "_"));
  }

  handleGuess(evt) {
    let ltr = evt.target.value;
    this.setState(st => ({
      guessed: st.guessed.add(ltr),
      nWrong: st.nWrong + (st.answer.includes(ltr) ? 0 : 1)
    }));
  }

  generateButtons() {
    return "abcdefghijklmnopqrstuvwxyz".split("").map(ltr => (
      <button
        key={ltr}
        value={ltr}
        onClick={this.handleGuess}
        disabled={this.state.guessed.has(ltr)}
      >
        {ltr}
      </button>
    ));
  }

  render() {
    const { nWrong, answer, guessed } = this.state;
    const { maxWrong, images } = this.props;
    const isWon = answer.split("").every(ltr => guessed.has(ltr));
    const isLost = nWrong >= maxWrong;

    return (
      <div className='Hangman'>
        <h1>Hangman</h1>
        <img src={images[nWrong]} alt={`Hangman with ${nWrong} wrong guesses`} />
        <p>Guessed wrong: {nWrong} / {maxWrong}</p>
        {isWon && <p className='Hangman-result win'>You won! 🎉</p>}
        {isLost && <p className='Hangman-result lose'>You lost! The word was: {answer}</p>}
        <p className='Hangman-word'>{this.guessedWord()}</p>
        <p className='Hangman-btns'>
          {isWon || isLost ? null : this.generateButtons()}
        </p>
        {(isWon || isLost) && (
          <button className='Hangman-reset' onClick={this.reset}>Play again</button>
        )}
      </div>
    );
  }
}

export default Hangman;
