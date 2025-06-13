from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
import uvicorn
import os
from fastapi import Cookie
import time
# from model import main_total
from IYD_model import fact_check_invoke
from typing import Dict
import sqlite3
import re
import json
app = FastAPI()
# Static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create `messages` table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER,
            question TEXT,
            answer TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (chat_id) REFERENCES chats(id)
        )
    """)

    conn.commit()
    conn.close()
    print("database created")
def drop_all_tables():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Drop the `messages` table
    cursor.execute("DROP TABLE IF EXISTS messages")

    # Drop the `chats` table
    cursor.execute("DROP TABLE IF EXISTS chats")

    conn.commit()
    conn.close()
    print("All tables have been dropped from the database.")
# Helper function to get a database connection
def get_db_connection():
    conn = sqlite3.connect("chat.db")
    conn.row_factory = sqlite3.Row  # Makes rows accessible as dictionaries
    return conn
def feedback_loop(q,a):
  if (q=="")and(a==""):
      return ""
  else:
    question =q
    answer = a
    loop_template = f" This the previous question asked by the user :\n {question}\n\  answer:\n0{answer}\n.\n If the it is useful make use of it ,it is helpful in know the state of the user what they try to ask.\n"
    return loop_template
def get_chats(chat_id):
    conn = get_db_connection()
    messages = conn.execute(
        "SELECT question, answer,created_at FROM messages WHERE chat_id = ? ORDER BY id", (chat_id,)
    ).fetchall()
    a = [dict(message) for message in messages]

    # Invalid answer to skip
    invalid_answer = "This Question not directly related to Bhagavad Gita or Pantanjali yoga sutra"

    # Initialize defaults
    question = ""
    answer = ""

    # Iterate backward to find a valid entry
    for entry in reversed(a):
        if entry.get('question') and entry.get('answer') and entry['answer'] != invalid_answer:
            question = entry['question']
            answer = entry['answer']
            break

    # Debugging output
    # print("33333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333")
    # print("last question", question)
    # print("last answer", answer)
    # print("33333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333")

    conn.close()
    return feedback_loop(question,answer)
def settingChatid(current_chat_id):
    # global last_chat_id
    return get_chats(current_chat_id)
    # last_chat_id = current_chat_id

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000","http://127.0.0.2:5501"],  # Adjust origins for production
    # allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database for storing users
USERS = {
    "codeblenders@gmail.com": pwd_context.hash("admin")  # Example admin user
}

# Routes
@app.get("/", response_class=HTMLResponse)
async def login_page(request: Request):
    """login page."""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    """sign-up page."""
    return templates.TemplateResponse("signup.html", {"request": request})

@app.post("/api/signup", response_class=JSONResponse)
async def signup(request: Request):
    """Handle user sign-up."""
    data = await request.json()
    email = data.get("email")
    password = data.get("password")

    # Input validation
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
    if email in USERS:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    # Hash password and store user
    hashed_password = pwd_context.hash(password)
    USERS[email] = hashed_password
    return JSONResponse(content={"message": "User registered successfully."})

@app.post("/api/login", response_class=JSONResponse)
async def login(request: Request):
    """Handle user login."""
    data = await request.json()
    email = data.get("email")
    password = data.get("password")

    if email in USERS and pwd_context.verify(password, USERS[email]):
        token = "secure-token"
        response = JSONResponse(content={"redirect_url": "/logged", "token": token})
        response.set_cookie(
            key="token",
            value=token,
            httponly=True,
            secure=False, 
            samesite="Lax"
        )
        return response

    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/logged", response_class=HTMLResponse)
async def logged_page(request: Request, token: str = Cookie(None)):
    """Serve the logged-in page only if the user is authenticated."""
    if not token or token != "secure-token": 
        return templates.TemplateResponse("login.html", {"request": request, "error": "Unauthorized access."})
    return templates.TemplateResponse("index.html", {"request": request})

# Create a new chat and return its ID
@app.post("/new_chat/")
async def create_new_chat():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO chats DEFAULT VALUES")  # Insert a new row in the `chats` table
    conn.commit()
    chat_id = cursor.lastrowid
    conn.close()
    return {"chat_id": chat_id}

@app.post("/add_message/{chat_id}/")
async def add_message(chat_id: int, message: Dict[str, str]):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if the chat ID exists
    chat = cursor.execute("SELECT * FROM chats WHERE id = ?", (chat_id,)).fetchone()
    if not chat:
        conn.close()
        raise HTTPException(status_code=404, detail="Chat ID not found")

    # Insert the message
    feedback=settingChatid(chat_id)  
    # print("8888888888888888888888888888888888888888888888888888888888888888888888888888888888888")
    # print(feedback)
    # print("8888888888888888888888888888888888888888888888888888888888888888888888888888888888888")
    question = message.get("question")
    # time.sleep(10)
    # answer =message.get("question")
    # answer=main_total(question,feedback)
    answer = fact_check_invoke(question)
#     answer="""Here is the combined output in the specified format:

