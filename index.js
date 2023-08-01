const express = require('express');
const axios = require('axios');

// Create an instance of Express
const app = express();

// Function to add a trailing slash to the URL if it doesn't have one
function addTrailingSlash(url) {
    return url.endsWith('/') ? url : `${url}/`;
}

// Configure app options
const verboseLogging = process.env.VERBOSE_LOG || 0;

// Configure Vault
const vaultUrl = process.env.VAULT_ADDR || 'http://vault:8200/v1';
const formattedVaultUrl = addTrailingSlash(vaultUrl);
const vaultToken = process.env.VAULT_TOKEN || "root";

// Define a route for the root path "/"
app.get('/', async (req, res) => {
    const secretPath = process.env.SECRETS_PATH || 'secret/data/devwebapp/config';

    const vaultHeaders = {
        'X-Vault-Token': vaultToken
    }
    const vaultResponse = await axios.get(`${formattedVaultUrl}v1/${secretPath}`, {headers: vaultHeaders})
        .then(response => {
            res.json(response.data)
        }) 
        .catch(error => {
            !! verboseLogging ? console.error(error) : console.error('Error making request to vault:', `${error.response.status} - ${error.response.statusText}`);          
            res.status(500).send(`Error making request to vault: ${error}`)
        })
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
