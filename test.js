const spawn = require("child_process").spawn;
const path = require("path");
function py_save_prefs() {
    const unixProcess = spawn(path.join(__dirname, './dist/Classifi'),['retrieve_models']);
    unixProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
      
      unixProcess.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });
      
      unixProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });
}
py_save_prefs()