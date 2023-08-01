const express = require('express');
const axios = require('axios');

// Create an instance of Express
const app = express();

// Function to add a trailing slash to the URL if it doesn't have one
function addTrailingSlash(url) {
    return url.endsWith('/') ? url : `${url}/`;
}

// Configure Vault
const vaultUrl = process.env.VAULT_ADDR || 'http://vault:8200/';
const formattedVaultUrl = addTrailingSlash(vaultUrl);
const vaultToken = process.env.VAULT_TOKEN || "root";

// Define a route for the root path "/"
app.get('/', async (req, res) => {
    const secretPath = process.env.SECRET_PATH || 'secret/data/devwebapp/config';
    const fullUrl = `${formattedVaultUrl}v1/${secretPath}`

    const vaultHeaders = {
        'X-Vault-Token': vaultToken
    }

    console.info(`Requesting from Vault - GET ${fullUrl}`)

    await axios.get(fullUrl, {headers: vaultHeaders})
        .then(response => {
            res.json(response.data);
        }) 
        .catch(error => {
            res.status(500).send(`Error making request to vault: ${error}`)
        })
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
