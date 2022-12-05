//#region ============================== SET MODAL CARD BOTTOM ==============================
/**
 * Sets the bottom of the modal card..
 */
function setModalCardBottom() {
  setAbout();
  setBaseStats();
  setEvolution();
  setMoves();
}

//#region ============================== ABOUT ==============================
/**
 * Sets the about tab's content.
 */
async function setAbout() {
  getElem('aboutDescription').innerHTML = getDescriptionForAbout();
  getElem('pokedexDataHeadline').style.color = colours[`${selectedType}`];
  getElem('species').innerHTML = await getSpecies();
  getElem('height').innerHTML = `${convertToStringReplaceDotWithComma(selectedPokemon.height / 10)} m`;
  getElem('weight').innerHTML = `${convertToStringReplaceDotWithComma(selectedPokemon.weight / 10)} kg`;
  genAbilities();
}

/**
 * Returns the description of the selected pokemon.
 * @returns {string} The description of the selected pokemon.
 */
function getDescriptionForAbout() {
  let foundedElement = pokemonSpecies[selectedPokemonIndex].flavor_text_entries.find((n) => n.language.name == 'en');
  let stringWITHBackspaceControlCharacter = foundedElement.flavor_text;
  let stringWITHOUTBackspaceControlCharacter = stringWITHBackspaceControlCharacter.replaceAll(/[\b\f\n\r\t\v]/g, ' ');
  return stringWITHOUTBackspaceControlCharacter;
}

/**
 * Returns the species of the selected pokemon.
 * @returns {string} The species of the selected pokemon.
 */
function getSpecies() {
  let foundedElement = pokemonSpecies[selectedPokemonIndex].genera.find((n) => n.language.name == 'en');
  return foundedElement.genus;
}

/**
 * Convert the height and weight number of the selected pokemon to string and replaces the dot character
 * with the comma character
 * @param {number} inputToChange - The number that should be converted and where the dot character should be replaced with the comma character.
 * @returns {string} The to string converted number (height or weight of the selected pokemon), where the dot character has been replaced with the comma character.
 */
function convertToStringReplaceDotWithComma(inputToChange) {
  let changedText = inputToChange.toString();
  return changedText.replace('.', ',');
}

/**
 * Generates the abilities of the selected pokemon.
 */
function genAbilities() {
  let abilitiesContainer = getElem('abilities');
  abilitiesContainer.innerHTML = '';
  selectedPokemon.abilities.forEach((element) => {
    abilityName = element.ability.name;
    if (element.is_hidden) {
      abilityName = `${abilityName} (hidden ability)`;
    }
    abilitiesContainer.innerHTML += /* html */ `${abilityName}<br>`;
  });
}
//#endregion ============================== ABOUT ==============================

//#region ============================== BASE STATS ==============================
/**
 * Sets the base stats tab's content.
 */
async function setBaseStats() {
  currentBaseStats = [];
  getElem('baseStatsHeadline').style.color = colours[`${selectedType}`];
  getValueAndSetColourOfProgressBars();
  setWidthsOfProgressBars();
  getElem('typeDefensesHeadline').style.color = colours[`${selectedType}`];
  getElem('typeDefensesPokemonName').innerHTML = selectedPokemon.name;
}

/**
 * Gets the value of the base stats of the selected pokemon and sets the color of the progress bars like the pokemon
 * type of the selected pokemon.
 */
function getValueAndSetColourOfProgressBars() {
  for (let i = 0; i <= 5; i++) {
    // Value of one of the six basa stats (like hp, attack etc.).
    let baseStatsValue = selectedPokemon.stats[i].base_stat;
    // The value is saved the array of the base stats of the selected pokemon.
    currentBaseStats.push(baseStatsValue);
    // Calc the progress bar width with the baseStatsValue as a percantge of the maximum of 200px (equivalent to 100%).
    let widthOfProgressBar = calcPercentageWidthOfBaseStats(baseStatsValue);
    // Save the calculated width in 'progressBarWidths' array.
    widthsOfProgressBars.push(widthOfProgressBar);
    // Remove the color like the pokoemon type of the previous pokemon opened in the modal card.
    getElem(`baseStats${i}`).removeAttribute('class');
    // Add the color like the pokemon type for the selected pokemon opened in the modal card.
    getElem(`baseStats${i}`).classList.add('prograssBar', `${selectedType}`);
  }
}

/**
 * Calculating the percentage width of the base stats value.
 * @param {number} baseStatsValue - The value of the base stat.
 * @returns {string} A string with the percentage value.
 */
function calcPercentageWidthOfBaseStats(baseStatsValue) {
  // 255 is the maximal value of all base stats of all pokemons.
  let percentage = Math.round((baseStatsValue / 255) * 100);
  return percentage;
}

