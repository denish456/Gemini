document.getElementById('togglePassword').addEventListener('click', function () {
    const password = document.getElementById('password');
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.textContent = type === 'password' ? 'visibility' : 'visibility_off';
});
 
document.getElementById('toggleConfirmPassword').addEventListener('click', function () {
    const confirmPassword = document.getElementById('confirmPassword');
    const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPassword.setAttribute('type', type);
    this.textContent = type === 'password' ? 'visibility' : 'visibility_off';
});
 
document.getElementById('signInForm').addEventListener('submit', function (e) {
    e.preventDefault();
 
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
 
    if (!name.value || !email.value || !password.value || !confirmPassword.value) {
        alert('Please fill in all fields.');
        return;
    }
 
    if (!email.value.includes('@')) {
        alert('Enter a valid email address.');
        return;
    }
 
    if (password.value !== confirmPassword.value) {
        alert('Passwords do not match!');
        return;
    }
 
    // Save to JSON Server
    fetch('http://localhost:8080/signinData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name.value,
            email: email.value,
            password: password.value
        })
    })
    .then(() => {
    
    localStorage.setItem('login', JSON.stringify({
        name: name.value,
        email: email.value
    }));

    window.location.href = 'gemini.html';
})
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to save. Try again.');
        });
});
 
 