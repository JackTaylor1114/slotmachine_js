const ICONS = ['🍋', '🍒', '🔔', '🍇', '💎'];
const VISIBLE_ICON_COUNT = 3;
const COLUMNS = Array.from(document.querySelectorAll('.column'));

document.addEventListener("DOMContentLoaded", function () 
{
  initSlots();
});

/**
 * Initialize the slots with random icons before start 
 */
function initSlots()
{
  COLUMNS.forEach(column =>
  {
    const iconContainer = column.querySelector('.icons');
    iconContainer.innerHTML = createRandomIcons(VISIBLE_ICON_COUNT);
    iconContainer.style.transition = 'none';
    iconContainer.style.top = '0px';
  });
}

/**
 * Sets random icons in each column
 * @param {*} count the number of icons per column
 * @returns the DOM content
 */
function createRandomIcons(count)
{
  const icons = [];
  for (let i = 0; i < count; i++)
  {
    const s = ICONS[Math.floor(Math.random() * ICONS.length)];
    icons.push(`<div class="icon">${s}</div>`);
  }
  return icons.join('');
}

/**
 * Perform the spin on the slot machine
 */
function startSpin()
{
  // Play spinning sound
  const audio = document.getElementById('wheelSound');
  audio.volume = 0.2;
  audio.currentTime = 0;
  audio.play();

  //Spin the icons
  COLUMNS.forEach((column, index) =>
  {
    //Remove previous win highlights
    document.querySelectorAll('.icon.win').forEach(el => el.classList.remove('win'));

    //Save the current icons and generate new ones for the next spin
    const container = column.querySelector('.icons');
    const currentIcons = container.innerHTML;
    const newIcons = createRandomIcons(VISIBLE_ICON_COUNT * 9);
    container.innerHTML = currentIcons + newIcons;
    container.style.transition = 'none';
    container.style.top = '0px';

    setTimeout(() =>
    {
      container.style.transition = 'top 0.5s ease-out';
      container.style.top = `-${80 * (VISIBLE_ICON_COUNT * 7)}px`;

      //Remove the old icons after the spin
      setTimeout(() =>
      {
        //Set new icons
        container.innerHTML = createRandomIcons(VISIBLE_ICON_COUNT);
        container.style.transition = 'none';
        container.style.top = '0px';

        //Check wins after the last column has finished spinning
        if (index === COLUMNS.length - 1)
        {
          const matrix = getVisibleIconsMatrix();
          checkAndMarkWins(matrix);
        }
      }, 500);
    }, index * 300);
  });
}

/**
 * Get the currently visible icons matrix
 * @returns a matrix of icons
 */
function getVisibleIconsMatrix()
{
  //Each column is an array of icon elements (top to bottom)
  return COLUMNS.map(column =>
  {
    const icons = Array.from(column.querySelectorAll('.icon')).slice(0, VISIBLE_ICON_COUNT);
    return icons;
  });
}

/**
 * Check for winning combinations of icons
 * @param {*} matrix the currently visible icons
 */
function checkAndMarkWins(matrix)
{
  let winLines = [];

  //Check all rows for sequences of 3 or more
  for (let row = 0; row < VISIBLE_ICON_COUNT; row++)
  {
    let count = 1;
    let icons = [matrix[0][row]];
    for (let col = 1; col < matrix.length; col++) 
    {
      if (matrix[col][row].textContent === matrix[col - 1][row].textContent)
      {
        count++;
        icons.push(matrix[col][row]);
      }
      else
      {
        if (count >= 3) winLines.push([...icons]);
        count = 1;
        icons = [matrix[col][row]];
      }
    }
    if (count >= 3) winLines.push([...icons]);
  }

  //Check columns for sequences of 3 or more
  for (let col = 0; col < matrix.length; col++)
  {
    let count = 1;
    let icons = [matrix[col][0]];
    for (let row = 1; row < VISIBLE_ICON_COUNT; row++)
    {
      if (matrix[col][row].textContent === matrix[col][row - 1].textContent)
      {
        count++;
        icons.push(matrix[col][row]);
      }
      else
      {
        if (count >= 3) winLines.push([...icons]);
        count = 1;
        icons = [matrix[col][row]];
      }
    }
    if (count >= 3) winLines.push([...icons]);
  }

  //Check diagonals of length 3 or more (left-to-right and right-to-left)
  //For 5 columns and 3 rows, possible diagonals are only of length 3
  for (let startCol = 0; startCol <= matrix.length - 3; startCol++)
  {
    //Left-to-right diagonal
    let diag1 = [matrix[startCol][0], matrix[startCol + 1][1], matrix[startCol + 2][2]];
    if (diag1.every(icon => icon.textContent === diag1[0].textContent)) winLines.push(diag1);

    //Right-to-left diagonal
    let diag2 = [matrix[startCol + 2][0], matrix[startCol + 1][1], matrix[startCol][2]];
    if (diag2.every(icon => icon.textContent === diag2[0].textContent)) winLines.push(diag2);
  }

  //Sequentially mark wins
  function markWin(index)
  {
    if (index < winLines.length)
    {
      //Remove previous win highlights
      document.querySelectorAll('.icon.win').forEach(el => el.classList.remove('win'));
      
      //Add win highlights and play winning sound
      winLines[index].forEach(icon => icon.classList.add('win'));
      const winAudio = document.getElementById('winSound');
      winAudio.currentTime = 0;
      winAudio.play();
      setTimeout(() => markWin(index + 1), 600);
    }
  }

  //Start marking wins if there are any
  if (winLines.length > 0) markWin(0);
}