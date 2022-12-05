//#region ============================== SET MODAL CARD TOP ==============================
/**
 * Changes the current displayd pokemon in the modal card by increasing the selected pokemon index
 * and checking before if the selected pokemon is already present
 * @param {number} plusOrMinusOne - The amount by which the current selected pokemon index should be changed,
 * either +1 or -1.
 */
function changePokemon(plusOrMinusOne) {
  changeSelectedPokemonIndex(plusOrMinusOne);
  // Check if changePokemonInterval is undefined.
  if (changePokemonInterval != undefined) {
    // Yes, clear the timeout of the last changePokemonInterval inteval.
    clearTimeout(changePokemonInterval);
  }
  // No, execute the check if the next pokemon after the selected one is present after defined timeout inveral.
  changePokemonInterval = setTimeout(checkPresenceSelectedPokemon, 400);
}

/**
 * Changes the currenct selected pokemon index by the amount of one, either increasing by one or reducing by one.
 * @param {number} plusOrMinusOne
 */
function changeSelectedPokemonIndex(plusOrMinusOne) {
  /**
   * Check if the 'selectedPokemonIndex' is eqaul to the start index of the 'allPokemons' array
   * and all 905 pokemons are NOT already present
   * and decide to reduce the 'selectedPokemonIndex' by one.
   * OR check if the 'selectedPokemonIndex' is eqaul to the last index of the 'allPokemons' array
   * and decide to increase the'selectedPokemonIndex' by one.
   */
  if (
    (selectedPokemonIndex == 0 && allPokemons.length != 905 && plusOrMinusOne == -1) ||
    (selectedPokemonIndex == 904 && plusOrMinusOne == 1)
  ) {
    selectedPokemonIndex = 0;
  } else if (selectedPokemonIndex == 0 && allPokemons.length == 905 && plusOrMinusOne == -1) {
    /**
     * Check if the 'selectedPokemonIndex' is eqaul to the start index of the 'allPokemons' array
     * and all 905 pokemons are already present
     * and decide to reduce the 'selectedPokemonIndex' by one.
     */
    selectedPokemonIndex = 904;
  }
  // Checks if the 'selectedPokemonIndex' eqaul to the last index of the 'allPokemons' array.
  else if (selectedPokemonIndex == 904 && plusOrMinusOne == 1) {
    selectedPokemonIndex = 0;
  } else {
    // Otherwise increase or reduce the 'selectedPokemonIndex' by one.
    selectedPokemonIndex = selectedPokemonIndex + plusOrMinusOne;
  }
}

/**
 * Checks if the selected pokemon is present in the array of all pokemons. If it is, sets the modal card for selected
 * pokemon. If it isn't, loads firstival the selected pokemon and then sets the modal card for it.
 */
async function checkPresenceSelectedPokemon() {
  // Generate modal card loader.
  genLoader('modalCardTopBottom', 'modalCardLoader');
  // Check if selected pokemon is present.
  if (allPokemons[selectedPokemonIndex]) {
    // Yes, set modal card.
    await setModalCard();
    // Remove loader
    await removeLoader('modalCardTopBottom', 'modalCardLoader');
  } else {
    // No, load futher pokemons to the index of next pokemon after the selected pokemon.
    await loadRenderTillEndIndexPlusTen(selectedPokemonIndex);
  }
}

/**
 * Sets the modal card.
 */
async function setModalCard() {
  selectedPokemon = allPokemons[selectedPokemonIndex];
  selectedType = await selectedPokemon.types[0].type.name;
  // Reset the array of progress bar widths of the base stats in the modal card.
  widthsOfProgressBars = [];
  // Reset the state whether the loading of progress bars of the base stats in the modal card have be done once.
  widthsOfPogresBarsAlreadySet = false;
  setModalCardBottom();
  setModalCardTop();
  // Set the visibility of the left switch arrow of the modal card.
  await setMCTArrowLeft();
}

