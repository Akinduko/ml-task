const spawn = require("child_process").spawn;
const path = require("path");
var fs = require('fs');
class MyStore {
    constructor() {
        this.groups = {}
        this.predict = {}
        this.modelname = ''
        this.pid = ''
    }
    addGroup(name, path) {
        this.groups[name] = path;
    }
    addPredict(path) {
        this.predict.path = path;
    }
    getGroup() {
        return this.groups;
    }
    getPredict() {
        return this.predict;
    }
    validateGroup() {
        if (this.groups.groupa && this.groups.groupb) {
            return true;
        }
        return false
    }
    setModelName(modelname) {
        this.modelname = modelname;
    }
    getModelName() {
        return this.modelname;
    }
    setPid(pid) {
        this.pid = pid;
    }
    getPid() {
        return this.pid;
    }
    clearGreat() {
        this.groups = {};
    }
}

const mystore = new MyStore();

function addGroup(event, clast) {
    try {
        const files = event.target.files;
        var folder = files[0].path;
        folder = folder;
        mystore.addGroup(clast, folder);
        document.getElementById(`visible${clast}`).placeholder = folder;
        mystore.validateGroup() === true ? document.getElementById(`trainbutton`).disabled = false : null;
    } catch (error) {
        Swal.fire({
            html: `<span>Unable to scan directory: ${error}</span>`,
            showCloseButton: false,
            showCancelButton: false,
            focusConfirm: false
        })
    }
}

function addPredict(event) {
    try {
        const files = event.target.files;
        var folder = files[0];
        folder = folder.path;
        mystore.addPredict(folder)
        document.getElementById(`predictinput`).placeholder = folder;
        const unixProcess = spawn(path.join(__dirname, './dist/Classifi'), ['retrieve_models']);
        // const unixProcess = spawn('/usr/local/bin/python3', ['./server/app.py', 'retrieve_models']);
        unixProcess.stdout.on('data', (data) => {
            const model = JSON.parse(JSON.stringify(data.toString('utf8'))).split(',')
            if (model.length === 1) {
                return Swal.fire({
                    html: `<br/><span>You do not have any available model please train a model</span>`,
                    showCloseButton: false,
                    showCancelButton: false,
                    focusConfirm: false
                })
            }

            Swal.fire({
                html: `<br/><br/>Select a model to proceed \n<br/><br/><div id="test" class="model--list"></div>`,
                showCloseButton: true,
                showCancelButton: true,
                focusConfirm: false,
                confirmButtonText: 'Proceed',
                onClose: () => {
                    return [
                        predict(folder)
                    ]
                },
                cancelButtonText: '<i class="fa fa-thumbs-down"></i> Cancel',
            })
            model.forEach(function (item) {
                var p = document.createElement('p');
                p.style.padding = '0px 100px'
                p.style.alignSelf = 'flex-start'
                var input = document.createElement('input');
                input.name = 'group';
                input.onclick = function () {
                    processItem(item.split('.')[0])
                }
                input.type = 'radio';
                p.appendChild(input);
                var span = document.createElement('span');
                span.textContent = item.split('.')[0]
                p.appendChild(span);
                document.getElementById('test').appendChild(p);
            });

        });

        unixProcess.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        unixProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    } catch (error) {
        Swal.fire({
            html: `<span>Unable to scan directory: ${folder} ${mystore.getModelName()} ${error}</span>`,
            showCloseButton: false,
            showCancelButton: false,
            focusConfirm: false
        })
    }
}

function processItem(model) {

    let models;
    if (model.includes("['")) {
        models = model.split("['")[1];
        mystore.setModelName(models);
        return
    }
    if (model.includes("'")) {
        models = model.split("'")[1];
        mystore.setModelName(models);
        return
    }
}