/**
 * Reset the widths of the progress bars and set the value and width of each progress bar, If the selected tab is the
 * baseStats tab and the widths of the progress bars have not already been set,
 */
function setWidthsOfProgressBars() {
  if (selectedTabName == 'baseStats' && !widthsOfPogresBarsAlreadySet) {
    resetWidthsOfProgressBars();
    setWidth();
    setValue();
    widthsOfPogresBarsAlreadySet = true;
  }
}

/**
 * Resets the widths of the progress bars to 0% and removes the base stat number inside of them.
 */
function resetWidthsOfProgressBars() {
  for (let i = 0; i < widthsOfProgressBars.length; i++) {
    progressBarElement = getElem(`baseStats${i}`);
    progressBarElement.style.transition = '';
    progressBarElement.style.width = '0%';
    progressBarElement.style.minWidth = '0%';
    progressBarElement.innerHTML = '';
  }
}

/**
 * Sets the widths of the progress bars.
 */
function setWidth() {
  if (setValueAndWidthIntevall_1) {
    clearTimeout(setValueAndWidthIntevall_1);
  }
  setValueAndWidthIntevall_1 = setTimeout(() => {
    for (let i = 0; i < widthsOfProgressBars.length; i++) {
      const ELEMENT = widthsOfProgressBars[i];
      progressBarElement = getElem(`baseStats${i}`);
      progressBarElement.style.transition = 'all 1400ms';
      progressBarElement.style.minWidth = '12%';
      progressBarElement.style.width = ELEMENT + '%';
    }
  }, 10);
}

/**
 * Sets the values in the progress bars (base stats of the selected pokemon).
 */
function setValue() {
  if (setValueAndWidthIntevall_2) {
    clearTimeout(setValueAndWidthIntevall_2);
  }
  setValueAndWidthIntevall_2 = setTimeout(() => {
    for (let i = 0; i < widthsOfProgressBars.length; i++) {
      progressBarElement = getElem(`baseStats${i}`);
      progressBarElement.innerHTML = currentBaseStats[i];
    }
  }, 150);
}
//#endregion ============================== BASE STATS ==============================

//#region ============================== EVOLUTION ==============================
/**
 * Sets the evolution tab's content.
 */
function setEvolution() {
  let evolutionContainer = getElem('evolution');
  evolutionContainer.innerHTML = '';
  pokemonEvolutionChain = pokemonEvolutionChains[selectedPokemonIndex];
  for (let i = 1; i < pokemonEvolutionChain.length; i++) {
    let pokemonLeft = pokemonEvolutionChain[i - 1];
    let pokemonRight = pokemonEvolutionChain[i];
    let dataForEvoLine = prepareDataForGentHTMLEvoLine(pokemonLeft, pokemonRight);
    evolutionContainer.innerHTML += createEvoLine(dataForEvoLine, i);
  }
}

/**
 * Returns preparied the data to generate an evolution row in modal card bottom, in tab evolution.
 * @param {JSON} pokemonLeft - The pokemon from which one evulution step begins.
 * @param {JSON} pokemonRight - The pokemon till which one evulution step ends.
 * @returns {JSON} The prepared data object with certain properties to generate an evolution row.
 */
function prepareDataForGentHTMLEvoLine(pokemonLeft, pokemonRight) {
  let data = {
    srcPokemonLeft: setSpritePath(pokemonLeft),
    indexInAllPokemonsPokemonLeft: pokemonLeft.id - 1,
    namePokemonLeft: pokemonLeft.name,
    type: pokemonLeft.types[0].type.name,
    srcPokemonRight: setSpritePath(pokemonRight),
    indexInAllPokemonsPokemonRight: pokemonRight.id - 1,
    namePokemonRight: pokemonRight.name,
  };
  return data;
}

/**
 * Returns a string of HTML containing an evolution row in modal card bottom, in tab evolution.
 * @param {any} data - The prepared data object with certain properties to generate an evolution row.
 * @param {number} i - The index of the evolution line.
 * @returns {HTMLElement} The strinf of HTML code containing evolution row.
 */

