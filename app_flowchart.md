flowchart TD
    config[Load Proxmox LLM credentials from local files]  
    start[User enters natural language declaration]  
    config --> start  
    start --> storeGit[Store declaration in GitHub repo]  
    storeGit --> parseLLM[Send declaration to LLM for plan generation]  
    parseLLM --> planReceived[Receive detailed action plan]  
    planReceived --> uiDisplay[Display plan preview in UI]  
    uiDisplay --> checkRole{User role is admin}  
    checkRole -->|yes| approval{Approve plan}  
    checkRole -->|no| waitAdmin[Notify admin for approval]  
    waitAdmin --> approval  
    approval -->|approved| execute[Execute reconciliation]  
    approval -->|rejected| abort[Abort process]  
    execute --> fetchState[Fetch current cluster state from Proxmox API]  
    fetchState --> diff[Compare declared state with current state]  
    diff --> applyChanges[Apply changes via Proxmox API]  
    applyChanges -->|success| logSuccess[Log success to PostgreSQL]  
    applyChanges -->|failure| logFailure[Log failure to PostgreSQL]  
    logSuccess --> uiResult[Display results to user]  
    logFailure --> uiResult