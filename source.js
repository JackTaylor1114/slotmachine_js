const SYMBOLS = ['🍉', '🌍', '💵', '💰', '💎']; //Available symbols
const SYMBOL_SCORE_MULTIPLIER = { '🍉': 1, '🌍': 1.2, '💵': 1.5, '💰': 2, '💎': 5 };
const VISIBLE_SYMBOL_COUNT = 3; //Number of rows visible per column
const COLUMNS = Array.from(document.querySelectorAll('.column'));

let TotalScore = 0; //Total score
let SpinScore = 0; //Score for the current spin

document.addEventListener("DOMContentLoaded", function () 
{
  initSlots();
});

/**
 * Initialize the slots with random symbols before the game starts 
 */
function initSlots()
{
  COLUMNS.forEach(column =>
  {
    const symbolContainer = column.querySelector('.symbols');
    symbolContainer.innerHTML = createRandomSymbols(VISIBLE_SYMBOL_COUNT);
    symbolContainer.style.transition = 'none';
    symbolContainer.style.top = '0px';
  });
}

/**
 * Sets random symbols in each column
 * @param {*} count the number of symbols per column
 * @returns the DOM content
 */
function createRandomSymbols(count)
{
  const symbols = [];
  for (let i = 0; i < count; i++)
  {
    const s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    symbols.push(`<div class="symbol">${s}</div>`);
  }
  return symbols.join('');
}

/**
 * Perform the spin on the slot machine
 */
function startSpin()
{
  //Reset score
  SpinScore = 0;
  updateSpinScoreDisplay();

  //Play spinning sound
  const audio = document.getElementById('wheelSound');
  audio.volume = 0.2;
  audio.currentTime = 0;
  audio.play();

  //Spin the symbols
  COLUMNS.forEach((column, index) =>
  {
    //Remove previous win highlights
    document.querySelectorAll('.symbol.win').forEach(el => el.classList.remove('win'));

    //Save the current symbols and generate new ones for the next spin
    const container = column.querySelector('.symbols');
    const currentSymbols = container.innerHTML;
    const newSymbols = createRandomSymbols(VISIBLE_SYMBOL_COUNT * 9);
    container.innerHTML = currentSymbols + newSymbols;
    container.style.transition = 'none';
    container.style.top = '0px';

    setTimeout(() =>
    {
      container.style.transition = 'top 0.5s ease-out';
      container.style.top = `-${80 * (VISIBLE_SYMBOL_COUNT * 7)}px`;

      //Remove the old symbols after the spin
      setTimeout(() =>
      {
        //Set new symbols
        container.innerHTML = createRandomSymbols(VISIBLE_SYMBOL_COUNT);
        container.style.transition = 'none';
        container.style.top = '0px';

        //Check wins after the last column has finished spinning
        if (index === COLUMNS.length - 1)
        {
          const matrix = getVisibleSymbolsMatrix();
          checkAndMarkWins(matrix);
        }
      }, 500);
    }, index * 300);
  });
}

/**
 * Get the currently visible symbols matrix
 * @returns a matrix of symbols
 */
function getVisibleSymbolsMatrix()
{
  //Each column is an array of symbol elements (top to bottom)
  return COLUMNS.map(column =>
  {
    const symbols = Array.from(column.querySelectorAll('.symbol')).slice(0, VISIBLE_SYMBOL_COUNT);
    return symbols;
  });
}

/**
 * Check for winning combinations of symbols
 * @param {*} matrix the currently visible symbols
 */