/**
 * Sets the modal card top by setting the background like selected pokemon type, generating all modal card type related
 * elements, and setting name and image of the selected pokemon.
 */
async function setModalCardTop() {
  setBgLikeType();
  await genMCAllTypeRelatedElements();
  setMCTNameImg();
}

/**
 * Changes the background of the modal card according to type of the selected pokemon.
 */
function setBgLikeType() {
  getElem('modalCardBg').removeAttribute('class');
  getElem('modalCardBg').classList.add('modalCardBgWithOpacity');
  getElem('modalCardBg').classList.add(selectedType);
}

/**
 * Generates all type related elements of the modal card
 * (at once everywhere in the whole modal card, in the top and bottom part (in about and base stats tab).
 */
async function genMCAllTypeRelatedElements() {
  genMCTTypeImgs();
  await getMCBDamageRelations();
  await getMCBWeaknesses();
  genMCBTypeWeaknesses();
  genMCBTypeDefenses();
  setMCBTypeDefensesNumbers();
}

/**
 * Generates an image for each type of the selected pokemon in the modal card top.
 */
function genMCTTypeImgs() {
  let mCTTypeImgsContainer = getElem('mCTTypeImgsContainer');
  mCTTypeImgsContainer.innerHTML = '';
  selectedPokemon.types.forEach((pokemonType) => {
    let pokemonTypeName = pokemonType.type.name;
    mCTTypeImgsContainer.innerHTML += createModalCardTopTypeImg(pokemonTypeName);
  });
}

/**
 * Returns string of HTML element containing the img of a type of the selected pokemon.
 * @param {string} pokemonTypeName - The name of the pokemon type (e.g. "fire").
 * @returns {HTMLImageElement} A string of HTML code containing the img of a type of the selected pokemon.
 */
function createModalCardTopTypeImg(pokemonTypeName) {
  return /* html */ `
      <img class="mCTTypeImg ${pokemonTypeName}" src="img/${pokemonTypeName}.svg" />
    `;
}

/**
 * Generates an array, collection of demage relations of the selected pokemon.
 * Takes the types of the selected pokemon and compares them to the types of all the pokemon in the pokedex.
 * If the selected pokemon's type matches a type in the pokedex, it pushes the damage relations of that type into an array.
 */
async function getMCBDamageRelations() {
  demageRelationsCollections = [];
  selectedPokemon.types.forEach((pokemonType) => {
    let pokemonTypeName = pokemonType.type.name;
    allTypes.forEach((typeObject) => {
      if (pokemonTypeName === typeObject.name) {
        let damageRelations = {
          double_damage_from: typeObject.damage_relations.double_damage_from,
          half_damage_from: typeObject.damage_relations.half_damage_from,
          no_damage_from: typeObject.damage_relations.no_damage_from,
        };
        demageRelationsCollections.push(damageRelations);
      }
    });
  });
}

/**
 * Generates an array, weaknesses nof the selected pokemon.
 * Loops through all the types in the allTypes array, and for each type it loops through the
 * demageRelationsCollections array, and for each demageRelations object in the
 * demageRelationsCollections array it searches for the typeNameInAllTypeObject in the demageRelations
 * object, and if it finds it, it fills the weaknesses array of the typeObject with the types that are
 * in the double_damage_from array of the demageRelations object.
 */
async function getMCBWeaknesses() {
  allTypes.forEach((typeObject) => {
    let typeNameInAllTypeObject = typeObject.name;
    demageRelationsCollections.forEach((demageRelations) => {
      searchForTypeNameFillWeaknesses(demageRelations, typeNameInAllTypeObject, 'double_damage_from');
      searchForTypeNameSpliceWeaknesses(demageRelations, 'half_damage_from');
      searchForTypeNameSpliceWeaknesses(demageRelations, 'no_damage_from');
    });
  });
}

