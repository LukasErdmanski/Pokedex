//#region ============================== LOADING RENDERING FUNCTIONS ==============================
/**
 * Calculates the amount of cards to load initially on the page based on the size of the screen.
 * @returns  {number} The number of cards to load.
 */
function calcStartAmoutToLoad() {
  let displayArea = window.innerHeight * window.innerWidth;
  let collectionCardArea = 230 * 230;
  let result = displayArea / collectionCardArea;
  if (result <= 15) {
    return 15;
  } else {
    return result * 1.2;
  }
}

/**
 * Loads all the types from the API and stores them in the allTypes array.
 */
async function loadTypes() {
  let promises = [];
  for (let i = 0; i < 18; i++) {
    let loadId = i + 1;
    let urlType = `https://pokeapi.co/api/v2/type/` + loadId;
    let typeObject = await fetchUrlConvertToAndReturnAsJSON(urlType);
    promises.push(typeObject);
  }
  allTypes = await Promise.all(promises);
}

/**
 * Loads and renders the next 10 cards in the collection.
 * @param {number} newEndLoadRenderIndex  - The new end index of the render loop.
 */
async function loadRenderTillEndIndexPlusTen(newEndLoadRenderIndex) {
  lastEndLoadRenderIndex = newEndLoadRenderIndex;
  if (!isLoading) {
    isLoading = true;
    genLoader('appAfterStartLoading', 'collectionLoader');
    await loadRenderLoop();
    if (getElem('modalCardLoader')) {
      removeLoader('modalCardTopBottom', 'modalCardLoader');
    }
    removeLoader('appAfterStartLoading', 'collectionLoader');
    isLoading = false;
  }
}

/**
 * Creates a new loader HTMLElement and appends it to a parent element defined by id.
 * @param {string} parentElementId - The id of the parent element that the loader will be appended to.
 * @param {string} loaderId - This is the id of the loader.
 */
function genLoader(parentElementId, loaderId) {
  if (parentElementId == 'modalCardTopBottom') {
    hideModelCard();
    setMCTNumber();
  }
  const NEW_LOADER_ELEMENT = document.createElement('div');
  NEW_LOADER_ELEMENT.innerHTML = createLoader(loaderId).trim();
  getElem(parentElementId).appendChild(NEW_LOADER_ELEMENT.firstElementChild);
}

/**
 * Returns the element with the id that is passed to it.
 * @param {string} id - The id of the element you want to get.
 * @returns {HTMLElement} The HTMLElement with the defined id.
 */
function getElem(id) {
  return document.getElementById(id);
}

/**
 * Hides the model card.
 */
function hideModelCard() {
  getElem('mCTTypeImgsContainer').classList.add('dn');
  getElem('mCTNameLine').classList.add('dn');
  getElem('mCTArrowsPokoemonImg').classList.add('dn');
  getElem('modalCardBottom').classList.add('dn');
}

/**
 * Sets the id number of the selected pokemon in the left top of the modal card.
 */
function setMCTNumber() {
  getElem('mCTNumber').innerHTML = `#${selectedPokemonIndex + 1}`;
}

/**
 * Returns a string of HTML containing a loader with the defined id.
 * @param {string} loaderId - The id of the loader.
 * @returns A string of HTML.
 */
function createLoader(loaderId) {
  return /* html */ `
      <div id="${loaderId}" class="loader">
        <div class="loaderContent">
          <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
          <img src="img/loading.gif">
        </div>
      </div>
     `;
}

/**
 * Removes the loader and shows the modal card if applicable.
 * @param {string} parentElementId - The id of the parent element of the loader.
 * @param {string} loaderId - The id of the loader element.
 */
async function removeLoader(parentElementId, loaderId) {
  getElem(loaderId).remove();
  if (parentElementId == 'modalCardTopBottom') {
    // If yes, the model card of the selected pokemon will be showed after the loader has been removed.
    showModelCard();
  }
}

/**
 * Shows the content of the selected pokemon in the modal card after the loader has been removed.
 */
function showModelCard() {
  getElem('mCTTypeImgsContainer').classList.remove('dn');
  getElem('mCTNameLine').classList.remove('dn');
  getElem('mCTArrowsPokoemonImg').classList.remove('dn');
  getElem('modalCardBottom').classList.remove('dn');
}

/**
 * Loads and renders pokemons to the end of the loop, and if the selected pokemon is present in the current loop,
 * it renders the modal card.
 */
async function loadRenderLoop() {
  let newStartLoadRenderIndex = allPokemons.length + 1;
  for (let loadId = newStartLoadRenderIndex; loadId < lastEndLoadRenderIndex + 10 && loadId <= 905; loadId++) {
    {
      if (loadId == 905) {
        // If the last pokemon loaded, remove the scoll event listener (checking if next pokemons should be loaded).
        removeScrollEventHandler();
      }
      let pokemon = await loadPokemon(loadId);
      renderCollectionCard(pokemon, loadId - 1);
      // Check if the selected pokemon in the modal card is present (already loaded and rendered) and corresponds to the current loadId.
      if (allPokemons[selectedPokemonIndex] && selectedPokemonIndex == loadId - 1) {
        await setModalCard();
      }
    }
  }
}

