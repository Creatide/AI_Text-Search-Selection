// Text Search Selection
//
// JavaScript Script for Adobe Illustrator.
// Tested with Adobe Illustrator CC 2014 and CC 2015, Windows 7/10 64-bit.
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.
//
// Copyright(c) 2016 Creatide / Sakari Niittymaa
// http://www.creatide.com
// hello@creatide.com
//
// 1.1.0 - 2015-01-29
// 1.0.0 - 2014-09-24

#target illustrator

if (app.documents.length > 0) {
    
var script_name = "Text Search Selection"
var doc = app.activeDocument;
var layers = doc.layers;
var text_items = [];
getTextLayers(layers);
var text_items_length = text_items.length;


// Recursive loop to get all text layers in active document
function getTextLayers ( obj_array ) {
    
    for (var i = 0; i < obj_array.length; i++) {
        
        // Open unlocked layers at beginning of process
        //obj_array[i].locked = false;
        
        if (obj_array[i].groupItems) {
            
            getTextLayers(obj_array[i].groupItems);
            getTextLayers(obj_array[i].textFrames);
            
        } else if (obj_array[i].typename == "TextFrame") {
            
            text_items.push(obj_array[i]);
            
        }
    }
}


// Recursive loop to unlock all items in active document
function unlockAll ( obj_array ) {
    
    for (var i = 0; i < obj_array.length; i++) {
        
        try {
        //obj_array[i].parent.locked = false;   
        obj_array[i].locked = false;
        } catch (e) {
            $.writeln(e);
        }
    
        if (obj_array[i].groupItems) {
            unlockAll(obj_array[i].groupItems);
            unlockAll(obj_array[i].textFrames);
        }
    }
}


// Parse selected text item
function textSearch ( input_text, search_word, case_sensitive ) {
    
    doc.selection = null;
    
    if (input_text) {
        
        //var char_found = false;
        var found_index = [];
        var input_length = input_text.length;
        
        // Loop every text items in active document
        for ( var j = 0; j < text_items_length; j++ ) {
            
            var text_items_char_length = text_items[j].contents.length;
            var found_counter = 0;
            
            // Search only full words
            if ( search_word ) {
                searchFromText (input_text);
            } 
            // Search by characters
            else {
                
                // Loop every input characters
                for ( var i = 0; i < input_length; i++ ) {                
                    searchFromText (input_text[i]);
                }
            }
        
            // Search from text string function
            function searchFromText (searchText) {
                
                var search_index;
                
                // Search input from text item characters
                if (search_word) {
                    search_index = case_sensitive ? text_items[j].contents.search(searchText) : text_items[j].contents.toLowerCase().search(searchText.toLowerCase());
                } else {
                    search_index = case_sensitive ? text_items[j].contents.indexOf(searchText) : text_items[j].contents.toLowerCase().indexOf(searchText.toLowerCase());
                }
            
                // Update counter
                if ( search_index != -1 ) {
                    found_counter++;
                }
            }
        
            if (found_counter) found_index.push(j);
        } 

        // Select all found text items
        var found_index_length = found_index.length;
        for ( var i = 0; i < found_index_length; i++ ) {
            var ref_index = found_index[i];
            try {
                text_items[ref_index].selected = true;
            } catch (e) {
                //$.writeln(e);
            }
        }    
    }
}

// GUI
startGUI();
function startGUI() {
    
    // Create Main Window
    var win = new Window( "dialog", script_name, undefined );
    
    // Style for Main Window
    win.orientation = "column";
    win.alignChildren = ["fill", "fill"];
    //win.preferredSize = [150, 350];
    
    // Style for Search group
    var searchGrp = win.add("panel", undefined, "Find by Characters");
    searchGrp.orientation = "column";
    searchGrp.alignChildren = ["fill", "fill"];
    
    var titleMsg = searchGrp.add ("statictext", undefined, "Select text items by characters:");
    var inputText = searchGrp.add("edittext { characters: 1, justify: 'center', active: true }");
    inputText.helpTip = "Input letters to search";

    // Search Button
    var searchBtn = searchGrp.add("button", undefined, "Search");
    searchBtn.helpTip = "Search from text items";
    searchBtn.onClick = function() {
        textSearch(inputText.text, wordSearch.value, caseSensitive.value);
        app.redraw();
    }
    
    // Search Button: Toggle Function
    function toggleSearch(hideBtn) {
        searchBtn.enabled = !hideBtn;
        //searchBtn.visible = false;
    }

    // Listener for the input
    inputText.onChanging = function() {
        if (instantSearch.value) textSearch(inputText.text, wordSearch.value, caseSensitive.value);
        app.redraw();
    }

    // Options
    var optionsGrp = win.add("panel", undefined, "Options");
    optionsGrp.orientation = "row";
    optionsGrp.margins = [10, 15, 10, 6];
    optionsGrp.alignChildren = ["fill", "fill"];
    
    // Checkbox: Search Words
    var wordSearch = optionsGrp.add ("checkbox", undefined, "Word Search");
    wordSearch.helpTip = "Search word from text items";
    wordSearch.value = true;
    
    // Checkbox: Case Sensitive
    var caseSensitive = optionsGrp.add ("checkbox", undefined, "Match Case");
    caseSensitive.helpTip = "Case sensitive search from text items";
    caseSensitive.value = false;
    
    // Checkbox: Instant Search
    var instantSearch = optionsGrp.add ("checkbox", undefined, "Instant Search");
    instantSearch.helpTip = "Instant search while writing (Could be very slow with many text items)";
    instantSearch.value = false;
    toggleSearch (instantSearch.value);
    
    // Listener: Instant Search
    instantSearch.onClick = function() {
        toggleSearch (instantSearch.value);
        if (instantSearch.value) textSearch(inputText.text, wordSearch.value, caseSensitive.value);
        app.redraw();
    }
    
    // Listener: Case Sensitive
    caseSensitive.onClick = function() {
        if (instantSearch.value) textSearch(inputText.text, wordSearch.value, caseSensitive.value);
        app.redraw();
    }

    // Style for Extra
    var extraGrp = win.add("panel", undefined, "Extra");
    extraGrp.orientation = "row";
    extraGrp.alignChildren = ["fill", "fill"];
    
    // Button: Unlock All
    var btnUnlock = extraGrp.add('button', undefined, "Unlock All");
    btnUnlock.helpTip = "Unlock All Layers in Active Document";
    btnUnlock.onClick = function () {
        unlockAll(layers);
        app.redraw(); 
    };

    // Button: Edges
    var btnEdges = extraGrp.add('button', undefined, "Edges");
    btnEdges.helpTip = "Show/Hide Edges";
    btnEdges.onClick = function () { 
        app.executeMenuCommand ('edge'); 
        app.redraw(); 
    };
    
    // Button: Bounding Box
    var btnBoundingBox = extraGrp.add('button', undefined, "Bounding Box");
    btnBoundingBox.helpTip = "Show/Hide Bounding Box";
    btnBoundingBox.onClick = function () { 
        app.executeMenuCommand ('AI Bounding Box Toggle'); 
        app.redraw(); 
    };

    // Close button
    var quitBtn = win.add("button", undefined, "Close");
    quitBtn.helpTip = "Press Esc to Close";

    // Event listener for the quit button
    quitBtn.onClick = function() {   
        win.close();   
    }  

    // Centering & Show Window
    win.center();
    win.show(); 
}
} else {
    alert("You do not have any document opened!");
}
    