document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Debes iniciar sesión primero");
        window.location.href = "login.html";
    }

});