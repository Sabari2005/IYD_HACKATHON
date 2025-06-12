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




## Author

- Sabari Vadivelan S (Team Leader) - Contact Gmail [sabari132005@gmail.com]()
- Uvarajan D (Member 2)
- Kaviarasu K (Member 3)
