let allPokemons = [];
let allTypes = [];
let pokemonSpecies = [];
let currentBaseStats = [];
let pokemonEvolutionChains = [];
let currentPokemonEvolutionChain = [];
let demageRelationsCollections = [];
let weaknesses = [];
let widthsOfProgressBars = [];
let isLoading = false;
let amoutToLoadRender;
let lastEndLoadRenderIndex = 0;
let modalCardIsOpen = false;
let selectedPokemon;
let selectedPokemonIndex;
let selectedType;
let selectedTabName = 'about';
let widthsOfPogresBarsAlreadySet = false;
let lastScaled;
let scrollPosition = 0;
let changeArrowStyleIntervall;
let changePokoemonImgSizeIntervall;
let changePokemonInterval;
let setValueAndWidthIntevall_1;
let setValueAndWidthIntevall_2;
let highlightAndEnlarge_evo_pokemonImg_intervall;

const APP_AFTER_START_LOADING = document.getElementById('appAfterStartLoading');

/**
 * The initial function which loads all pokemon types, loads and render start amount of pokemons,
 * hides the start loading screen and shows the pokemon card collection.
 */
async function init() {
  amoutToLoadRender = calcStartAmoutToLoad();
  let newEndLoadRenderIndex = lastEndLoadRenderIndex + amoutToLoadRender;
  await loadTypes();
  await loadRenderTillEndIndexPlusTen(newEndLoadRenderIndex);
}

/**
 * Hides the start loading screen and shows the start app content.
 */
async function addClassesAfterLoadingRendering() {
  getElem('loadingScreen').classList.add('translateLoadingScreen');
  APP_AFTER_START_LOADING.classList.add('opacity1');
}

/**
 * Switches the visibility of the whole searchbar clicking on the lupe button.
 */
function toggleSearchbar() {
  getElem('searchbar').classList.toggle('hide');
  getElem('lupe').classList.toggle('lupeImgActive');
}

/**
 * Enlarges the pokemon image of the collection card, when the mouse hovered over it.
 * @param {HTMLElement} element - The HTML element that should be enlarged.
 */
function scaleUpPokemonImg(element) {
  element.classList.add('pokemonImgScaled');
  lastScaled = element;
}

/**
 * Reduces the current enlarged pokemon image of the collection card, when the mouse leaved its area.
 */
function scaleDownPokemonImg() {
  lastScaled.classList.remove('pokemonImgScaled');
}

/**
 * Opens the modal card for the selected pokemon from the card collection.
 * @param {number} index - The index of the selected pokemon in the array of all pokemons.
 */
async function openModal(index) {
  modalCardIsOpen = true;
  selectedPokemonIndex = index;
  toggleVisibilitySearchBarLupeAndScrollArrow();
  hideModelCard();
  genLoader('modalCardTopBottom', 'modalCardLoader');
  await setModalCard();
  removeLoader('modalCardTopBottom', 'modalCardLoader');
  add_Fade_In_EffectToModalCard();
  disableScrolling();
}

/**
 * Toggles the visibility of the search bar and the scroll up arrow.
 */
function toggleVisibilitySearchBarLupeAndScrollArrow() {
  getElem('searchbarContainer').classList.toggle('dn');
  getElem('scrollUpArrow').classList.toggle('dn');
}

/**
 * Adds a fade in effect to the modal card while opening.
 */
function add_Fade_In_EffectToModalCard() {
  getElem('modal').classList.remove('dn');
  getElem('modalCard').classList.remove('fadeOutFrame');
  getElem('modalCardBgTopBottom').classList.remove('fadeOutContent');
  getElem('modalCard').classList.add('fadeInFrame');
  getElem('modalCardBgTopBottom').classList.add('fadeInContent');
}

/**
 * Disables the scrolling of the background behind the opened modal card (pokemon card collection).
 */
function disableScrolling() {
  scrollPosition = window.pageYOffset;
  const BODY = document.getElementsByTagName('BODY')[0];
  BODY.style.overflow = 'hidden';
  BODY.style.position = 'fixed';
  BODY.style.top = `-${scrollPosition}px`;
  BODY.style.width = '100%';
}

/**
 * Closes the modal card.
 */
