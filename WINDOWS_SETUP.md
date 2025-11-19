# Windows Setup Guide for FAVcart

This guide provides step-by-step instructions to set up and run the FAVcart application on a Windows environment.

## 1. Prerequisites

- **Node.js**: Install from [nodejs.org](https://nodejs.org/).
- **MongoDB**: Install MongoDB Community Server from the official website. During installation, you can configure it to run as a service or start it manually.
- **Git**: Install [Git for Windows](https://git-scm.com/download/win), which includes **Git Bash**, a tool required to run the `.sh` setup scripts.

## 2. Initial Project Setup

1.  **Create Data Directory**: MongoDB requires a data directory. Open Command Prompt and create the default folder:
    ```cmd
    md C:\data\db
    ```

2.  **Configure Environment**: In the `backend/config` directory, copy `config.env.example` and rename the copy to `config.env`. Open the new `config.env` file and:
    -   Replace `172.x.x.x` and `192.x.x.x` with the actual LAN IP addresses of your two Windows machines.
    -   Update `JWT_SECRET` to a unique, secure string.
    -   (Optional) Update Stripe, SMTP, and other keys if you plan to use those features.

3.  **Install Dependencies**: Open your terminal in the project root and run:
    ```bash
    # Install backend dependencies
    npm install

    # Install frontend dependencies
    cd frontend
    npm install
    cd ..
    ```

## 3. Running the Application

### Standalone Mode (Single PC)

1.  **Start MongoDB**: Open a Command Prompt and run:
    ```cmd
    "C:\Program Files\MongoDB\Server\{your_version}\bin\mongod.exe" --dbpath "C:\data\db"
    ```
    *(Adjust the path to your MongoDB installation directory)*

2.  **Start Application**: Open a new terminal in the project root and run:
    ```bash
    npm run dev:standalone
    ```
    The application will be available at `http://localhost:3000`.

### Replica Set Mode (Two PCs)

1.  **Firewall Configuration**: When you first run `mongod.exe`, Windows Defender Firewall will likely ask for permission. Click **Allow access** for `mongod.exe` on **Private networks**. Do this on both machines.

2.  **Start MongoDB on Both Machines**:
    -   **Primary PC**: Open Command Prompt and run (replace `<PRIMARY_IP>` with its IP):
        ```cmd
        mongod --dbpath "C:\data\db" --replSet rs0 --bind_ip 127.0.0.1,<PRIMARY_IP>
        ```
    -   **Secondary PC**: Open Command Prompt and run (replace `<SECONDARY_IP>` with its IP):
        ```cmd
        mongod --dbpath "C:\data\db" --replSet rs0 --bind_ip 127.0.0.1,<SECONDARY_IP>
        ```

3.  **Initialize Replica Set**:
    -   On the **primary PC**, open **Git Bash** (NOT Command Prompt) in the project root.
    -   Run the setup script:
        ```bash
        ./scripts/setup-replica.sh <PRIMARY_IP> <SECONDARY_IP>
        ```
    -   The script will configure the replica set and verify the connection.

4.  **Start Application**: In the project root, run:
    ```bash
    npm run dev:replica
    ```

## 4. Important Notes for Windows

-   **Use Git Bash for `.sh` scripts**: Standard Windows Command Prompt cannot run shell scripts. Always use Git Bash for scripts like `setup-replica.sh`.
-   **File Paths**: Use Windows-style paths (`C:\...`) in Windows terminals and Unix-style paths (`/c/...`) in Git Bash.
-   **Firewall**: Always ensure `mongod.exe` and `node.exe` are allowed through the firewall for private networks so the two machines can communicate.