/**
 * Takes an array of objects (demage relations obects), and for each object with the name according to the a given
 * demage relation, checks if the object's name property is equal to a given type name, and if it is,
 * it adds the given/founded type name to an weeknesses array.
 * @param {Array} demageRelations - The given array of demage relations objects.
 * @param {string} typeNameInAllTypeObject - The name of the type that is being searched for in the
 * demage relations object.
 * @param {string} demageRelation  - The given name of damage relation (e.g. "double_damage_from").
 */
function searchForTypeNameFillWeaknesses(demageRelations, typeNameInAllTypeObject, demageRelation) {
  demageRelations[demageRelation].forEach((demageRelationObject) => {
    let typeNameInDemageRelationObject = demageRelationObject.name;
    if (
      typeNameInAllTypeObject === typeNameInDemageRelationObject &&
      !weaknesses.includes(typeNameInDemageRelationObject)
    ) {
      weaknesses.push(typeNameInDemageRelationObject);
    }
  });
}

/**
 * Takes an array of objects (demage relations obects), and for each object with the name according to the a given
 * demage relation, checks if the object's name property is in the weaknesses array.
 * If it is, it removes it from the weaknesses array.
 * @param {Array} demageRelations - The given array of demage relations objects.
 * @param {string} demageRelation - The given name of damage relation (e.g. "half_damage_from").
 */
function searchForTypeNameSpliceWeaknesses(demageRelations, demageRelation) {
  demageRelations[demageRelation].forEach((demageRelationObject) => {
    let typeNameInDemageRelationObject = demageRelationObject.name;
    if (weaknesses.includes(typeNameInDemageRelationObject)) {
      let index = weaknesses.indexOf(typeNameInDemageRelationObject);
      weaknesses.splice(index, 1);
    }
  });
}

/**
 * Generates a weaknesses icon for each type from the weaknesses array in the modal card bottom, about tab, weaknesses section.
 */
function genMCBTypeWeaknesses() {
  let container = getElem('weaknesses');
  container.innerHTML = '';
  weaknesses.forEach((typeNameInWeakness) => {
    container.innerHTML += createTypeWeakness(typeNameInWeakness);
  });
}

/**
 * Returns a string of HTML containing a icon of a weekness type
 * @param {string} typeNameInWeakness - The name of the type.
 * @returns {HTMLImageElement} A string of HTML code containing a icon of a weekness type.
 */
function createTypeWeakness(typeNameInWeakness) {
  return /* html */ `
      <img class="${typeNameInWeakness}" src='img/${typeNameInWeakness}.svg' />
    `;
}

/**
 * Generates all existing type icons / defense icons in the modal card bottom, base tab, type defenses section.
 */
async function genMCBTypeDefenses() {
  let container = getElem('typeDefensesCollection');
  container.innerHTML = '';
  for (let i = 0; i < allTypes.length; i++) {
    const TYPE_NAME = allTypes[i].name;
    container.innerHTML += createTypeDefense(TYPE_NAME);
  }
}

/**
 * Returns a string of HTML containing a icon of a defense type
 * @param {string} typeName - The name of the type.
 * @returns {HTMLElement} A string of HTML code containing a icon of a defense type and span with the defense amount of one.
 */
function createTypeDefense(typeName) {
  return /* html */ `
      <div class='typeDefenseWithAmount'>
        <img class="${typeName}" src='img/${typeName}.svg' />
        <span id="${typeName}">1</span>
      </div>
    `;
}

/**
 * Sets the defense amount for each type in the modal card bottom, base tab, type defenses section.
 */
