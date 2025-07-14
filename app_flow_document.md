# App Flow Document for MycoPod

## Onboarding and Sign-In/Sign-Up

When a new user arrives at MycoPod, they open their browser to the IP address or host name where the UI is running inside its Proxmox LXC container. This brings up a clean, light-mode landing page with a prominent login form. Since MycoPod is a private homelab tool, user accounts for Admins and regular Users are created externally by a system administrator. There is no self-service sign-up form. To gain access, the administrator shares a unique username and password with each team member.

On this login screen, the user enters their assigned username and password. If they mistype their credentials, an error message appears above the form in red text explaining that the login failed. Below the login fields there is a link labeled “Forgot your password?” Clicking this link opens a password recovery page. On that page the user types their username or email address. If the system recognizes the account, it sends a one-time reset link to the associated email address. The email contains a secure URL that allows the user to choose a new password. Once the new password is set, they return to the login screen and enter their credentials again.

After a successful login, MycoPod checks the role associated with the user. If the user is marked as Admin, they are granted full access rights including the ability to approve and apply cluster declarations. If the user is marked as a regular User, they are granted read-only and draft-only permissions that allow them to craft and preview cluster declarations but not apply them without Admin approval.

A logout control appears in the header on every page once the user is signed in. Clicking this control immediately ends the session and returns the user to the login screen.

## Main Dashboard or Home Page

Upon successful authentication, the user lands on the main dashboard. The dashboard features a fixed header with the MycoPod logo on the left, the user’s name and role in the top right corner, and a logout button next to the user name. A vertical navigation menu appears on the left side of the screen. This menu shows links to key sections: Dashboard, New Declaration, Pending Approvals (Admins only), Reconciliation Logs, and Settings.

The central area of the dashboard varies by role. Admin users see a list of recent declarations with status indicators and a summary of any pending approvals. Regular Users see a welcome message and a prompt encouraging them to start a new cluster declaration. Below this message Users can click a large button labeled “Create New Declaration” to begin. Admins can also use this button, but they also have immediate access to the Pending Approvals view.

At the bottom of the navigation menu, a small icon links to documentation and a second icon links to the GitHub repository where all declarations are stored.

## Detailed Feature Flows and Page Transitions

When the user clicks the New Declaration button, the UI transitions to an editor page. This page contains a large, free-form text area at the top where the user can type plain English instructions describing the desired state of their Proxmox cluster. For example, they might write, “Provision three Ubuntu VMs for a Kubernetes cluster and mount an NFS share on the existing storage pool.” As the user types, the page remains uncluttered and minimalistic, with a faint placeholder hint that encourages natural language.

After finishing the declaration, the user clicks a preview button below the editor. The page displays a loading spinner while the system sends the text to the chosen LLM provider. Once the model responds, the UI renders a detailed action plan in plain English. This plan outlines each step the system intends to execute, such as creating specific VM templates, installing Kubernetes components, or configuring NFS mounts. Each planned action is paired with a brief technical note explaining the underlying Proxmox API call or shell command.

Below the plan, the page shows two buttons. If the user is an Admin, these buttons read “Commit and Apply” and “Cancel.” If the user is a regular User, the buttons read “Submit for Approval” and “Cancel.” Clicking Cancel returns the user to the dashboard without saving any changes. Clicking Commit or Submit triggers a dialog that asks for final confirmation: a short summary reminds the user of the role-based outcome. For Admins, the dialog warns that clicking will immediately send this declaration to GitHub and start the reconciliation process. For Users, the dialog explains that clicking will push the declaration to GitHub and create a pending approval request.

Once confirmed, MycoPod pushes the natural-language declaration document to a designated GitHub repository. For Users, the document is tagged as pending approval. For Admins, it is tagged as ready for reconciliation. The UI then navigates automatically to the Pending Approvals page (Admins) or to a confirmation page that displays the GitHub commit ID and a button labeled “View Status.” If a User submits, they see the same confirmation page but with a message that the declaration is awaiting Admin approval.

