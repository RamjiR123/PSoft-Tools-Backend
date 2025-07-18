# PSoft-Tools-Backend
Backend for PSoft Tools. This provides support for features that the front end cannot run, such as Dafny operations.
## Features
### Dafny Code Verification/Running
Hosts an environment to verify and run Dafny code.
### Hoare Triple Verification
Hosts an environment to verify Hoare Triples that have been translated to Dafny code.
### Forward Reasoning
Hosts an environment to produce the strongest postcondition from a given precondition and Java code.
### Backward Reasoning
Hosts an environment to produce the weakest precondition from a given postcondition and Java code.
### Control Flow Graphs *(Under Development)*
Provides a tool that generates a control-flow graph from given Java code.
## Local Hosting/Development
### Setup
#### Requirements
1. Node Version 20.xx.xx+
#### Node.js
1. Install the latest version of npm: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
2. (Optional, HIGHLY RECOMMENDED) Install nvm to manage node versions. 
3. Install the dependencies: `npm install`
4. Set up the frontend server: https://github.com/aandrepingu/PSoft-Tools
#### Dafny
This application requires .NET SDK 6.0 and Dafny in order to run. We recommend using the provided script `./src/dafnySetup.sh` to automatically install required components; however, these are the steps to manually do so:
1. Install .NET SDK 6.0: `sudo apt install dotnet-sdk-6.0`
2. Install Dafny into the "src/dafny" directory:
    - `cd ./src`
    - `wget https://github.com/dafny-lang/dafny/releases/download/v4.4.0/dafny-4.4.0-x64-ubuntu-20.04.zip`
    - `unzip dafny-4.4.0-x64-ubuntu-20.04.zip`
3. Create the required file "src/Dafny-Files/dafnyCode.dfy":
    - `mkdir ./src/Dafny-Files`
    - `touch ./src/Dafny-Files/dafnyCode.dfy`

#### Python
This application requires Python and SymPy in order to run. There will be a shell script provided in the future, however these are the steps to manually install them:
    - `cd ./src`
    - `mkdir ./src/sympy-python`
    - `go to https://www.python.org/downloads/windows/ and download the 3.13.5 embeddable zip and unzip it in ./src/sympy-python`
    - `go to https://bootstrap.pypa.io/get-pip.py and save it into ./src/sympy-python as get-pip.py`
    - `open python315._pth and uncomment import site`
    - `run .\python.exe get-pip.py`
    - `run .\python.exe -m pip install sympy`

### Running
1. Run the dev server: `npm run dev`
2. Run the frontend dev server: 
    - `cd /path/to/PSoft-Tools/psoft-tools`
    - `npm run dev`