/**
 * Loads a pokemon, its species and its evolution chain.
 * @param {number } loadId - The id of the pokemon you want to load.
 * @returns {JSON} The pokemon object.
 */
async function loadPokemon(loadId) {
  let urlPokemonId = `https://pokeapi.co/api/v2/pokemon/${loadId}`;
  let pokemon = await fetchUrlConvertToAndReturnAsJSON(urlPokemonId);
  allPokemons.push(pokemon);
  let urlPokemonSpeciesId = `https://pokeapi.co/api/v2/pokemon-species/${loadId}`;
  let pokemonSpeciesSet = await fetchUrlConvertToAndReturnAsJSON(urlPokemonSpeciesId);
  pokemonSpecies.push(pokemonSpeciesSet);
  if (pokemonSpeciesSet.evolution_chain != null) {
    let urlEvolutionChain = await pokemonSpeciesSet.evolution_chain.url;
    await loadEvolutionChain(urlEvolutionChain);
  } else {
    pokemonEvolutionChains.push('');
  }
  return pokemon;
}

/**
 * Fetches the url, converts the response to JSON, and returns the JSON.
 * @param {string} url - The URL to fetch.
 * @returns {JSON} A Promise that resolves to the JSON object.
 */
async function fetchUrlConvertToAndReturnAsJSON(url) {
  let response = await fetch(url).catch(errorFetchFctn);
  let responseAsJSON = await response.json();
  return responseAsJSON;
}

/**
 * Displays an alert message to the user, if the fetch request fails.
 */
function errorFetchFctn() {
  let errorMsg =
    'Sorry! Unfortunately, the Pokemon API could not be connected. Some of the Pokemon properties could therefore not be loaded. Try again later.';
  alert(errorMsg);
}

/**
 * Loads the evolution chain of a current loaded pokemon and pushes it into an array of evolution chains.
 * @param {string} urlEvolutionChain - The URL of the evolution chain API of the current loaded pokemon.
 */
async function loadEvolutionChain(urlEvolutionChain) {
  // Load the evolution chain for the current loaded pokemon.
  let currentPokemonEvolutionChain = [];
  let evoChainAsJSON = await fetchUrlConvertToAndReturnAsJSON(urlEvolutionChain);
  // Load the first pokemon in the current evolution chain array.*/
  let first_pokemonInEvoChain = await load_first_pokemonInEvoChain(evoChainAsJSON);
  currentPokemonEvolutionChain.push(first_pokemonInEvoChain);
  if (evoChainAsJSON.chain.evolves_to.length >= 1) {
    /* If the evolution path for the second pokemon exists in the evolution chain JSON, 
      load the second pokemon in the current evolution chain array.*/
    let second_pokemonInEvoChain = await load_second_pokemonInEvoChain(evoChainAsJSON);
    currentPokemonEvolutionChain.push(second_pokemonInEvoChain);
  }
  if (evoChainAsJSON.chain.evolves_to.length == 1 && evoChainAsJSON.chain.evolves_to[0].evolves_to.length == 1) {
    /* If the evolution path for the third pokemon exists in the evolution chain JSON, 
      load the third pokemon in the current evolution chain array.*/
    let third_pokemonInEvoChain = await load_third_pokemonInEvoChain(evoChainAsJSON);
    currentPokemonEvolutionChain.push(third_pokemonInEvoChain);
  }
  // Load the current evolution chain array in the array of evolution chains.
  pokemonEvolutionChains.push(currentPokemonEvolutionChain);
}

/**
 * Loads the first pokemon in the current evolution chain.
 * @param {JSON} evoChainAsJSON - The current evolution chain.
 * @returns {JSON } The first pokemon in the evolution chain.
 */
async function load_first_pokemonInEvoChain(evoChainAsJSON) {
  let firstPokemonBySpeciesUrl = await fetchUrlConvertToAndReturnAsJSON(evoChainAsJSON.chain.species.url);
  let firstPokemonByIdUrl = await fetchUrlConvertToAndReturnAsJSON(
    `https://pokeapi.co/api/v2/pokemon/${firstPokemonBySpeciesUrl.id}`
  );
  return firstPokemonByIdUrl;
}

/**
 * Loads the second pokemon in the current evolution chain.
 * @param {JSON} evoChainAsJSON - The current evolution chain.
 * @returns {JSON } The second pokemon in the evolution chain.
 */
