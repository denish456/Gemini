document.getElementById('togglePassword').addEventListener('click', function () {
    const password = document.getElementById('password');
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.textContent = type === 'password' ? 'visibility' : 'visibility_off';
});
 
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
 
    const email = document.getElementById('email');
    const password = document.getElementById('password');
 
    if (!email.value || !password.value) {
        alert('Please fill in all fields.');
        return;
    }
 
    if (!email.value.includes('@')) {
        alert('Enter a valid email address.');
        return;
    }
 
    try {
        const response = await fetch('http://localhost:8080/signinData')
        const data = await response.json();
 
        const user = data.find(v => v.email === email.value && v.password === password.value);
       
       
 
        if (user) {
            localStorage.setItem('login', JSON.stringify(user))
            window.location.href = 'Gemini.html';
        } else {
            alert('Invalid email or password');
        }
 
 
 
    } catch (error) {
        console.log(error);
 
    }
 
 
    // fetch(`http://localhost:8080/signinData?email=${email.value}&password=${password.value}`)
    //     .then(res => res.json())
    //     .then(data => {
    //         if (data.length > 0) {
 
    //             window.location.href = 'Gemini.html';
    //         } else {
    //             alert('Invalid email or password.');
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Login error:', error);
    //         alert('Error during login. Try again.');
    //     });
});
 
 