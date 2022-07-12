# encrypt-javascript
Small script to encrypt JavaScript and decrypt the generated js on the browser.

## Installation
```
git clone https://github.com/cmovz/encrypt-javascript.git
cd encrypt-javascript
npm i uglify-js
```

## Running
Go to the script directory and run:
```
node encrypt-js.js INPUT_FILE.js
```
It will generate a file called `compiled_script.js`, which contains the minified, encrypted original script and code to decrypt it on the browser.

## Caveats
If your original script contains global variables, they must not be declared using `let`, please use `var` instead.

## Customizing
By default it will encrypt the code 3 times, the original code will be encrypted, then the ciphertext will be encrypted and the resulting ciphertext will be encrypted again, you can change it on [this line](https://github.com/cmovz/encrypt-javascript/blob/main/encrypt-js.js#L18).