function predict(folder) {
    if (!mystore.getModelName()) {
        return Swal.fire({
            html: `<br/><span>You have not selected any available model please select a model</span>`,
            showCloseButton: false,
            showCancelButton: false,
            focusConfirm: false
        })
    }
    try {
        const unixProcess = spawn(path.join(__dirname, './dist/Classifi'), ['predict', '-path', `${folder}`,'--model',`${mystore.getModelName()}`]);
        // const unixProcess = spawn('/usr/local/bin/python3', ['./server/app.py', 'predict', '-path', `${folder}`,'--model',`${mystore.getModelName()}`]);
        unixProcess.stdout.on('data', (data) => {
            // results is an array consisting of messages collected during execution
            console.log('results: %j', data);
            //todo: If api returns the results and the folder directory
            Swal.fire({
                html: `<span>${data}</span>`,
                showCloseButton: false,
                showCancelButton: false,
                focusConfirm: false
            })
            if (!(data === 'You are required to provide a trained model to proceed')) {
                const perc = 100;
                document.getElementById('predictprogress').value = perc;
                document.getElementById('predicttag').innerText = `${perc}%`;
                document.getElementById('predictresult').innerText = 'Completed';
                const slides = document.getElementById(`sliders`);
                fs.readdir(`${folder}/predictions/${folder.split('/')[folder.split('/').length-1]}`, function (err, files) {
                    //handling error
                    if (err) {
                        Swal.fire({
                            html: `<span>Unable to scan directory: ${folder} ${mystore.getModelName()} ${error}</span>`,
                            showCloseButton: false,
                            showCancelButton: false,
                            focusConfirm: false
                        })
                        return console.log('Unable to scan directory: ' + err);
                    }
                    //listing all files using forEach
                    document.getElementById(`slides`).hidden = false;
                    files.forEach(function (file) {
                        const img = document.createElement("img");
                        file.split('.').length > 1 ? img.src = `${folder+'/'+file}` : null;
                        img.className = "mySlides"
                        img.style = "width:100%; height:250px;";
                        slides.appendChild(img)
                    });
                    showDivs(5);
                });
            }
        });

        unixProcess.stderr.on('data', (data) => {
            Swal.fire({
                html: `<span>Unable to scan directory: ${folder} ${mystore.getModelName()} ${error}</span>`,
                showCloseButton: false,
                showCancelButton: false,
                focusConfirm: false
            })
            return;
        });

        unixProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    } catch (error) {
        Swal.fire({
            html: `<span>${error}</span>`,
            showCloseButton: false,
            showCancelButton: false,
            focusConfirm: false
        })
    }
}

function showDivs(n) {
    let i;
    var x = document.getElementsByClassName("mySlides");
    if (n > x.length) {
        slideIndex = 1
    }
    if (n < 1) {
        slideIndex = x.length
    }
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    x[slideIndex - 1].style.display = "block";
    var y = document.getElementById("confidencetext");
    updateConfidenceProgress("confidence", 'progress--100')
    y.innerText = '100%'

}

function updateConfidenceProgress(id, name) {
    var element, name, arr;
    element = document.getElementById(id);
    arr = element.className.split(" ");
    element.className = arr[0] + " " + name;
}

function train() {
    document.getElementById(`trainbutton`).disabled = true;
    const textareavalue = document.getElementById(`modelname`).value;
    const modelname = textareavalue.split('').length > 1 ? textareavalue : makeid(8);
    mystore.setModelName(modelname)
    console.log('Saving Directory');
    const groups = mystore.getGroup();
    Swal.fire({
        html: `<span>You are about to train a model with name <b>${modelname}</b></span>`,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'Proceed',
        onClose: () => {
            return [
                startTraining(groups, modelname)
            ]
        },
        cancelButtonText: '<i class="fa fa-thumbs-down"></i> Cancel',
    })
}

