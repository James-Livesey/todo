var view = {};

view.renderCurrentList = function() {
    subElements.render();

    if (todo.getCurrentList() instanceof todo.List) {
        todo.getCurrentList().load().then(function() {
            subElements.render();
        });
    }
};

view.selectList = function(element) {
    todo.setCurrentList(todo.getLists()[Number(element.getAttribute("data-list"))]);

    view.renderCurrentList();
};

view.getCategoryFromElement = function(element) {
    return todo.getCurrentList().categories[Number(element.getAttribute("data-category"))];
};

view.getItemFromElement = function(element) {
    return view.getCategoryFromElement(element).items[Number(element.getAttribute("data-item"))];
};

view.markCompletion = function(complete, element) {
    var item = view.getItemFromElement(element);

    item.complete = complete;

    todo.getCurrentList().save();
};

view.checkItemAddInput = function(event, element) {
    if (event.key != "Enter") {
        return;
    }

    view.getCategoryFromElement(element).items.push(new todo.Item(element.value.trim()));

    todo.getCurrentList().save();
    subElements.render();
};