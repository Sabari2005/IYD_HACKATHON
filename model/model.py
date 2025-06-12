import re
import os
import torch
import pandas as pd
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.retrievers import BM25Retriever, EnsembleRetriever
from sentence_transformers import CrossEncoder
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.schema import Document
import pandas as pd
import gdown
import zipfile
import os
load_dotenv()  
def load_and_chunk_book(file_path):
    loader = PyPDFLoader(file_path)
    pages = loader.load()

    chunks = []
    for page in pages:
        text = page.page_content
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        for para in paragraphs:
            chunks.append({"text": para})
    return chunks


def get_vector_db(chunks, save_path="faiss_db1"):
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    if os.path.exists(save_path):
        print("Loading existing FAISS index...")
        return FAISS.load_local(save_path, embeddings, allow_dangerous_deserialization=True)
    else:
        print("Creating new FAISS index...")
        documents = [Document(page_content=chunk["text"]) for chunk in chunks]
        vector_db = FAISS.from_documents(documents, embeddings)
        vector_db.save_local(save_path)
        return vector_db

def get_retriever(vector_db, chunks):
    bm25_docs = [Document(page_content=chunk["text"]) for chunk in chunks]
    bm25_retriever = BM25Retriever.from_documents(bm25_docs)
    semantic_retriever = vector_db.as_retriever(search_kwargs={"k": 5})
    return EnsembleRetriever(
        retrievers=[bm25_retriever, semantic_retriever],
        weights=[0.4, 0.6]
    )


cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def rerank(query, retrieved_docs):
    pairs = [[query, doc.page_content] for doc in retrieved_docs]
    scores = cross_encoder.predict(pairs)
    ranked = sorted(zip(retrieved_docs, scores), key=lambda x: x[1], reverse=True)
    return [doc for doc, score in ranked[:3]]


def get_llama_chain():
    llm1 = ChatGroq(
        temperature=0.1,
        model_name="llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY1")
    )

    prompt = ChatPromptTemplate.from_template("""
    Analyze the question and context. Respond STRICTLY in this format:
    
    Label: True/False/None
    Evidence: "[Relevant text from context]"
    Explanation: [1-2 sentence justification]

    Context: "{evidence}"
    Question: "{question}"
    """)

    return (
        {
            "question": RunnablePassthrough(),
            "evidence": lambda x: x["docs"][0].page_content,
        }
        | prompt
        | llm1
    )

def fact_check(question, retriever, chain):
    retrieved_docs = retriever.invoke(question)
    if not retrieved_docs:
        return "Label: None\nExplanation: No relevant evidence found."
    
    reranked_docs = rerank(question, retrieved_docs)
    result = chain.invoke({
        "question": question,
        "docs": [reranked_docs[0]]
    })
    return result.content

print("Initializing system...")
chunks = load_and_chunk_book("books.pdf") 
vector_db = get_vector_db(chunks)
retriever = get_retriever(vector_db, chunks)
llama_chain = get_llama_chain()
print("System ready!\n")

def create_faiss_index():
    df = pd.read_csv("valmiki.csv")  
    
 
    documents = [
        Document(
            page_content=row["english_translation"],
            metadata={
                "Kanda": row["Kanda"],
                "footnote": row["footnote"],
                "verse_id": row["verse_id"]
            }
        ) for _, row in df.iterrows()
    ]
    
    embedder = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cuda' if torch.cuda.is_available() else 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )
    

    vector_db = FAISS.from_documents(documents, embedder)
    vector_db.save_local("ramayana_faiss_db")

# create_faiss_index()
# INITAIL CREATE OF FAISS DB

