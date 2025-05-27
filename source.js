const ICONS = ['🍋', '🍒', '🔔', '🍊', '🍇', '💎'];
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
        container.innerHTML = createRandomIcons(VISIBLE_ICON_COUNT);
        container.style.transition = 'none';
        container.style.top = '0px';
      }, 500);
    }, index * 300);
  });
}