async function load_second_pokemonInEvoChain(evoChainAsJSON) {
  let secondPokemonBySpeciesUrl = await fetchUrlConvertToAndReturnAsJSON(
    evoChainAsJSON.chain.evolves_to[0].species.url
  );
  let secondPokemonByIdUrl = await fetchUrlConvertToAndReturnAsJSON(
    `https://pokeapi.co/api/v2/pokemon/${secondPokemonBySpeciesUrl.id}`
  );
  return secondPokemonByIdUrl;
}

/**
 * Loads the third pokemon in the current evolution chain.
 * @param {JSON} evoChainAsJSON - The current evolution chain.
 * @returns {JSON } The third pokemon in the evolution chain.
 */
async function load_third_pokemonInEvoChain(evoChainAsJSON) {
  let thirddPokemonBySpeciesUrl = await fetchUrlConvertToAndReturnAsJSON(
    evoChainAsJSON.chain.evolves_to[0].evolves_to[0].species.url
  );
  let thirdPokemonByIdUrl = await fetchUrlConvertToAndReturnAsJSON(
    `https://pokeapi.co/api/v2/pokemon/${thirddPokemonBySpeciesUrl.id}`
  );
  return thirdPokemonByIdUrl;
}

/**
 * Renders the pokemon collection card.
 * @param {JSON} pokemon - The pokemon object.
 * @param {number} indexInAllPolemonsArray - The index of the pokemon in the array of all pokemons.
 */
function renderCollectionCard(pokemon, indexInAllPolemonsArray) {
  let searchValue = getElem('searchbar').value;
  searchValueLC = searchValue.toLowerCase();
  if (!searchValueLC || searchCondition(searchValueLC, pokemon)) {
    const TYPE = pokemon.types[0].type.name;
    const SPRITE_PATH = setSpritePath(pokemon);
    const COLLECTION = getElem('collection');
    const NEW_COLLECTION_CARD_ELEMENT = document.createElement('div');
    NEW_COLLECTION_CARD_ELEMENT.innerHTML = createCollectionCard(
      pokemon,
      indexInAllPolemonsArray,
      TYPE,
      SPRITE_PATH
    ).trim();
    COLLECTION.appendChild(NEW_COLLECTION_CARD_ELEMENT.firstElementChild);
  }
}

/**
 * Returns true, if the search value is included in the pokemon's name, id, or type.
 * @param {string} searchValueLC - The search value in lowercase.
 * @param {JSON} pokemon - The pokemon object that is being iterated over.
 * @returns {boolean} A boolean value.
 */
function searchCondition(searchValueLC, pokemon) {
  const POKEMON_NAME_LC = pokemon.name.toLowerCase();
  const POKEMON_ID = pokemon.id.toString();
  const POKEMON_TYPE_LC = pokemon.types[0].type.name.toLowerCase();
  return (
    POKEMON_NAME_LC.includes(searchValueLC) || POKEMON_ID == searchValueLC || POKEMON_TYPE_LC.includes(searchValueLC)
  );
}

/**
 * Sets the path to the sprite image for the pokemon if 'home' nodule in JSON exist. Otherwise set it from 'official-artwork' of JSON.
 * @param {JSON} pokemon - The pokemon object.
 */
function setSpritePath(pokemon) {
  if (pokemon.sprites.other.home.front_default != null) {
    return pokemon.sprites.other.home.front_default;
  } else {
    return pokemon.sprites.other['official-artwork'].front_default;
  }
}

/**
 * Returns a string of HTML representing a pokemon collection card.
 * @param {JSON} pokemon - The pokemon object.
 * @param {number} indexInAllPolemonsArray - The index of the pokemon in the array of all pokemons.
 * @param {string} type - The type of the pokemon.
 * @param {string} spritePath - The path to the pokemon's sprite image.
 * @returns {HTMLElement} A string of HTML code representing a pokemon collection card.
 */
function createCollectionCard(pokemon, indexInAllPolemonsArray, type, spritePath) {
  return /* html */ `  
          <div class="card ${type} cp" onclick="openModal(${indexInAllPolemonsArray})">
              <div>
                <div class="bgImageWithText">
                    <img class="bgImage" src="img/${type}.svg" alt="">
                    <span>${type}</span>
                </div>
              </div>
              <div class="cardText">
                  <span class="number">#${pokemon.id}</span>
                  <span class="name">${pokemon.name}</span>
              </div>
              <img class="pokemonImg" src="${spritePath}" onmouseover="scaleUpPokemonImg(this)" onmouseout="scaleDownPokemonImg()">
          </div>
      `;
}

/**
 * Renders each pokemon collection card according to the search value (name, id or type).
 */
function search() {
  let collection = getElem('collection');
  collection.innerHTML = '';
  for (let i = 0; i < allPokemons.length; i++) {
    const POKEMON = allPokemons[i];
    renderCollectionCard(POKEMON, i);
  }
}
//#endregion ============================== LOADING RENDERING FUNCTIONS ==============================
