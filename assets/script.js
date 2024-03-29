const lengthError = document.querySelector('#length-error');
const charError = document.querySelector('#char-error');
const generateBtn = document.querySelector('.generate');
const maxPass = 10;

const charInput = document.querySelector("#char-choice");

let passwordLength;
let includeUpper;
let includeLower;
let includeNumerals;
let includeSpecial;
let historyArea = document.querySelector('#history-area');

const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numerals = '0123456789';
const special = '!@#$%^&*-_+=<>?;:|';

const copyToClipboard = (text) => {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);

  tempInput.select();
  tempInput.setSelectionRange(0, 99999);

  document.execCommand('copy');

  document.body.removeChild(tempInput);
};

const generatePassword = () => {
  if (
    passwordLength < 8 ||
    passwordLength > 128 ||
    (!includeUpper && !includeLower && !includeNumerals && !includeSpecial)
  ) {
    return '';
  }

  let password = '';
  const requiredChars = [];

  if (includeUpper) {
    requiredChars.push(upperCase);
    password += upperCase.charAt(Math.floor(Math.random() * upperCase.length));
  }
  if (includeLower) {
    requiredChars.push(lowerCase);
    password += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
  }
  if (includeNumerals) {
    requiredChars.push(numerals);
    password += numerals.charAt(Math.floor(Math.random() * numerals.length));
  }
  if (includeSpecial) {
    requiredChars.push(special);
    password += special.charAt(Math.floor(Math.random() * special.length));
  }

  for (let i = requiredChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
  }

  while (password.length < passwordLength) {
    const randomCharSet =
      requiredChars[Math.floor(Math.random() * requiredChars.length)];
    const randomChar =
      randomCharSet[Math.floor(Math.random() * randomCharSet.length)];
    password += randomChar;
  }

  password = password.split('');
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }
  password = password.join('');

  return password;
};

const lastPass = JSON.parse(localStorage.getItem('lastPass')) || [];

const addToLast = (password) => {
  lastPass.unshift(password);
  if (lastPass.length > 10) {
    lastPass.pop();
  }
  updateLast();
};

const updateLast = () => {
  localStorage.setItem('lastPass', JSON.stringify(lastPass));
};

const createPasswordButton = (password) => {
  const passwordButton = document.createElement('button');
  passwordButton.classList.add('password-button');
  passwordButton.textContent = password;

  passwordButton.addEventListener('click', () => {
    copyToClipboard(password);

    const tooltip = document.createElement('span');
    tooltip.textContent = 'Copied!';
    tooltip.classList.add('tooltip');
    
    const rect = passwordButton.getBoundingClientRect();
    const viewportOffset = rect.top + window.scrollY;
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = viewportOffset -140+ 'px';
  
    // Append the tooltip to the body
    document.body.appendChild(tooltip);
  
    setTimeout(() => {
      document.body.removeChild(tooltip); // Remove the tooltip element
    }, 2000);
  });

  
  return passwordButton;
};

const populatePasswordHistory = () => {
  const historyArea = document.querySelector('#history-area');
  historyArea.innerHTML = '';

  lastPass.forEach((password) => {
    const passwordButton = createPasswordButton(password);
    historyArea.appendChild(passwordButton);
  });
};

const upperCheckbox = document.querySelector('#upper');
const lowerCheckbox = document.querySelector('#lower');
const numeralsCheckbox = document.querySelector('#numerals');
const specialCheckbox = document.querySelector('#special');
const selectAllCheckbox = document.querySelector('#selectAll');

const characterTypeCheckboxes = [
  upperCheckbox,
  lowerCheckbox,
  numeralsCheckbox,
  specialCheckbox,
];

characterTypeCheckboxes.forEach((checkbox, index) => {
  checkbox.addEventListener('change', () => {
    switch (index) {
      case 0:
        includeUpper = checkbox.checked;
        break;
      case 1:
        includeLower = checkbox.checked;
        break;
      case 2:
        includeNumerals = checkbox.checked;
        break;
      case 3:
        includeSpecial = checkbox.checked;
        break;
    }

    const allChecked = characterTypeCheckboxes.every(checkbox => checkbox.checked);

    selectAllCheckbox.checked = allChecked;

  });
});

selectAllCheckbox.addEventListener('change', () => {
  characterTypeCheckboxes.forEach((checkbox) => {
    checkbox.checked = selectAllCheckbox.checked;
  });

  includeUpper = selectAllCheckbox.checked;
  includeLower = selectAllCheckbox.checked;
  includeNumerals = selectAllCheckbox.checked;
  includeSpecial = selectAllCheckbox.checked;
});

generateBtn.addEventListener('click', () => {  
  const charInputValue = charInput.value;
  passwordLength = parseInt(charInputValue);

  lengthError.style.display = 'none';
  charError.style.display = 'none';

  let hasLengthError = false;
  let hasCharError = false;

  if (isNaN(passwordLength) || passwordLength < 8 || passwordLength > 128) {
    lengthError.style.display = 'block';
    hasLengthError = true;
  }

  if (!includeUpper && !includeLower && !includeNumerals && !includeSpecial) {
    charError.style.display = 'block';
    hasCharError = true;
  }

  if (!hasLengthError && !hasCharError) {
    const newPass = generatePassword();
    
    const passwordButton = createPasswordButton(newPass);
    historyArea.appendChild(passwordButton);

    const scrollAmount = window.innerHeight * 0.9;
    window.scrollBy({
      top: scrollAmount,
      behavior: "smooth",
    });

    const displayedButtons = document.querySelectorAll('.password-button');

    if (displayedButtons.length > maxPass) {
      historyArea.removeChild(displayedButtons[maxPass]);
    }

    addToLast(newPass);
    updateLast();

    populatePasswordHistory();
    updateTitleVisibility(); 
  }
});

charInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    generateBtn.click();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    generateBtn.click();

    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement.type === 'checkbox') {
      focusedElement.click();
    }
  }
});

const updateTitleVisibility = () => {
  const prevTitle = document.querySelector('.prev-title');
  prevTitle.style.display = lastPass.length > 0 ? 'block' : 'none';
};

updateTitleVisibility();

window.addEventListener('load', () => {
  populatePasswordHistory();
  updateTitleVisibility();
});
