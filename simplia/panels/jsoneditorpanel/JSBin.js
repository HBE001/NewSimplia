/**
 * Created by yahya on 9/29/15.
 */
var element;
var editor;

var machineElement;
var machineEditor;

var jsonValue = {};
var stateInputJSON = {};
var roleStateJSON = {};

var currentState = "";
var currentRole = "";

function loadScript(url, callback) {
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

function output(inp) {
    document.body.appendChild(document.createElement('pre')).innerHTML = inp;
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function setupBFSTMachine(currentState, currentRole) {
    var statesArray = [];
    var rolesArray = [];
    var inputArray = [];


    if (stateInputJSON['StateInput'] !== undefined) {
        statesArray = [];
        for (var state in stateInputJSON['StateInput']) {
            statesArray.push(state);
        }
    }

    if (roleStateJSON['RoleState'] !== undefined) {
        rolesArray = [];
        for (var role in roleStateJSON['RoleState']) {
            rolesArray.push(role);
        }
    }

    if (currentState == "") {
        currentState = statesArray[0];
    }
    if (currentRole == "") {
        currentRole = rolesArray[0];
    }

    if (roleStateJSON['RoleState'][currentRole] !== undefined
        && roleStateJSON['RoleState'][currentRole][currentState] != undefined) {
        inputArray = [];
        inputArray = roleStateJSON['RoleState'][currentRole][currentState];
    }
    // ---------------------------------------
    $(".machine_holder").empty();
    machineEditor = new JSONEditor($(".machine_holder")[0], {
        theme: 'bootstrap2',
        schema: {
            "title": "BFSTInstance",
            "type": "object",
            "properties": {
                "Current_State": {
                    "type": "string",
                    "title": "Current_State",
                    "default": currentState,
                    "enum": statesArray
                },
                "Role": {
                    "type": "string",
                    "title": "Role",
                    "default": currentRole,
                    "enum": rolesArray
                },
                "Input": {
                    "type": "string",
                    "title": "Input",
                    "enum": inputArray
                },
                "Output": {
                    "type": "string",
                    "title": "Output",
                },
                "Next_State": {
                    "type": "string",
                    "title": "Next_State",
                },
                "Cycle": {
                    "type": "string",
                    "title": "Cycle",
                }
            }
        }
    });

    machineEditor.on('change', function () {
        var machineJSON = machineEditor.getValue();
        if (machineJSON['Role'] != currentRole || machineJSON['Current_State'] != currentState) {
            setupBFSTMachine(machineJSON['Current_State'], machineJSON['Role']);
        }
    });
}

loadScript("https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js", function () {
    console.log("jQuery Loaded");
    loadScript("https://rawgit.com/jdorn/json-editor/master/dist/jsoneditor.js", function () {
        editor = new JSONEditor($('.editor_holder'), {
            theme: 'bootstrap2',
            schema: {
                "title": "BFSTInstance",
                "type": "object",
                "properties": {
                    "Current_State": {
                        "type": "string",
                        "title": "Current_State",
                    },
                    "Role": {
                        "type": "string",
                        "title": "Role",
                    },
                    "Input": {
                        "type": "string",
                        "title": "Input",
                    },
                    "Output": {
                        "type": "string",
                        "title": "Output",
                    },
                    "Next_State": {
                        "type": "string",
                        "title": "Next_State",
                    },
                    "Cycle": {
                        "type": "string",
                        "title": "Cycle",
                    }
                }
            }
        });

        // Hook up the submit button to log to the console
        $('.saveTransition').on('click', function () {
            // Get the value from the editor
            jsonValue = editor.getValue();

            var stateInput_stateJSON;
            var stateInput_inputJSON;

            var roleState_roleJSON;
            var roleState_stateJSON;

            if (stateInputJSON['StateInput'] === undefined) {
                stateInput_stateJSON = {};
                stateInput_inputJSON = {};
            } else {
                stateInput_stateJSON = stateInputJSON['StateInput'];
                if (stateInput_stateJSON[jsonValue['Current_State']] === undefined) {
                    stateInput_inputJSON = {};
                } else {
                    stateInput_inputJSON = stateInput_stateJSON[jsonValue['Current_State']];
                }
            }

            stateInput_inputJSON[jsonValue['Input']] = {
                "Output": jsonValue['Output'],
                "Next_State": jsonValue['Next_State'],
                "Cycle": jsonValue['Cycle']
            };
            stateInput_stateJSON[jsonValue['Current_State']] = stateInput_inputJSON;
            stateInputJSON = {'StateInput': stateInput_stateJSON};

            // ----------------------------------------------------
            // ----------------------------------------------------

            if (roleStateJSON['RoleState'] === undefined) {
                roleState_roleJSON = {};
                roleState_stateJSON = {};
                roleState_stateJSON[jsonValue['Current_State']] = [];
            } else {
                roleState_roleJSON = roleStateJSON['RoleState'];
                if (roleState_roleJSON[jsonValue['Role']] === undefined) {
                    roleState_stateJSON = {};
                } else {
                    roleState_stateJSON = roleState_roleJSON[jsonValue['Role']];
                }
                if (roleState_stateJSON[jsonValue['Current_State']] === undefined) {
                    roleState_stateJSON[jsonValue['Current_State']] = [];
                }
            }
            if (roleState_stateJSON[jsonValue['Current_State']].indexOf(jsonValue['Input']) == -1) {
                roleState_stateJSON[jsonValue['Current_State']].push(jsonValue['Input']);
            }
            roleState_roleJSON[jsonValue['Role']] = roleState_stateJSON;
            roleStateJSON = {'RoleState': roleState_roleJSON};


            console.log(JSON.stringify(stateInputJSON, undefined, 4));
            console.log(JSON.stringify(roleStateJSON, undefined, 4));
            console.log('------------------------------------------------');

            output(syntaxHighlight(JSON.stringify(stateInputJSON, null, 4)));
            output(syntaxHighlight(JSON.stringify(roleStateJSON, null, 4)));
            output(syntaxHighlight('------------------------------------------------'));
            //set item in storage.
            //localStorage["bfstInstance"] = JSON.stringify({
            //    stateInputJSON: stateInputJSON,
            //    roleStateJSON: roleStateJSON
            //});

            // ------------------------------------------------------------------------------------
            // ------------------------------------------------------------------------------------
            setupBFSTMachine(currentState, currentRole);
        });


        // ------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------

        $('.run').on('click', function () {
            // Get the value from the machineEditor
            jsonValue = machineEditor.getValue();
            var resultValues = stateInputJSON['StateInput'][jsonValue['Current_State']][jsonValue['Input']];
            if (resultValues !== undefined) {
                $("input[name*='root[Output]']").val(resultValues['Output']);
                $("input[name*='root[Next_State]']").val(resultValues['Next_State']);
                $("input[name*='root[Cycle]']").val(resultValues['Cycle']);
                // -------------------------------------------------------
                //$("select[name*='root[Current_State]']").val(resultValues['Next_State']);
                currentState = resultValues['Next_State'];
                currentRole = jsonValue['Role'];
            }
        });
    });
});