scaleUpPokemonImg;
function createEvoLine(data, i) {
  return /* html */ `
      <div id="evoLine${i}" class="evoLine">
        <div class="evoPokemonName">
          <div id="evoLine${i}_pokemonLeftImg_Div" class="evoPokemon" onclick="changeToPokemonFromEvolutionChain(${data.indexInAllPokemonsPokemonLeft}), highlightAndEnlarge_evo_pokemonImg_onClick('evoLine${i}_pokemonLeftImg_Div')">
            <img class="cp" src="${data.srcPokemonLeft}" onmouseover="highlightAndEnlarge_evo_pokemonImg_onMouse_Over('evoLine${i}_pokemonLeftImg_Div')" onmouseout="highlightAndEnlarge_evo_pokemonImg_onMouse_Out('evoLine${i}_pokemonLeftImg_Div')"/>
          </div>
          <div class="evoNameContainer cp" onclick="changeToPokemonFromEvolutionChain(${data.indexInAllPokemonsPokemonLeft})">
            <div class="evoName ${data.type}">${data.namePokemonLeft}</div>
          </div>
        </div>
  
        <div class="evoRightArrowLevel">
          <img class="evoRightArrow cp" src="img/arrow-right.png" />
        </div>
  
        <div class="evoPokemonName">
          <div id="evoLine${i}_pokemonRightImg_Div" class="evoPokemon" onclick="changeToPokemonFromEvolutionChain(${data.indexInAllPokemonsPokemonRight}, highlightAndEnlarge_evo_pokemonImg_onClick('evoLine${i}_pokemonRightImg_Div'))">
            <img class="cp" src="${data.srcPokemonRight}" onmouseover="highlightAndEnlarge_evo_pokemonImg_onMouse_Over('evoLine${i}_pokemonRightImg_Div')" onmouseout="highlightAndEnlarge_evo_pokemonImg_onMouse_Out('evoLine${i}_pokemonRightImg_Div')"/>
          </div>
          <div class="evoNameContainer cp" onclick="changeToPokemonFromEvolutionChain(${data.indexInAllPokemonsPokemonRight})">
            <div class="evoName ${data.type}">${data.namePokemonRight}</div>
          </div>
        </div>
      </div>
    `;
}

/**
 * Highlights and enlarges the pokemon image in the modal card, in tab evolution by clickig on it.
 * @param {HTMLElement} element - The HTML element that should be highlighted and enlarged.
 */
function highlightAndEnlarge_evo_pokemonImg_onClick(element) {
  lastScaled.classList.remove('evoPokemonImgScaled');
  getElem(element).classList.add('evoPokemonImgScaled');
  if (highlightAndEnlarge_evo_pokemonImg_intervall) {
    clearTimeout(highlightAndEnlarge_evo_pokemonImg_intervall);
  }
  highlightAndEnlarge_evo_pokemonImg_intervall = setTimeout(() => {
    getElem(element).classList.remove('evoPokemonImgScaled');
  }, 111);
}

/**
 * Highlights and enlarges the pokemon image in the modal card, in tab evolution, when the mouse hovered over it.
 * @param {HTMLElement} element - The HTML element that should be enlarged.
 */
function highlightAndEnlarge_evo_pokemonImg_onMouse_Over(element) {
  getElem(element).classList.add('evoPokemonImgScaled');
  lastScaled = getElem(element);
}

/**
 * Reduces the current enlarged pokemon image in the modal card, in tab evolution, when the mouse leaved its area.
 */
function highlightAndEnlarge_evo_pokemonImg_onMouse_Out() {
  lastScaled.classList.remove('evoPokemonImgScaled');
}

/**
 * Changes the current displayd pokemon in the modal card, if the selected pokemon from the evolution tab
 * is different as the current display pokemon in the modal card, by changing the selected pokemon index
 * and checking before, if the selected pokemon is already present.
 * @param indexInAllPokemons - The index of the pokemon in the allPokemons array.
 */
async function changeToPokemonFromEvolutionChain(indexInAllPokemons) {
  setTimeout(() => {
    if (selectedPokemonIndex != indexInAllPokemons) {
      selectedPokemonIndex = indexInAllPokemons;
      checkPresenceSelectedPokemon();
    }
  }, 221);
}

//#endregion ============================== EVOLUTION ==============================

//#region ============================== MOVES ==============================
/**
 * Sets the moves tab's content.
 */
function setMoves() {
  getElem('movesCollection').innerHTML = '';
  selectedPokemon.moves.forEach((element) => {
    let moveName = element.move.name;
    getElem('movesCollection').innerHTML += createMoveLine(moveName);
  });
}

/**
 * Returns string of HTML element containing a row with the star icon and one of the move names of the selected pokemon
 * in the modal card bottom, in moves tab.
 * @param {string} move - The given move for which the line with star icon and the move name should be returned.
 * @returns {HTMLElement} A string of HTML code containing the line with star icon and the move name.
 */
function createMoveLine(move) {
  return /* html */ `
      <span class="starTextLine">
        <img src="img/star.png" />
        <span>${move}</span>
      </span>
    `;
}
//#endregion ============================== MOVES ==============================
//#endregion ============================== SET MODAL CARD BOTTOM ==============================
