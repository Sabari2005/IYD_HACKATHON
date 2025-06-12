## "NYD HACKATHON - AI-Powered Knowledge Retrieval with Agentic RAG"

### **NEGOTIO** - A RAG implemented website for patanjali yoga sutra's and bagavad gita 

## Table of contents

- [Overview](#overview)
- [About Negotio](#)
  - [Process flow](#)
- [Architecture Diagram](#my-process)
- [Installation](#installation)
- [website overview](#)
- [API service](#)
- [Author](#author)

## Introducing **NEGOTIO** 

  - The name **Negotio** captures the essence of enlightening users with curated knowledge, reflecting the transformative journey they undertake. By tying the name to the philosophical ethos, the platform builds trust and authenticity, making it instantly recognizable in the niche it serves.

  - Get expert guidance powered by AI Negotio specializing in Yoga Bhagavad Gita, and Negotiation. Know your sologa that suits your needs and start your conversation with ease.


  ### Process Flow

  #### User Login:
  - The user accesses the login page of the website.
  - The user inputs their email and password.
  - Upon successful login, the user is granted access to the main page of the website, where they can interact with the chatbot.

  #### Main Page Interaction:
  - The main page displays a chat interface powered by the **Negotio**
  - The user is presented with the option to start a conversation with the Negotiot, specializing in the Bhagavad Gita and Patanjali Yoga Sutras.
  - Users can enter questions or requests related to the teachings of the Bhagavad Gita, Yoga Sutras, or negotiation.

  #### Database Initialization
  - Upon starting the application, tables chats and messages are created in the SQLite database
  - The chats table stores individual chat sessions.
The messages table **stores messages** related to each chat.


  #### User Query Processing:
  - The user’s input is sent to the backend, where **FastAPI** handles the request.
  - The **Negotio AI model** (via `model.py`) processes the query using a **Agentic Retrieval-Augmented Generation (RAG)** system.
  - The Agentic RAG model retrieves relevant information from the Bhagavad Gita and Yoga Sutra datasets.

  #### Response Generation:
  - The model generates a context-aware response based on the retrieved information.
  - The response is sent back to the frontend, where it is displayed to the user as part of the conversation.

  #### Feedback Loop:
  - The system fetches previous questions and answers from the database using feedback loop.
  - The feedback loop helps refine the context and improve future answers by considering past user interactions.

  #### Additional Interaction:
  - The user can continue the conversation by asking more questions or clarifying points.
  - The chatbot provides answers, explanations, and insights, focusing on the wisdom of the Bhagavad Gita, Yoga Sutras, and negotiation principles.

  #### Model Processing:
  - Additionally, the backend allows execution of the AI model to intract with user.
  - This model handles the retrieval and response generation mechanism for all user interactions.

  #### User Feedback:
  - Users can interact further with the AI by refining their queries and exploring additional details on the Bhagavad Gita and Yoga Sutras.


## Architecture Diagram

<img src="../assets/server_archi.png">

## Built with

- ### Frontend:
  - HTML, CSS, JS

- ### Backend:
  - `Python`: Programming language.
  - `FastAPI`: API framework.
  - `Pinecone`: Semantic search backend.
  - `SentenceTransformer`: Embedding generation for semantic search.
  - `Llama`: Query processing and AI response generation

## Website Overview
<img src="../assets/login.png">
<img src="../assets/main_page.png">
<img src="../assets/content1.png">
<img src="../assets/content2.png">


## Installation

### Prerequirements
  - `python3.11`

### Installation steps

  ```
    https://github.com/Sabari2005/NYD_Hackathon.git
    cd NYD_Hackathon
    cd Negotio
  ```
  ```
    pip install -r requirements.txt
  ```
  - run the server
  ```
  python app.py
  ```
  - Open ` http://127.0.0.1:8000` in your browser
  
  - **Login Credentials**

  ```
  E-Mail: codeblenders@gmail.com
  Password: admin
  ``` 

## Providing API service

- The API is built using FastAPI and is designed to be easily integrated with websites or other applications. It includes endpoints for submitting queries and retrieving responses with semantic and AI-enhanced accuracy.

### Installation

#### Prerequirements
  - `python3.11`

#### Installation steps

  ```
    https://github.com/Sabari2005/NYD_Hackathon.git
    cd NYD_Hackathon
    cd Negotio
  ```
  ```
    pip install -r requirements.txt
  ```
  - run the `api.py` to start the API/Endpoint 
  ```
  python api.py
  ```
  -  Now you can access our model using the api endpoint `127.0.0.2:8001/send-text`

## Steps to access the endpoint using postman

### 1. Setup Postman
- Open Postman and create a new request.
- Set the HTTP method to `POST`.

### 2. Enter the URL
- Enter the URL of your FastAPI server. If you are running the server locally on the default port, the URL would typically look like this:
  `http://127.0.0.1:8000/send-text`

### 3.Add Headers
- Go to the `Headers` tab in Postman.
- Add the following key-value pair to indicate the content type:

    ```
    Key: Content-Type
    Value: application/json
    ```

### 4.Provide JSON Body
- Go to the `Body` tab in Postman.
- Select the `raw` option.
- Enter a JSON object in the following format:

    ```
    {
      "text": "Your sample input text here"
    }
    ```
### Screenshots

<img src="../assets/postman1.png">

<img src="../assets/postman2.png">



## Demo 

- Click [here](https://drive.google.com/file/d/1hamvELwKoyN44bXj4EsQwxoawWfdWGTS/view?usp=sharing) to see the demo video

## Author

- Sabari Vadivelan S (Team Leader) - Contact Gmail [sabari132005@gmail.com]()
- Uvarajan D (Member 2)

