# Jeu de Bench Mark Humain 🧩 🧩
---

# Pour Commencer
```git
1. git clone https://github.com/hasilon88/HumanBenchmark.git
```

## Configuration

### Backend (`/HumanBenchmarkServer`)

###### prérequis  :

>**Dans le fichier `/HumanBenchmarkServer/src/main/resources/application.properties`, vous devrez remplacer la propriété `server.ip` par l'adresse IP de votre machine.**

---

1. **naviguez vers la racine du serveur.**

```shell
cd /HumanBenchmarkServer
```

2. **Générez le code client.**

```shell
mvn verify
```

---

### Frontend (`human-benchmark-app`)

1. **Naviguez vers la racine du frontend.**

```shell
cd /human-benchmark-app
```

2. **Installez les dépendances requises.**

```shell
npm i
```

3. **Installez expo cli.**

```shell
npm install -g expo-cli 
```

4. **Démarrez l'application.**

```shell
npx expo start
```