# --------------------------
# <Label>None</Label>
# <Evidence>"Then she who is a hymnodist that Tara has performed a hymnal bon voyage wishing triumph to Vali, and entered palace chambers along with other females, disoriented by her own sadness."</Evidence>
# <Explanation>The context does not mention "Ravenna" at all, therefore there is no information to determine if the statement is true or false.</Explanation>
# --------------------------

# Note: Since the result is "None", the Kanda and Verse fields are not included."""
# #     print(answer)
    data = dict(re.findall(r"<(\w+)>(.*?)</\1>", answer.strip()))
    answer_json = json.dumps(data)
    # print(data)
    # print(json.dumps)

    if not question or not answer:
        conn.close()
        raise HTTPException(status_code=400, detail="Both 'question' and 'answer' are required")
    cursor.execute(
        "INSERT INTO messages (chat_id, question, answer) VALUES (?, ?, ?)",
        (chat_id, question, answer_json),
    )
    conn.commit()
    conn.close()
    return {"status": "Message added successfully"}

@app.get("/recents/")
async def get_recents():
    conn = get_db_connection()
    query = """
        SELECT chats.id AS chat_id, chats.created_at, 
               messages.question, messages.answer
        FROM chats
        LEFT JOIN messages ON chats.id = messages.chat_id
        ORDER BY chats.id DESC
    """
    result = conn.execute(query).fetchall()
    conn.close()
    chats = {}
    for row in result:
        chat_id = row["chat_id"]
        if chat_id not in chats:
            chats[chat_id] = {
                "chat_id": chat_id,
                "created_at": row["created_at"],
                "messages": []
            }
        chats[chat_id]["messages"].append({
            "question": row["question"],
            "answer": row["answer"]
        })

    # Convert chats dict to a list for the response
    return {"chats": list(chats.values())}

# Retrieve all messages for a specific chat
@app.get("/get_chat_messages/{chat_id}/")
async def get_chat_messages(chat_id: int):
    conn = get_db_connection()
    messages = conn.execute(
        "SELECT question, answer FROM messages WHERE chat_id = ? ORDER BY id", (chat_id,)
    ).fetchall()
    conn.close()
    settingChatid(chat_id)
    print({"messages": [dict(message) for message in messages]})
    # return {"messages": [dict(message) for message in messages]}
    return {
        "messages": [
            {
                "question": message["question"],
                "answer": json.loads(message["answer"])  # convert string back to dict
            }
            for message in messages
        ]
    }

@app.delete("/delete_chat/{chat_id}/")
async def delete_chat(chat_id: int):
    conn = get_db_connection()
    try:
        # Start a transaction
        conn.execute("BEGIN")
        
        # Delete from the messages table
        conn.execute("DELETE FROM messages WHERE chat_id = ?", (chat_id,))
        
        # Delete from the chats table
        conn.execute("DELETE FROM chats WHERE id = ?", (chat_id,))
        
        # Commit the transaction
        conn.commit()
        conn.close()

        print(f"chat_id {chat_id} deleted successfully from both tables.")
        return {"message": f"chat_id {chat_id} deleted successfully from both tables."}

    except Exception as e:
        # Rollback the transaction 
        conn.rollback()
        conn.close()

        print(f"Error deleting chat_id {chat_id}: {e}")
        return {"error": f"Error deleting chat_id {chat_id}: {e}"}, 500


if __name__ == "__main__":
    drop_all_tables()
    create_tables()
    uvicorn.run(app, host="127.0.0.1", port=8000)