embedder = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={'device': 'cuda' if torch.cuda.is_available() else 'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)

vector_db = FAISS.load_local(
    "ramayana_faiss_db",
    embedder,
    allow_dangerous_deserialization=True
)
retriever = vector_db.as_retriever(
    search_type="similarity",
    search_kwargs={"k":3}
)

llm2 = ChatGroq(
    temperature=0.1,
    model_name="llama3-70b-8192",
    api_key=os.getenv("GROQ_API_KEY2")
)

def ramayana_fact_check(question):
    try:
 
        docs = retriever.get_relevant_documents(question)
        
        context = ""
        for doc in docs:
            kanda = doc.metadata.get("Kanda", "Unknown Kanda")
            footnote = doc.metadata.get("footnote", "Unknown Verse")
            context += f"""
            Kanda: {kanda}
            Verse: {footnote}
            Text: \"{doc.page_content}\"\n
            """
        
        prompt = f"""
        **Task**: Verify if the statement is factually correct based ONLY on the Valmiki Ramayana verses below.
        
        **Rules**:
        1. Return 'True' ONLY if the statement is EXACTLY supported by any verse. Include:
           - Kanda name
           - Verse number (footnote)
           - Direct quote from the verse
        2. Return 'False' if ANY verse contradicts it or if no supporting evidence exists.
        
        **Output Format** (STRICTLY FOLLOW):
        --------------------------
        <Label>True/False</Label>
        <Kanda>[Only if True]</Kanda>
        <Verse>[Only if True]</Verse>
        <Evidence>"[Direct quote]" [Only if True]</Evidence>
        --------------------------
        
        **Statement**: "{question}"
        
        **Verses**:
        {context}
        """
    
        response = llm2.invoke(prompt)
        return response.content
    
    except Exception as e:
        return f"<Label>Error</Label>\n<Message>{str(e)}</Message>"

llm3 = ChatGroq(
    temperature=0.1,
    model_name="llama3-70b-8192",
    api_key=os.getenv("GROQ_API_KEY3")
)

def combined_fact_check(question):
    
    pdf_result = fact_check(question, retriever, llama_chain)  
    csv_result = ramayana_fact_check(question)  
    
    prompt = f"""
    Combine these two fact-checking results into one final output in the exact specified format.

    Result from CSV System (contains Kanda and Verse info):
    ---{csv_result}---

    Result from PDF System:
    ---{pdf_result}---

    Question: "{question}"

    Rules:
    1. Take the results from both systems and make use of the content check the fact ofr the question

    **Output Format** (STRICTLY FOLLOW):
    --------------------------
    <Label>True/False/None</Label>
    <Kanda>[Only if True]</Kanda>
    <Verse>[Only if True]</Verse>
    <Evidence>"[Direct quote]" [Only if True/False/None]</Evidence>
    <Explanation>[if only True/False/None]</Explanation>
    --------------------------

    """

    final_response = llm3.invoke(prompt)
    
    return final_response.content



# Function to extract data from combined output
def parse_output(output):
    data = {
        "Label": "",
        "Kanda": "",
        "Verse": "",
        "Evidence": "",
        "Explanation": ""
    }
    for key in data:
        match = re.search(f"<{key}>(.*?)</{key}>", output, re.DOTALL)
        if match:
            data[key] = match.group(1).strip()
    return data

def main(question_csv_file_path, output_file_path):
    
    # Load your CSV
    df = pd.read_csv(question_csv_file_path)  # Replace with your CSV file name

    # Storage for new rows
    results = []

    for idx, row in df.iterrows():
        question = row["Statement"]
        output = combined_fact_check(question)
        parsed = parse_output(output)
        parsed["Statement"] = question  # Add original question
        results.append(parsed)
        print(f"Processed: {question} -> {parsed}")

    # Convert to DataFrame
    output_df = pd.DataFrame(results, columns=["Statement", "Label", "Kanda", "Verse", "Evidence", "Explanation"])

    # Save to new CSV
    output_df.to_csv(output_file_path, index=False)


question_csv_file_path="YOUR CSV FILE PATH" #example : test.csv
output_file_path="YOUR OUTPUT CSV FILEs PATH" #examplt : result.csv
main(question_csv_file_path, output_file_path)