var view = {};

view.getItemFromElement = function(element) {
    return todo.getCurrentList().categories[Number(element.getAttribute("data-category"))].items[Number(element.getAttribute("data-item"))];
};

view.markCompletion = function(complete, element) {
    var item = view.getItemFromElement(element);

    item.complete = complete;

    todo.getCurrentList().save();
};