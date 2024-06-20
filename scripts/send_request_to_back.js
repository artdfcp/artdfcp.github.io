document.getElementById('sendButton').addEventListener('click', function() {
    const name = document.getElementById('nameInput').value;

    fetch('https://get-me-home-back.vercel.app/api/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('responseMessage').innerText = data.message;
    })
    .catch(error => console.error('Error:', error));
});