var todo = {};

todo._lists = null;

todo.getLists = function() {
    var listsInfo = [];

    if (todo._lists instanceof Object) {
        return todo._lists;
    }

    try {
        listsInfo = JSON.parse(localStorage.getItem("todo_lists") || "[]");
    } catch (e) {
        listsInfo = [];
    }

    var lists = listsInfo.map((info) => new todo.List(info.id, info.name));

    todo._lists = lists;

    return lists;
};

todo.setLists = function(lists) {
    localStorage.setItem("todo_lists", JSON.stringify(lists.map((list) => ({
        id: list.id,
        name: list.name
    }))));

    todo._lsits = lists;
};

todo.addList = function(list) {
    var lists = todo.getLists();

    lists.push(list);

    todo.setLists(lists);
};

todo.getCurrentListId = function() {
    return localStorage.getItem("todo_currentList") || null;
};

todo.getCurrentList = function() {
    var currentListId = todo.getCurrentListId();

    return todo.getLists().find((list) => list.id == currentListId) || null;
};

todo.setCurrentList = function(list) {
    localStorage.setItem("todo_currentList", list.id);
};

todo.List = class {
    constructor(id, name = null) {
        this.id = id;
        this.name = name || "Main";

        this._gistFilename = "todo.md";

        this.categories = [];
    }

    getContents(authToken = auth.getToken()) {
        var thisScope = this;

        return fetch(`https://api.github.com/gists/${this.id}`, {
            method: "GET",
            headers: authToken != null ? {
                "Authorization": `token ${authToken}`
            } : {}
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            thisScope._gistFilename = Object.keys(data?.files || {})[0];

            var contents = data?.files[thisScope._gistFilename]?.content;

            if (typeof(contents) != "string") {
                return Promise.reject("Expected contents to be a string");
            }

            return Promise.resolve(contents);
        });
    }

    setContents(contents, authToken = auth.getToken()) {
        var gistFiles = {};

        gistFiles[this._gistFilename] = {content: contents};

        return fetch(`https://api.github.com/gists/${this.id}`, {
            method: "PATCH",
            headers: {
                "Authorization": `token ${authToken}`
            },
            body: JSON.stringify({files: gistFiles})
        });
    }

    parseContents(contents) {
        var lines = contents.split("\n");
        var addedFirstCategory = false;
        var currentCategory = new todo.Category();

        this.categories = [];

        var thisScope = this;

        lines.forEach(function(line) {
            if (line.match(/^#[^#]/)) {
                if (addedFirstCategory) {
                    thisScope.categories.push(currentCategory);

                    currentCategory = new todo.Category();
                }

                currentCategory.name = line.match(/^#\s*(.*)/)[1].trim();
                addedFirstCategory = true;

                return;
            }
            
            if (line.match(/^- \[.\]/)) {
                currentCategory.items.push(new todo.Item(line.match(/^- \[.\] (.*)/)[1].trim(), !!line.match(/^- \[[xX]\]/)));

                return;
            }

            if (currentCategory.items.length == 0) {
                return;
            }

            currentCategory.items[currentCategory.items.length - 1].contents += line + "\n";
        });

        this.categories.push(currentCategory);
    }

    stringify() {
        var contents = "";

        this.categories.forEach(function(category) {
            contents += `\n# ${category.name}\n`;

            category.items.forEach(function(item) {
                contents += `- [${item.complete ? "x" : " "}] ${item.message}\n`;

                if (item.contents.trim().length > 0) {
                    contents += `\n${item.contents.trim()}\n\n`;
                }
            });
        });

        return contents.trim();
    }

    load(authToken = auth.getToken()) {
        var thisScope = this;

        return this.getContents(authToken).then(function(contents) {
            thisScope.parseContents(contents);

            return Promise.resolve();
        });
    }

    save(authToken = auth.getToken()) {
        return this.setContents(this.stringify(), authToken);
    }
};

todo.Category = class {
    constructor(name = null) {
        this.name = name || "Uncategorised";

        this.items = [];
    }
};

todo.Item = class {
    constructor(message, complete = false) {
        this.message = message;
        this.complete = complete;

        this.contents = "";
    }
};