function stopTraining() {

    const pid = mystore.getPid()
    try {
        const unixProcess = spawn(path.join(__dirname, './dist/Classifi'), ['killpid', '--pid', `${pid}`]);
        // const unixProcess = spawn('/usr/local/bin/python3', ['./server/app.py', 'killpid', '--pid', `${pid}`]);
        unixProcess.stdout.on('data', (data) => {
            resetStyles()
        });
        unixProcess.stderr.on('data', (data) => {
            resetStyles()
            Swal.fire({
                html: `<span>${data}</span>`,
                showCloseButton: false,
                showCancelButton: false,
                focusConfirm: false
            })
        });

        unixProcess.on('close', (code) => {
            resetStyles()
            Swal.fire({
                html: `<span>Training Terminated Successsfully</span>`,
                showCloseButton: false,
                showCancelButton: false,
                focusConfirm: false
            })
        });
    } catch (error) {
        resetStyles()
        Swal.fire({
            html: `<span>${error}</span>`,
            showCloseButton: false,
            showCancelButton: false,
            focusConfirm: false
        })
    }
}

function resetStyles() {
    document.getElementById(`modelprogress`).style.display = 'none';
    document.getElementById(`trainbutton`).style.display = 'block';
    document.getElementById(`stopbutton`).style.display = 'none';
    document.getElementById(`_modelname`).style.display = 'block';
    document.getElementById(`spinner`).style.display = 'none';
    document.getElementById(`progressdata`).innerText = '';
}

function startTraining(groups, modelname) {

    try {
        const groupa = groups.groupa;
        const groupb = groups.groupb;
        document.getElementById(`modelprogress`).style.display = 'block'
        document.getElementById(`trainbutton`).style.display = 'none';
        document.getElementById(`stopbutton`).style.display = 'block';
        document.getElementById(`_modelname`).style.display = 'none'
        document.getElementById(`spinner`).style.display = 'flex'

        const unixProcess = spawn(path.join(__dirname, './dist/Classifi'), ['train', '--grpA', `${groupa}`, '--grpB', `${groupb}`, '--model', `${modelname}`]);
        // const unixProcess = spawn('/usr/local/bin/python3', ['./server/app.py', 'train', '--grpA', `${groupa}`, '--grpB', `${groupb}`, '--model', `${modelname}`]);
        unixProcess.stdout.on('data', (data) => {
            if (data.includes('pid')) {
                const pid = data.toString('utf8').split(':')[1];
                mystore.setPid(pid)
            }

            document.getElementById(`progressdata`).innerText = data.toString('utf8')
        });

        unixProcess.stderr.on('data', (data) => {
            // document.getElementById(`trainbutton`).disabled = false
            // Swal.fire({
            //     html: `<span>${data}</span>`,
            //     showCloseButton: false,
            //     showCancelButton: false,
            //     focusConfirm: false
            // })
            // if (data.includes('pid')) {
            //     // const pid = data.split(':')[1];
            //     // mystore.setPid(pid)
            //     Swal.fire({
            //         html: `<span>${data}</span>`,
            //         showCloseButton: false,
            //         showCancelButton: false,
            //         focusConfirm: false
            //     })
            // }
        });

        unixProcess.on('close', (code) => {
            document.getElementById(`modelprogress`).style.display = 'none';
            document.getElementById(`trainbutton`).style.display = 'block';
            document.getElementById(`stopbutton`).style.display = 'none';
            document.getElementById(`_modelname`).style.display = 'block';
            document.getElementById(`spinner`).style.display = 'none';
            document.getElementById(`progressdata`).innerText = '';
            Swal.fire({
                html: `<span>Completed</span>`,
                showCloseButton: false,
                showCancelButton: false,
                focusConfirm: false
            })
        });
    } catch (error) {
        document.getElementById(`modelprogress`).style.display = 'none';
        document.getElementById(`trainbutton`).style.display = 'block';
        document.getElementById(`stopbutton`).style.display = 'none';
        document.getElementById(`_modelname`).style.display = 'block';
        document.getElementById(`spinner`).style.display = 'none';
        document.getElementById(`progressdata`).innerText = '';
        Swal.fire({
            html: `<span>${error}</span>`,
            showCloseButton: false,
            showCancelButton: false,
            focusConfirm: false
        })
    }

}

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}