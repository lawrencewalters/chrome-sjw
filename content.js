'use strict';

var targets = [{
        find: /\balt(ernative)?( |-)right\b/gi,
        replace: ['Neo-Nazi', 'Racist', 'White supremacist']
    }
];

function walk(rootNode) {
    // Find all the text nodes in rootNode
    var walker = document.createTreeWalker(
            rootNode,
            NodeFilter.SHOW_TEXT,
            null,
            false),
    node;

    // Modify each text node's value
    while (node = walker.nextNode()) {
        handleText(node);
    }
}

function handleText(textNode) {
    textNode.nodeValue = replaceText(textNode.nodeValue);
}

function replaceText(v) {
    for (var i = 0; i < targets.length; i += 1) {
        v = v.replace(targets[i].find, targets[i].replace[targets[i].current]);
    }
    return v;
}

// The callback used for the document body and title observers
function observerCallback(mutations) {
    var i;

    mutations.forEach(function (mutation) {
        for (i = 0; i < mutation.addedNodes.length; i++) {
            if (mutation.addedNodes[i].nodeType === 3) {
                handleText(mutation.addedNodes[i]);
            } else {
                walk(mutation.addedNodes[i]);
            }
        }
    });
}

// Walk the doc (document) body, replace the title, and observe the body and title
function walkAndObserve(doc) {
    var docTitle = doc.getElementsByTagName('title')[0],
    observerConfig = {
        characterData: true,
        childList: true,
        subtree: true
    },
    bodyObserver,
    titleObserver;

    // Do the initial text replacements in the document body and title
    walk(doc.body);
    doc.title = replaceText(doc.title);

    // Observe the body so that we replace text in any added/modified nodes
    bodyObserver = new MutationObserver(observerCallback);
    bodyObserver.observe(doc.body, observerConfig);

    // Observe the title so we can handle any modifications there
    if (docTitle) {
        titleObserver = new MutationObserver(observerCallback);
        titleObserver.observe(docTitle, observerConfig);
    }
}

function setCurrentReplacements(targs){
    for (var i = 0; i < targs.length; i += 1) {
        if(typeof targs[i].current === "undefined") {
            targs[i].current = Math.floor(Math.random() * targs[i].replace.length);
        }
    }    
}

setCurrentReplacements(targets);
walkAndObserve(document);
