# Full Project System Architecture & Data Flow (DOCS)

## 1. Complete System Architecture Diagram
This diagram outlines all logical components, modules, and physical infrastructure layers comprising the entire DOCS platform.

```mermaid
flowchart TD
    %% Define Styles
    classDef actor fill:#f3f4f6,stroke:#374151,stroke-width:2px,color:#111827;
    classDef ui fill:#bfdbfe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a;
    classDef api fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#713f12;
    classDef infra fill:#fecaca,stroke:#dc2626,stroke-width:2px,color:#7f1d1d;

    %% Actors
    Admin((Admin)):::actor
    Faculty((Faculty)):::actor
    Student((Student)):::actor

    %% Presentation Layer (Frontend)
    subgraph PresentationLayer [Presentation Layer / UI]
        direction LR
        AdminUI[Admin Dashboard]:::ui
        FacultyUI[Faculty Dashboard]:::ui
        StudentUI[Student Workspace]:::ui
    end

    %% Application Layer (Backend/API)
    subgraph ApplicationLayer [Application API Layer]
        Auth[Auth & RBAC Module]:::api
        Acad[Academic & User Management]:::api
        Lab[Lab & Session Management]:::api
        Eval[Plagiarism & Analytics Service]:::api
        ExecAPI[Execution Queue Manager]:::api
        ResourceAPI[File & Resource Manager]:::api
    end

    %% Infrastructure Layer
    subgraph InfrastructureLayer [Infrastructure & Engines]
        DB[(PostgreSQL Database)]:::infra
        ExecEngine[Docker Sandbox Engine]:::infra
        Storage[(S3 Cloud Storage)]:::infra
        LLM[AI Hint Generator API]:::infra
    end

    %% Connections
    Admin --> AdminUI
    Faculty --> FacultyUI
    Student --> StudentUI

    AdminUI --> Auth & Acad
    FacultyUI --> Auth & Lab & Eval & ResourceAPI
    StudentUI --> Auth & Lab & ExecAPI & ResourceAPI & LLM

    Auth & Acad & Lab & Eval --> DB
    ExecAPI --> ExecEngine
    ExecEngine --> DB
    ResourceAPI --> Storage
    Eval --> ExecEngine
```

***

## 2. Platform Data Flow Diagram (DFD Level 1)
This diagram maps the flow of data through the system's core processes, illustrating how data travels from Admin setup to Faculty content creation, into Student submissions, and finally through automated System evaluation.

```mermaid
flowchart LR
    %% Styles
    classDef process fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef datastore fill:#e2e8f0,stroke:#475569,stroke-width:2px,color:#0f172a;
    classDef entity fill:#f1f5f9,stroke:#94a3b8,stroke-width:2px,color:#0f172a,stroke-dasharray: 5 5;

    %% External Entities
    Admin[/Admin/]:::entity
    Faculty[/Faculty/]:::entity
    Student[/Student/]:::entity

    %% Data Stores
    D1[(D1: User & Academic DB)]:::datastore
    D2[(D2: Labs & Test Cases DB)]:::datastore
    D3[(D3: Submissions & Marks DB)]:::datastore
    D4[(D4: File Storage / S3)]:::datastore

    %% Processes
    P1((1. Manage<br/>Users & Setup)):::process
    P2((2. Create<br/>Labs & Content)):::process
    P3((3. Code<br/>Workspace)):::process
    P4((4. Sandbox<br/>Execution)):::process
    P5((5. Plagiarism<br/>& Analytics)):::process

    %% Data Flows
    Admin -->|Academic structure & Accounts| P1
    P1 -->|Store Users/Batches| D1

    Faculty -->|Experiment Specs| P2
    Faculty -->|Upload Manuals| P2
    P2 -->|Store Questions & Tests| D2
    P2 -->|Save Files| D4

    Student -->|Code & Submissions| P3
    D2 -->|Fetch Questions| P3
    D4 -->|Download Manuals| P3
    P3 -->|Enqueue Code| P4
    
    P4 -->|Fetch Test Cases| D2
    P4 -->|Execution Results| D3
    P3 -->|Final Submit| D3

    Faculty -->|Trigger Check| P5
    D3 -->|Fetch All Submissions| P5
    P5 -->|Update Plagiarism Score| D3
    
    Faculty -->|View Reports & Marks| D3
    Student -->|View Final Marks| D3
```
