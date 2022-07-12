/* 2022 Douglas Maieski - https://github.com/cmovz */

const fs = require('fs');
const uglifyjs = require('uglify-js');
const crypto = require('crypto');

if (process.argv.length !== 3) {
  console.error('Usage: node encrypt-js.js source.js');
  process.exit(1);
}

const input = fs.readFileSync(process.argv[2]);
const minified = uglifyjs.minify(input.toString());
let bytes = Buffer.from(minified.code);
let decrypter;

for (let i = 0; i < 3; ++i) {
  const iv = new Uint8Array(16);
  const key = new Uint8Array(16);
  crypto.randomFillSync(key);
  crypto.randomFillSync(iv);
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let b = cipher.update(bytes);
  b64 = Buffer.concat([iv, b, cipher.final()]).toString('base64');

  decrypter = `
  (async () => {
    const k = await crypto.subtle.importKey(
      'raw',
      new Uint8Array([${key.toString()}]),
      'AES-CBC',
      false,
      ['decrypt']
    );
    const p = base64Decode('${b64}');
    const iv = p.subarray(0,16);
    const c = p.subarray(16);
    const s = new TextDecoder().decode(await crypto.subtle.decrypt(
      {name:'AES-CBC', iv},
      k,
      c
    ));
    eval.apply(window, [s]);
  })();
  `;

  bytes = Buffer.from(decrypter);
}

b64 = bytes.toString('base64');

const data = `
const base64Table = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,62,0,0,0,63,52,53,54,55,56,57,58,59,60,61,0,0,0,0,0,0,0,0,1,2,3,4,5,6,
  7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,0,0,0,0,0,0,26,27,28,29,
  30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0
];

function base64Decode(str) {
  const blocks = str.length / 4;
  const binLength = blocks * 3;
  const bin = new Uint8Array(binLength);
  const binStr = new TextEncoder().encode(str);

  let i, dest = 0;
  for (i = 0; i < binStr.length - 4; i += 4, dest += 3) {
    bin[dest] = base64Table[binStr[i]] << 2;
    bin[dest] |= base64Table[binStr[i+1]] >> 4;
    
    bin[dest+1] = base64Table[binStr[i+1]] << 4;
    bin[dest+1] |= base64Table[binStr[i+2]] >> 2;

    bin[dest+2] = base64Table[binStr[i+2]] << 6;
    bin[dest+2] |= base64Table[binStr[i+3]];
  }

  let trimN = 0;
  bin[dest] = base64Table[binStr[i]] << 2;
  bin[dest] |= base64Table[binStr[i+1]] >> 4;

  if (str[i+2] === '=') {
    trimN = 2;
    bin[dest+1] = base64Table[binStr[i+1]] << 4;
  } else {
    if (str[i+3] !== '=') {
      bin[dest+1] = base64Table[binStr[i+1]] << 4;
      bin[dest+1] |= base64Table[binStr[i+2]] >> 2;
      bin[dest+2] = base64Table[binStr[i+2]] << 6;
      bin[dest+2] |= base64Table[binStr[i+3]];
    } else {
      trimN = 1;
      bin[dest+1] = base64Table[binStr[i+1]] << 4;
      bin[dest+1] |= base64Table[binStr[i+2]] >> 2;
    }
  }

  return bin.subarray(0, bin.length - trimN);
}

eval(new TextDecoder().decode(base64Decode('${b64}')))
`;

fs.writeFileSync('compiled_script.js', data);