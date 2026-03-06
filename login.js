function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorDiv = document.getElementById("login_error");

    if (errorDiv) {
        errorDiv.textContent = "";
    }

    if (!username || !password) {
        if (errorDiv) {
            errorDiv.textContent = "Completa todos los campos.";
        }
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const userFound = users.find(user =>
        user.username === username &&
        user.password === password
    );

    if (userFound) {

        const token = "token_" + Date.now();
        localStorage.setItem("authToken", token);
        localStorage.setItem("currentUser", JSON.stringify(userFound));

        window.location.href = "home.html";

    } else {
        if (errorDiv) {
            errorDiv.textContent = "Usuario o contraseña incorrectos.";
        } else {
            alert("Usuario o contraseña incorrectos.");
        }
    }
}