 /* Compile the contract and copy the resulting wasm into `../out` */

// `shelljs` is included in the devDependencies of the root project
const sh = require('shelljs')

// Define the build command
const buildCmd = "RUSTFLAGS='-C link-arg=-s' cargo build --all --target wasm32-unknown-unknown --release"

// Execute the build command, storing exit code for later use
const { code } = sh.exec(buildCmd)

// Get package name from Cargo.toml
const packageName = require('fs').readFileSync(`Cargo.toml`).toString().match(/name = "([^"]+)"/)[1]
const compiledWasm = `./target/wasm32-unknown-unknown/release/${packageName}.wasm`
  
// Create `../out` dir
const destination = `../out`
sh.mkdir('-p', destination)

// Copy link
const outFile = `${destination}/main.wasm`
sh.rm('-f', outFile)
sh.cp('-u', compiledWasm, outFile)

// exit script with the same code as the build command
process.exit(code)