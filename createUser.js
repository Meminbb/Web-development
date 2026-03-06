function register() {
    const username = document.getElementById("new_username").value.trim();
    const email = document.getElementById("new_email").value.trim();
    const password = document.getElementById("new_password").value.trim();
    const gender = document.querySelector('input[name="gender"]:checked');
    const errorDiv = document.getElementById("register_error");

    errorDiv.textContent = "";

    if (!username || !email || !password) {
        errorDiv.textContent = "Completa todos los campos.";
        return;
    }

    if (!gender) {
        errorDiv.textContent = "Selecciona un género.";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.some(user => user.username === username);

    if (userExists) {
        errorDiv.textContent = "El usuario ya existe.";
        return;
    }

    const newUser = {
        username,
        email,
        password,
        gender: gender.value
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Usuario creado correctamente");

    window.location.href = "login.html";
}