function closeModal() {
  modalCardIsOpen = false;
  if (getElem('modalCardLoader')) {
    removeLoader('modalCardTopBottom', 'modalCardLoader');
  }
  add_Fade_Out_EffectToModalCard();
  changeTab('about');
  toggleVisibilitySearchBarLupeAndScrollArrow();
  widthsOfPogresBarsAlreadySet = false;
  widthsOfProgressBars = [];
  lastScaled.classList.remove('pokemonImgScaled');
  enableScrolling();
}

/**
 * Adds a fade out effect to the modal card while closing.
 */
function add_Fade_Out_EffectToModalCard() {
  getElem('modalCard').classList.remove('fadeInFrame');
  getElem('modalCardBgTopBottom').classList.remove('fadeInContent');
  getElem('modalCard').classList.add('fadeOutFrame');
  getElem('modalCardBgTopBottom').classList.add('fadeOutContent');
  setTimeout(() => {
    getElem('modal').classList.add('dn');
  }, 310);
}

/**
 * Switches to the tab in the modal card bottom, which should be showed.
 * @param {string} tabName - The name of the tab to switch to.
 */
function changeTab(tabName) {
  if (tabName != selectedTabName) {
    getElem(selectedTabName + 'Tab').classList.remove('active');
    getElem(selectedTabName).classList.add('dn');
    getElem(tabName + 'Tab').classList.add('active');
    getElem(tabName).classList.remove('dn');
    selectedTabName = tabName;
    setWidthsOfProgressBars();
  }
}

/**
 * Enables the scrolling of the pokemon card collection after closing the modal card.
 */
function enableScrolling() {
  const BODY = document.getElementsByTagName('BODY')[0];
  BODY.style.removeProperty('overflow');
  BODY.style.removeProperty('position');
  BODY.style.removeProperty('top');
  BODY.style.removeProperty('width');
  window.scrollTo(0, scrollPosition);
}

/**
 * Closes the modal, if the pressed key is the escape key.
 * Changes the pokemon in the opened modal card, if the pressed key is the left or right arrow key.
 * @param {event} - The given event object after pressing any key on the keyboard.
 */
function closeModalOrChangePekomenOnKeyDown(event) {
  let pressedKey = event.key;
  if (pressedKey == 'Escape') {
    closeModal();
  }
  if (pressedKey == 'ArrowLeft') {
    changePokemon(-1);
    highlightAndEnlarge_Arrow(mCTArrowLeft);
  }
  if (pressedKey == 'ArrowRight') {
    changePokemon(+1);
    highlightAndEnlarge_Arrow(mCTArrowRight);
  }
}

/**
 * Scrolls the app to the top.
 */
function scrollToStart() {
  APP_AFTER_START_LOADING.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
}

/* Adds a scroll event listener to the APP_AFTER_START_LOADING constant (HTMLelement with the id of 'appAfterStartLoading')
and the fuction 'checkIfLoadARenderfterScroll' as its event handler.*/
APP_AFTER_START_LOADING.addEventListener('scroll', checkIfLoadARenderfterScroll);

/**
 * Removes the scroll event listener from the appAfterStartLoading HTMLelement.
 */
function removeScrollEventHandler() {
  APP_AFTER_START_LOADING.removeEventListener('scroll', checkIfLoadARenderfterScroll);
}

/**
 * Checks if the user has scrolled to the bottom of the page. If he has, it will load more pokemon collection cards.
 */
async function checkIfLoadARenderfterScroll() {
  let percentageScrolledAmount = calcPercentageScrolledAmount();
  if (percentageScrolledAmount >= 0.99 && isLoading == false) {
    let newEndLoadRenderIndex = lastEndLoadRenderIndex + amoutToLoadRender;
    loadRenderTillEndIndexPlusTen(newEndLoadRenderIndex);
  }
}

/**
 * Calculates the percentage of the page that has been scrolled.
 */
function calcPercentageScrolledAmount() {
  // Further loading should start three pokemon collection rows (three pokemon card heights plus their margin) earlier. 762px corresponds to this distance.
  let a = APP_AFTER_START_LOADING.scrollTop + 762;
  let b = APP_AFTER_START_LOADING.scrollHeight - APP_AFTER_START_LOADING.clientHeight;
  let c = a / b;
  return c;
}
