const steper = document.getElementById('password-length');
const passwordGeneratorForm = document.getElementById('generator-form');
const parentStrengthDetails = document.getElementById('strength-details');
const copyButton = document.getElementById('copy-button');

copyButton.addEventListener('click', (e) => {
    const passwordContainer = document.getElementById('output-password');

    navigator.clipboard.writeText(passwordContainer.innerText);

    // TODO: show copied text
    console.log('copied');
});

const scaleRange = (value, newMin = 0, newMax = 20, oldMin = 0, oldMax = 100) => {
    let steps = (oldMax - oldMin) / (newMax - newMin);
    return (value / steps) + newMin;
};

const updateSteperValue = (e) => {
    let newValue = e.target.value;
    const steperValue = passwordGeneratorForm.querySelector('span.form__range-value');
    steperValue.innerText = scaleRange(parseInt(newValue));
}

const generatePassword = (options = {
    passwordLength: 10,
    includeUppercase: false,
    includeLowercase: false,
    includeNumbers: false,
    includeSymbols: false,
}, pools = {
    uppercaseLetters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercaseLetters: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?/",
}) => {
    // TODO: validate password length

    let poolCharacters = "";

    if (options.includeUppercase) poolCharacters += pools.uppercaseLetters;
    if (options.includeLowercase) poolCharacters += pools.lowercaseLetters;
    if (options.includeNumbers) poolCharacters += pools.numbers;
    if (options.includeSymbols) poolCharacters += pools.symbols;

    let password = '';

    for (let i = 0; i < options.passwordLength; i++) {
        let randomNumber = Math.floor(Math.random() * poolCharacters.length);
        password += poolCharacters[randomNumber];
    }

    return password;
};

steper.addEventListener('input', updateSteperValue);

const transformData = (form, transformer) => {
    const data = Object.fromEntries(new FormData(form));
    const transformedData = {...data};
    
    Object.keys(data).forEach((key) => {
        transformedData[key] = transformer[key](data[key]);
    });

    return transformedData;
}

const getStrength = (score) => {
    switch (score) {
        case 0:
            return 'too-weak';
        case 1:
            return 'weak';
        case 2:
        case 3:
            return 'medium';
        case 4:
            return 'strong';
    }
};

const strengthDecoration = {
    'too-weak': {color: 'red', cols: 1},
    'weak': {color: 'orange', cols: 2},
    'medium': {color: 'yellow', cols: 3},
    'strong': {color: 'neon-green', cols: 4},
};

const renderSuccess = (strength, password) => {
    const passwordContainer = document.getElementById('output-password');
    passwordContainer.innerText = password;

    const spans = parentStrengthDetails.querySelectorAll('span.password-strength__status');
    spans.forEach((span) => {
        span.classList.remove('password-strength__status--visible');
    });

    let spanTarget = parentStrengthDetails.querySelector(`span.password-strength__status--${strength}`);
    spanTarget.classList.add('password-strength__status--visible');

    const colsStrong = parentStrengthDetails.querySelectorAll('div.password-strength__column');
    let { color, cols } = strengthDecoration[strength];

    for (let i = 0; i < colsStrong.length; i++) {
        colsStrong[i].className = 'password-strength__column';
    }
    
    for (let i = 0; i < cols; i++) {
        colsStrong[i].classList.add(`password-strength__column--${color}`);
    }
};

const cleanFormData = {
    passwordLength: (value) => scaleRange(parseInt(value)),
    includeUppercase: (value) => true,
    includeLowercase: (value) => true,
    includeNumbers: (value) => true,
    includeSymbols: (value) => true,
}

passwordGeneratorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // no validations required

    // render success
    let generatedPassword = generatePassword(transformData(e.currentTarget, cleanFormData));
    let strengthEval = zxcvbn(generatedPassword);
    let strength = getStrength(strengthEval.score);
    renderSuccess(strength, generatedPassword);

    if (generatedPassword !== '') {
        // enable copy button
        copyButton.disabled = false;
        copyButton.classList.add('output__copy-button--ready');
    } else {
        // disable copy button
        copyButton.disabled = true;
        copyButton.classList.remove('output__copy-button--ready');
    }
});
