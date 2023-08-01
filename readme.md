# DevWebApp-Express
https://hub.docker.com/r/maxtwinslow1/devwebapp-express

This is a rewrite of [burtlo's](https://github.com/burtlo) [devwebapp-ruby](https://hub.docker.com/r/burtlo/devwebapp-ruby) container using Express. 

Burtlo's original project is used within the official Hashicorp tutorial [Integrate a Kubernetes cluster with an external Vault](https://developer.hashicorp.com/vault/tutorials/kubernetes/kubernetes-external-vault) as an application pod deployed to Kubernetes and configured to speak to Vault. 

It works well but the code is no longer viewable and has a few limitations

This project works as a replacement for burtlo/devwebapp-ruby and also provides some additional features on top of it via environment variables. Specifically:
- `SECRET_PATH` - The _burtlo/devwebapp-ruby_ container has a hardcoded secret path of `secret/devwebapp/config`. This works for the Hashicorp tutorial however it doesn't allow you to test other paths in Vault. As a default, this project uses the path from the tutorial  (`secret/devwebapp/config`) but specifying a SECRET_PATH variable will override that value.

- `VAULT_TOKEN` - This allows you to test the application when running Vault in non-dev mode.

- `PORT` - This allows you to specify a custom port to listen on. (Default is :3000)

## Prerequisites
A Vault server running on your host machine.

This write-up assumes you are using Docker on Mac and Minikube. If you're on other platforms, you'll need to adjust your VAULT_ADDR variables accordingly.

## Run it as standalone container
```
# On your host machine
vault secrets enable kv
vault kv put kv/max password=1234

# Pull the container from Dockerhub
docker pull maxtwinslow1/devwebapp-express:latest

# Create an env file
cat > env << EOF
VAULT_TOKEN=hvs.ABCDEFGHIJKLMNOP
VAULT_ADDR=http://host.docker.internal:8200
SECRET_PATH=kv/max
EOF

# Run the contaainer
docker run -d --rm --env-file env -p 3000:3000 --name my-devwebapp-express devwebapp-express

# Make a GET request against port 3000
~ curl -s localhost:3000 | jq
{
  "request_id": "32f0fc91-00cc-f173-4742-0981c1edee93",
  "lease_id": "",
  "renewable": false,
  "lease_duration": 2764800,
  "data": {
    "password": "1234"
  },
  "wrap_info": null,
  "warnings": null,
  "auth": null
}
```

## Run it as a kubernetes pod
```
cat > example-devwebapp-pod.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
    name: devwebapp-pod
    labels:
        app: devwebapp-pod
spec:
    containers:
      - name: app
        image: devwebapp-express
        env:
        - name: VAULT_ADDR
          value: http://host.docker.internal:8200
        - name: VAULT_TOKEN
          value: hvs.ABCDEFGHIJKLMNOP
        - name: SECRET_PATH
          value: kv/max
EOF

kubectl apply -f example-devwebapp-pod.yaml

~ kubectl exec -t devwebapp-pod -- curl -s localhost:3000
{"request_id":"596d6bfc-0376-e24f-0461-9422033cb924","lease_id":"","renewable":false,"lease_duration":2764800,"data":{"password":"1234"},"wrap_info":null,"warnings":null,"auth":null}
```
