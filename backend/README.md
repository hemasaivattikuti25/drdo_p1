# FAVcart Backend

This is the FastAPI (Python) backend for the FAVcart e-commerce platform.

## Quick Start

1.  **Create Virtual Environment**:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Start the Server**:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    The API will run at [http://localhost:8000](http://localhost:8000).
    Documentation: [http://localhost:8000/docs](http://localhost:8000/docs).

## Features
*   **FastAPI**: High-performance async framework.
*   **MongoDB Motor**: Async database driver.
*   **Hot Redundancy**: Auto-failover between Replica Set and Standalone DB.
*   **JWT Auth**: Secure user authentication.

For full project documentation, please refer to the [Root README](../README.md).
