/**
 * Created by Imad on 6/8/2015.
 */
function doUpdates(Y) {
    fixCheckboxSelect(Y);
}

function fixCheckboxSelect(Y) {
    DtCheckboxSelectUpdate = function(){};

    Y.mix( DtCheckboxSelectUpdate.prototype, {
        _onCheckboxSelect: function(e){
            var chkTar = e.target,                  // the INPUT[checkbox] that triggered this
                tr     = chkTar.ancestor('tr'),     // the clicked TR
                rec    = this.getRecord(tr),        // the Model corresponding to the clicked TR
                pkv    = this._getPKValues(rec);    // primary key value object, either an individual value or an object value

            // If this change makes it "checked", then add the "pkv" to the _chkRecords array
            if(e.target.get('checked')) {
                this._chkRecords.push(pkv);
            } else {
                // The user "un-checked" this record, remove it from _chkRecords ...

                // The wonky but works amazingly well method to remove one element!
                var vals = [];
                Y.Array.each(this._chkRecords,function(s){
                    if(typeof s === "object") {
                        if(JSON.stringify(s) !== JSON.stringify(pkv)) vals.push(s);

                    }
                    else {
                        if (s !== pkv) vals.push(s);
                    }
                });
                this._chkRecords = vals;
            }
        }
    });

    Y.DataTable.CheckboxSelectUpdate = DtCheckboxSelectUpdate;
    Y.Base.mix(Y.DataTable, [Y.DataTable.CheckboxSelectUpdate]);
}