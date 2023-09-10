# CS Messaging Web App

## Overview
This is a Customer Support Messaging Web Application designed to facilitate communication between customers and support agents. It allows users to send and receive messages in real-time, improving customer support and service.

## Application Link

You can access the web application here: [Customer Support Messaging Web App](https://csmessagingwebappfrontendfinal.onrender.com)

## Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Clone the Repository

Clone this repository using the following command in your Git Bash:

```bash
git clone https://github.com/GaneshN29/CS_Messaging_Web_App_Project.git
```

### 2. Install Node.js and React

Please follow this article until "Step 2: : Install Create React App" to install Node.js,npm and react on your computer: [How to Install Node.js,npm and react](https://kinsta.com/knowledgebase/install-react/#how-to-install-react-on-windows).

### 3. Open the Project in Visual Studio Code

Open the "CS_Messaging_Web_App_Project" folder in Visual Studio Code.

### 4. Start the Frontend

Open the terminal in Visual Studio Code and navigate to the "cs-app" directory using the following command:

```bash
cd .\cs-app\
```
Then, install the packages:
```bash
npm i
```
Then, start the React app:

```bash
npm start
```

### 5. Start the Backend

Open a new terminal in Visual Studio Code and start the server by running:
```bash
cd server
```
Then, install the packages:
```bash
npm i
```
Then, start backend:
```bash
node backend/server.js
```

You should now be able to access the application in your web browser at [https://localhost:3000](https://localhost:3000).

## User Credentials

You can use the following credentials to log in to the application:
| # | Customer         | Agent            |
| - | ---------------- | ---------------- |
| 1 | Username: ganesh | Username: agent1 |
|   | Password: ganesh | Password: agent1 |
| - | ---------------- | ---------------- |
| 2 | Username: customer1 | Username: agent2 |
|   | Password: customer1 | Password: agent2 |
| - | ---------------- | ---------------- |
| 3 | Username: customer2 | Username: agent3 |
|   | Password: customer2 | Password: agent3 |
| - | ---------------- | ---------------- |
| 4 | Username: customer3 | Username: agent4 |
|   | Password: customer3 | Password: agent4 |
| - | ---------------- | ---------------- |
| 5 | Username: customer4 | Username: agent5 |
|   | Password: customer4 | Password: agent5 |
| - | ---------------- | ---------------- |
| 6 | Username: customer5 |                  |
|   | Password: customer5 |                  |
| - | ---------------- | ---------------- |
| 7 | Username: customer6 |                  |
|   | Password: customer6 |                  |

Note: Customer registration is possible, but agent registration is not available. Agents can only be added by administrators with specific privileges.
   
## Optional Step 6: Set Up Your MongoDB Atlas Database

You can run the project without setting up your own MongoDB Atlas database, as the project is using a global database that can be accessed by anyone. However, if you want to create your own database for more control and customization, follow these steps:

1. Follow this guide until you reach the "Connect Cluster" step: [Create and Connect to a MongoDB Atlas Database with Node.js](https://coderrocketfuel.com/article/create-and-connect-to-a-mongodb-atlas-database-with-node-js).

2. In the "Connect Cluster" step, obtain a URL that looks like this:


   mongodb+srv://<user-name>:<password>@cluster0.chvg1ga.mongodb.net/?retryWrites=true&w=majority
   ```

   Make sure to allow access from "0.0.0.0/0" IP address for everyone.

3. Save this URL somewhere safe.

4. In the project's root directory ("CS_Messaging_Web_App"), create a `.env` file if it doesn't already exist.

5. In the `.env` file, add the following line, replacing `<your-mongo-uri>` with the URL you obtained in step 2:

   ```
   MONGO_URI=<your-mongo-uri>
   ```

6. Save the `.env` file.

7. Now, when you run the backend (Step 5), it will connect to your MongoDB Atlas database and create a database named "test" with all the necessary schemas.

8. To populate the logins collection, add documents for the agent and customer using the MongoDB ObjectID provided by MongoDB Atlas:

   For Agent:
   ```json
   {
     "_id": { "$oid": "<use-mongo_id>" },
     "username": "agent1",
     "password": "agent1",
     "entity": "agent"
   }
   ```

   For Customer:
   ```json
   {
     "_id": { "$oid": "<use-mongo_id>" },
     "username": "customer3",
     "password": "customer3",
     "entity": "customer"
   }
   ```

   Use the MongoDB ObjectID provided by MongoDB Atlas for the `<use-mongo_id>` placeholder.

9. You might also need to add canned messages in the "cannedmessages" collection:

   ```json
   {
     "_id": { "$oid": "<use-mongo_id>" },
     "message": "Hello! How can I assist you?"
   }
   ```

10. For the remaining collections and data, you can add values directly from the frontend of the application.

Now, your project is configured to use your own MongoDB Atlas database, and you have populated the initial data. Remember, this step is optional, and you can use the project with the global database if you prefer.
