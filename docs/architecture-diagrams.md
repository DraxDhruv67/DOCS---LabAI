# DOCS System Architecture & Data Flow

## 1. System Architecture Diagram
This diagram illustrates the **Hybrid Approach**. It shows how the infrastructure is decoupled into three distinct layers: Web Hosting (Vercel), Data Storage (Managed Cloud), and Code Execution (Dedicated VPS).

```mermaid
flowchart TD
    %% Define Styles
    classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef vercel fill:#000,stroke:#fff,stroke-width:2px,color:#fff;
    classDef data fill:#0284c7,stroke:#fff,stroke-width:2px,color:#fff;
    classDef exec fill:#ea580c,stroke:#fff,stroke-width:2px,color:#fff;

    %% Client Layer
    subgraph ClientLayer ["Client Layer"]
        Student["Student Browser"]:::client
        Faculty["Faculty Browser"]:::client
    end

    %% Web Hosting Layer (Vercel)
    subgraph WebLayer ["Web Hosting Layer (Vercel)"]
        UI["Next.js UI & Dashboards"]:::vercel
        API["Next.js API Routes"]:::vercel
    end

    %% Data Layer
    subgraph DataLayer ["Data Layer (Managed Services)"]
        DB[("PostgreSQL Database\n(Neon/Supabase)")]:::data
        S3[("Cloud Storage\n(AWS S3/Uploads)")]:::data
        Queue[("Message Queue\n(Redis/BullMQ)")]:::data
    end

    %% Execution Layer
    subgraph ExecLayer ["Execution Layer (Dedicated VPS)"]
        Worker["Execution Worker Node\n(Node.js/Python)"]:::exec
        Docker1["Docker Sandbox (Python)"]:::exec
        Docker2["Docker Sandbox (C++/Java)"]:::exec
    end

    %% Connections
    Student -->|HTTPS| UI
    Faculty -->|HTTPS| UI
    UI --> API
    
    API -->|Read/Write Data| DB
    API -->|Upload Files| S3
    API -->|Enqueue Execution Job| Queue

    Queue <-->|Worker pulls jobs 20 at a time| Worker
    Worker -->|1. Fetch code & tests\n2. Save final marks| DB
    Worker -->|Spawns securely| Docker1
    Worker -->|Spawns securely| Docker2
```

***

## 2. Code Submission Data Flow (Sequence Diagram)
This diagram maps the exact step-by-step journey of a piece of code from the moment a student clicks "Submit" until they see their final score, demonstrating how the queue safely handles 500 concurrent users.

```mermaid
sequenceDiagram
    autonumber
    
    actor Student
    participant Vercel as Vercel (Web API)
    participant DB as PostgreSQL Database
    participant Queue as Redis Queue
    participant Worker as Execution Worker (VPS)

    Student->>Vercel: Click "Run Code" (POST /submit)
    Vercel->>DB: Save submission with status "PENDING"
    Vercel->>Queue: Push Job ID to Queue
    Vercel-->>Student: Return 200 OK ("In Queue")
    
    Note over Student, Vercel: Student UI shows a loading spinner
    
    Queue->>Worker: Worker pulls next batch of 20 jobs
    Worker->>DB: Fetch student's code and test cases
    
    Note over Worker: Spawns Docker Sandbox<br/>Executes code against tests<br/>Computes time & memory<br/>Destroys Sandbox
    
    Worker->>DB: Update submission to "EVALUATED" + Final Score
    
    loop Frontend Polling (Every 2 seconds)
        Student->>Vercel: Poll for status change
        Vercel->>DB: Check submission status
        DB-->>Vercel: Status: EVALUATED, Score: 10/10
        Vercel-->>Student: Return final results
    end
    
    Note over Student: UI triggers the "Question Solved!" popup
```
