/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * © 2010-2015 Lotus Interworks Inc. (“LIW”) Proprietary and Trade Secret.
 * Do not copy distribute or otherwise use without explicit written permission from B. Gopinath President.
 * Do not communicate or share the information contained herein with any one else except employees of LIW  on a need to know basis.
 * LIW values its intellectual properties and excepts all those who work with LIW to protect all work, including ideas, designs, processes,
 * software and documents shared or created in any engagement with LIW as proprietary to LIW.
 * This document may make references to open sourced software being considered or used by LIW.
 * Extensions, including modifications to such open source software are deemed proprietary and trade secret to LIW  until
 * and unless LIW formally and with explicit written consent contributes specific modified open source code back to open source.
 * In any event, including cases where modified open sourced components are placed in open source, the selection, interconnection,
 * configuration, processes, designs, implementation of all technology, including opens source software,
 * that is being developed or is part of LIW deployed systems are proprietary and trade secret to LIW and
 * such information shall not be shared with any one else except employees of LIW on a need to know basis.
 *
 */

/**
 * A simple example for a panel derived from BasicPanel class
 * @param Y
 * @param properties
 * @constructor
 */
function AnotherSamplePanel(Y, properties) {
    //Calling base constructor
    BasicPanel.call(this, Y);

    //Default title
    this.panelTitle = "Another Sample Panel";

    if(typeof properties === "object") {
        $.extend(this, properties);
    }
}

//Inheriting from the base object
AnotherSamplePanel.prototype = Object.create(BasicPanel.prototype);

/**
 * Essential init function that should always be called by the panel loader utility. Also, it's imperative to call the base class (which may not be BasicPanel always) init function in it
 * @param cb
 */
AnotherSamplePanel.prototype.init = function(cb) {
    //Calling the base class init function
    //The basic panel outline will be created inside it
    BasicPanel.prototype.init.call(this, cb || undefined);
};