Admins who visit the Pending Approvals page see a list of newly submitted declarations. Each entry shows the title, author, timestamp, and a short excerpt. Admins can click any entry to expand it and view the full plan. Within this detail view they find an Approve button and a Reject button. Approving moves the declaration into the ready state so the reconciliation engine can pick it up. Rejecting opens a text field where the Admin can explain needed edits. Clicking Reject sends a notification in the UI back to the original author with the rejection reason, and the declaration returns to draft mode.

The reconciliation engine runs in its own LXC container and polls GitHub every thirty seconds. When it finds a declaration marked ready, it pulls down the document and reads the local configuration files to authenticate with Proxmox API version 8.4.1. It then sequentially executes each step of the plan. Every Proxmox API response and shell command output is recorded in a PostgreSQL database. Once the engine completes or encounters an error, the UI automatically refreshes the Reconciliation Logs page.

On the Reconciliation Logs page, users see a chronological list of execution runs. Each run expands to reveal every step performed, with green indicators for success and red for failure. Clicking on an individual action line shows the raw API request and response. A search field at the top allows quick filtering by host name or timestamp. Regular Users can view logs but cannot trigger reconciliation runs manually.

## Settings and Account Management

In the Settings section, users can manage their personal information and application configuration. On the Account tab, users see their username, role, and email address. They can click an Edit button to change their email or update their password. Changing a password requires entering the current password and the new password twice for confirmation. All changes here update the user directory immediately.

On the Configuration tab, Admins can upload or replace Proxmox credentials and LLM API key files. The interface provides two file-picker controls labeled “Proxmox Credentials” and “LLM Configuration.” Once a file is selected, the user clicks Save and the new file is stored inside the Agent container in a protected local directory. A success message confirms the update. If the file format is invalid, an error banner explains the expected format.

After saving settings, the user clicks a Return to Dashboard link at the top of the page to go back to the main flow.

## Error States and Alternate Paths

If the user enters invalid credentials on the login page, the form displays a red error message stating that the username or password is incorrect. After three failed attempts, the user must wait two minutes before trying again. During password recovery, if the given username or email is not found in the system, the page displays a neutral message indicating that if an account exists, an email will be sent. This prevents disclosure of valid accounts.

When previewing a plan, if the LLM provider times out or returns an error, the UI shows an inline notification explaining that the natural language service is unavailable and suggests trying again. If the user tries to commit a declaration without having valid Proxmox credentials configured, the commit button is disabled and a tooltip explains that credentials must be uploaded first.

During reconciliation, if the engine loses network connectivity to Proxmox or GitHub, the UI shows a yellow warning badge next to the affected reconciliation run. The engine automatically retries up to three times with exponential backoff. If all retries fail, the run is marked as errored and the failure reason appears in the log. Users can click a Retry button next to that run to ask the engine to attempt the operation again.

If an Admin rejects a User’s declaration, the UI highlights that declaration entry in the Pending Approvals list with a red border and shows the rejection comment. The author sees the comment in their dashboard under a “My Drafts” section, where they can edit the original text and resubmit.

## Conclusion and Overall App Journey

A typical user journey begins with logging in, either as an Admin or a regular User. After arriving at the dashboard, the user writes a natural language declaration describing the desired Proxmox cluster changes. They preview a structured action plan, confirm it, and commit it to GitHub. For regular Users, this creates a pending approval that an Admin reviews, comments on if edits are needed, or approves. Once approved or if submitted by an Admin, the reconciliation engine reads the declaration, applies each step to the Proxmox cluster, and logs detailed results. The UI then updates to show success or failure for every action. Throughout this journey, the user can manage credentials and personal settings in a secure Settings area, recover lost passwords, or sign out. From the first login to the final reconciliation report, MycoPod guides homelab owners through a transparent, role-based process of declaring, reviewing, and applying infrastructure changes in plain English.