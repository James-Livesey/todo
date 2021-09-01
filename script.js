var subElements = require("com.subnodal.subelements");

subElements.init();

subElements.ready(function() {
    if (todo.getCurrentList() instanceof todo.List) {
        todo.getCurrentList().load().then(function() {
            subElements.render();
        });
    }
});