function checkAndMarkWins(matrix)
{
  let winLines = [];

  //Check all rows for sequences of 3 or more
  for (let row = 0; row < VISIBLE_SYMBOL_COUNT; row++)
  {
    let count = 1;
    let winningFields = [matrix[0][row]];
    let symbol = matrix[0][row].textContent;
    for (let col = 1; col < matrix.length; col++) 
    {
      if (matrix[col][row].textContent === matrix[col - 1][row].textContent)
      {
        count++;
        winningFields.push(matrix[col][row]);
      }
      else
      {
        if (count >= 3) winLines.push({ icons: [...winningFields], length: count, symbol: symbol });
        count = 1;
        winningFields = [matrix[col][row]];
        symbol = matrix[col][row].textContent;
      }
    }
    if (count >= 3) winLines.push({ icons: [...winningFields], length: count, symbol: symbol });
  }

  //Check columns for sequences of 3 or more
  for (let col = 0; col < matrix.length; col++)
  {
    let count = 1;
    let winningFields = [matrix[col][0]];
    let symbol = matrix[col][0].textContent;
    for (let row = 1; row < VISIBLE_SYMBOL_COUNT; row++)
    {
      if (matrix[col][row].textContent === matrix[col][row - 1].textContent)
      {
        count++;
        winningFields.push(matrix[col][row]);
      }
      else
      {
        if (count >= 3) winLines.push({ icons: [...winningFields], length: count, symbol: symbol });
        count = 1;
        winningFields = [matrix[col][row]];
        symbol = matrix[col][row].textContent;
      }
    }
    if (count >= 3) winLines.push({ icons: [...winningFields], length: count, symbol: symbol });
  }

  //Check diagonals of length 3 (left-to-right and right-to-left)
  for (let startCol = 0; startCol <= matrix.length - 3; startCol++)
  {
    //Left-to-right diagonal
    let diag1 = [matrix[startCol][0], matrix[startCol + 1][1], matrix[startCol + 2][2]];
    let symbol1 = diag1[0].textContent;
    if (diag1.every(icon => icon.textContent === symbol1)) winLines.push({ icons: diag1, length: 3, symbol: symbol1 });

    //Right-to-left diagonal
    let diag2 = [matrix[startCol + 2][0], matrix[startCol + 1][1], matrix[startCol][2]];
    let symbol2 = diag2[0].textContent;
    if (diag2.every(icon => icon.textContent === symbol2)) winLines.push({ icons: diag2, length: 3, symbol: symbol2 });
  }

  //Calculate the score for the current spin
  for (let i = 0; i < winLines.length; i++) 
  {
    let score = 0;
    if (winLines[i].length === 3) score = 100;
    else if (winLines[i].length === 4) score = 200;
    else if (winLines[i].length >= 5) score = 300;
    let multiplier = SYMBOL_SCORE_MULTIPLIER[winLines[i].symbol] || 1;
    score = score * multiplier;
    winLines[i].score = score;
  }

  //Sequentially mark wins
  function markWin(index)
  {
    if (index < winLines.length)
    {
      //Update spin score and total score
      SpinScore += winLines[index].score;
      updateSpinScoreDisplay();
      TotalScore += winLines[index].score;
      updateScoreDisplay();

      //Remove previous win highlights
      document.querySelectorAll('.symbol.win').forEach(el => el.classList.remove('win'));
      //Add win highlights and play winning sound
      winLines[index].icons.forEach(icon => icon.classList.add('win'));
      const winAudio = document.getElementById('winSound');
      winAudio.currentTime = 0;
      winAudio.play();
      setTimeout(() => markWin(index + 1), 600);
    }
    else 
    {
      //Play special sound when current spin sctore is high enough
      if (SpinScore >= 1000)
      {
        const winAudio = document.getElementById('bigSpinL2Sound');
        winAudio.currentTime = 0;
        winAudio.play();
      }
      else if (SpinScore >= 500)
      {
        const winAudio = document.getElementById('bigSpinL1Sound');
        winAudio.currentTime = 0;
        winAudio.play();
      }
    }
  }

  //Start marking wins if there are any
  if (winLines.length > 0) markWin(0);
}

/**
 * Update the total score
 */
function updateScoreDisplay() 
{
  const scoreDiv = document.getElementById('totalScore');
  scoreDiv.textContent = TotalScore;
}

/**
 * Update the score of the current spin
 */
function updateSpinScoreDisplay() 
{
  const spinScoreDiv = document.getElementById('spinScore');
  spinScoreDiv.textContent = SpinScore;
}