function setMCBTypeDefensesNumbers() {
  allTypes.forEach((typeObject) => {
    let typeNameInAllTypeObject = typeObject.name;
    demageRelationsCollections.forEach((demageRelations) => {
      searchForTypeNameMultiplicateAmount(demageRelations, typeNameInAllTypeObject, 'double_damage_from', 2);
      searchForTypeNameMultiplicateAmount(demageRelations, typeNameInAllTypeObject, 'half_damage_from', 0.5);
      searchForTypeNameMultiplicateAmount(demageRelations, typeNameInAllTypeObject, 'no_damage_from', 0);
    });
    let typDefNumberElement = getElem(typeNameInAllTypeObject);
    // Checks if the defense amount is a decimal number.
    if (!Number.isInteger(typDefNumberElement)) {
      typDefNumberElement.innerHTML = changeToFraction(typDefNumberElement.innerHTML);
    }
  });
}

/**
 * Takes an array of objects (demage relations obects), and for each object with the name according to the a given
 * demage relation, checks if the object's name property is equal to a given type name, and if it is, then multiply the
 * current innerHTML of the element with the id of typeNameInAllTypeObject by the given multiplicator.
 * @param {Array} demageRelations - The given array of demage relations objects.
 * @param {string} typeNameInAllTypeObject - The name of the type that is being searched for in the demage relations object.
 * @param {string} demageRelation - The given name of damage relation (e.g. "double_damage_from").
 * @param {number} multiplicator - The multiplicator.
 */
function searchForTypeNameMultiplicateAmount(demageRelations, typeNameInAllTypeObject, demageRelation, multiplicator) {
  demageRelations[demageRelation].forEach((demageRelationObject) => {
    let typeNameInDemageRelationObject = demageRelationObject.name;
    if (typeNameInAllTypeObject === typeNameInDemageRelationObject) {
      getElem(typeNameInAllTypeObject).innerHTML *= multiplicator;
    }
  });
}

/**
 * Returns HTML-encoded entity as 1/2, if the given result is 0.5. Returns HTML-encoded entity as 1/4,
 * if the given result is 0.25. Otherwise returns the given result.
 * @param {string} result - The given result of the calculation executed in the function searchForTypeNameMultiplicateAmount.
 * @returns {string} The result as the HTML-encoded entity if the result is a decimal number, otherwise as the same format like a given way.
 */
function changeToFraction(result) {
  if (result == 0.5) {
    return '&frac12;';
  } else if (result == 0.25) {
    return '&frac14;';
  } else return result;
}

/**
 * Sets the name of the selected pokemon and the image of the selected pokemon in the modal card top.
 */
function setMCTNameImg() {
  getElem('mCTName').innerHTML = selectedPokemon.name;
  getElem('mCTPokoemonImg').classList.remove('mCTPokoemonImgClick');
  getElem('mCTPokoemonImg').src = setSpritePath(selectedPokemon);
}

/**
 * Highlights and enlarges the pokemon image in the modal card top by clickig on it.
 */
function highlightAndEnlarge_PokemonImg(element) {
  element.classList.remove('mCTPokoemonImgClick');
  element.classList.add('mCTPokoemonImgClick');
  if (changePokoemonImgSizeIntervall) {
    clearTimeout(changeArrowStyleIntervall);
  }
  changePokoemonImgSizeIntervall = setTimeout(() => {
    element.classList.remove('mCTPokoemonImgClick');
  }, 1201);
}

/**
 * Sets the visibility of the left switch arrow of the modal card.'.
 */
async function setMCTArrowLeft() {
  if (selectedPokemonIndex == 0 && allPokemons.length != 905) {
    getElem('mCTArrowLeft').classList.add('dn');
  } else {
    getElem('mCTArrowLeft').classList.remove('dn');
  }
}

/**
 * Highlights and enlarges the arrow in the modal card by clickig on it.
 */
function highlightAndEnlarge_Arrow(element) {
  element.classList.remove('mCTArrowClick');
  element.classList.add('mCTArrowClick');
  if (changeArrowStyleIntervall) {
    clearTimeout(changeArrowStyleIntervall);
  }
  changeArrowStyleIntervall = setTimeout(() => {
    element.classList.remove('mCTArrowClick');
  }, 111);
}
//#endregion ============================== SET MODAL CARD TOP ==============================
