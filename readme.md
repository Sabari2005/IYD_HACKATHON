# IYD HACKATHON

### Solution by Team Code Blenders 

# Fact Verification Pipeline – System Design and Implementation

## 1. Introduction

The proposed system is a hybrid fact-verification pipeline designed to validate statements based on both scanned book content (PDF) and structured scripture data (CSV) using retrieval-augmented generation. The architecture integrates dense and sparse retrieval, cross-encoder re-ranking, and large language model (LLM)-based reasoning to ensure high-precision fact checking for questions derived from religious texts.

---

## 2. System Overview

The system consists of the following core components:

- Text Extraction and Chunking from PDF  
- CSV Data Vectorization  
- Hybrid Document Retrieval (BM25 + FAISS)  
- Cross-Encoder Re-ranking  
- LLM-based Analysis with LLaMA 3  
- Ensemble Reasoning for Final Fact Validation  

---

## 3. Data Preprocessing

### 3.1 PDF Book Chunking

PDF files are processed using the `PyPDFLoader`. Each page is parsed, and the content is split into paragraph-level chunks. These paragraphs form the input for document embeddings and semantic indexing.

### 3.2 CSV Dataset Loading

The structured dataset (`valmiki.csv`) is loaded using Pandas. Each row contains:

- **Kanda (Book)**  
- **Verse ID**  
- **Footnote**  
- **English Translation**  

Each entry is converted into a LangChain `Document` object with metadata.

---

## 4. Embedding and Vector Indexing

### 4.1 FAISS Vector Store

For both the PDF and CSV pipelines, the `HuggingFaceEmbeddings` model (`all-MiniLM-L6-v2`) is used to embed the text documents.

- **For PDF Chunks:** The FAISS index is built (or loaded) locally to facilitate fast semantic search.  
- **For CSV Verses:** A separate FAISS index is created using metadata and translation text, stored as `ramayana_faiss_db`.  

Both indices are stored locally for efficiency and reusability.

---

## Architecture Diagram

![Architecture](/assets/archi.png)


---

## 5. Document Retrieval Mechanism

### 5.1 Hybrid Retrieval Setup

Two retrieval methods are utilized:

- **BM25 Retriever** – Provides keyword-based sparse retrieval.  
- **Semantic Retriever** – Uses vector similarity from FAISS.  

An `EnsembleRetriever` combines both using weighted scoring:

- **BM25:** 0.4  
- **FAISS:** 0.6  

This improves both recall and precision.

---

## 6. Cross-Encoder Re-Ranking

Top retrieved documents are re-ranked using the `cross-encoder/ms-marco-MiniLM-L-6-v2` model. This model performs **pairwise relevance scoring** between the user query and each document. The **top 3 documents** are selected for further reasoning.

---

## 7. LLM Reasoning and Fact Checking

### 7.1 PDF System – LLM Chain Execution

A structured prompt template is used to guide the LLM (**LLaMA3-70B**) via the **Groq API**. The model receives:

- The user’s question  
- The most relevant re-ranked context  

The model outputs a structured response:


## Single Script Execution (Sabari_Vadivelan_s.py)
- clone the github repository 
```
    git clone https://github.com/Sabari2005/IYD_Hackathon.git
    cd IYD_Hackathon
```
- Open the Sabari_Vadivelan_s.py file
- replace input csv file path and output csv file path
```
question_csv_file_path="YOUR CSV INPUT FILE PATH" #example : test.csv
output_file_path="YOUR CSV OUTPUT FILE PATH" #examplt : result.csv
```
- Run the Sabari_vadivelan_S.py
```
    python Sabri_Vadivelan_S.py
```
- Automatically Creates all the necessary files
```
├─.env
├─valmiki
├─books.pdf
│
├───faiss_db1
│       index.faiss
│       index.pkl
│
└───ramayana_faiss_db
        index.faiss
        index.pkl
```
- results are stored in a specified location 

## Full project Folder structure

```
│   readme.md
│   Sabari_Vadivelan_S.py
│
├───assets
│       archi.png
│
├───model
│   │   .env
│   │   books.pdf
│   │   model.py
│   │   readme.md
│   │   requirements.txt
│   │   result.csv
│   │   Sabari_Vadivelan_S.py
│   │   test.csv
│   │   valmiki.csv
│   │
│   ├───faiss_db1
│   │       index.faiss
│   │       index.pkl
│   │
│   └───ramayana_faiss_db
│           index.faiss
│           index.pkl
│
└───website
    │   app.py
    │   books.pdf
    │   chat.db
    │   database.ipynb
    │   IYD_model.py
    │   readme.md
    │   requirements.txt
    │   valmiki.csv
    │
    ├───faiss_db1
    │       index.faiss
    │       index.pkl
    │
    ├───ramayana_faiss_db
    │       index.faiss
    │       index.pkl
    │
    ├───static
    │   ├───css
    │   ├───fonts
    │   ├───img
    │   └───js    │
    ├───templates
    │       index.html
    │       login.html
    │       signup.html
    │
    └───__pycache__
            IYD_model.cpython-311.pyc
            model.cpython-311.pyc

```


## Author

- Sabari Vadivelan S (Team Leader) - Contact Gmail [sabari132005@gmail.com]()
- Uvarajan D (Member 2)
- Kaviarasu K (Member 3)
