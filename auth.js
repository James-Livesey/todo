var auth = {};

auth.getToken = function() {
    return localStorage.getItem("todo_authToken") || null;
};

auth.setToken = function(token) {
    return localStorage.setItem("todo_authToken", token);
};

auth.hasToken = function() {
    return typeof(localStorage.getItem("todo_authToken")) == "string";
};